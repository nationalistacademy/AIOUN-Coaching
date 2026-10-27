/* ==========================================================================
   AIOU Coaching — studio.js
   The Multi-ID AI Studio app. Uses:
     AIOU.store (IDs + settings)   AIOU.ai (DeepSeek via your Worker)
     AIOU.ui    (helpers)          AIOU.hub (tool grid)

   Sections: 1 Multi-ID Response · 2 Study Helper · 3 Diagram
             4 Assignment Builder · 5 All Tools
   ========================================================================== */
(function (w, d) {
  'use strict';

  var S = w.AIOU.store, AI = w.AIOU.ai, UI = w.AIOU.ui;
  var $ = UI.$, el = UI.el, add = UI.add;

  var SECTIONS = ['Multi-ID Response', 'Study Helper', 'Diagram', 'Assignment', 'All Tools'];
  var current = 1;
  var diagramPng = null;

  /* ================= navigation ========================================= */
  function buildNav() {
    var nav = $('nav');
    UI.empty(nav);
    SECTIONS.forEach(function (name, i) {
      add(nav, el('button', 'step', (i + 1) + '. ' + name, {
        type: 'button', dataset: { n: String(i + 1) }
      }));
    });
    nav.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.step') : null;
      if (btn) go(Number(btn.dataset.n));
    });
  }

  function go(n) {
    current = n;
    UI.$$('#nav .step').forEach(function (el2) {
      var i = Number(el2.dataset.n);
      el2.className = 'step' + (i === n ? ' active' : i < n ? ' done' : '');
    });
    $('s1').classList.toggle('hid', n !== 1);
    $('s5').classList.toggle('hid', n !== 5);
    $('ws').classList.toggle('hid', n < 2 || n > 4);
    [2, 3, 4].forEach(function (k) {
      var sec = $('s' + k);
      if (sec) sec.classList.toggle('hid', k !== n);
    });
    if (n === 5) renderHub();
    w.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ================= ID manager ======================================== */
  var saveTimer = null;
  function saveSoon(fn) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(fn, 350);
  }

  function idRow(item) {
    var row = el('div', 'idrow', null, { dataset: { id: item.id } });

    var name = el('input', '', null, { value: item.name, placeholder: 'Naam', title: 'Pehchaan ke liye naam' });
    var url = el('input', '', null, { value: item.url, placeholder: 'https://aiou-tools.xxxx.workers.dev/' });
    var token = el('input', '', null, { value: item.token, placeholder: 'Auth token (optional)', type: 'password' });

    var sel = el('select', '', null, { title: 'Model' });
    S.MODELS.forEach(function (m) { add(sel, el('option', '', m.label, { value: m.value })); });
    sel.value = item.model;

    var on = el('input', '', null, { type: 'checkbox', title: 'Is ID ko istemal karein' });
    on.checked = item.enabled !== false;

    var del = el('button', 'del', '🗑', { type: 'button', title: 'ID hataayein' });

    function persist(patch) {
      saveSoon(function () {
        S.updateId(item.id, patch);
        url.title = S.validUrl(url.value) ? '✅ ' + S.host(url.value) : '⚠️ Poora https:// URL likhein';
        summary();
      });
    }

    name.addEventListener('input', function () { persist({ name: name.value }); });
    url.addEventListener('input', function () { persist({ url: url.value }); });
    token.addEventListener('input', function () { persist({ token: token.value }); });
    sel.addEventListener('change', function () { persist({ model: sel.value }); });
    on.addEventListener('change', function () { persist({ enabled: on.checked }); });
    del.addEventListener('click', function () {
      S.removeId(item.id);
      row.remove();
      summary();
      UI.toast('ID hata diya');
    });

    url.title = S.validUrl(item.url) ? '✅ ' + S.host(item.url) : '⚠️ Poora https:// URL likhein';

    [name, url, token, sel, on, del].forEach(function (n) { add(row, n); });
    return row;
  }

  function renderIds() {
    var list = S.getIds();
    var mount = $('idList');
    UI.empty(mount);
    if (!list.length) {
      add(mount, el('div', 'empty', 'Abhi koi ID save nahi hai. "+ Naya ID add karein" dabayein, Worker URL paste karein aur ek naam de dein.'));
    } else {
      list.forEach(function (item) { add(mount, idRow(item)); });
    }
    summary();
  }

  function summary() {
    var all = S.getIds();
    var ready = S.enabledIds();
    var bad = all.filter(function (x) { return x.enabled && !S.validUrl(x.url); }).length;
    var txt = all.length
      ? ready.length + ' / ' + all.length + ' ID ready' + (bad ? ' · ' + bad + ' URL adhoora hai' : '')
      : 'Koi ID nahi';
    var pill = $('idSummary');
    pill.textContent = txt;
    pill.className = 'pill' + (ready.length ? '' : ' w');
  }

  function bindIdButtons() {
    $('btnAddId').addEventListener('click', function () {
      S.addId({});
      renderIds();
      UI.toast('Naya ID add ho gaya — URL paste karein');
    });

    $('btnClearIds').addEventListener('click', function () {
      if (!confirm('Saare IDs localStorage se hata dein?')) return;
      S.setIds([]);
      renderIds();
      UI.toast('List saaf ho gayi');
    });

    $('btnExportIds').addEventListener('click', function () {
      var blob = new w.Blob([S.exportIds()], { type: 'application/json' });
      UI.downloadBlob(blob, 'aiou-ids.json');
      UI.toast('IDs file download ho gayi');
    });

    $('btnImportIds').addEventListener('click', function () { $('importFile').click(); });

    $('importFile').addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file) return;
      var reader = new w.FileReader();
      reader.onload = function () {
        try {
          S.importIds(String(reader.result));
          renderIds();
          UI.toast('IDs import ho gayi');
        } catch (e) { UI.toast('Import nahi ho saka: ' + e.message, 'err'); }
      };
      reader.readAsText(file);
      this.value = '';
    });

    $('btnPingAll').addEventListener('click', pingAll);
  }

  function pingAll() {
    var ids = [],
        bad = [];
    S.getIds().forEach(function (x) {
      if (!x.enabled) return;
      if (S.validUrl(x.url)) ids.push(x); else bad.push(x.name);
    });
    if (!ids.length) return UI.toast('Pehle kam az kam ek sahi Worker URL save karein', 'err');
    if (bad.length) UI.toast('URL adhoora: ' + bad.join(', '), 'err');

    var btn = $('btnPingAll');
    var old = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Testing...';
    UI.status($('runStatus'), ids.length + ' IDs ko chhota test bheja ja raha hai...', 'ld');
    renderResults(ids);
    AI.askAll(ids, { user: 'Reply with exactly this word and nothing else: OK', temperature: 0, maxTokens: 16 }, function (r) {
      if (cards[r.id]) cards[r.id].update(r);
    }).then(function (res) {
      var ok = res.filter(function (r) { return r.ok; }).length;
      UI.status($('runStatus'), ok + ' / ' + res.length + ' IDs kaam kar rahe hain', ok ? 'ok' : 'err');
      UI.toast(ok + '/' + res.length + ' IDs ready', ok ? 'ok' : 'err');
    })['catch'](function (e) {
      UI.status($('runStatus'), '❌ ' + e.message, 'err');
    }).then(function () {
      btn.disabled = false;
      btn.textContent = old;
    });
  }

  /* ================= multi-ID run ====================================== */
  var cards = {};

  function cardFor(id) {
    var node = el('div', 'res-card');
    var head = el('div', 'res-head');
    var dot = el('span', 'dot');
    var name = el('div', 'res-name', null, {});
    add(name, dot);
    add(name, el('span', '', id.name));
    add(head, name);
    add(head, el('span', 'badge', id.model));
    var meta = el('div', 'res-meta');
    var body = el('div', 'res-body', 'Waiting for answer…');
    var actions = el('div', 'res-actions hid');
    add(node, head); add(node, meta); add(node, body); add(node, actions);

    var api = {
      node: node,
      set: function (kind, label) { dot.className = 'dot ' + kind; if (label) add(meta, el('span', 'badge', label)); },
      update: function (r) {
        UI.empty(meta);
        add(meta, el('span', 'badge', UI.fmtMs(r.ms)));
        if (r.ok) {
          dot.className = 'dot ok';
          body.className = 'res-body';
          add(meta, el('span', 'badge', r.chars + ' chars'));
          if (r.reasoning) add(meta, el('span', 'badge', 'reasoning ' + r.reasoning.length + ' chars'));
          var showReasoning = !!r.reasoning;
          body.textContent = showReasoning ? r.text + '\n\n— — — reasoning — — —\n' + r.reasoning : r.text;
          UI.empty(actions);
          add(actions, el('button', '', '📋 Copy', {
            type: 'button', onclick: function () { UI.copy(body.textContent); }
          }));
          add(actions, el('button', '', '⤵ Draft me daalein', {
            type: 'button', onclick: function () {
              $('sDraft').value = r.text;
              countWords();
              go(4);
              UI.toast(id.name + ' ka jawab draft me chala gaya');
            }
          }));
          var star = el('button', '', '⭐ Best', {
            type: 'button', onclick: function () {
              UI.$$('#results .res-card').forEach(function (c) { c.classList.remove('best'); });
              UI.$$('#results .res-actions button').forEach(function (b) { b.classList.remove('on'); });
              node.classList.add('best');
              star.classList.add('on');
              UI.toast('Best jawab: ' + id.name);
            }
          });
          add(actions, star);
          actions.classList.remove('hid');
        } else {
          dot.className = 'dot err';
          node.classList.add('fail');
          body.className = 'res-body err-text';
          body.textContent = '❌ ' + (r.error || 'Error');
        }
      }
    };
    return api;
  }

  function renderResults(ids) {
    cards = {};
    var mount = $('results');
    UI.empty(mount);
    ids.forEach(function (id) {
      var c = cardFor(id);
      c.set('run', 'chalu');
      cards[id.id] = c;
      add(mount, c.node);
    });
    $('resultCount').textContent = ids.length ? ids.length + ' ID(s) ko bheja gaya' : '';
  }

  function promptText() {
    var p = $('userPrompt').value.trim();
    if (!p) { UI.toast('Pehle prompt likhein', 'err'); return null; }
    S.setSettings({
      system: $('sysPrompt').value,
      temperature: Number($('temp').value),
      maxTokens: Number($('maxTok').value),
      json: $('jsonMode').checked
    });
    return p;
  }

  function runAll() {
    var ids = S.enabledIds();
    if (!ids.length) return UI.toast('Pehle ek sahi Worker ID save karein', 'err');
    var prompt = promptText();
    if (!prompt) return;

    var btn = $('btnRunAll');
    btn.disabled = true;
    UI.status($('runStatus'), ids.length + ' IDs ko ek sath bheja ja raha hai...', 'ld');
    renderResults(ids);

    AI.askAll(ids, { user: prompt }, function (r) {
      if (cards[r.id]) cards[r.id].update(r);
    }).then(function (res) {
      var ok = res.filter(function (r) { return r.ok; });
      var fast = ok.slice().sort(function (a, b) { return a.ms - b.ms; })[0];
      UI.status($('runStatus'),
        ok.length + ' / ' + res.length + ' jawab aa gaye' + (fast ? ' · sabse tez: ' + fast.name + ' (' + UI.fmtMs(fast.ms) + ')' : ''),
        ok.length ? 'ok' : 'err');
      $('resultCount').textContent = ok.length + ' jawab · ' + res.length + ' ID';
    })['catch'](function (e) {
      UI.status($('runStatus'), '❌ ' + e.message, 'err');
    }).then(function () {
      btn.disabled = false;
    });
  }

  function runFirst() {
    var ids = S.enabledIds();
    if (!ids.length) return UI.toast('Pehle ek sahi Worker ID save karein', 'err');
    var prompt = promptText();
    if (!prompt) return;

    var btn = $('btnRunFirst');
    btn.disabled = true;
    renderResults(ids);
    var i = 0;
    var res = AI.askFirst(ids, { user: prompt }, function (id) {
      i++;
      UI.status($('runStatus'), 'Try ' + i + '/' + ids.length + ': ' + id.name + ' ...', 'ld');
      if (cards[id.id]) cards[id.id].set('run', 'try');
    });
    res.then(function (r) {
      if (cards[r.id]) cards[r.id].update(r);
      UI.status($('runStatus'), r.ok
        ? '✅ ' + r.name + ' ne jawab diya (' + UI.fmtMs(r.ms) + ')'
        : '❌ ' + r.error, r.ok ? 'ok' : 'err');
      $('resultCount').textContent = 'Fallback mode — pehla kaam karne wala ID';
      btn.disabled = false;
    });
  }

  /* ================= study helper ====================================== */
  function countWords() {
    var n = $('sDraft').value.trim().split(/\s+/).filter(Boolean).length;
    $('wc').textContent = n + ' words';
  }

  function ctx() {
    return 'Course: ' + ($('sCourse').value || 'AIOU course') + ' (' + ($('sCode').value || '-') + ')\n' +
           'Questions:\n' + $('sQ').value.trim();
  }

  var TUTOR = 'You are a patient study tutor for AIOU (Allama Iqbal Open University, Pakistan) students. ' +
    'Use simple English; add a short Roman Urdu summary at the end. Never invent facts, statistics, quotes, ' +
    'page numbers or URLs; say "verify karein" when unsure. Do NOT write the final assignment answer as ' +
    'ready-to-submit prose: guide the student to write it themselves.';

  var ACTS = {
    outline: {
      need: 'q', p: function () {
        return 'For each question below give: 1) what the question is really asking, 2) key concepts to cover, ' +
          '3) a suggested heading outline, 4) key points/examples to research, 5) common mistakes.\n\n' + ctx();
      }
    },
    explain: {
      need: 'q', p: function () {
        return 'Explain the core concepts needed for these questions in simple language with everyday examples, ' +
          'short definitions and a quick self-check quiz (3 questions, no answers).\n\n' + ctx();
      }
    },
    feedback: {
      need: 'd', p: function () {
        return ctx() + '\n\nStudent draft:\n"""\n' + $('sDraft').value.trim().slice(0, 9000) + '\n"""\n\n' +
          'Give: (a) strengths, (b) points missing compared to the questions, (c) structure advice, ' +
          '(d) grammar/clarity fixes as "original → improved" for the 8 most important sentences, ' +
          '(e) a score out of 10 with reasons. Do not rewrite the whole draft.';
      }
    },
    refs: {
      need: 'q', p: function () {
        return 'Suggest what kinds of sources to look for on these topics: search keywords, well-known ' +
          'textbook/author names ONLY if you are confident they exist, official AIOU/HEC resources, and an ' +
          'APA 7 format template. Mark every item "verify karein".\n\n' + ctx();
      }
    }
  };

  function helper(btnId, key) {
    var a = ACTS[key];
    if (a.need === 'q' && !$('sQ').value.trim()) {
      UI.toast('Pehle Assignment section me questions paste karein', 'err');
      return go(4);
    }
    if (a.need === 'd' && $('sDraft').value.trim().split(/\s+/).length < 30) {
      return UI.toast('Feedback ke liye kam az kam 30 alfaz ka apna draft likhein', 'err');
    }
    var b = $(btnId), old = b.textContent;
    b.disabled = true;
    b.textContent = '⏳ ...';
    tab(0);
    UI.status($('st2'), 'AI soch raha hai (IDs par fallback chal raha hai)...', 'ld');
    $('guide').textContent = 'Loading...';

    AI.ask({ system: TUTOR, user: a.p() }).then(function (r) {
      if (!r.ok) throw new Error(r.error);
      $('guide').textContent = r.text;
      $('guideMeta').textContent = r.name + ' · ' + r.model + ' · ' + UI.fmtMs(r.ms);
      UI.status($('st2'), '✅ Tayar', 'ok');
    })['catch'](function (e) {
      $('guide').textContent = 'Error: ' + e.message;
      $('guideMeta').textContent = '';
      UI.status($('st2'), '❌ ' + e.message, 'err');
    }).then(function () {
      b.disabled = false;
      b.textContent = old;
    });
  }

  /* ================= diagram =========================================== */
  var DSYS = 'Return ONLY valid Mermaid flowchart code starting with "graph TD". Use 6-12 nodes. ' +
    'Node labels: short plain words, letters/numbers/spaces only, NO brackets, quotes, parentheses or ' +
    'special characters inside labels. Node syntax: A[Label]. No markdown fences.';

  function makeDiagram() {
    var topic = $('dTopic').value.trim();
    if (!topic) return UI.toast('Diagram ka topic likhein', 'err');
    var b = $('btnDiag'), old = b.textContent;
    b.disabled = true;
    b.textContent = '⏳ Drawing...';
    tab(1);
    UI.status($('st3'), 'Diagram ban raha hai...', 'ld');
    diagramPng = null;

    AI.ask({ system: DSYS, user: 'Topic: ' + topic, temperature: 0.1, maxTokens: 900 })
      .then(function (first) {
        if (!first.ok) throw new Error(first.error);
        var code = first.text.replace(/```(?:mermaid)?/g, '').trim();
        return w.mermaid.render('m' + Date.now(), code)['catch'](function () {
          return AI.ask({
            system: DSYS,
            user: 'Topic: ' + topic + '\nPrevious code had a syntax error; use only very simple labels.',
            temperature: 0.1, maxTokens: 900
          }).then(function (second) {
            if (!second.ok) throw new Error(second.error);
            var code2 = second.text.replace(/```(?:mermaid)?/g, '').trim();
            return w.mermaid.render('m' + Date.now(), code2);
          });
        });
      })
      .then(function (rendered) { return paintDiagram(rendered.svg); })
      .then(function (png) {
        diagramPng = png;
        UI.status($('st3'), '✅ Diagram tayar — Assignment section se Word file me lag jayega', 'ok');
      })['catch'](function (e) {
        UI.status($('st3'), '❌ ' + e.message, 'err');
      }).then(function () {
        b.disabled = false;
        b.textContent = old;
      });
  }

  function paintDiagram(svg) {
    $('dArea').innerHTML = svg;
    return svgToPng(svg);
  }

  function svgToPng(svg) {
    return new w.Promise(function (resolve, reject) {
      var m = svg.match(/viewBox="([\d.\-\s]+)"/);
      var box = m ? m[1].trim().split(/\s+/).map(Number) : [0, 0, 800, 600];
      var W = box[2], H = box[3];
      var s = svg.replace(/<svg([^>]*)>/, function (all, attrs) {
        return '<svg' + attrs.replace(/\s(width|height)="[^"]*"/g, '') + ' width="' + W + '" height="' + H + '">';
      });
      var img = new w.Image();
      img.onload = function () {
        var k = 2,
            c = d.createElement('canvas');
        c.width = W * k;
        c.height = H * k;
        var g = c.getContext('2d');
        g.fillStyle = '#fff';
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (blob) {
          blob.arrayBuffer().then(function (buf) {
            resolve({ data: new Uint8Array(buf), w: W, h: H });
          });
        }, 'image/png');
      };
      img.onerror = function () { reject(new Error('Diagram ko image me convert nahi kar saka')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    });
  }

  /* ================= assignment (docx) ================================= */
  function buildDocx() {
    var lib = w.docx;
    if (!lib) throw new Error('docx library load nahi hui (internet check karein)');
    var Document = lib.Document, Packer = lib.Packer, Paragraph = lib.Paragraph, TextRun = lib.TextRun,
        HeadingLevel = lib.HeadingLevel, ImageRun = lib.ImageRun, AlignmentType = lib.AlignmentType,
        Footer = lib.Footer, PageNumber = lib.PageNumber;

    var name = $('sName').value || 'Student',
        roll = $('sRoll').value || 'N/A',
        course = $('sCourse').value || 'Course',
        code = $('sCode').value || '-',
        sem = $('sSem').value || '-';
    var draft = $('sDraft').value.trim();
    if (!draft) throw new Error('Pehle Assignment section me apna draft likhein');

    var C = AlignmentType.CENTER;
    function P(text, o) {
      o = o || {};
      return new Paragraph({
        alignment: o.a,
        spacing: { after: o.after === undefined ? 200 : o.after, line: 360 },
        indent: o.ind,
        children: [new TextRun({ text: text, size: o.sz || 24, bold: o.b })]
      });
    }

    var kids = [
      P('ALLAMA IQBAL OPEN UNIVERSITY', { a: C, b: true, sz: 36, after: 500 }),
      P('ASSIGNMENT', { a: C, b: true, sz: 32, after: 500 }),
      P('Course Name: ' + course, { a: C }),
      P('Course Code: ' + code, { a: C, after: 500 }),
      P('Name: ' + name, { a: C }),
      P('Roll No: ' + roll, { a: C }),
      P('Semester: ' + sem, { a: C }),
      new Paragraph({ text: 'Answers', heading: HeadingLevel.HEADING_1, pageBreakBefore: true, spacing: { after: 200 } })
    ];

    draft.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).forEach(function (l) {
      kids.push(l.startsWith('#')
        ? new Paragraph({ text: l.replace(/^#+\s*/, ''), heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 150 } })
        : P(l, { a: AlignmentType.JUSTIFIED }));
    });

    if (diagramPng) {
      var iw = Math.min(diagramPng.w, 500),
          ih = Math.round(diagramPng.h * iw / diagramPng.w);
      kids.push(P('Diagram: ' + ($('dTopic').value || ''), { a: C, b: true, after: 100 }));
      kids.push(new Paragraph({
        alignment: C,
        children: [new ImageRun({ data: diagramPng.data, type: 'png', transformation: { width: iw, height: ih } })]
      }));
    }

    var refs = $('sRefs').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (refs.length) {
      kids.push(new Paragraph({ text: 'References', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } }));
      refs.forEach(function (r) { kids.push(P(r, { ind: { left: 720, hanging: 720 } })); });
    }

    var doc = new Document({
      sections: [{
        properties: {},
        footers: {
          default: new Footer({
            children: [new Paragraph({ alignment: C, children: [new TextRun({ children: [PageNumber.CURRENT] })] })]
          })
        },
        children: kids
      }]
    });
    return Packer.toBlob(doc).then(function (blob) {
      return { blob: blob, file: name.replace(/\s+/g, '_') + '_' + code + '_Assignment.docx' };
    });
  }

  function downloadDoc() {
    var b = $('btnDoc'), old = b.textContent;
    b.disabled = true;
    b.textContent = '⏳ ...';
    UI.status($('st4'), 'Word file ban rahi hai...', 'ld');
    w.Promise.resolve().then(buildDocx).then(function (out) {
      UI.downloadBlob(out.blob, out.file);
      UI.status($('st4'), '✅ Download ho gayi' + (diagramPng ? '' : ' (diagram nahi lagi — Diagram section me bana lein)'), 'ok');
    })['catch'](function (e) {
      UI.status($('st4'), '❌ ' + e.message, 'err');
    }).then(function () {
      b.disabled = false;
      b.textContent = old;
    });
  }

  /* ================= output tabs + hub ================================= */
  function tab(i) {
    [0, 1].forEach(function (k) {
      $('p' + k).classList.toggle('hid', k !== i);
      UI.$$('.tabs .tab')[k].classList.toggle('active', k === i);
    });
  }

  var hubDone = false;
  function renderHub() {
    if (hubDone) return;
    w.AIOU.hub.render($('hub'), { base: '' });
    hubDone = true;
  }

  /* ================= boot ============================================== */
  function boot() {
    if (!w.mermaid) { UI.toast('Mermaid load nahi hui — diagram offline nahi banega', 'err'); }
    w.mermaid && w.mermaid.initialize({ startOnLoad: false, theme: 'default', flowchart: { htmlLabels: false } });

    buildNav();
    renderIds();
    bindIdButtons();

    var set = S.getSettings();
    $('sysPrompt').value = set.system || '';
    $('temp').value = set.temperature;
    $('maxTok').value = set.maxTokens;
    $('jsonMode').checked = !!set.json;
    $('tempOut').textContent = set.temperature;

    $('temp').addEventListener('input', function () { $('tempOut').textContent = $('temp').value; });
    $('sysPrompt').addEventListener('change', function () { S.setSettings({ system: $('sysPrompt').value }); });
    $('jsonMode').addEventListener('change', function () { S.setSettings({ json: $('jsonMode').checked }); });

    $('btnRunAll').addEventListener('click', runAll);
    $('btnRunFirst').addEventListener('click', runFirst);
    $('btnDiag').addEventListener('click', makeDiagram);
    $('btnDoc').addEventListener('click', downloadDoc);
    $('btnGuideCopy').addEventListener('click', function () { UI.copy($('guide').textContent); });
    $('btnGuideDraft').addEventListener('click', function () {
      var t = $('guide').textContent;
      if (!t || t.indexOf('AI ki madad yahan') === 0) return UI.toast('Pehle koi action chalayein', 'err');
      $('sDraft').value = t;
      countWords();
      go(4);
      UI.toast('Guide ka jawab draft me chala gaya');
    });

    [['bOutline', 'outline'], ['bExplain', 'explain'], ['bFeedback', 'feedback'], ['bRefs', 'refs']]
      .forEach(function (pair) {
        var btn = $(pair[0]);
        if (btn) btn.addEventListener('click', function () { helper(pair[0], pair[1]); });
      });

    UI.$$('.tabs .tab').forEach(function (t, i) { t.addEventListener('click', function () { tab(i); }); });

    $('sDraft').addEventListener('input', countWords);
    countWords();
    go(1);
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
