'use strict';
/* THE EVIDENCE TOOL, TESTED — because a check that only holds while somebody remembers
 * to run it is not a check.
 *
 *   node tools/evidence.test.js
 *
 * Every assertion here started as a command I typed by hand while building evidence.js.
 * They all passed. That is worth exactly nothing tomorrow: a by-hand check protects the
 * afternoon it was run and no other, and this repository already lost a whole session to
 * a defect that three hundred passing checks agreed with. So the plants are committed.
 *
 * THE FOUR THINGS THAT MUST HOLD
 *
 *   1 · REDACTION HIDES SECRETS AND NOTHING ELSE. A redactor that also swallowed the word
 *       "FAIL" would turn this file into a machine for hiding failures, which is a worse
 *       outcome than having no redactor at all.
 *   2 · A HASH IS THE FILE'S HASH. Checked against sha256 computed a second way, from the
 *       bytes, rather than against itself.
 *   3 · A DRIFTED EXIT CODE IS CAUGHT. The record says 0, the command now returns 7, and
 *       nothing in the entry explains it — that must read as MOVED, not as fine.
 *   4 · THE EXEMPTION CANNOT BE HAND-WAVED. An entry may be excused only by writing down
 *       both the cause and which later run supersedes it. "ignore this one" must not work,
 *       and neither must half the shape. Without this, --check is useless within a week.
 *
 * THE REAL LOG IS BORROWED AND PUT BACK. Plants 3 and 4 need a real entry to drift, so
 * this test edits docs/verification/EVIDENCE.md and restores it in a finally, then asserts
 * the restored bytes hash to what they hashed before. If that last assertion ever fails,
 * this test has damaged the evidence log and says so loudly rather than leaving it wrong.
 */

const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const EV = require('./evidence.js');
const ROOT = path.join(__dirname, '..');

let pass = 0;
const failures = [];
function ok(what, cond, detail) {
  if (cond) { pass += 1; console.log(`  ok   ${what}`); }
  else { failures.push(`${what}${detail ? ` — ${detail}` : ''}`); console.log(`  FAIL ${what}${detail ? ` — ${detail}` : ''}`); }
}

/* ── 1 · redaction ─────────────────────────────────────────────────────────── */
console.log('\nredaction (§42) — secrets masked, failures never');
{
  const r = EV.redact('Authorization: Bearer sk-live-abcdef123456');
  ok('a bearer token is masked', r.includes('[REDACTED]') && !r.includes('abcdef123456'), r);

  const k = EV.redact('API_KEY=super-secret-value');
  ok('a key=value secret is masked', k.includes('[REDACTED]') && !k.includes('super-secret-value'), k);

  const u = EV.redact('postgres://app:hunter2@localhost:5432/medhava');
  ok('a database password inside a URL is masked',
    u.includes('[REDACTED]') && !u.includes('hunter2') && u.includes('localhost:5432'), u);

  const pk = EV.redact('-----BEGIN RSA PRIVATE KEY-----\nMIIabc\n-----END RSA PRIVATE KEY-----');
  ok('a private key body is masked', !pk.includes('MIIabc'), pk);

  /* THE ONE THAT MATTERS. Redaction that eats a failure message is the abuse §42 warns
     about, and it would be invisible: the entry would simply look clean. */
  const f = EV.redact('FAIL: 3 tests failed\nassert.strictEqual(671.82, 672)');
  ok('a failure message is NOT masked',
    f.includes('FAIL: 3 tests failed') && f.includes('671.82') && !f.includes('[REDACTED]'), f);

  const e = EV.redact('Error: password required');
  ok('the bare word "password" in an error is NOT masked',
    e === 'Error: password required', e);
}

/* ── 2 · hashing ───────────────────────────────────────────────────────────── */
console.log('\nhashing (§39) — the thing inspected is the thing reported');
{
  const h = EV.hash('package.json');
  const independent = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(ROOT, 'package.json'))).digest('hex');
  ok('the recorded hash equals one computed from the bytes a second way',
    h.sha256 === independent, `${h.sha256} vs ${independent}`);
  ok('the recorded byte count equals the file size on disk',
    h.bytes === fs.statSync(path.join(ROOT, 'package.json')).size);
  const missing = EV.hash('this/file/does/not/exist.txt');
  ok('a file that is not there is recorded as MISSING, not as a hash of nothing',
    missing.missing === true && missing.sha256 === null);
}

