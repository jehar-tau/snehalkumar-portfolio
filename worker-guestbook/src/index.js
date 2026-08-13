// Cloudflare Worker: backend for the Playground "Guestbook Wall" — visitors
// leave a sticky note (name, optional org, email, message), it's stored in
// Workers KV, and appears on the public board. Email is collected for the
// site owner only and is never returned by the public GET endpoint.
//
// Storage: one KV key ("notes") holding the full JSON array. Modest scale
// (a personal portfolio guestbook) makes a single blob simpler than one KV
// entry per note, and matches how the rest of this site persists data.
//
// Abuse mitigation, since notes post instantly with no moderation queue:
//   - required-field + length validation
//   - a hidden honeypot field (bots fill it, humans don't — silently
//     dropped, not rejected, so bots don't learn to adapt)
//   - per-IP rate limit via a short-lived KV key (native TTL, no extra
//     infra)
//   - notes render through the site's normal text-binding path (same as
//     everything else on the page), which escapes HTML by default — never
//     rendered as raw HTML.

const ALLOWED_ORIGINS = new Set([
  'https://snehalkumar.com',
  'https://www.snehalkumar.com',
  'https://jehar-tau.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

const MAX_NOTES_RETURNED = 200;
const RATE_LIMIT_SECONDS = 3600; // one submission per IP per hour
const LIMITS = { name: 60, org: 80, email: 120, message: 280 };

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function getNotes(env) {
  const raw = await env.NOTES.get('notes');
  return raw ? JSON.parse(raw) : [];
}

async function saveNotes(env, notes) {
  await env.NOTES.put('notes', JSON.stringify(notes));
}

function publicView(note) {
  const { email, ...rest } = note;
  return rest;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (!ALLOWED_ORIGINS.has(origin)) {
      return json({ error: 'origin not allowed' }, 403, headers);
    }

    // GET /notes — public board (no email)
    if (request.method === 'GET' && url.pathname === '/notes') {
      const notes = await getNotes(env);
      const view = notes.slice(-MAX_NOTES_RETURNED).map(publicView);
      return json({ notes: view }, 200, headers);
    }

    // GET /notes/admin — owner-only, includes email. Requires the same
    // secret used for deletes, set via `wrangler secret put ADMIN_TOKEN`.
    if (request.method === 'GET' && url.pathname === '/notes/admin') {
      const auth = request.headers.get('Authorization') || '';
      if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
        return json({ error: 'unauthorized' }, 401, headers);
      }
      const notes = await getNotes(env);
      return json({ notes }, 200, headers);
    }

    // POST /notes — submit a new sticky note
    if (request.method === 'POST' && url.pathname === '/notes') {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ error: 'invalid json' }, 400, headers);
      }

      // Honeypot: real visitors never see or fill this field. If it's
      // filled, pretend success so the bot doesn't adapt, but drop it.
      if (body.website) {
        return json({ ok: true }, 201, headers);
      }

      const name = String(body.name || '').trim().slice(0, LIMITS.name);
      const org = String(body.org || '').trim().slice(0, LIMITS.org);
      const email = String(body.email || '').trim().slice(0, LIMITS.email);
      const message = String(body.message || '').trim().slice(0, LIMITS.message);

      if (!name || !message) {
        return json({ error: 'name and message are required' }, 400, headers);
      }
      if (email && !isValidEmail(email)) {
        return json({ error: 'that email doesn’t look valid' }, 400, headers);
      }

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = 'ratelimit:' + ip;
      if (await env.NOTES.get(rlKey)) {
        return json({ error: 'You can leave one note per hour — try again later.' }, 429, headers);
      }
      await env.NOTES.put(rlKey, '1', { expirationTtl: RATE_LIMIT_SECONDS });

      const note = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        name, org: org || null, email: email || null, message,
        ts: Date.now(),
      };
      const notes = await getNotes(env);
      notes.push(note);
      await saveNotes(env, notes);

      return json({ ok: true, note: publicView(note) }, 201, headers);
    }

    // DELETE /notes/:id — owner-only removal of a bad note
    if (request.method === 'DELETE' && url.pathname.startsWith('/notes/')) {
      const auth = request.headers.get('Authorization') || '';
      if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
        return json({ error: 'unauthorized' }, 401, headers);
      }
      const id = url.pathname.slice('/notes/'.length);
      const notes = await getNotes(env);
      const next = notes.filter((n) => n.id !== id);
      if (next.length === notes.length) {
        return json({ error: 'not found' }, 404, headers);
      }
      await saveNotes(env, next);
      return json({ ok: true }, 200, headers);
    }

    return json({ error: 'not found' }, 404, headers);
  },
};
