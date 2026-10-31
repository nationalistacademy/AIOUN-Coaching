/* ==========================================================================
   AIOU Coaching — hub.js
   Renders the list from js/tools.js as a searchable, filterable card grid.

   Usage:
     AIOU.hub.render(document.getElementById('hub'), { base: 'tools/' });
     // base is prefixed to every tool link ('' when the page lives in tools/)

   Exposes: window.AIOU.hub
   ========================================================================== */
(function (w) {
  'use strict';

  var T = (w.AIOU && w.AIOU.tools) || { groups: [{ id: 'all', label: 'All' }], list: [] };
  var ui = (w.AIOU && w.AIOU.ui) || {};

  function norm(s) { return String(s === undefined || s === null ? '' : s).toLowerCase(); }

  function render(mount, opts) {
    opts = opts || {};
    var base = opts.base || '';
    if (!mount) return;

    var bar = ui.el('div', 'hubbar');
    var search = ui.el('input', '', null, {
      type: 'search',
      placeholder: 'Tool dhoondein… (guess paper, cover page, humanizer)',
      'aria-label': 'Search tools'
    });
    ui.add(bar, search);

    var chips = ui.el('div', 'chips');
    var count = ui.el('div', 'count', null, { 'aria-live': 'polite' });
    var grid = ui.el('div', 'tgrid');
    var current = 'all';
    var query = '';

    function matches(item) {
      if (current !== 'all' && item.group !== current) return false;
      if (!query) return true;
      var hay = norm([item.name, item.desc, item.id, (item.badges || []).join(' ')].join(' '));
      return query.split(/\s+/).every(function (part) { return hay.indexOf(part) > -1; });
    }

    function card(item) {
      var c = ui.el('article', 'tcard');
      var sheen = ui.el('span', 'sheen', null, { 'aria-hidden': 'true' }); // crystal highlight on hover
      ui.add(c, sheen);
      ui.add(c, ui.el('div', 'tic', item.icon));
      ui.add(c, ui.el('h3', '', item.name));
      ui.add(c, ui.el('p', '', item.desc));
      var tb = ui.el('div', 'tb');
      (item.badges || []).forEach(function (b) { ui.add(tb, ui.el('span', 'badge', b)); });
      ui.add(c, tb);
      ui.add(c, ui.el('a', 'btn ghost go', 'Open tool →', { href: base + item.file }));
      return c;
    }

    function paint() {
      ui.empty(grid);
      var shown = T.list.filter(matches);
      if (!shown.length) {
        ui.add(grid, ui.el('p', 'hub-empty', 'Kuch nahi mila — doosra lafz try karein.'));
      } else {
        shown.forEach(function (item) { ui.add(grid, card(item)); });
      }
      count.textContent = shown.length + ' / ' + T.list.length + ' tools dikh rahe hain';
      Array.prototype.forEach.call(chips.children, function (ch) {
        var on = ch.dataset.group === current;
        ch.className = 'chip' + (on ? ' on' : '');
        ch.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    T.groups.forEach(function (g) {
      var ch = ui.el('button', 'chip', g.label, {
        type: 'button', dataset: { group: g.id }, 'aria-pressed': 'false'
      });
      ch.addEventListener('click', function () { current = g.id; paint(); });
      ui.add(chips, ch);
    });

    search.addEventListener('input', function () {
      query = norm(this.value).trim();
      paint();
    });
    // "/" focuses the search box, like GitHub
    w.document.addEventListener('keydown', function (e) {
      if (e.key === '/' && e.target !== search && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) {
        e.preventDefault();
        search.focus();
      }
    });

    ui.empty(mount);
    ui.add(mount, bar);
    ui.add(mount, chips);
    ui.add(mount, count);
    ui.add(mount, grid);
    paint();
  }

  w.AIOU = w.AIOU || {};
  w.AIOU.hub = { render: render };
})(window);
