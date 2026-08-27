#!/usr/bin/env bash
# Probes each arm the moment its MP4 lands, instead of waiting for the whole queue.
# Writes to out/probe-results.txt. Light CPU on purpose - it must not compete with
# the render that is still running behind it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT=out/probe-results.txt
: > "$OUT"
ARMS="out/d1-inside-the-system.mp4 out/d2-the-product.mp4 out/d3-one-take.mp4 out/a0plus-v1-with-score.mp4"

settled() {  # file - true once size stops changing across 10s
  local a b
  a=$(stat -c %s "$1" 2>/dev/null || echo 0); sleep 10
  b=$(stat -c %s "$1" 2>/dev/null || echo 0)
  [ "$a" = "$b" ] && [ "$a" -gt 100000 ]
}

for f in $ARMS; do
  for _ in $(seq 1 240); do            # up to 40 min per arm
    [ -s "$f" ] && settled "$f" && break
    sleep 10
  done
  if [ ! -s "$f" ]; then echo "MISSING  $f" >> "$OUT"; continue; fi
  {
    echo "=== $(basename "$f") ==="
    ffprobe -v error -select_streams v:0 \
      -show_entries stream=width,height,r_frame_rate,nb_frames,codec_name \
      -of default=nw=1 "$f"
    node scripts/bench-video/probe-frame.mjs  "$f" 2>&1 | grep -vE '^\s*$'
    node scripts/bench-video/probe-motion.mjs "$f" 2>&1 | grep -vE '^\s*$'
  } >> "$OUT" 2>&1
  echo "PROBED $(basename "$f")" >> "$OUT"
done
echo "ALL-PROBED" >> "$OUT"
