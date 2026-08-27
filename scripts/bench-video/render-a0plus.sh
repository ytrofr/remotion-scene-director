#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/../.."
# wait for the main render script to finish before competing for memory
while pgrep -f "render-arms.sh" >/dev/null 2>&1; do :; done
t0=$(date +%s)
npx remotion render src/index.ts SigmaFilmA0Plus out/a0plus-v1-with-score.mp4 \
  --gl=angle --codec h264 --crf 18 --concurrency 3 --log=error >/dev/null 2>&1
echo "FULL   A0+ v1-with-score  $(( $(date +%s) - t0 ))s  exit=$?" >> out/render-log.txt
