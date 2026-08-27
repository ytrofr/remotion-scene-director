#!/usr/bin/env bash
# D2 alone, at reduced concurrency, after every other render has drained.
#
# D2 is the only arm that decodes real video (four OffthreadVideo sources). It wedged at
# concurrency 4 with pre-encode frozen at exactly 5,242,928 bytes - 5 MiB on the nose,
# which is a pipe boundary, not a coincidence. Four workers each holding a decoder is the
# same shape as the arm that had to drop to --parallel 1 in yesterday's tournament, so
# this retry changes ONE variable: concurrency.
set -uo pipefail
cd "$(dirname "$0")/../.."
for _ in $(seq 1 400); do grep -q "^REDO" out/render-log-sw.txt 2>/dev/null && break; sleep 15; done
t0=$(date +%s)
npx remotion render src/index.ts SigmaFilmD2 out/d2-the-product.mp4 \
  --gl=swiftshader --codec h264 --crf 18 --concurrency 2 --log=error >/dev/null 2>&1
rc=$?
echo "RETRY  D2 the-product conc=2  $(( $(date +%s) - t0 ))s  exit=$rc  $(stat -c %s out/d2-the-product.mp4 2>/dev/null || echo 0)b" >> out/render-log-sw.txt
if [ -s out/d2-the-product.mp4 ]; then
  node scripts/bench-video/probe-frame.mjs  out/d2-the-product.mp4 >> out/probe-results.txt 2>&1
  node scripts/bench-video/probe-motion.mjs out/d2-the-product.mp4 >> out/probe-results.txt 2>&1
  node scripts/bench-video/probe-bleed.mjs  out/d2-the-product.mp4 >> out/probe-results.txt 2>&1
fi
echo "QUEUE-COMPLETE" >> out/probe-results.txt
