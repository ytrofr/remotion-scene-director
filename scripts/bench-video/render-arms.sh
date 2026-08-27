#!/usr/bin/env bash
# Renders every arm serially and records wall-clock per arm.
# Serial by necessity: ~10 GB available, no GPU, and four Chrome-based renders in
# parallel is how the last tournament hit a concurrency deadlock (rule 57).
set -uo pipefail
cd "$(dirname "$0")/../.."
LOG=out/render-log.txt
: > "$LOG"

probe() {  # id label
  local t0=$(date +%s)
  npx remotion render src/index.ts "$1" "out/.probe-$1.mp4" --frames=180-239 \
    --gl=angle --codec h264 --crf 20 --concurrency 2 --log=error >/dev/null 2>&1
  echo "PROBE  $2  $(( $(date +%s) - t0 ))s / 60 frames" | tee -a "$LOG"
}

full() {   # id outfile label
  local t0=$(date +%s)
  npx remotion render src/index.ts "$1" "$2" \
    --gl=angle --codec h264 --crf 18 --concurrency 3 --log=error >/dev/null 2>&1
  local rc=$?
  echo "FULL   $3  $(( $(date +%s) - t0 ))s  exit=$rc  $(ls -la "$2" 2>/dev/null | awk '{print $5}')b" | tee -a "$LOG"
}

probe SigmaFilmD1 "D1 after grain fix"
probe SigmaFilm   "v1 baseline"

full SigmaFilmD1 out/d1-inside-the-system.mp4 "D1 inside-the-system"
full SigmaFilmD2 out/d2-the-product.mp4        "D2 the-product"
full SigmaFilmD3 out/d3-one-take.mp4           "D3 one-take"

echo "DONE" | tee -a "$LOG"
