'use strict';
/* EVIDENCE CAPTURE — the record that does not depend on my word.
 *
 *   node tools/evidence.js --id R001 --why "isolation holds" -- npm run medhava
 *   node tools/evidence.js --list
 *   node tools/evidence.js --check          → every recorded run still reproducible?
 *
 * WHY THIS EXISTS
 * This session produced thirty-four defects, and the two most expensive shared one shape:
 * I reported a result I had not re-derived. I said the repository had no CI when
 * .github/workflows/ci.yml was sitting there. I reported an archive as 540 files and
 * 24.6MB when it was 439 and 15.6MB. Both were confident, both were wrong, and nothing
 * in the repository could contradict me because the only record was my sentence.
 *
 * The Universal Anti-Cheat Protocol says it plainly at §52: "AI says all tests passed" is
 * never sufficient evidence. §38 asks for a tamper-evident record. §39 asks for artifact
 * hashes. §40 asks for execution provenance. This file is those three.
 *
 * WHAT IT RECORDS, AND WHY EACH FIELD IS THERE
 *   command      what was actually run, verbatim — not a description of it
 *   exit code    the number, from the process, not my reading of the output
 *   output       the tail, captured from the real stream
 *   commit       which revision produced it, so a later reader can go back
 *   dirty        whether the tree had uncommitted changes — a clean-tree run and a
 *                dirty-tree run are different claims and only one is reproducible
 *   artifacts    SHA-256 of every file the run was about, so the thing inspected and the
 *                thing reported are provably the same file
 *   timestamp    when, in UTC
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 * It does not decide PASS. It records an exit code and a hash; a human or a gate reads
 * them. An evidence tool that also rules on its own output is the circular proof this
 * whole exercise exists to stop.
 *
 * APPEND-ONLY, AND ONLY AS FAR AS THAT GOES
 * Entries are appended and never rewritten, and --check re-runs each recorded command to
 * see whether it still produces the recorded exit code. That is tamper-EVIDENT, not
 * tamper-PROOF: anyone with write access can edit the file. §63 of the protocol is honest
 * about this and so is this comment. Real immutability needs a store this repository does
 * not have.
 *
 * SECRETS ARE REDACTED (§42) — and redaction is never used to hide a failure.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execSync, spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'docs', 'verification');
const FILE = path.join(DIR, 'EVIDENCE.md');

/* Patterns that must never reach the record. Redaction applies to the captured output
   only — an exit code and a failure message are never redacted, because hiding a failure
   behind "[REDACTED]" would be the exact abuse §42 warns about. */
const SECRETS = [
  [/(Authorization:\s*Bearer\s+)\S+/gi, '$1[REDACTED]'],
  [/((?:API[_-]?KEY|SECRET|TOKEN|PASSWORD|PASSWD|PWD)\s*[=:]\s*)\S+/gi, '$1[REDACTED]'],
  [/(postgres(?:ql)?:\/\/[^:]+:)[^@]+(@)/gi, '$1[REDACTED]$2'],
  [/(-----BEGIN [A-Z ]*PRIVATE KEY-----)[\s\S]*?(-----END)/g, '$1[REDACTED]$2'],
];
const redact = (s) => SECRETS.reduce((t, [re, to]) => t.replace(re, to), String(s));

function sh(cmd, fallback) {
  try {
    return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (_) { return fallback; }
}

const provenance = () => ({
  commit: sh('git rev-parse HEAD', 'unknown'),
  branch: sh('git rev-parse --abbrev-ref HEAD', 'unknown'),
  /* A dirty tree means the recorded command ran against something that is not in any
     commit, so nobody can reproduce it later from the revision alone. Recorded rather
     than refused — a lot of honest verification happens mid-change — but recorded. */
  dirty: sh('git status --porcelain', '') !== '',
  node: process.version,
  platform: `${process.platform} ${process.arch}`,
});

function hash(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return { file: rel, sha256: null, bytes: null, missing: true };
  const buf = fs.readFileSync(full);
  return {
    file: rel,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    bytes: buf.length,
    missing: false,
  };
}

/* ── running a command and recording what really happened ─────────────────── */
function record(opts) {
  const { id, why, artifacts, argv } = opts;
  const started = new Date();
  const r = spawnSync(argv[0], argv.slice(1), {
    cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: false,
  });
  const finished = new Date();

  /* THE EXIT CODE COMES FROM THE PROCESS, not from reading the output for the word
     "pass". A suite that prints "0 failed" and exits 1 is a failure, and this session
     shipped an archive built before exactly that kind of fix. */
  const code = r.status === null ? -1 : r.status;
  const out = redact(((r.stdout || '') + (r.stderr || '')).trimEnd());
  const tail = out.split('\n').slice(-12).join('\n');

  const entry = {
    id,
    why: why || '',
    command: argv.join(' '),
    exit_code: code,
    signal: r.signal || null,
    started: started.toISOString(),
    finished: finished.toISOString(),
    seconds: Math.round((finished - started) / 100) / 10,
    ...provenance(),
    artifacts: (artifacts || []).map(hash),
    tail,
  };
  append(entry);
  return entry;
}

/* ── the file ─────────────────────────────────────────────────────────────── */
const HEADER = `# Verification evidence

Every entry below is one command that was actually run, with the exit code the process
returned, the revision it ran against, and the SHA-256 of the files it was about.

**This file is appended to, never rewritten.** It is tamper-EVIDENT rather than
tamper-proof: anybody with write access to this repository can edit it, and no comment
can prevent that. What it does buy is that a claim now has to disagree with a recorded
exit code rather than merely with somebody's memory. \`node tools/evidence.js --check\`
re-runs each recorded command and reports where the result has moved.

An entry records what happened. It does not rule on whether the requirement passed —
a tool that graded its own output would be the circular proof this file exists to stop.

Secrets are redacted from captured output. Redaction is never applied to hide a failure.

---
`;

function append(entry) {
  fs.mkdirSync(DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, HEADER);
  const a = entry.artifacts.length
    ? entry.artifacts.map((x) => (x.missing
      ? `  - \`${x.file}\` — **MISSING at the time of the run**`
      : `  - \`${x.file}\` — \`${x.sha256}\` (${x.bytes.toLocaleString()} bytes)`)).join('\n')
    : '  - none recorded';
  fs.appendFileSync(FILE, `
## ${entry.id} · exit ${entry.exit_code}${entry.exit_code === 0 ? '' : '  ← NON-ZERO'}

${entry.why ? `${entry.why}\n` : ''}
| | |
|---|---|
| Command | \`${entry.command}\` |
| Exit code | **${entry.exit_code}**${entry.signal ? ` (signal ${entry.signal})` : ''} |
| Ran | ${entry.started} → ${entry.finished} (${entry.seconds}s) |
| Commit | \`${entry.commit}\` on \`${entry.branch}\`${entry.dirty ? ' — **working tree dirty**' : ''} |
| Environment | node ${entry.node} · ${entry.platform} |

Artifacts:
${a}

<details><summary>Last lines of real output</summary>

\`\`\`
${entry.tail}
\`\`\`
</details>

---
`);
}

/* ── reading it back ──────────────────────────────────────────────────────── */
function entries() {
  if (!fs.existsSync(FILE)) return [];
  const text = fs.readFileSync(FILE, 'utf8');
  const out = [];
  const re = /^## (\S+) · exit (-?\d+)([\s\S]*?)\| Command \| `([^`]+)` \|/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      id: m[1],
      exit_code: Number(m[2]),
      command: m[4],
      /* AN OLD FAILURE THAT WAS FIXED IS NOT A DRIFTING RECORD, and it is not a silence
         either. It is explained only when somebody wrote down what the cause was and
         which later run supersedes it — the same shape every other exemption in this
         repository uses. A bare "ignore this" would make --check useless within a week. */
      explained: /\*\*Cause, found after this run:\*\*/.test(m[3])
        && /Superseded by \*\*\S+\*\*/.test(m[3]),
    });
  }
  return out;
}

