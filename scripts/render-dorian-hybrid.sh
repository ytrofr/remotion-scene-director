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
echo "=== Concat: HF intro + Remotion slice + HF closing ==="
CONCAT_LIST="$WORK_DIR/concat-hybrid.txt"
cat > "$CONCAT_LIST" <<EOF
file '$(pwd)/$INTRO'
file '$(pwd)/$REMOTION_SLICE'
file '$(pwd)/$CLOSING'
EOF

"$FFMPEG" -y -f concat -safe 0 -i "$CONCAT_LIST" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 160k -r 30 \
  "$OUT" 2>&1 | tail -3

echo ""
echo "=== Done ==="
ls -la "$OUT"
"$FFMPEG" -i "$OUT" 2>&1 | grep Duration | head -1
