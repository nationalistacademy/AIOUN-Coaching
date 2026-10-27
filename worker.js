// AIOU Coaching AI Worker — DeepSeek API proxy
// Deploy on Cloudflare Workers.
// Secrets (Cloudflare dashboard or `wrangler secret put`):
//   DEEPSEEK_API_KEY
//   AUTH_TOKEN

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
      'Access-Control-Max-Age': '86400'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed. Use POST.' }, 405, cors);
    }

    if (env.AUTH_TOKEN) {
      const tok = request.headers.get('X-Auth-Token');
      if (tok !== env.AUTH_TOKEN) {
        return json({ error: 'Unauthorized — invalid X-Auth-Token' }, 401, cors);
      }
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, cors);
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return json({ error: 'messages[] array is required' }, 400, cors);
    }

    const payload = {
      model: body.model || 'deepseek-chat',
      messages: body.messages,
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
      max_tokens: body.max_tokens || 8000,
      stream: false
    };

    if (body.json === true) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      const data = await r.json();

      if (!r.ok) {
        return json({
          error: data.error?.message || 'DeepSeek API error',
          detail: data
        }, r.status, cors);
      }

      return json(data, 200, cors);
    } catch (e) {
      return json({ error: 'Upstream error: ' + e.message }, 502, cors);
    }
  }
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { ...cors, 'Content-Type': 'application/json' }
  });
}
