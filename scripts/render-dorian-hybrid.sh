#!/bin/bash
# Assembles the HYBRID (Both) Dorian video:
#   HF scene 1 (0-2.5s) + Remotion scenes 2-12 slice (2.5-75s) + HF scene 13 (75-81s)
# Pre-requisites:
#   - public/hf-clips/01-intro.mp4 + public/hf-clips/13-closing.mp4 (from render:hf-full)
#   - out/dorian-full.mp4 (from render:full)
set -e
cd "$(dirname "$0")/.."

HF_CLIPS="public/hf-clips"
WORK_DIR="hf/.render-work"
OUT="out/dorian-hybrid.mp4"
mkdir -p "$WORK_DIR" out

INTRO="$HF_CLIPS/01-intro.mp4"
CLOSING="$HF_CLIPS/13-closing.mp4"
FULL_REMOTION="out/dorian-full.mp4"
REMOTION_SLICE="$WORK_DIR/remotion-scenes-2-12.mp4"

# Guards
for f in "$INTRO" "$CLOSING" "$FULL_REMOTION"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: $f missing."
    [ "$f" = "$INTRO" ] || [ "$f" = "$CLOSING" ] && echo "  → Run: npm run render:hf-full"
    [ "$f" = "$FULL_REMOTION" ] && echo "  → Run: npm run render:full"
    exit 1
  fi
done

FFMPEG="ffmpeg"
if ! command -v ffmpeg >/dev/null 2>&1; then
  REMOTION_FFMPEG="node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg"
  [ -f "$REMOTION_FFMPEG" ] && FFMPEG="$REMOTION_FFMPEG"
fi

# Scene boundaries (from DorianFull FULL_SCENE_INFO, 30fps):
#   Intro:       frames 0-75    = 0.0s - 2.5s
#   Scenes 2-12: frames 75-2250 = 2.5s - 75.0s
#   Closing:     frames 2250-2430 = 75.0s - 81.0s

echo "=== Slicing Remotion scenes 2-12 (2.5s - 75.0s) ==="
"$FFMPEG" -y -i "$FULL_REMOTION" -ss 2.5 -to 75.0 \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 160k -r 30 \
  "$REMOTION_SLICE" 2>&1 | tail -3

echo ""
echo "=== Normalize HF clips: add silent audio if missing ==="
# Concat demuxer drops audio if ANY input lacks an audio stream.
# HF scenes 01-intro and 13-closing have no <audio> → no AAC track → concat
# silently produces video-only hybrid → 2x post-process fails with
# "Stream specifier ':a' matches no streams".
INTRO_NORM="$WORK_DIR/01-intro-with-silence.mp4"
CLOSING_NORM="$WORK_DIR/13-closing-with-silence.mp4"
for pair in "$INTRO:$INTRO_NORM" "$CLOSING:$CLOSING_NORM"; do
  src="${pair%%:*}"
  dst="${pair##*:}"
  if "$FFMPEG" -i "$src" 2>&1 | grep -q "Stream.*Audio"; then
    cp "$src" "$dst"
  else
    "$FFMPEG" -y -i "$src" \
      -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000" \
      -shortest -c:v copy -c:a aac -b:a 160k \
      "$dst" 2>&1 | tail -2
  fi
done

echo ""
echo "=== Concat: HF intro + Remotion slice + HF closing ==="
# IMPORTANT: use concat FILTER, not concat demuxer. The demuxer preserves
# per-input time_base: HF MP4s are time_base 1/90000, Remotion re-encoded
# slice is 1/15360. Mixing time_bases in the demuxer produces visually
# corrupted output — content plays at wildly wrong timestamps. The filter
# decodes all inputs, concatenates in filter graph with unified timing, and
# re-encodes cleanly. Slower but correct. Evidence 2026-04-24: demuxer-built
# hybrid showed scene 11 content at t=5s (should have been scene 2);
# filter-built hybrid shows scene 6 at t=20s (correct).
"$FFMPEG" -y \
  -i "$INTRO_NORM" \
  -i "$REMOTION_SLICE" \
  -i "$CLOSING_NORM" \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 160k -r 30 \
  "$OUT" 2>&1 | tail -3

echo ""
echo "=== Done ==="
ls -la "$OUT"
"$FFMPEG" -i "$OUT" 2>&1 | grep Duration | head -1
