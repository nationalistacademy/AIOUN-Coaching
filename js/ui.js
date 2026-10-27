/* ==========================================================================
   AIOU Coaching — ui.js
   Tiny DOM helpers so page scripts stay short. No framework, no build step.

   Exposes: window.AIOU.ui
   ========================================================================== */
(function (w) {
  'use strict';

  var d = w.document;

  function $(id) { return d.getElementById(id); }
  function $$(sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); }

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* el('div', 'class-a class-b', 'text', { onclick: fn }) */
  function el(tag, cls, text, attrs) {
    var node = d.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'html') { node.innerHTML = attrs[k]; return; }
        if (k.slice(0, 2) === 'on') { node.addEventListener(k.slice(2), attrs[k]); return; }
        if (k === 'dataset') {
          Object.keys(attrs[k]).forEach(function (dk) { node.dataset[dk] = attrs[k][dk]; });
          return;
        }
        node.setAttribute(k, attrs[k]);
      });
    }
    return node;
  }

  function empty(node) { if (node) node.innerHTML = ''; }
  function add(parent, child) { if (parent && child) parent.appendChild(child); return child; }

  /* status line inside an element that has class "stt" */
  function status(node, msg, kind) {
    if (!node) return;
    if (!msg) { node.className = 'stt hid'; node.textContent = ''; return; }
    node.className = 'stt ' + (kind || 'ld');
    node.textContent = msg;
  }

  var toastTimer = null;
  function toast(msg, kind) {
    var t = $('aiou-toast');
    if (!t) {
      t = el('div', '', '', { id: 'aiou-toast' });
      t.style.cssText = 'position:fixed;z-index:9999;left:50%;bottom:24px;transform:translateX(-50%);' +
        'max-width:90vw;padding:11px 20px;border-radius:999px;font-size:.85rem;font-weight:700;' +
        'backdrop-filter:blur(14px);box-shadow:0 10px 30px rgba(0,0,0,.35);transition:opacity .25s;' +
        'font-family:system-ui,-apple-system,sans-serif';
      d.body.appendChild(t);
    }
    t.style.background = kind === 'err' ? 'rgba(239,68,68,.92)' : 'rgba(22,163,74,.92)';
    t.style.color = '#fff';
    t.style.opacity = '1';
    t.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.style.opacity = '0'; }, 2600);
  }

  function fallbackCopy(text) {
    var ta = el('textarea', '', text);
    ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px';
    d.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = d.execCommand('copy'); } catch (e) { ok = false; }
    d.body.removeChild(ta);
    return ok;
  }

  function copy(text) {
    text = String(text || '');
    if (!text) { toast('Kuch bhi copy karne ko nahi hai', 'err'); return Promise.resolve(false); }
    if (w.navigator.clipboard && w.isSecureContext !== false) {
      return w.navigator.clipboard.writeText(text).then(function () {
        toast('Copy ho gaya ✅');
        return true;
      }).catch(function () {
        var ok = fallbackCopy(text);
        toast(ok ? 'Copy ho gaya ✅' : 'Copy nahi ho saka', ok ? 'ok' : 'err');
        return ok;
      });
    }
    var ok2 = fallbackCopy(text);
    toast(ok2 ? 'Copy ho gaya ✅' : 'Copy nahi ho saka', ok2 ? 'ok' : 'err');
    return Promise.resolve(ok2);
  }

  function downloadBlob(blob, filename) {
    var url = w.URL.createObjectURL(blob);
    var a = el('a', '', '', { href: url, download: filename });
    d.body.appendChild(a);
    a.click();
    setTimeout(function () { w.URL.revokeObjectURL(url); d.body.removeChild(a); }, 1500);
  }

  function fmtMs(ms) {
    if (!ms && ms !== 0) return '—';
    return ms < 1000 ? ms + ' ms' : (ms / 1000).toFixed(1) + ' s';
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  w.AIOU = w.AIOU || {};
  w.AIOU.ui = {
    $: $, $$: $$, esc: esc, el: el, empty: empty, add: add,
    status: status, toast: toast, copy: copy, downloadBlob: downloadBlob,
    fmtMs: fmtMs, shuffle: shuffle
  };
})(window);
