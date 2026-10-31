/* ==========================================================================
   AIOU Coaching — store.js
   Keeps Worker URL + access token + model settings in localStorage.
   The Ollama API key remains server-side in Cloudflare.
   Exposes: window.AIOU.store
   ========================================================================== */
(function (w) {
  'use strict';

  var KEYS = {
    ids: 'aiou_ids_v2',
    settings: 'aiou_settings_v2',
    legacyUrl: 'aw_worker',
    legacyToken: 'aw_token'
  };

  var MODELS = [
    { value: 'ollama/glm-5.3', label: 'GLM 5.3 — Ollama Cloud' },
    { value: 'ollama/gpt-oss:120b-cloud', label: 'GPT-OSS 120B — Ollama Cloud' },
    { value: 'ollama/deepseek-v4-pro', label: 'DeepSeek V4 Pro — Ollama Cloud' },
    { value: 'openrouter/auto', label: 'Auto — OpenRouter' },
    { value: 'openrouter/openai/gpt-4.1', label: 'GPT-4.1 — OpenRouter' },
    { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek/deepseek-reasoner', label: 'DeepSeek Reasoner' },
    { value: 'claude/claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
    { value: 'claude/claude-haiku-4-5', label: 'Claude Haiku 4.5' },
    { value: 'codex/gpt-5-codex', label: 'GPT-5 Codex (configure API URL)' },
    { value: 'freebuff/deepseek/deepseek-v4-flash', label: 'DeepSeek V4 Flash — Freebuff (configure URL)' }
  ];

  var DEFAULT_SYSTEM =
    'You are a study assistant for AIOU (Allama Iqbal Open University, Pakistan) students. ' +
    'Answer in simple English and add a short Roman Urdu summary at the end. ' +
    'Never invent facts, statistics, quotes, page numbers or URLs — say "verify karein" when unsure.';

  var DEFAULT_SETTINGS = {
    system: DEFAULT_SYSTEM,
    temperature: 0.7,
    maxTokens: 4000,
    json: false,
    timeoutMs: 120000
  };

  function read(key, fallback) {
    try {
      var raw = w.localStorage.getItem(key);
      if (!raw) return fallback;
      var val = JSON.parse(raw);
      return val === null || val === undefined ? fallback : val;
    } catch (e) { return fallback; }
  }

  function write(key, val) {
    try { w.localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  function uid() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function validUrl(u) {
    if (!u) return false;
    try {
      var p = new w.URL(String(u).trim());
      return (p.protocol === 'http:' || p.protocol === 'https:') && !!p.host;
    } catch (e) { return false; }
  }

  function host(u) {
    try { return new w.URL(String(u).trim()).host; } catch (e) { return String(u || ''); }
  }

  function isModel(m) {
    for (var i = 0; i < MODELS.length; i++) {
      if (MODELS[i].value === m) return true;
    }
    return false;
  }

  function normalizeId(o) {
    o = o || {};
    var url = String(o.url || '').trim();
    var name = String(o.name || '').trim();
    if (!name) name = validUrl(url) ? host(url).split('.')[0] : 'ID';
    return {
      id: String(o.id || uid()),
      name: name.slice(0, 40),
      url: url,
      token: String(o.token || '').trim(),
      model: isModel(o.model) ? o.model : 'ollama/glm-5.3',
      enabled: o.enabled !== false
    };
  }

  function migrate() {
    var url = '';
    var token = '';
    try {
      url = (w.localStorage.getItem(KEYS.legacyUrl) || '').trim();
      token = (w.localStorage.getItem(KEYS.legacyToken) || '').trim();
    } catch (e) { /* ignore */ }
    if (!validUrl(url)) return [];
    var list = [normalizeId({ name: 'Worker 1', url: url, token: token })];
    write(KEYS.ids, list);
    return list;
  }

  function getIds() {
    var list = read(KEYS.ids, null);
    if (!Array.isArray(list)) list = migrate();
    return (list || []).map(normalizeId);
  }

  function setIds(list) {
    var clean = (list || []).map(normalizeId);
    write(KEYS.ids, clean);
    return clean;
  }

  function addId(partial) {
    var list = getIds();
    var item = normalizeId(partial || {});
    item.name = item.name === 'ID' ? 'Worker ' + (list.length + 1) : item.name;
    list.push(item);
    setIds(list);
    return item;
  }

  function updateId(id, patch) {
    var list = getIds();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) list[i] = normalizeId(Object.assign({}, list[i], patch, { id: id }));
    }
    return setIds(list);
  }

  function removeId(id) {
    return setIds(getIds().filter(function (x) { return x.id !== id; }));
  }

  function enabledIds() {
    return getIds().filter(function (x) { return x.enabled && validUrl(x.url); });
  }

  function exportIds() {
    return JSON.stringify({ version: 2, ids: getIds() }, null, 2);
  }

  function importIds(text) {
    var data = JSON.parse(text);
    var list = Array.isArray(data) ? data : (data && data.ids);
    if (!Array.isArray(list)) throw new Error('File me "ids" array nahi mila');
    return setIds(list);
  }

  function getSettings() {
    var s = read(KEYS.settings, {}) || {};
    return Object.assign({}, DEFAULT_SETTINGS, s);
  }

  function setSettings(patch) {
    var s = Object.assign({}, getSettings(), patch || {});
    write(KEYS.settings, s);
    return s;
  }

  w.AIOU = w.AIOU || {};
  w.AIOU.store = {
    KEYS: KEYS,
    MODELS: MODELS,
    DEFAULT_SYSTEM: DEFAULT_SYSTEM,
    uid: uid,
    validUrl: validUrl,
    host: host,
    getIds: getIds,
    setIds: setIds,
    addId: addId,
    updateId: updateId,
    removeId: removeId,
    enabledIds: enabledIds,
    exportIds: exportIds,
    importIds: importIds,
    getSettings: getSettings,
    setSettings: setSettings
  };
})(window);
