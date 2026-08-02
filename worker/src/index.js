// Cloudflare Worker: proxies the portfolio's "Ask AI" chat to Workers AI —
// an open-source model (Llama 3.3) running directly in Cloudflare's network
// via the `AI` binding below. No API key, no external account, no billing:
// it's included free on Cloudflare's Workers AI free tier (10,000
// neurons/day). The browser calls this Worker; this Worker calls the model.

const ALLOWED_ORIGINS = new Set([
  'https://snehalkumar.com',
  'https://www.snehalkumar.com',
  // GitHub's TLS cert for the custom domain hasn't finished provisioning as
  // of this deploy, so the site is still served over plain HTTP — allow
  // both until https_enforced is available, then the http:// ones can go.
  'http://snehalkumar.com',
  'http://www.snehalkumar.com',
  'https://jehar-tau.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const MAX_TOKENS_CAP = 700;   // hard ceiling regardless of what the client asks for
const MAX_MESSAGES = 20;      // caps conversation length per request
const MAX_CHARS_PER_MSG = 4000;

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response(JSON.stringify({ error: 'origin not allowed' }), {
        status: 403, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST only' }), {
        status: 405, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'invalid json' }), {
        status: 400, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const system = typeof body.system === 'string' ? body.system.slice(0, 20000) : '';
    const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
    if (!system || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'system and messages are required' }), {
        status: 400, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const cleanMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, MAX_CHARS_PER_MSG),
    }));

    const maxTokens = Math.min(Number(body.max_tokens) || MAX_TOKENS_CAP, MAX_TOKENS_CAP);

    let aiResult;
    try {
      aiResult = await env.AI.run(MODEL, {
        messages: [{ role: 'system', content: system }, ...cleanMessages],
        max_tokens: maxTokens,
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'model request failed', detail: String(e).slice(0, 500) }), {
        status: 502, headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Workers AI sometimes hands back `response` already parsed into an
    // object when the model's output looks like JSON — the client always
    // wants a raw string to run its own JSON.parse on, so normalize here.
    const rawResponse = (aiResult && aiResult.response) || '';
    const text = typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse);

    return new Response(JSON.stringify({ text }), {
      status: 200, headers: { ...headers, 'Content-Type': 'application/json' },
    });
  },
};
