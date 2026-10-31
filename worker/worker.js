// AIOU Coaching AI Worker — Ollama Cloud proxy
// Deploy from the worker/ directory. Keep OLLAMA_API_KEY server-side.
//
// Required Cloudflare runtime secrets:
//   OLLAMA_API_KEY  — Ollama Cloud API key
//   AUTH_TOKEN      — one or more comma-separated client access tokens
//
// Optional runtime variables:
//   OLLAMA_MODEL      — default model (default: glm-5.3)
//   ALLOWED_ORIGINS   — comma-separated exact browser origins
//   AI_TIMEOUT_MS     — upstream timeout in milliseconds

const OLLAMA_URL = 'https://ollama.com/api/chat';
const DEFAULT_MODEL = 'glm-5.3';
const ALLOWED_MODELS = [
  'glm-5.3',
  'gpt-oss:120b-cloud',
  'deepseek-v4-pro'
];
const DEFAULT_ORIGINS = [
  'https://aioucoaching.blogspot.com',
  'https://aioucoaching.netlify.app'
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = getAllowedOrigins(env);
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : 'null',
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
      'Access-Control-Max-Age': '86400'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === 'GET') {
      return json({
        ok: true,
        service: 'aiou-coaching-ollama',
        provider: 'ollama-cloud',
        defaultModel: env.OLLAMA_MODEL || DEFAULT_MODEL,
        models: ALLOWED_MODELS,
        authRequired: true
      }, 200, cors);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed. Use POST.' }, 405, cors);
    }

    if (!origin || !allowed.includes(origin)) {
      return json({ error: 'Origin not allowed' }, 403, cors);
    }

    if (!env.OLLAMA_API_KEY) {
      return json({ error: 'Server setup incomplete: OLLAMA_API_KEY secret missing' }, 503, cors);
    }

    if (!hasTokens(env)) {
      return json({ error: 'Server setup incomplete: AUTH_TOKEN secret missing' }, 503, cors);
    }

    if (!authorized(request, env)) {
      return json({ error: 'Unauthorized — X-Auth-Token missing or invalid' }, 401, cors);
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 65536) {
      return json({ error: 'Request too large (maximum 64 KB)' }, 413, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, cors);
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json({ error: 'messages[] array is required' }, 400, cors);
    }

    const requestedModel = String(body.model || env.OLLAMA_MODEL || DEFAULT_MODEL);
    const model = ALLOWED_MODELS.includes(requestedModel)
      ? requestedModel
      : (ALLOWED_MODELS.includes(env.OLLAMA_MODEL) ? env.OLLAMA_MODEL : DEFAULT_MODEL);

    const payload = {
      model: model,
      messages: body.messages,
      stream: false,
      options: {
        temperature: clamp(num(body.temperature, 0.7), 0, 2),
        num_predict: clamp(num(body.max_tokens, 4000), 16, 8192)
      }
    };

    if (body.json === true) payload.format = 'json';

    const controller = new AbortController();
    const timeoutMs = clamp(num(env.AI_TIMEOUT_MS, 120000), 10000, 180000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + env.OLLAMA_API_KEY
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return json({ error: 'Ollama returned a non-JSON response', detail: raw.slice(0, 300) }, 502, cors);
      }

      if (!response.ok) {
        const message = data.error || 'Ollama Cloud API error';
        return json({ error: message, model: model, status: response.status }, response.status, cors);
      }

      const message = data.message || {};
      const content = String(message.content || '');
      if (!content.trim()) {
        return json({ error: 'Ollama returned an empty response', model: model }, 502, cors);
      }

      // Keep the OpenAI-compatible response shape expected by the existing AI Studio.
      return json({
        id: data.id || ('ollama-' + Date.now()),
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: data.model || model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: content,
            reasoning_content: String(message.thinking || '')
          },
          finish_reason: data.done_reason || 'stop'
        }],
        usage: {
          prompt_tokens: num(data.prompt_eval_count, 0),
          completion_tokens: num(data.eval_count, 0),
          total_tokens: num(data.prompt_eval_count, 0) + num(data.eval_count, 0)
        }
      }, 200, cors);
    } catch (error) {
      const message = error && error.name === 'AbortError'
        ? 'Ollama Cloud timeout'
        : 'Upstream error: ' + (error && error.message ? error.message : 'unknown');
      return json({ error: message }, 504, cors);
    } finally {
      clearTimeout(timeout);
    }
  }
};

function getAllowedOrigins(env) {
  const configured = String(env.ALLOWED_ORIGINS || '').split(',').map(function (x) {
    return x.trim();
  }).filter(Boolean);
  return configured.length ? configured : DEFAULT_ORIGINS;
}

function authorized(request, env) {
  const configured = String(env.AUTH_TOKEN || '').split(',').map(function (x) {
    return x.trim();
  }).filter(Boolean);
  const sent = String(request.headers.get('X-Auth-Token') || '').trim();
  return !!sent && configured.includes(sent);
}

function hasTokens(env) {
  return String(env.AUTH_TOKEN || '').split(',').some(function (x) {
    return x.trim().length > 0;
  });
}

function num(value, fallback) {
  return typeof value === 'number' && isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({}, cors || {}, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    })
  });
}
