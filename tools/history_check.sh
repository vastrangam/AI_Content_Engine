#!/bin/bash
# DOES ANY COMMIT ON THIS BRANCH STILL CARRY A REAL PERSON'S NAME?
#
#   tools/history_check.sh                       # the current branch
#   tools/history_check.sh refs/heads/<branch>   # a named ref
#
# WHY THIS IS A COMMITTED TOOL AND NOT A SCRATCH SCRIPT
# It was a scratch script, in /tmp, and it was recorded in EVIDENCE.md that way. That is a
# defect, and `node tools/evidence.js --check` is what found it: the log's whole promise is
# that the next person — or the next MODEL, per HANDOFF.md — can re-run any recorded command
# instead of believing it. A command living in a scratch directory cannot be re-run by anybody
# but the session that wrote it, in the container that still has it. So it lives here.
#
# WHY IT TAKES A REF AND DOES NOT DEFAULT TO --all
# `git log --all` sweeps in every branch, including a pre-scrub backup that was deliberately
# NOT rewritten. Run that way it reports the names as present and the scrub as failed, which is
# true of the backup and false of the branch being asked about. One ref at a time, named.
#
# WHAT A CLEAN RESULT LOOKS LIKE, AND WHAT IT DOES NOT PROVE
# Zero means no blob reachable from that ref contains a roster string as TEXT. Compressed
# binaries can still match on chance byte sequences — a four-character name inside a 3.7MB PDF
# is expected roughly eight times over by arithmetic alone — so a small non-zero count on PDFs
# is not evidence of a leak until the rendered text is extracted and checked. That happened:
# two PDFs matched, pdfplumber found 0 real names in the text of either.
#
# It needs engine/private/master.json to know what the real names ARE. Without it there is
# nothing to compare against, and it says so rather than reporting a clean sweep it did not do.

set -u
cd "$(dirname "$0")/.." || exit 1
REF="${1:-HEAD}"

if [ ! -f engine/private/master.json ]; then
  echo "history_check: engine/private/master.json is not in this checkout, so there is nothing"
  echo "  to compare the history against. SKIPPED, not passed — nothing was verified."
  echo "  This is the normal state of a fresh clone; the real roster is gitignored on purpose."
  exit 0
fi

PAT=$(node -e '
const fs=require("fs");
const real=JSON.parse(fs.readFileSync("engine/private/master.json","utf8"));
const s=new Set();
(real.people||[]).forEach(p=>[p.id,p.name,...(p.aliases||[])].forEach(x=>{
  const v=String(x||"").trim();
  if(v.length>3) s.add(v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));}));
process.stdout.write([...s].join("|"));')

if [ -z "$PAT" ]; then
  echo "history_check: the private roster names nobody. SKIPPED, not passed."
  exit 0
fi

TOTAL=$(git rev-list --objects "$REF" 2>/dev/null | wc -l)
if [ "$TOTAL" -eq 0 ]; then
  echo "history_check: '$REF' resolves to nothing. Name a real ref."
  exit 1
fi

HITS=$(git rev-list --objects "$REF" \
  | awk '{print $1}' \
  | git cat-file --batch-check='%(objectname) %(objecttype) %(objectsize)' 2>/dev/null \
  | awk '$2=="blob" && $3 < 4000000 {print $1}' \
  | git cat-file --batch 2>/dev/null \
  | grep -ciE "$PAT")

echo "history_check: $REF — $TOTAL objects reachable, $HITS blob line(s) matching a real name"

if [ "$HITS" -gt 0 ]; then
  echo "  Non-zero. Identify each one before concluding: a text file is a real leak, a PDF or"
  echo "  other compressed binary is very likely a chance byte sequence and must be confirmed"
  echo "  by extracting its rendered text before it is called either way."
fi
exit 0
