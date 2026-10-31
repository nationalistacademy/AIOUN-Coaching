/* AIOU Workshop Planner data engine.
 * Input dates are interpreted as day/month/year where ambiguous.
 * AIOU workshop times are Pakistan Standard Time (UTC+5).
 */
(function (root) {
  'use strict';
  var OFFSET_HOURS = 5;
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTH_MAP = {};
  MONTHS.forEach(function (m, i) { MONTH_MAP[m.toLowerCase()] = i + 1; });
  function pad(n) { return String(n).padStart(2, '0'); }
  function validDate(y, m, d) {
    var dt = new Date(Date.UTC(y, m - 1, d));
    if (!Number.isInteger(y) || y < 1900 || y > 2200 ||
        dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
    return { y: y, m: m, d: d, iso: y + '-' + pad(m) + '-' + pad(d) };
  }
  function monthNumber(s) { return MONTH_MAP[String(s || '').slice(0, 3).toLowerCase()] || null; }

  function parseDate(input) {
    var s = String(input || '').trim().replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[, ]+/i, '');
    var m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return validDate(+m[1], +m[2], +m[3]);
    if ((m = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/))) {
      var year = +m[3]; return validDate(year < 100 ? year + 2000 : year, +m[2], +m[1]);
    }
    if ((m = s.match(/^(\d{1,2})[ ,.-]+([A-Za-z]{3,9})[ ,.-]+(\d{4})$/))) {
      var mon = monthNumber(m[2]); return mon ? validDate(+m[3], mon, +m[1]) : null;
    }
    if ((m = s.match(/^([A-Za-z]{3,9})[ ,.-]+(\d{1,2}),?\s+(\d{4})$/))) {
      var month = monthNumber(m[1]); return month ? validDate(+m[3], month, +m[2]) : null;
    }
    return null;
  }

  function parseTime(input) {
    var s = String(input || '').trim().toUpperCase().replace(/\./g, '');
    var m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/);
    if (!m) return null;
    var h = +m[1], min = +m[2], meridiem = m[3] || '';
    if (min > 59) return null;
    if (meridiem) {
      if (h < 1 || h > 12) return null;
      if (meridiem === 'PM' && h !== 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
    } else if (h > 23) return null;
    return pad(h) + ':' + pad(min);
  }

  function parseDateTime(input) {
    var s = String(input || '').trim(), m;
    if ((m = s.match(/^(.*?)\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)$/i))) {
      var date = parseDate(m[1]), time = parseTime(m[2]);
      return date && time ? { date: date, hm: time } : null;
    }
    return null;
  }

  function parseSchedule(input) {
    var sessions = [], bad = [], duplicates = 0, seen = Object.create(null);
    String(input || '').split(/\r?\n/).forEach(function (line, index) {
      if (!line.trim() || /^\s*#/.test(line)) return;
      var columns = line.split('\t').map(function (x) { return x.trim(); });
      if (columns.length < 4) {
        bad.push({ line: index + 1, why: 'Expected 4 tab-separated columns: course, course|group|batch, start, end' });
        return;
      }
      var meta = (columns[1] || '').split('|').map(function (x) { return x.trim(); });
      var start = parseDateTime(columns[2]), end = parseDateTime(columns[3]);
      if (!start || !end || start.date.iso !== end.date.iso) {
        bad.push({ line: index + 1, why: 'Start/end date-time could not be read; use a supported date and time format' });
        return;
      }
      if (end.hm <= start.hm) {
        bad.push({ line: index + 1, why: 'End time must be later than start time on the same date' });
        return;
      }
      var code = meta[0] || columns[0], group = meta[1] || '', batch = meta[2] || '';
      if (!code) {
        bad.push({ line: index + 1, why: 'Course code or title is missing' });
        return;
      }
      var session = {
        title: code + (group ? ' (' + group + ')' : ''),
        code: code, group: group, batch: batch,
        date: start.date.iso, start: start.hm, end: end.hm
      };
      var key = [code, group, batch, session.date, session.start, session.end].join('|').toLowerCase();
      if (seen[key]) { duplicates++; return; }
      seen[key] = true;
      sessions.push(session);
    });
    return { sessions: sessions, bad: bad, duplicates: duplicates };
  }

  function weekday(iso) {
    var p = iso.split('-');
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
  }
  function utcMs(iso, hm) {
    var p = iso.split('-'), t = hm.split(':');
    return Date.UTC(+p[0], +p[1] - 1, +p[2], +t[0] - OFFSET_HOURS, +t[1]);
  }
  function fmtUtc(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
      'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function fmtDay(iso) {
    var p = iso.split('-');
    return DAYS[weekday(iso)] + ', ' + pad(+p[2]) + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0];
  }
  function fmt12(hm) {
    var h = +hm.slice(0, 2);
    return (h % 12 || 12) + ':' + hm.slice(3) + ' ' + (h >= 12 ? 'PM' : 'AM');
  }

  function plan(inputSessions) {
    var groups = Object.create(null), unique = Object.create(null);
    (inputSessions || []).slice().sort(function (a, b) {
      return (a.date + a.start + a.code + a.group + a.batch).localeCompare(b.date + b.start + b.code + b.group + b.batch);
    }).forEach(function (s) {
      var key = [s.code, s.group, s.batch].join('|');
      var dedupe = [key, s.date, s.start, s.end].join('|');
      if (unique[dedupe]) return;
      unique[dedupe] = true;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.keys(groups).sort().map(function (key) {
      var list = groups[key], total = list.length, quizIndex = total >= 2 ? total - 2 : -1;
      return {
        title: list[0].title, code: list[0].code, group: list[0].group, batch: list[0].batch,
        sessions: list.map(function (s, i) {
          return {
            n: i + 1, total: total, title: s.title, date: s.date, start: s.start, end: s.end,
            startMs: utcMs(s.date, s.start), endMs: utcMs(s.date, s.end),
            quiz: i === quizIndex, last: i === total - 1
          };
        })
      };
    });
  }

  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(16);
  }
  function events(plans, options) {
    options = options || {};
    var alarms = Array.isArray(options.reminders) ? options.reminders : [60], cleanAlarms = [];
    alarms.forEach(function (n) {
      n = Number(n);
      if (Number.isInteger(n) && n > 0 && n <= 43200 && cleanAlarms.indexOf(n) < 0) cleanAlarms.push(n);
    });
    if (!cleanAlarms.length) cleanAlarms = [60];
    var out = [];
    (plans || []).forEach(function (group) {
      group.sessions.forEach(function (s) {
        var identity = [group.code, group.group, group.batch, s.date, s.start].join('|');
        out.push({
          uid: hash(identity) + '@aiou-coaching',
          start: s.startMs, end: s.endMs,
          summary: 'AIOU Workshop: ' + group.title + ' (' + s.n + '/' + s.total + ')' +
            (s.quiz ? ' [Quiz check]' : (s.last ? ' [Last class]' : '')),
          desc: 'Course ' + group.code + ' · Group ' + group.group + ' · Batch ' + group.batch + '\n' +
            (s.quiz ? 'Second-last class: check AAGHI LMS for quiz availability.\n' : '') +
            'Confirm schedule in official AIOU LMS.',
          alarms: cleanAlarms.slice(), kind: 'session', s: s
        });
      });
    });
    return out;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/\\/g, '\\\\')
      .replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }
  function buildIcs(calendarEvents, options) {
    options = options || {};
    var now = options.now instanceof Date ? options.now : new Date();
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//AIOU Coaching//Workshop Planner//EN',
      'CALSCALE:GREGORIAN', 'X-WR-CALNAME:AIOU Workshops', 'X-WR-TIMEZONE:Asia/Karachi'
    ];
    (calendarEvents || []).forEach(function (event) {
      lines.push(
        'BEGIN:VEVENT', 'UID:' + esc(event.uid), 'DTSTAMP:' + fmtUtc(now.getTime()),
        'DTSTART:' + fmtUtc(event.start), 'DTEND:' + fmtUtc(event.end),
        'SUMMARY:' + esc(event.summary), 'DESCRIPTION:' + esc(event.desc)
      );
      (event.alarms || []).forEach(function (minutes) {
        lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(event.summary),
          'TRIGGER:-PT' + minutes + 'M', 'END:VALARM');
      });
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }

  function googleLink(event) {
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
      encodeURIComponent(event.summary) + '&dates=' + fmtUtc(event.start) + '/' + fmtUtc(event.end) +
      '&details=' + encodeURIComponent(event.desc) + '&ctz=Asia%2FKarachi';
  }
  function message(plans) {
    var lines = ['Aap ka AIOU workshop schedule:'];
    (plans || []).forEach(function (group) {
      lines.push('\n' + group.title);
      group.sessions.forEach(function (s) {
        lines.push(s.n + ') ' + fmtDay(s.date) + ' · ' + fmt12(s.start) + '–' + fmt12(s.end) +
          (s.quiz ? ' · QUIZ availability AAGHI LMS par check karein' : ''));
      });
    });
    return lines.join('\n');
  }

  var api = {
    parseDate: parseDate, parseTime: parseTime, parseDateTime: parseDateTime,
    parseSchedule: parseSchedule, plan: plan, events: events, buildIcs: buildIcs,
    googleLink: googleLink, fmtUtc: fmtUtc, fmtDay: fmtDay, fmt12: fmt12,
    utcMs: utcMs, message: message
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WS = api;
}(typeof window !== 'undefined' ? window : globalThis));
