// AIOU Coaching AI Worker — multi-provider gateway
// Deploy from worker/ with Wrangler. Provider API keys stay in Cloudflare Secrets.
// Required: AUTH_TOKEN. Providers: OLLAMA_API_KEY, OPENROUTER_API_KEY,
// DEEPSEEK_API_KEY, CLAUDE_API_KEY. Optional endpoint variables:
// FREEBUFF_BASE_URL, CODEX_API_URL, FREEBUFF_MODEL, CODEX_MODEL.

const DEFAULT_ORIGINS = [
  'https://aioucoaching.blogspot.com',
  'https://aioucoaching.netlify.app',
  'https://nationalistacademy.github.io'
];
const DEFAULT_MODEL = 'ollama/glm-5.3';

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

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (request.method === 'GET') {
      return json({
        ok: true,
        service: 'aiou-coaching-multi-provider',
        providers: {
          ollama: !!env.OLLAMA_API_KEY,
          openrouter: !!env.OPENROUTER_API_KEY,
          deepseek: !!env.DEEPSEEK_API_KEY,
          claude: !!env.CLAUDE_API_KEY,
          codex: !!(env.CODEX_API_KEY && env.CODEX_API_URL),
          freebuff: !!(env.FREEBUFF_API_KEY && env.FREEBUFF_BASE_URL)
        },
        defaultModel: env.DEFAULT_MODEL || DEFAULT_MODEL,
        authRequired: true
      }, 200, cors);
    }

    if (request.method !== 'POST') return json({ error: 'Method not allowed. Use POST.' }, 405, cors);
    if (!origin || !allowed.includes(origin)) return json({ error: 'Origin not allowed' }, 403, cors);
    if (!hasTokens(env)) return json({ error: 'Server setup incomplete: AUTH_TOKEN secret missing' }, 503, cors);
    if (!authorized(request, env)) return json({ error: 'Unauthorized — X-Auth-Token missing or invalid' }, 401, cors);

    const length = Number(request.headers.get('Content-Length') || 0);
    if (length > 65536) return json({ error: 'Request too large (maximum 64 KB)' }, 413, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400, cors); }
    if (!Array.isArray(body.messages) || !body.messages.length) {
      return json({ error: 'messages[] array is required' }, 400, cors);
    }

    const parsed = parseModel(body.model || env.DEFAULT_MODEL || DEFAULT_MODEL);
    const provider = String(body.provider || parsed.provider).toLowerCase();
    const model = parsed.model;
    const timeoutMs = clamp(num(env.AI_TIMEOUT_MS, 120000), 10000, 180000);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await callProvider(provider, model, body, env, controller.signal);
      return json(toOpenAIResponse(provider, model, result), 200, cors);
    } catch (error) {
      const status = Number(error && error.status) || (error && error.name === 'AbortError' ? 504 : 502);
      const message = error && error.name === 'AbortError'
        ? 'AI provider timeout'
        : (error && error.message ? error.message : 'Upstream provider error');
      return json({ error: message, provider, model }, status, cors);
    } finally {
      clearTimeout(timer);
    }
  }
};

function parseModel(value) {
  const raw = String(value || DEFAULT_MODEL);
  const i = raw.indexOf('/');
  if (i < 1) return { provider: 'ollama', model: raw };
  return { provider: raw.slice(0, i).toLowerCase(), model: raw.slice(i + 1) };
}

