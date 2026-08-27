#!/usr/bin/env bash
# Re-renders D1 after the queue drains, with the cost-line overflow fixed.
# Queued rather than run now, because a second concurrent render is what wedged the
# first attempt.
set -uo pipefail
cd "$(dirname "$0")/../.."
for _ in $(seq 1 240); do grep -q "^DONE" out/render-log-sw.txt 2>/dev/null && break; sleep 15; done
t0=$(date +%s)
npx remotion render src/index.ts SigmaFilmD1 out/d1-inside-the-system.mp4 \
  --gl=swiftshader --codec h264 --crf 18 --concurrency 4 --log=error >/dev/null 2>&1
echo "REDO   D1 bleed-fix  $(( $(date +%s) - t0 ))s  exit=$?  $(stat -c %s out/d1-inside-the-system.mp4)b" >> out/render-log-sw.txt
node scripts/bench-video/probe-bleed.mjs out/d1-inside-the-system.mp4 out/sigma-film-25s.mp4 >> out/probe-results.txt 2>&1
echo "REDO-PROBED" >> out/probe-results.txt
