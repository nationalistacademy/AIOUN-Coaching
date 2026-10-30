/* ==========================================================================
   AIOU Coaching — ai.js
   Talks to your Cloudflare Worker (worker/worker.js), which proxies the
   DeepSeek API. Supports many "IDs" at once:

     AI.askAll(ids, opts)   -> same prompt to every ID, in parallel
     AI.askFirst(ids, opts) -> first ID that answers wins (fallback)
     AI.ask(opts)           -> first working ID from the saved list

   Every call resolves to a result object, so one dead ID never stops the rest:
     { id, name, model, ok, text, reasoning, error, ms, chars }

   Exposes: window.AIOU.ai
   ========================================================================== */
(function (w) {
  'use strict';

  var store = w.AIOU && w.AIOU.store;

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function endpoint(id) {
    return {
      url: String((id && id.url) || '').trim(),
      token: String((id && id.token) || '').trim()
    };
  }

  function opts2body(id, o) {
    o = o || {};
    var s = store ? store.getSettings() : {};
    var messages = [];
    var sys = o.system !== undefined ? o.system : s.system;
    if (sys) messages.push({ role: 'system', content: String(sys) });
    messages.push({ role: 'user', content: String(o.user || '') });

    return {
      model: o.model || (id && id.model) || 'deepseek-chat',
      messages: messages,
      temperature: typeof o.temperature === 'number' ? o.temperature : (s.temperature || 0.7),
      max_tokens: o.maxTokens || s.maxTokens || 4000,
      json: o.json === undefined ? !!s.json : !!o.json
    };
  }

  /* One ID, one answer. Never throws — failures come back as { ok: false }. */
  function askId(id, o) {
    var started = Date.now();
    var e = endpoint(id);
    var out = {
      id: id && id.id, name: (id && id.name) || 'ID', model: (id && id.model) || 'deepseek-chat',
      ok: false, text: '', reasoning: '', error: '', ms: 0, chars: 0
    };

    if (!store || !store.validUrl(e.url)) {
      out.error = 'Worker URL set nahi hai';
      return Promise.resolve(out);
    }

    var timeoutMs = (o && o.timeoutMs) || (store.getSettings().timeoutMs || 120000);
    var ctrl = w.AbortController ? new w.AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeoutMs);

    return w.fetch(e.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': e.token },
      body: JSON.stringify(opts2body(id, o)),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.text().then(function (raw) {
        if (!r.ok) {
          var msg = raw.slice(0, 300);
          try { msg = JSON.parse(raw).error || msg; } catch (err) { /* keep raw */ }
          throw new Error('Worker ' + r.status + ': ' + msg);
        }
        var data;
        try { data = JSON.parse(raw); } catch (err) { throw new Error('Worker ne JSON nahi diya'); }
        if (data.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
        var msg2 = (data.choices && data.choices[0] && data.choices[0].message) || {};
        var text = String(msg2.content || '').trim();
        if (!text) throw new Error('AI ne khali jawab diya');
        out.text = text;
        out.reasoning = String(msg2.reasoning_content || '').trim();
        out.ok = true;
        return out;
      });
    }).catch(function (err) {
      out.error = err && err.name === 'AbortError'
        ? 'Timeout — ' + Math.round(timeoutMs / 1000) + 's me jawab nahi aaya'
        : (err && err.message) || 'Unknown error';
      return out;
    }).then(function (res) {
      clearTimeout(timer);
      res.ms = Date.now() - started;
      res.chars = res.text.length;
      return res;
    });
  }

  /* Same prompt to every ID. onDone(result) fires as each one finishes. */
  function askAll(ids, o, onDone) {
    var list = (ids || []).slice();
    return Promise.all(list.map(function (id) {
      return askId(id, o).then(function (res) {
        if (typeof onDone === 'function') { try { onDone(res); } catch (e) { /* ignore */ } }
        return res;
      });
    }));
  }

  /* Try IDs one by one until one answers (order = list order). */
  function askFirst(ids, o, onTry) {
    var list = (ids || []).slice();
    var last = null;
    return list.reduce(function (chain, id, i) {
      return chain.then(function (done) {
        if (done) return done;
        if (typeof onTry === 'function') onTry(id, i);
        return askId(id, o).then(function (res) {
          if (res.ok) return res;
          last = res;
          if (i < list.length - 1) return sleep(250).then(function () { return null; });
          return null;
        });
      });
    }, Promise.resolve(null)).then(function (res) {
      return res || last || {
        id: null, name: '—', model: '—', ok: false, text: '', reasoning: '',
        error: 'Koi bhi ID kaam nahi kar raha — settings check karein', ms: 0, chars: 0
      };
    });
  }

  /* Local Ollama: prompts stay on this device; no cloud API key or fee. */
  var OLLAMA_KEY = 'aiou_ollama_settings_v1';
  function ollamaConfig() {
    try {
      var saved = JSON.parse(w.localStorage.getItem(OLLAMA_KEY) || '{}');
      return { enabled: saved.enabled === true, host: 'http://127.0.0.1:11434',
        model: String(saved.model || 'qwen2.5:3b').trim() };
    } catch (e) { return { enabled: false, host: 'http://127.0.0.1:11434', model: 'qwen2.5:3b' }; }
  }
  function saveOllamaConfig(patch) {
    var current = ollamaConfig();
    var next = { enabled: patch.enabled === undefined ? current.enabled : !!patch.enabled,
      model: String(patch.model || current.model || 'qwen2.5:3b').trim().slice(0, 80) };
    try { w.localStorage.setItem(OLLAMA_KEY, JSON.stringify(next)); } catch (e) {}
    return ollamaConfig();
  }
  function askOllama(o) {
    o = o || {};
    var cfg = ollamaConfig(), started = Date.now();
    var out = { id: 'local-ollama', name: 'Local Ollama', model: cfg.model, ok: false,
      text: '', reasoning: '', error: '', ms: 0, chars: 0 };
    var messages = [], settings = store ? store.getSettings() : {};
    var system = o.system !== undefined ? o.system : settings.system;
    if (system) messages.push({ role: 'system', content: String(system) });
    messages.push({ role: 'user', content: String(o.user || '') });
    var controller = w.AbortController ? new w.AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, (o.timeoutMs || 120000));
    return w.fetch(cfg.host + '/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: cfg.model, messages: messages, stream: false,
        options: { temperature: typeof o.temperature === 'number' ? o.temperature : 0.7,
          num_predict: o.maxTokens || settings.maxTokens || 4000 } }),
      signal: controller ? controller.signal : undefined
    }).then(function (r) {
      return r.text().then(function (raw) {
        if (!r.ok) throw new Error('Ollama ' + r.status + ': ' + raw.slice(0, 240));
        var data = JSON.parse(raw);
        out.text = String(data.message && data.message.content || '').trim();
        if (!out.text) throw new Error('Ollama ne khali jawab diya');
        out.ok = true; return out;
      });
    }).catch(function (err) {
      out.error = err && err.name === 'AbortError' ? 'Local Ollama timeout' :
        ((err && err.message) || 'Ollama connect nahi hua. Ollama start karein aur model pull karein.');
      return out;
    }).then(function (result) {
      clearTimeout(timeout); result.ms = Date.now() - started; result.chars = result.text.length; return result;
    });
  }

  function withLocalOllama(ids) {
    var cfg = ollamaConfig(), list = (ids || []).slice();
    if (cfg.enabled) list.unshift({ id: 'local-ollama', name: 'Local Ollama', model: cfg.model, enabled: true, localOllama: true });
    return list;
  }

  var workerAskId = askId;
  askId = function (id, o) { return id && id.localOllama ? askOllama(o) : workerAskId(id, o); };
  var workerAskAll = askAll;
  askAll = function (ids, o, onDone) { return workerAskAll(withLocalOllama(ids), o, onDone); };
  var workerAskFirst = askFirst;
  askFirst = function (ids, o, onTry) { return workerAskFirst(withLocalOllama(ids), o, onTry); };

  /* Convenience: prefer local Ollama, then fall back to saved Worker IDs. */
  function ask(o) {
    var ids = store ? store.enabledIds() : [];
    if (!ids.length && !ollamaConfig().enabled) {
      return Promise.resolve({ id: null, name: '—', model: '—', ok: false, text: '', reasoning: '',
        error: 'Ollama enable karein ya pehle Worker URL save karein', ms: 0, chars: 0 });
    }
    return askFirst(ids, o);
  }

  w.AIOU = w.AIOU || {};
  w.AIOU.ai = { askId: askId, askAll: askAll, askFirst: askFirst, ask: ask,
    ollamaConfig: ollamaConfig, saveOllamaConfig: saveOllamaConfig,
    testOllama: function () {
      var previous = ollamaConfig();
      saveOllamaConfig({ enabled: true });
      return askOllama({ system: 'Reply with exactly OK.', user: 'Connection test. Reply OK.', maxTokens: 8, timeoutMs: 15000 })
        .then(function (result) { saveOllamaConfig({ enabled: previous.enabled }); return result; });
    } };
})(window);
