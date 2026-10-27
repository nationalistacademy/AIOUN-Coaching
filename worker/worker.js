// AIOU Coaching AI Worker — DeepSeek API proxy
// Deploy from the worker/ folder on Cloudflare Workers.
//
// Secrets (Cloudflare dashboard or `wrangler secret put`):
//   DEEPSEEK_API_KEY   required — your DeepSeek key, stays server side
//   AUTH_TOKEN         required — one token, or many separated by commas
//
// The browser never sees the DeepSeek key. Tools send an X-Auth-Token header
// that must match one of the tokens above; kai "IDs" = kai tokens.

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODELS = ['deepseek-chat', 'deepseek-reasoner'];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
  'Access-Control-Max-Age': '86400'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Health check: useful when the studio tests several Worker URLs at once.
    if (request.method === 'GET') {
      return json({
        ok: true,
        service: 'aiou-coaching-tools',
        models: MODELS,
        authRequired: true,
        tokens: countTokens(env)
      }, 200);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed. Use POST.' }, 405);
    }

    if (!env.DEEPSEEK_API_KEY) {
      return json({ error: 'Server setup incomplete: DEEPSEEK_API_KEY secret missing' }, 500);
    }

    if (!String(env.AUTH_TOKEN || '').split(',').some((t) => t.trim())) {
      return json({ error: 'Server setup incomplete: AUTH_TOKEN secret missing. Configure it before enabling AI requests.' }, 503);
    }

    if (!authorized(request, env)) {
      return json({ error: 'Unauthorized — X-Auth-Token galat hai ya missing' }, 401);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json({ error: 'messages[] array is required' }, 400);
    }

    const model = MODELS.includes(body.model) ? body.model : MODELS[0];
    const payload = {
      model,
      messages: body.messages,
      temperature: clamp(num(body.temperature, 0.7), 0, 2),
      max_tokens: clamp(num(body.max_tokens, 4000), 16, 8192),
      stream: false
    };

    if (body.json === true) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Number(env.AI_TIMEOUT_MS) || 120000);

      const r = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));

      const raw = await r.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return json({ error: 'DeepSeek ne JSON ke ilawa jawab diya', detail: raw.slice(0, 300) }, 502);
      }

      if (!r.ok) {
        return json({
          error: data.error?.message || 'DeepSeek API error',
          model,
          status: r.status
        }, r.status);
      }

      return json(data, 200);
    } catch (e) {
      const msg = e && e.name === 'AbortError' ? 'DeepSeek timeout' : 'Upstream error: ' + (e && e.message);
      return json({ error: msg }, 504);
    }
  }
};

function authorized(request, env) {
  const configured = String(env.AUTH_TOKEN || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  if (configured.length === 0) return false; // fail closed: never expose an unauthenticated API proxy
  const sent = String(request.headers.get('X-Auth-Token') || '').trim();
  return !!sent && configured.includes(sent);
}

function countTokens(env) {
  return String(env.AUTH_TOKEN || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean).length;
}

function num(value, fallback) {
  return typeof value === 'number' && isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
