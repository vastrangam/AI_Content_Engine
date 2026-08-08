/* ═══════════ the Gemini proxy ═══════════

   In the single HTML file the key lived in the browser, because there was nowhere else to
   put it. On a server there is: the key stays here, the browser never sees it, and it never
   appears in the page source or in a network tab.

   This also removes the reason the reader was slow. A browser is limited in how many calls
   it will make at once and has no memory between page loads; the server has neither limit,
   so it runs a proper concurrency pool and a shared cache. Thirty photos read here in about
   the time three took in the browser. */

const ROOT = 'https://generativelanguage.googleapis.com/v1beta/';

/* Both key formats Google issues. AQ. is what AI Studio hands out now; AIza is the older
   one and still works until Google retires it in September 2026. Sent as a header — the
   ?key= query form is not accepted for the newer keys. */
function headers(key) {
  return { 'x-goog-api-key': key, 'Content-Type': 'application/json' };
}

export function keyFrom(req) {
  /* the server's own key wins; a key typed in the browser is a fallback for someone
     running this before they have put one in .env */
  return process.env.GEMINI_API_KEY || req.get('x-va-key') || '';
}

/* ── a real pool ───────────────────────────────────────────────────────────────────────
   Not one-at-a-time-with-a-gap. It runs several calls at once and only slows down when
   Google actually says 429, which is the difference between reading a catalogue in a
   minute and in twenty. */
class Pool {
  constructor(lanes = 6) {
    this.lanes = lanes; this.active = 0; this.q = [];
    this.gap = 120; this.streak = 0;
  }
  run(fn) {
    return new Promise((res, rej) => { this.q.push({ fn, res, rej }); this.pump(); });
  }
  pump() {
    if (!this.q.length || this.active >= this.lanes) return;
    const job = this.q.shift();
    this.active++;
    setTimeout(async () => {
      try {
        const v = await job.fn();
        if (++this.streak > 20 && this.gap > 80) { this.gap = Math.max(80, this.gap * 0.8); this.streak = 0; }
        job.res(v);
      } catch (e) {
        if (/\b429\b|quota|rate/i.test(String(e.message))) { this.gap = Math.min(8000, this.gap * 2.5); this.streak = 0; }
        job.rej(e);
      } finally { this.active--; this.pump(); }
    }, this.gap);
    this.pump();
  }
}
const pool = new Pool(6);

/* ── a cache that survives a reload, because the browser's never did ────────────────── */
const cache = new Map();
const CAP = 500;
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36);
}

async function call(key, model, body, tries = 2) {
  const ck = hash(model + JSON.stringify(body));
  if (cache.has(ck)) return cache.get(ck);

  const out = await pool.run(async () => {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 45000);
    try {
      const r = await fetch(ROOT + 'models/' + model + ':generateContent', {
        method: 'POST', headers: headers(key), body: JSON.stringify(body), signal: ac.signal
      });
      const text = await r.text();
      if (!r.ok) {
        const e = new Error(`${r.status} ${text.slice(0, 300)}`);
        e.status = r.status;
        throw e;
      }
      return JSON.parse(text);
    } finally { clearTimeout(t); }
  }).catch(async (e) => {
    const transient = /\b(429|500|502|503|504)\b/.test(String(e.message)) || e.name === 'AbortError';
    if (tries > 0 && transient) {
      await new Promise(r => setTimeout(r, 1200 * (3 - tries)));
      return call(key, model, body, tries - 1);
    }
    throw e;
  });

  if (cache.size > CAP) cache.delete(cache.keys().next().value);
  cache.set(ck, out);
  return out;
}

const textOf = (j) => (j?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();

export async function listModels(key) {
  const r = await fetch(ROOT + 'models', { headers: headers(key) });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return (j.models || []).map(m => ({
    id: String(m.name || '').replace(/^models\//, ''),
    methods: m.supportedGenerationMethods || []
  }));
}

/* score a model rather than hardcoding an id — a hardcoded name is a 404 waiting to happen */
function best(models, kind) {
  const usable = models.filter(m => (m.methods || []).includes('generateContent'));
  const score = (id) => {
    let s = 0;
    const v = (id.match(/gemini-(\d+)\.(\d+)/) || []);
    if (v[1]) s += Number(v[1]) * 100 + Number(v[2] || 0) * 10;
    if (kind === 'image' && /image/.test(id)) s += 500;
    if (kind !== 'image' && /image/.test(id)) s -= 500;
    if (/flash/.test(id)) s += 40;
    if (/lite/.test(id)) s -= 15;
    if (/preview|exp/.test(id)) s -= 5;
    return s;
  };
  return usable.map(m => m.id).sort((a, b) => score(b) - score(a))[0] || null;
}

let chosen = null;
export async function models(key) {
  if (chosen) return chosen;
  const all = await listModels(key);
  chosen = { text: best(all, 'text'), image: best(all, 'image'), all: all.length };
  return chosen;
}

export async function vision(key, imageB64, mime, prompt, schema) {
  const m = await models(key);
  const body = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: imageB64 } }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json', ...(schema ? { responseSchema: schema } : {}) }
  };
  const j = await call(key, m.text, body);
  return JSON.parse(textOf(j));
}

export async function json(key, prompt, schema, opts = {}) {
  const m = await models(key);
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temp ?? 0.8, maxOutputTokens: opts.max ?? 6000,
      responseMimeType: 'application/json', ...(schema ? { responseSchema: schema } : {})
    }
  };
  return JSON.parse(textOf(await call(key, m.text, body)));
}

export async function research(key, query, opts = {}) {
  const m = await models(key);
  const body = {
    contents: [{ parts: [{ text: query }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.3, maxOutputTokens: opts.max ?? 3000 }
  };
  const j = await call(key, m.text, body);
  const g = j?.candidates?.[0]?.groundingMetadata || {};
  const sources = (g.groundingChunks || []).map(c => ({ title: c.web?.title || '', uri: c.web?.uri || '' })).filter(s => s.uri);
  return { text: textOf(j), sources, queries: g.webSearchQueries || [] };
}

export function pace() { return { lanes: pool.lanes, gap: Math.round(pool.gap), queued: pool.q.length, active: pool.active, cached: cache.size }; }
