#!/usr/bin/env bash
# Publish the built marketing site to the VPS.
#
#   ./deploy/publish-site.sh                 # medhava.com  (the neutral edition)
#   ./deploy/publish-site.sh vastrangam      # the trade edition, wherever you host it
#
# Set MEDHAVA_HOST to the ssh target, e.g. export MEDHAVA_HOST=medhava@203.0.113.10
#
# It rebuilds first ON PURPOSE. Publishing whatever happens to be sitting in the working tree
# is how a page goes out carrying a half-finished edit nobody remembers making.
set -euo pipefail

ED="${1:-medhava}"
HOST="${MEDHAVA_HOST:?set MEDHAVA_HOST, e.g. export MEDHAVA_HOST=medhava@203.0.113.10}"
REMOTE_ROOT="${MEDHAVA_ROOT:-/var/www/medhava}"

cd "$(dirname "$0")/.."

if [ "$ED" = "vastrangam" ]; then
  SRC="brand/site/index_vastrangam.html"
  node brand/site/build.js vastrangam
else
  SRC="brand/site/index.html"
  node brand/site/build.js
fi

[ -f "$SRC" ] || { echo "$SRC was not produced — the build failed, nothing published."; exit 1; }

# Upload beside the live file, then move into place. rsync-ing over index.html directly means
# a visitor arriving mid-transfer gets a truncated page.
TMP="index.html.incoming"
rsync -avz --checksum "$SRC" "$HOST:$REMOTE_ROOT/$TMP"
ssh "$HOST" "mv $REMOTE_ROOT/$TMP $REMOTE_ROOT/index.html && sudo nginx -t && sudo systemctl reload nginx"

echo
echo "published $SRC ($(du -h "$SRC" | cut -f1)) → $HOST:$REMOTE_ROOT/index.html"
echo "check it:  curl -sSI https://medhava.com | head -1"
