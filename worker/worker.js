// AIOU Coaching AI Worker — hardened multi-provider gateway.
// Provider keys and AUTH_TOKEN must exist only as Cloudflare Worker Secrets.
// AI requests fail closed unless the Cloudflare AI_RATE_LIMITER binding exists.

const DEFAULT_ORIGINS = [
  'https://aioucoaching.blogspot.com',
  'https://aioucoaching.netlify.app',
  'https://nationalistacademy.github.io'
];
const DEFAULT_MODELS = ['deepseek/deepseek-chat', 'deepseek/deepseek-reasoner'];
const MAX_BODY_BYTES = 16384;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 6000;
const MAX_TOTAL_CHARS = 14000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = getAllowedOrigins(env);
    const originAllowed = !!origin && allowedOrigins.includes(origin);
    const cors = originAllowed ? {
      'Access-Control-Allow-Origin': origin,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
      'Access-Control-Max-Age': '600'
    } : {};

    if (request.method === 'OPTIONS') {
      if (!originAllowed) return json({ error: 'Origin not allowed' }, 403);
      return new Response(null, { status: 204, headers: securityHeaders(cors) });
    }

    if (request.method === 'GET') {
      return json({
        ok: true,
        service: 'aiou-coaching-multi-provider',
        authRequired: true,
        models: getAvailableModels(env)
      }, 200, cors);
    }

    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);
    if (!originAllowed) return json({ error: 'Origin not allowed' }, 403);
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) {
      return json({ error: 'Content-Type must be application/json' }, 415, cors);
    }
    if (!hasTokens(env)) return json({ error: 'Worker authentication is not configured' }, 503, cors);
    if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401, cors);

    // Fail closed: configure this binding in Cloudflare before enabling paid/provider traffic.
    if (!env.AI_RATE_LIMITER || typeof env.AI_RATE_LIMITER.limit !== 'function') {
      return json({ error: 'AI service is not enabled: rate-limit binding is missing' }, 503, cors);
    }
    const ip = request.headers.get('CF-Connecting-IP') || '';
    if (!ip) return json({ error: 'Client network identity unavailable' }, 403, cors);
    try {
      const rate = await env.AI_RATE_LIMITER.limit({ key: 'ai-content-studio:' + ip });
      if (!rate || rate.success !== true) {
        return json({ error: 'Rate limit reached. Please try again later.' }, 429, cors, { 'Retry-After': '60' });
      }
    } catch (_) {
      return json({ error: 'AI service is temporarily unavailable' }, 503, cors);
    }

    let body;
    try {
      body = await readBoundedJson(request, MAX_BODY_BYTES);
    } catch (error) {
      return json({ error: error && error.status === 413 ? 'Request too large' : 'Invalid JSON request' },
        error && error.status ? error.status : 400, cors);
    }

    const messagesResult = validateMessages(body && body.messages);
    if (!messagesResult.ok) return json({ error: messagesResult.error }, 400, cors);

    const availableModels = getAvailableModels(env);
    const requestedModel = String((body && body.model) || env.DEFAULT_MODEL || availableModels[0] || '');
    const parsed = parseModel(requestedModel);
    if (!availableModels.includes(requestedModel)) {
      return json({ error: 'Model is not enabled for this Worker' }, 400, cors);
    }

    const timeoutMs = clamp(num(env.AI_TIMEOUT_MS, 60000), 10000, 90000);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await callProvider(parsed.provider, parsed.model, body, env, controller.signal);
      return json(toOpenAIResponse(parsed.provider, parsed.model, result), 200, cors);
    } catch (error) {
      const status = error && error.name === 'AbortError' ? 504 :
        (Number(error && error.status) >= 400 && Number(error && error.status) < 600 ? Number(error.status) : 502);
      return json({
        error: error && error.name === 'AbortError' ? 'AI provider timeout' : 'AI provider request failed',
        provider: parsed.provider,
        status: status
      }, status, cors);
    } finally {
      clearTimeout(timer);
    }
  }
};

function parseModel(value) {
  const raw = String(value || '');
  const i = raw.indexOf('/');
  if (i < 1) return { provider: 'deepseek', model: raw };
  return { provider: raw.slice(0, i).toLowerCase(), model: raw.slice(i + 1) };
}

function getAllowedModels(env) {
  const configured = String(env.ALLOWED_MODELS || DEFAULT_MODELS.join(','))
    .split(',').map(x => x.trim()).filter(Boolean);
  return configured.filter(x => {
    const parsed = parseModel(x);
    return ['ollama', 'openrouter', 'deepseek', 'claude'].includes(parsed.provider) &&
      !!parsed.model && parsed.model.length <= 120;
  });
}

function getAvailableModels(env) {
  return getAllowedModels(env).filter(value => {
    const provider = parseModel(value).provider;
    if (provider === 'ollama') return !!env.OLLAMA_API_KEY;
    if (provider === 'openrouter') return !!env.OPENROUTER_API_KEY;
    if (provider === 'deepseek') return !!env.DEEPSEEK_API_KEY;
    if (provider === 'claude') return !!env.CLAUDE_API_KEY;
    return false;
  });
}

