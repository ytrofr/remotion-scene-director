#!/bin/bash
# Extracts matched frames from both tournament arms at identical timecodes.
#
# The fidelity question for a cross-implementation tournament is whether the two arms
# are the same film. Same cut sheet and same geometry module make that likely; frames
# pulled from the two finished MP4s at the same second are what make it CHECKED.
set -e
cd "$(dirname "$0")/.."

FFMPEG="node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg"
command -v ffmpeg >/dev/null 2>&1 && FFMPEG="ffmpeg"

A="out/limor-remotion.mp4"
B="out/limor-hyperframes.mp4"
OUT="out/limor-compare"

for f in "$A" "$B"; do
  [ -f "$f" ] || { echo "MISSING: $f"; exit 1; }
done

mkdir -p "$OUT"

# One per act hinge: the scattered field, the reframe, the owner line, the question,
# the questions, the organ reveal, the resolved stack, the brand.
TIMES="2.0 14.0 24.3 28.3 33.7 62.0 95.3 102.0"

for t in $TIMES; do
  tag=$(echo "$t" | tr '.' '_')
  "$FFMPEG" -y -loglevel error -ss "$t" -i "$A" -frames:v 1 "$OUT/t${tag}_remotion.png"
  "$FFMPEG" -y -loglevel error -ss "$t" -i "$B" -frames:v 1 "$OUT/t${tag}_hyperframes.png"
  echo "  t=${t}s"
done

echo ""
echo "matched pairs in $OUT"
ls "$OUT" | wc -l
