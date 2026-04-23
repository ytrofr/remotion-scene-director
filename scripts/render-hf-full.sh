#!/bin/bash
# Renders all 13 HF Dorian scenes individually, then concats to one MP4.
# Output: public/hf-clips/<scene>.mp4 (per-scene) + public/hf-clips/dorian-full-pure-hf.mp4 (concat)
set -e
cd "$(dirname "$0")/.."

SCENES_DIR="hf/scenes"
WORK_DIR="hf/.render-work"
OUT_DIR="public/hf-clips"
mkdir -p "$WORK_DIR" "$OUT_DIR"

# Find ffmpeg (system or Remotion bundled)
FFMPEG="ffmpeg"
if ! command -v ffmpeg >/dev/null 2>&1; then
  REMOTION_FFMPEG="node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg"
  if [ -f "$REMOTION_FFMPEG" ]; then
    FFMPEG="$REMOTION_FFMPEG"
    echo "Using Remotion bundled ffmpeg"
  else
    echo "ERROR: ffmpeg not found"
    exit 1
  fi
fi

echo "=== Rendering 13 HF scenes individually ==="
START=$(date +%s)
for scene in $(ls "$SCENES_DIR"/*.html | sort); do
  name=$(basename "$scene" .html)
  echo ""
  echo "→ $name"
  cp "$scene" "$WORK_DIR/index.html"
  npx hyperframes render "$WORK_DIR/" -o "$OUT_DIR/$name.mp4" -q standard -f 30 --quiet 2>&1 | tail -3
done
END=$(date +%s)
echo ""
echo "HF scene renders: $((END - START))s"

echo ""
echo "=== Concatenating 13 HF MP4s → dorian-full-pure-hf.mp4 ==="
CONCAT_LIST="$WORK_DIR/concat-pure-hf.txt"
> "$CONCAT_LIST"
for scene in $(ls "$SCENES_DIR"/*.html | sort); do
  name=$(basename "$scene" .html)
  echo "file '$(pwd)/$OUT_DIR/$name.mp4'" >> "$CONCAT_LIST"
done

# Re-encode to uniform params (HF scenes may have slight encoder differences across renders)
"$FFMPEG" -y -f concat -safe 0 -i "$CONCAT_LIST" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 160k \
  -r 30 \
  "$OUT_DIR/dorian-full-pure-hf.mp4" 2>&1 | tail -3

echo ""
echo "=== Done ==="
ls -la "$OUT_DIR/dorian-full-pure-hf.mp4"
DUR=$("$FFMPEG" -i "$OUT_DIR/dorian-full-pure-hf.mp4" 2>&1 | grep Duration | head -1)
echo "$DUR"
