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

  /* Convenience: first working saved ID. */
  function ask(o) {
    var ids = store ? store.enabledIds() : [];
    if (!ids.length) {
      return Promise.resolve({
        id: null, name: '—', model: '—', ok: false, text: '', reasoning: '',
        error: 'Pehle "Multi-ID Response" section me kam az kam ek Worker URL save karein', ms: 0, chars: 0
      });
    }
    return askFirst(ids, o);
  }

  w.AIOU = w.AIOU || {};
  w.AIOU.ai = { askId: askId, askAll: askAll, askFirst: askFirst, ask: ask };
})(window);