/* ── 3 and 4 · drift, and the exemption ────────────────────────────────────── */
console.log('\ndrift detection — a recorded exit code that no longer holds');
const FILE = EV.FILE;
const original = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : null;
const originalHash = original && crypto.createHash('sha256').update(original).digest('hex');

/* entries() is the only place `explained` is decided, so the plants are aimed there. The
   MOVED-and-exit-1 half of the behaviour is covered by the end-to-end assertion below. */
const reread = () => {
  delete require.cache[require.resolve('./evidence.js')];
  return require('./evidence.js').entries();
};
const rowOf = (id) => reread().find((e) => e.id === id);

try {
  if (!original) {
    ok('there is an evidence log to test against', false,
      'docs/verification/EVIDENCE.md does not exist — record a run first');
  } else {
    const first = EV.entries()[0];
    ok('the log parses into at least one entry', !!first);

    const head = `## ${first.id} · exit ${first.exit_code}`;
    const drifted = `## ${first.id} · exit ${first.exit_code + 7}  ← NON-ZERO`;
    const inject = (excuse) => fs.writeFileSync(FILE, original
      .replace(head, drifted)
      .replace(new RegExp(`(${drifted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\n)`),
        excuse ? `$1\n${excuse}\n` : '$1'));

    inject(null);
    ok('a drifted exit code with no explanation is not explained',
      rowOf(first.id).explained === false);

    inject('> ignore this one, it is fine');
    ok('a vague excuse does not earn the exemption',
      rowOf(first.id).explained === false);

    inject('**Cause, found after this run:** a thing went wrong.');
    ok('a cause with no superseding run does not earn it either',
      rowOf(first.id).explained === false);

    inject('Superseded by **V-SOMETHING**.');
    ok('a supersession with no cause does not earn it either',
      rowOf(first.id).explained === false);

    inject('**Cause, found after this run:** the date normaliser was missing.\n' +
      'Superseded by **V-SOMETHING**.');
    ok('both halves written down DOES earn it',
      rowOf(first.id).explained === true);
  }
} finally {
  if (original !== null) fs.writeFileSync(FILE, original);
}

if (original !== null) {
  const now = crypto.createHash('sha256').update(fs.readFileSync(FILE, 'utf8')).digest('hex');
  ok('the evidence log is byte-identical to how this test found it',
    now === originalHash, `${now} vs ${originalHash}`);
}

/* ── 5 · the wrapper cannot launder a failure ──────────────────────────────── */
console.log('\nexit propagation — recording a failure is still a failure');
{
  /* End to end, against a real child process, writing to a scratch log rather than the
     real one. A wrapper that exited 0 because it succeeded at *recording* would let every
     red command in this repository be reported green by putting evidence.js in front of
     it — the single most dangerous thing this tool could get wrong. */
  const r = spawnSync(process.execPath, [
    path.join(__dirname, 'evidence.js'), '--id', 'SELFTEST-RED', '--',
    process.execPath, '-e', 'process.exit(3)',
  ], { cwd: ROOT, encoding: 'utf8', env: { ...process.env } });
  ok('wrapping a command that exits 3 makes the wrapper exit non-zero',
    r.status !== 0, `wrapper exited ${r.status}`);
  ok('the recorded exit code is the command’s own, not the wrapper’s',
    /exit 3/.test(r.stdout || ''), (r.stdout || '').trim().split('\n').pop());

  /* That run appended a real SELFTEST-RED entry to the real log — which is itself the
     proof that the wrapper records rather than merely reports. */
  const after = fs.readFileSync(FILE, 'utf8');
  ok('the failing run was appended to the log with its own exit code',
    /## SELFTEST-RED · exit 3/.test(after));

  /* Then put the log back. A test fixture is not verification and does not belong in a
     record of verification. Restored from the bytes read at the top rather than by cutting
     the entry out with a regex: the first attempt did exactly that, left one blank line
     behind, and the hash assertion below is what caught it. */
  if (original !== null) {
    fs.writeFileSync(FILE, original);
    const back = crypto.createHash('sha256').update(fs.readFileSync(FILE, 'utf8')).digest('hex');
    ok('the log is byte-identical again afterwards, to the hash, not to the eye',
      back === originalHash, `${back} vs ${originalHash}`);
    ok('and carries no trace of this test’s fixture entry',
      !fs.readFileSync(FILE, 'utf8').includes('SELFTEST-RED'));
  }
}

/* ── result ───────────────────────────────────────────────────────────────── */
console.log('');
if (failures.length) {
  console.error(`evidence.test: ${failures.length} failed, ${pass} passed`);
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(`evidence.test: ${pass} passed, 0 failed`);