async function callProvider(provider, model, body, env, signal) {
  const messages = body.messages;
  const maxTokens = clamp(num(body.max_tokens, 1800), 16, 2048);
  const temperature = clamp(num(body.temperature, 0.4), 0, 1.2);

  if (provider === 'ollama') {
    requireSecret(env.OLLAMA_API_KEY);
    return fetchJson('https://ollama.com/api/chat', {
      model: model, messages: messages, stream: false,
      options: { temperature: temperature, num_predict: maxTokens }
    }, { Authorization: 'Bearer ' + env.OLLAMA_API_KEY }, signal);
  }

  if (provider === 'deepseek') {
    requireSecret(env.DEEPSEEK_API_KEY);
    const payload = { model: model, messages: messages, stream: false, max_tokens: maxTokens };
    if (model !== 'deepseek-reasoner') {
      payload.temperature = temperature;
      if (body.json === true) payload.response_format = { type: 'json_object' };
    }
    return fetchJson('https://api.deepseek.com/chat/completions', payload, {
      Authorization: 'Bearer ' + env.DEEPSEEK_API_KEY
    }, signal);
  }

  if (provider === 'openrouter') {
    requireSecret(env.OPENROUTER_API_KEY);
    return fetchJson('https://openrouter.ai/api/v1/chat/completions', {
      model: model, messages: messages, stream: false,
      temperature: temperature, max_tokens: maxTokens,
      ...(body.json === true ? { response_format: { type: 'json_object' } } : {})
    }, {
      Authorization: 'Bearer ' + env.OPENROUTER_API_KEY,
      'HTTP-Referer': 'https://aioucoaching.blogspot.com/',
      'X-Title': 'AIOU Coaching'
    }, signal);
  }

  if (provider === 'claude') {
    requireSecret(env.CLAUDE_API_KEY);
    const messagesForClaude = messages.filter(m => m.role !== 'system');
    const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
    const data = await fetchJson('https://api.anthropic.com/v1/messages', {
      model: model, messages: messagesForClaude, system: system,
      max_tokens: maxTokens, temperature: temperature
    }, {
      'x-api-key': env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    }, signal);
    return {
      model: data.model || model,
      choices: [{
        message: {
          role: 'assistant',
          content: (data.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n')
        },
        finish_reason: data.stop_reason || 'stop'
      }],
      usage: data.usage || {}
    };
  }

  throw httpError(400, 'Unsupported provider');
}

async function fetchJson(url, payload, headers, signal) {
  const response = await fetch(url, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
    body: JSON.stringify(payload),
    signal,
    redirect: 'error'
  });
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch (_) { throw httpError(502, 'Invalid provider response'); }
  if (!response.ok) throw httpError(response.status, 'Provider request failed');
  return data;
}

function toOpenAIResponse(provider, model, data) {
  if (data && Array.isArray(data.choices) && data.choices[0]) return data;
  if (provider === 'ollama') {
    const message = data && data.message ? data.message : {};
    const content = String(message.content || '');
    if (!content.trim()) throw httpError(502, 'Empty provider response');
    return {
      id: data.id || ('ollama-' + Date.now()),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: data.model || model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content: content },
        finish_reason: data.done_reason || 'stop'
      }],
      usage: {
        prompt_tokens: num(data.prompt_eval_count, 0),
        completion_tokens: num(data.eval_count, 0),
        total_tokens: num(data.prompt_eval_count, 0) + num(data.eval_count, 0)
      }
    };
  }
  throw httpError(502, 'Unexpected provider response');
}

async function readBoundedJson(request, maxBytes) {
  const headerLength = Number(request.headers.get('Content-Length') || 0);
  if (headerLength > maxBytes) throw httpError(413, 'Request too large');
  if (!request.body) throw httpError(400, 'Missing request body');
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    total += part.value.byteLength;
    if (total > maxBytes) {
      try { await reader.cancel(); } catch (_) {}
      throw httpError(413, 'Request too large');
    }
    chunks.push(part.value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(merged));
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) {
    return { ok: false, error: 'messages must contain 1–12 items' };
  }
  let total = 0;
  let hasUser = false;
  for (const message of messages) {
    if (!message || !['system', 'user', 'assistant'].includes(message.role) ||
        typeof message.content !== 'string' || message.content.length > MAX_MESSAGE_CHARS) {
      return { ok: false, error: 'Each message must have an allowed role and plain-text content' };
    }
    if (message.role === 'user') hasUser = true;
    total += message.content.length;
    if (total > MAX_TOTAL_CHARS) return { ok: false, error: 'Combined message content is too long' };
  }
  if (!hasUser) return { ok: false, error: 'At least one user message is required' };
  return { ok: true };
}

function getAllowedOrigins(env) {
  const configured = String(env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  const candidates = configured.length ? configured : DEFAULT_ORIGINS;
  return candidates.filter(value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.origin === value && url.username === '' && url.password === '';
    } catch (_) { return false; }
  });
}

function authorized(request, env) {
  const sent = String(request.headers.get('X-Auth-Token') || '');
  if (!sent || sent.length > 256) return false;
  const configured = String(env.AUTH_TOKEN || '').split(',').map(x => x.trim()).filter(Boolean);
  return configured.some(token => constantTimeEqual(sent, token));
}

function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a));
  const right = new TextEncoder().encode(String(b));
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) diff |= (left[i] || 0) ^ (right[i] || 0);
  return diff === 0;
}

function hasTokens(env) {
  return String(env.AUTH_TOKEN || '').split(',').some(x => x.trim().length > 0);
}
function requireSecret(value) {
  if (!value) throw httpError(503, 'Provider is not configured');
}
function num(value, fallback) {
  return typeof value === 'number' && isFinite(value) ? value : fallback;
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
function securityHeaders(extra) {
  return Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  }, extra || {});
}
function json(value, status, cors, extra) {
  return new Response(JSON.stringify(value), {
    status: status || 200,
    headers: securityHeaders(Object.assign({}, cors || {}, extra || {}))
  });
}