async function callProvider(provider, model, body, env, signal) {
  if (provider === 'ollama') {
    requireSecret(env.OLLAMA_API_KEY, 'OLLAMA_API_KEY');
    const payload = {
      model, messages: body.messages, stream: false,
      options: {
        temperature: clamp(num(body.temperature, 0.7), 0, 2),
        num_predict: clamp(num(body.max_tokens, 4000), 16, 8192)
      }
    };
    if (body.json === true) payload.format = 'json';
    return fetchJson('https://ollama.com/api/chat', payload, {
      Authorization: 'Bearer ' + env.OLLAMA_API_KEY
    }, signal);
  }

  if (provider === 'openrouter' || provider === 'deepseek') {
    const keyName = provider === 'openrouter' ? 'OPENROUTER_API_KEY' : 'DEEPSEEK_API_KEY';
    requireSecret(env[keyName], keyName);
    const base = provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.deepseek.com/chat/completions';
    const headers = { Authorization: 'Bearer ' + env[keyName] };
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://aioucoaching.blogspot.com/';
      headers['X-Title'] = 'AIOU Coaching';
    }
    return fetchJson(base, {
      model, messages: body.messages, stream: false,
      temperature: clamp(num(body.temperature, 0.7), 0, 2),
      max_tokens: clamp(num(body.max_tokens, 4000), 16, 8192),
      ...(body.json === true ? { response_format: { type: 'json_object' } } : {})
    }, headers, signal);
  }

  if (provider === 'claude') {
    requireSecret(env.CLAUDE_API_KEY, 'CLAUDE_API_KEY');
    const messages = body.messages.filter(m => m.role !== 'system');
    const system = body.messages.filter(m => m.role === 'system').map(m => String(m.content || '')).join('\n\n');
    const data = await fetchJson('https://api.anthropic.com/v1/messages', {
      model, messages, system,
      max_tokens: clamp(num(body.max_tokens, 4000), 16, 8192),
      temperature: clamp(num(body.temperature, 0.7), 0, 1)
    }, {
      'x-api-key': env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    }, signal);
    return {
      model: data.model || model,
      choices: [{ message: { role: 'assistant', content: (data.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n') }, finish_reason: data.stop_reason || 'stop' }],
      usage: data.usage || {}
    };
  }

  if (provider === 'codex') {
    requireSecret(env.CODEX_API_KEY, 'CODEX_API_KEY');
    if (!env.CODEX_API_URL) throw httpError(501, 'CODEX_API_URL variable is required; Codex key endpoint is not assumed');
    return fetchJson(env.CODEX_API_URL, {
      model: model || env.CODEX_MODEL || 'gpt-5-codex',
      messages: body.messages,
      temperature: clamp(num(body.temperature, 0.7), 0, 2),
      max_tokens: clamp(num(body.max_tokens, 4000), 16, 8192)
    }, { Authorization: 'Bearer ' + env.CODEX_API_KEY }, signal);
  }

  if (provider === 'freebuff') {
    requireSecret(env.FREEBUFF_API_KEY, 'FREEBUFF_API_KEY');
    if (!env.FREEBUFF_BASE_URL) throw httpError(501, 'FREEBUFF_BASE_URL variable is required; FREEBUFF_API_KEY alone does not identify an API endpoint');
    const url = String(env.FREEBUFF_BASE_URL).replace(/\/$/, '') + '/v1/chat/completions';
    return fetchJson(url, {
      model: model || env.FREEBUFF_MODEL || 'deepseek/deepseek-v4-flash',
      messages: body.messages, stream: false,
      temperature: clamp(num(body.temperature, 0.7), 0, 2),
      max_tokens: clamp(num(body.max_tokens, 4000), 16, 8192)
    }, { Authorization: 'Bearer ' + env.FREEBUFF_API_KEY }, signal);
  }

  throw httpError(400, 'Unsupported provider: ' + provider);
}

async function fetchJson(url, payload, headers, signal) {
  const response = await fetch(url, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
    body: JSON.stringify(payload),
    signal
  });
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { throw httpError(502, 'Provider returned non-JSON response'); }
  if (!response.ok) {
    const detail = typeof data.error === 'string' ? data.error : (data.error && data.error.message) || data.message || 'Provider API error';
    throw httpError(response.status, String(detail).slice(0, 400));
  }
  return data;
}

function toOpenAIResponse(provider, model, data) {
  if (data.choices && data.choices[0]) return data;
  if (provider === 'ollama') {
    const message = data.message || {};
    const content = String(message.content || '');
    if (!content.trim()) throw httpError(502, 'Ollama returned an empty response');
    return {
      id: data.id || ('ollama-' + Date.now()), object: 'chat.completion',
      created: Math.floor(Date.now() / 1000), model: data.model || model,
      choices: [{ index: 0, message: { role: 'assistant', content, reasoning_content: String(message.thinking || '') }, finish_reason: data.done_reason || 'stop' }],
      usage: { prompt_tokens: num(data.prompt_eval_count, 0), completion_tokens: num(data.eval_count, 0), total_tokens: num(data.prompt_eval_count, 0) + num(data.eval_count, 0) }
    };
  }
  return {
    id: data.id || (provider + '-' + Date.now()), object: 'chat.completion',
    created: Math.floor(Date.now() / 1000), model: data.model || model,
    choices: [{ index: 0, message: { role: 'assistant', content: '' }, finish_reason: 'stop' }],
    usage: data.usage || {}
  };
}

function getAllowedOrigins(env) {
  const configured = String(env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  return configured.length ? configured : DEFAULT_ORIGINS;
}
function authorized(request, env) {
  const configured = String(env.AUTH_TOKEN || '').split(',').map(x => x.trim()).filter(Boolean);
  const sent = String(request.headers.get('X-Auth-Token') || '').trim();
  return !!sent && configured.includes(sent);
}
function hasTokens(env) { return String(env.AUTH_TOKEN || '').split(',').some(x => x.trim()); }
function requireSecret(value, name) { if (!value) throw httpError(503, 'Server setup incomplete: ' + name + ' secret missing'); }
function num(value, fallback) { return typeof value === 'number' && isFinite(value) ? value : fallback; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function httpError(status, message) { const e = new Error(message); e.status = status; return e; }
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({}, cors || {}, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  });
}
