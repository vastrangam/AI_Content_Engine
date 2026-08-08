/* ═══════════ .env, read before anything else ═══════════

   This is its own file for one reason, and it is a real one.

   ES modules are evaluated before the body of the file that imports them. So a .env reader
   sitting at the top of index.js runs AFTER store.js has already decided whether Supabase is
   configured — and store.js decides that once, at import time. The keys would be in .env,
   the app would say "this computer", and nothing would explain why.

   Importing this first fixes it: it is a sibling import, so it evaluates first, and every
   module after it sees a fully populated process.env.

   Real environment variables always win over the file, so a hosting provider that sets them
   properly is never overridden by a stale .env someone copied up with the code. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ENV_FILE = path.join(HERE, '..', '.env');

if (fs.existsSync(ENV_FILE)) {
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    if (/^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

export const loaded = fs.existsSync(ENV_FILE);
