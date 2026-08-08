/* ═══════════ npm run verify — the whole thing, three times ═══════════

   "ran test 3 times before giving final output."

   So this runs the server self-test and the browser test three times over and only says
   the app is good if all six runs pass. Three runs rather than one because the failures
   that matter here are the intermittent ones — a race between the workspace saving and the
   page reloading looks fine once and fails on the third go. */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROUNDS = Number(process.env.ROUNDS || 3);

const suites = [
  { name: 'server', file: 'selftest.js', port: 3987 },
  { name: 'browser', file: 'browsertest.js', port: 3988 },
  /* the offline file is built from the same modules, so it is verified alongside the app
     rather than being remembered about later */
  { name: 'offline', file: 'singlefiletest.js', port: 0 }
];

const summary = [];
let bad = 0;

for (let round = 1; round <= ROUNDS; round++) {
  for (const s of suites) {
    console.log('\n════ round ' + round + ' / ' + ROUNDS + ' · ' + s.name + ' ' + '═'.repeat(30) + '\n');
    const r = spawnSync(process.execPath, [path.join(HERE, s.file)], {
      stdio: 'inherit',
      /* a different port each round, so a socket that has not finished closing from the
         last round cannot make this one look broken */
      env: { ...process.env, TEST_PORT: String(s.port + round * 10) }
    });
    const passed = r.status === 0;
    if (!passed) bad++;
    summary.push({ round, suite: s.name, passed });
  }
}

console.log('\n  ' + '═'.repeat(58));
console.log('  Verification — ' + ROUNDS + ' rounds');
console.log('  ' + '─'.repeat(58));
summary.forEach(s => console.log('  round ' + s.round + '  ' + s.suite.padEnd(9) + (s.passed ? 'passed' : 'FAILED')));
console.log('  ' + '─'.repeat(58));
console.log('  ' + (bad ? bad + ' of ' + summary.length + ' runs FAILED' : 'all ' + summary.length + ' runs passed'));
console.log('  ' + '═'.repeat(58) + '\n');
process.exit(bad ? 1 : 0);