/* --check RE-RUNS what was recorded. A recorded exit code that no longer reproduces is
   the single most useful thing this file can tell anybody: either the code moved or the
   record was wrong, and both are worth knowing before a claim rests on it. */
function check() {
  const rows = entries();
  if (!rows.length) {
    console.log('evidence: nothing recorded yet — run a command through this tool first.');
    return 0;
  }
  let moved = 0;
  let superseded = 0;
  rows.forEach((e) => {
    const argv = e.command.split(' ');
    const r = spawnSync(argv[0], argv.slice(1), { cwd: ROOT, encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024 });
    const now = r.status === null ? -1 : r.status;
    const same = now === e.exit_code;
    let mark;
    if (same) mark = 'ok   ';
    else if (e.explained) { mark = 'FIXED'; superseded += 1; }
    else { mark = 'MOVED'; moved += 1; }
    console.log(`  ${mark} ${e.id.padEnd(12)} recorded ${e.exit_code}, ` +
      `now ${now}   ${e.command}`);
  });
  console.log(`\nevidence: ${rows.length} recorded run(s), ${moved} no longer reproduce` +
    (superseded ? `, ${superseded} superseded with a written cause` : '') + '.');
  if (superseded && !moved) {
    console.log('  A FIXED row is a failure that was real when recorded and has since been');
    console.log('  explained and superseded. It stays in the log — deleting it would remove');
    console.log('  the only record that the failure ever happened.');
  }
  return moved;
}

/* ── command line ─────────────────────────────────────────────────────────── */
if (require.main === module) {
  const argv = process.argv.slice(2);

  if (argv.includes('--check')) process.exit(check() ? 1 : 0);
  if (argv.includes('--list')) {
    entries().forEach((e) => console.log(`  ${e.id.padEnd(12)} exit ${e.exit_code}  ${e.command}`));
    process.exit(0);
  }

  const sep = argv.indexOf('--');
  if (sep === -1) {
    console.error('usage: node tools/evidence.js --id R001 [--why "..."] ' +
      '[--artifact path]... -- <command>');
    process.exit(2);
  }
  const flags = argv.slice(0, sep);
  const cmd = argv.slice(sep + 1);
  if (!cmd.length) { console.error('evidence: no command after --'); process.exit(2); }

  const flag = (name) => {
    const i = flags.indexOf(name);
    return i === -1 ? null : flags[i + 1];
  };
  const artifacts = [];
  flags.forEach((f, i) => { if (f === '--artifact') artifacts.push(flags[i + 1]); });

  const id = flag('--id');
  if (!id) { console.error('evidence: --id is required'); process.exit(2); }

  const e = record({ id, why: flag('--why'), artifacts, argv: cmd });
  console.log(`evidence: ${e.id} recorded — exit ${e.exit_code}, ${e.seconds}s, ` +
    `commit ${e.commit.slice(0, 7)}${e.dirty ? ' (dirty)' : ''}`);
  e.artifacts.forEach((x) => console.log(x.missing
    ? `  ${x.file} — MISSING`
    : `  ${x.file} — ${x.sha256.slice(0, 16)}… ${x.bytes.toLocaleString()} bytes`));
  /* The tool exits with the command's own code, so a wrapper cannot turn a failure into
     a success by succeeding at recording it. */
  process.exit(e.exit_code === 0 ? 0 : 1);
}

module.exports = { record, entries, check, hash, redact, FILE };
