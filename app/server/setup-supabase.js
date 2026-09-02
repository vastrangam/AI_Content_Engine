/* ═══════════ npm run setup:supabase ═══════════

   Prints exactly what to do, in order, so nothing has to be guessed or remembered. It also
   tells you whether the keys you have already put in .env work, which is the only part of
   the migration that can go wrong quietly. */

import './env.js';
import { SUPABASE_SETUP, backend } from './store.js';

const URL_ = process.env.SUPABASE_URL || '';
const KEY = process.env.SUPABASE_SERVICE_KEY || '';

const line = (s = '') => console.log('  ' + s);

console.log('');
line('Vastrangam AI Engine — moving your work to Supabase');
line('─'.repeat(64));
line('');
line('Right now your work is stored: ' + backend.toUpperCase());
line('');

if (!URL_ || !KEY) {
  line('To move it online, once:');
  line('');
  line('  1. Go to supabase.com and make a free account and a new project.');
  line('     The free tier is enough for a catalogue of this size.');
  line('');
  line('  2. In that project open  SQL Editor  and run this:');
  line('');
  SUPABASE_SETUP.split('\n').forEach(l => line('       ' + l));
  line('');
  line('  3. Open  Storage  and create a bucket named exactly:   photos');
  line('     Leave it private. The app reaches it with the service key, not the browser.');
  line('');
  line('  4. Open  Project Settings → API  and copy two things:');
  line('       Project URL           →  SUPABASE_URL');
  line('       service_role key      →  SUPABASE_SERVICE_KEY');
  line('');
  line('  5. Put them in the file called  .env  next to this app:');
  line('');
  line('       SUPABASE_URL=https://xxxxxxxx.supabase.co');
  line('       SUPABASE_SERVICE_KEY=eyJhbGciOi...');
  line('');
  line('  6. Stop the app and start it again. The banner will say  supabase.');
  line('');
  line('Nothing you can see changes. The same screens, the same catalogue — it is just');
  line('stored somewhere both your laptop and your phone can reach.');
  line('');
  line('The service_role key can read and write everything in that project. Keep it in');
  line('.env on your own machine and never paste it into a browser or a chat.');
  line('');
  process.exit(0);
}

line('Both keys are set. Checking them…');
line('');

const r = await fetch(URL_.replace(/\/$/, '') + '/rest/v1/workspaces?select=owner&limit=1', {
  headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
}).catch(e => ({ ok: false, status: 0, statusText: e.message, text: async () => '' }));

if (r.ok) {
  line('  ok    the workspaces table is reachable');
} else {
  const body = (await r.text()).slice(0, 200);
  line('  FAIL  ' + r.status + ' ' + (r.statusText || '') + ' ' + body);
  line('');
  line('  If it says the table does not exist, run this in SQL Editor:');
  line('');
  SUPABASE_SETUP.split('\n').forEach(l => line('     ' + l));
}

const b = await fetch(URL_.replace(/\/$/, '') + '/storage/v1/bucket/photos', {
  headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
}).catch(() => ({ ok: false, status: 0 }));

line(b.ok ? '  ok    the "photos" bucket exists'
         : '  FAIL  no "photos" bucket — create one in Storage, named exactly  photos');

line('');
line(r.ok && b.ok
  ? 'Ready. Restart the app and the banner will say  supabase.'
  : 'Fix the lines marked FAIL above, then run  npm run setup:supabase  again.');
line('');
