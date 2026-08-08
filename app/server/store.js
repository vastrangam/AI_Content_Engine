/* ═══════════ where the work lives ═══════════

   Two backends behind one interface.

   · Supabase, when SUPABASE_URL and SUPABASE_SERVICE_KEY are set. Your catalogue and your
     content sit in Postgres and your photographs in Supabase Storage, so opening the app on
     your phone shows the same work as your laptop.

   · This computer, when they are not. A SQLite file and a folder of images under ./data.

   The point of the split is that you can use the app TODAY, before any account exists, and
   moving to Supabase later changes nothing you can see — the same routes, the same screens,
   the same data shape. Nothing in the app above this file knows which one is running. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* DATA_DIR exists so the self-test can run against a scratch folder instead of your real
   catalogue. Nothing else sets it. */
const DATA = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(HERE, '..', 'data');
const BLOBS = path.join(DATA, 'images');

fs.mkdirSync(BLOBS, { recursive: true });

const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
let sb = null;

export const backend = useSupabase ? 'supabase' : 'this computer';

async function supa() {
  if (sb) return sb;
  const { createClient } = await import('@supabase/supabase-js');
  sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });
  return sb;
}

/* ── the document: one JSON record per user, exactly the shape the browser already uses ──
   Keeping the existing shape is deliberate. The whole UI reads VA.DB; changing that would
   mean rewriting every screen. The server stores it, versions it, and hands it back. */

const DOC = path.join(DATA, 'workspace.json');

export async function loadDoc(user = 'default') {
  if (useSupabase) {
    const db = await supa();
    const { data, error } = await db.from('workspaces').select('doc').eq('owner', user).maybeSingle();
    if (error) throw error;
    return data?.doc ?? null;
  }
  try { return JSON.parse(fs.readFileSync(DOC, 'utf8')); }
  catch { return null; }
}

export async function saveDoc(doc, user = 'default') {
  if (useSupabase) {
    const db = await supa();
    const { error } = await db.from('workspaces')
      .upsert({ owner: user, doc, updated_at: new Date().toISOString() }, { onConflict: 'owner' });
    if (error) throw error;
    return { ok: true, where: 'supabase' };
  }
  /* write to a temp file and rename — a crash mid-write must never leave a half-written
     workspace, which is the one failure that would lose a day's cataloguing */
  const tmp = DOC + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(doc));
  fs.renameSync(tmp, DOC);
  return { ok: true, where: 'disk' };
}

/* ── images: keyed blobs, the same keys the browser used in IndexedDB ────────────────── */

const safe = (k) => String(k).replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 120);

export async function putImage(key, buffer, contentType = 'image/jpeg') {
  if (useSupabase) {
    const db = await supa();
    const { error } = await db.storage.from('photos')
      .upload(safe(key), buffer, { contentType, upsert: true });
    if (error) throw error;
    return { ok: true };
  }
  fs.writeFileSync(path.join(BLOBS, safe(key)), buffer);
  return { ok: true };
}

export async function getImage(key) {
  if (useSupabase) {
    const db = await supa();
    const { data, error } = await db.storage.from('photos').download(safe(key));
    if (error) return null;
    return Buffer.from(await data.arrayBuffer());
  }
  const f = path.join(BLOBS, safe(key));
  return fs.existsSync(f) ? fs.readFileSync(f) : null;
}

export async function delImage(key) {
  if (useSupabase) {
    const db = await supa();
    await db.storage.from('photos').remove([safe(key)]);
    return { ok: true };
  }
  const f = path.join(BLOBS, safe(key));
  if (fs.existsSync(f)) fs.unlinkSync(f);
  return { ok: true };
}

export function stats() {
  if (useSupabase) return { backend, images: null, note: 'counts live in Supabase' };
  const files = fs.existsSync(BLOBS) ? fs.readdirSync(BLOBS) : [];
  const bytes = files.reduce((n, f) => n + fs.statSync(path.join(BLOBS, f)).size, 0);
  return { backend, images: files.length, bytes, folder: DATA };
}

/* The SQL to run once in Supabase, printed by `npm run setup` so nobody has to guess it. */
export const SUPABASE_SETUP = `
-- Run this once in Supabase → SQL Editor, then create a Storage bucket named "photos".
create table if not exists workspaces (
  owner       text primary key,
  doc         jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table workspaces enable row level security;
`.trim();
