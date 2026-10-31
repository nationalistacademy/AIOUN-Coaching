const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const WS = require('../src/tools/workshop-planner/ics.js');
const raw = fs.readFileSync(__dirname + '/fixtures/portal-paste.txt', 'utf8');

test('parses supplied portal rows and groups sessions by course, group and batch', () => {
  const result = WS.parseSchedule(raw);
  assert.equal(result.bad.length, 0);
  assert.equal(result.sessions.length, 42);
  assert.equal(result.duplicates, 0);
  const plans = WS.plan(result.sessions);
  assert.equal(plans.length, 7);
  const course = plans.find(x => x.code === '5402');
  assert.deepEqual(course.sessions.map(x => x.date), [
    '2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09', '2026-07-10', '2026-07-11'
  ]);
  assert.deepEqual([course.sessions[4].start, course.sessions[4].end], ['16:20', '18:00']);
  assert.equal(course.sessions[4].quiz, true);
  assert.equal(course.sessions[5].last, true);
});

test('parses ISO, Pakistani numeric and English month date formats', () => {
  assert.equal(WS.parseDate('2026-11-12').iso, '2026-11-12');
  assert.equal(WS.parseDate('12/11/2026').iso, '2026-11-12');
  assert.equal(WS.parseDate('12-11-2026').iso, '2026-11-12');
  assert.equal(WS.parseDate('12 November 2026').iso, '2026-11-12');
  assert.equal(WS.parseDate('Nov 12, 2026').iso, '2026-11-12');
  assert.equal(WS.parseDate('31/02/2026'), null);
});

test('parses 12-hour and 24-hour times and rejects invalid times', () => {
  assert.equal(WS.parseTime('3:40 PM'), '15:40');
  assert.equal(WS.parseTime('12:05 AM'), '00:05');
  assert.equal(WS.parseTime('00:05'), '00:05');
  assert.equal(WS.parseTime('23:59'), '23:59');
  assert.equal(WS.parseTime('25:00'), null);
});

test('converts Pakistan time to UTC', () => {
  assert.equal(WS.fmtUtc(WS.utcMs('2026-07-06', '15:40')), '20260706T104000Z');
});

test('creates unique ICS events and calendar alarms', () => {
  const events = WS.events(WS.plan(WS.parseSchedule(raw).sessions), { reminders: [60, 30, 60, -1, 50000] });
  assert.equal(events.length, 42);
  assert.equal(new Set(events.map(x => x.uid)).size, 42);
  assert.deepEqual(events[0].alarms, [60, 30]);
  const ics = WS.buildIcs(events, { now: new Date('2026-10-30T00:00:00Z') });
  assert.ok(ics.includes('DTSTART:20260706T104000Z'));
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 42);
  assert.equal((ics.match(/BEGIN:VALARM/g) || []).length, 84);
});

test('reports malformed rows and skips duplicate imports', () => {
  const row = '5402\t5402|G909|16BH\t12/11/2026 10:00 AM\t12/11/2026 11:00 AM';
  const result = WS.parseSchedule(row + '\n' + row + '\n5402\tbad');
  assert.equal(result.sessions.length, 1);
  assert.equal(result.duplicates, 1);
  assert.equal(result.bad.length, 1);
});

test('does not merge same course title across distinct groups or batches', () => {
  const a = { title: 'Same', code: '123', group: 'G1', batch: 'A', date: '2026-11-12', start: '10:00', end: '11:00' };
  const b = { ...a, group: 'G2' };
  const c = { ...a, batch: 'B' };
  assert.equal(WS.plan([a, b, c]).length, 3);
});
