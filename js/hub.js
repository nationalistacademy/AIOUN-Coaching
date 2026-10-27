/* ==========================================================================
   AIOU Coaching — hub.js
   Renders the list from js/tools.js as a filterable card grid.

   Usage:
     AIOU.hub.render(document.getElementById('hub'), { base: 'tools/' });
     // base is prefixed to every tool link ('' when the page lives in tools/)

   Exposes: window.AIOU.hub
   ========================================================================== */
(function (w) {
  'use strict';

  var T = (w.AIOU && w.AIOU.tools) || { groups: [{ id: 'all', label: 'All' }], list: [] };
  var ui = (w.AIOU && w.AIOU.ui) || {};

  function render(mount, opts) {
    opts = opts || {};
    var base = opts.base || '';
    if (!mount) return;

    var chips = ui.el('div', 'chips');
    var grid = ui.el('div', 'tgrid');
    var count = ui.el('div', 'count');
    var current = 'all';

    function matches(item) {
      if (current === 'all') return true;
      if (current === 'ai') return item.group === 'ai';
      return item.group === current;
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
      shown.forEach(function (item) { ui.add(grid, card(item)); });
      count.textContent = shown.length + ' tool' + (shown.length === 1 ? '' : 's') + ' dikh rahe hain';
      Array.prototype.forEach.call(chips.children, function (ch) {
        ch.className = 'chip' + (ch.dataset.group === current ? ' on' : '');
      });
    }

    T.groups.forEach(function (g) {
      var ch = ui.el('button', 'chip', g.label, { type: 'button', dataset: { group: g.id } });
      ch.addEventListener('click', function () { current = g.id; paint(); });
      ui.add(chips, ch);
    });

    ui.empty(mount);
    ui.add(mount, chips);
    ui.add(mount, count);
    ui.add(mount, grid);
    paint();
  }

  w.AIOU = w.AIOU || {};
  w.AIOU.hub = { render: render };
})(window);
