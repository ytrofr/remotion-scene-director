#!/bin/bash
# Assembles the 3-way Dorian deliverable:
#   1. Post-processes Remotion full (out/dorian-full.mp4) to 2x
#   2. Post-processes Pure HF (public/hf-clips/dorian-full-pure-hf.mp4) to 2x
#   3. Builds Hybrid (ffmpeg concat) then post-processes to 2x
#   4. Copies 3 MP4s + README + STATS to Desktop bundle
set -e
cd "$(dirname "$0")/.."

BUNDLE="/mnt/c/Users/ytr_o/Desktop/dorian-full-three-way"
mkdir -p "$BUNDLE"

FFMPEG="ffmpeg"
if ! command -v ffmpeg >/dev/null 2>&1; then
  REMOTION_FFMPEG="node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg"
  [ -f "$REMOTION_FFMPEG" ] && FFMPEG="$REMOTION_FFMPEG"
fi

PURE_HF_1X="public/hf-clips/dorian-full-pure-hf.mp4"
PURE_REMOTION_1X="out/dorian-full.mp4"

# Guards
for f in "$PURE_HF_1X" "$PURE_REMOTION_1X"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: $f missing. Run renders first."
    exit 1
  fi
done

# --- Step 1: Hybrid assembly (1x) ---
echo "=== Step 1: Assembling Hybrid (HF 1 + Remotion 2-12 + HF 13) ==="
bash scripts/render-dorian-hybrid.sh
HYBRID_1X="out/dorian-hybrid.mp4"

# --- Step 2: Post-process all 3 to 2x ---
echo ""
echo "=== Step 2: Post-processing all 3 outputs to 2x ==="
apply_2x() {
  local input="$1"
  local output="$2"
  echo "→ $(basename "$input") → $(basename "$output")"
  "$FFMPEG" -y -i "$input" \
    -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" \
    -map "[v]" -map "[a]" \
    -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p \
    -c:a aac -b:a 160k \
    -r 30 \
    "$output" 2>&1 | tail -3
}

PURE_HF_2X="out/dorian-full-pure-hf-2x.mp4"
PURE_REMOTION_2X="out/dorian-full-pure-remotion-2x.mp4"
HYBRID_2X="out/dorian-full-hybrid-2x.mp4"

apply_2x "$PURE_HF_1X" "$PURE_HF_2X"
apply_2x "$PURE_REMOTION_1X" "$PURE_REMOTION_2X"
apply_2x "$HYBRID_1X" "$HYBRID_2X"

# --- Step 3: Bundle to Desktop ---
echo ""
echo "=== Step 3: Bundling to Desktop ==="
cp "$PURE_HF_2X" "$BUNDLE/PURE-HF-2x.mp4"
cp "$PURE_REMOTION_2X" "$BUNDLE/PURE-REMOTION-2x.mp4"
cp "$HYBRID_2X" "$BUNDLE/HYBRID-2x.mp4"

# --- Step 4: Generate STATS ---
echo ""
echo "=== Step 4: Generating STATS.md ==="
size() { du -h "$1" 2>/dev/null | cut -f1; }
dur() { "$FFMPEG" -i "$1" 2>&1 | grep Duration | head -1 | sed 's/.*Duration: \([^,]*\).*/\1/'; }

cat > "$BUNDLE/STATS.md" <<EOF
# Dorian Full Three-Way Render Stats

Generated: $(date -u +"%Y-%m-%d %H:%M UTC")

## File sizes + durations

| File                | Size              | Duration (2x)  |
| ------------------- | ----------------- | -------------- |
| HYBRID-2x.mp4       | $(size "$HYBRID_2X") | $(dur "$HYBRID_2X") |
| PURE-HF-2x.mp4      | $(size "$PURE_HF_2X") | $(dur "$PURE_HF_2X") |
| PURE-REMOTION-2x.mp4| $(size "$PURE_REMOTION_2X") | $(dur "$PURE_REMOTION_2X") |

## Scene code size (lines)

| Scene             | Remotion TSX | HF HTML |
| ----------------- | ------------ | ------- |
| 1-Intro           | 52           | 139     |
| 2-HomeScroll      | 92           | 483     |
| 3-TapBubble       | 110          | 233     |
| 4-ChatOpen        | 223          | 332     |
| 5-UserTyping      | 258          | 382     |
| 6-AIThinking      | 213          | 276     |
| 7-AIResponse      | 284          | 341     |
| 8-ProductPage     | 497 (+parts) | 458     |
| 9-ProductDetail   | 135          | 353     |
| 10-StoreDashboard | 1570         | 920     |
| 11-MapSearch      | 511          | 499     |
| 12-AIProducts     | 868          | 486     |
| 13-Closing        | 78 (reused)  | 136     |
| **Total**         | **4891**     | **5038**|

## Source map

- Remotion: \`src/compositions/DorianFull/\` + \`src/compositions/DorianDemo/\` + \`src/compositions/DorianStores/\`
- HF: \`hf/scenes/*.html\` + \`hf/lib/dorian-phone.js\`
- Rule: \`.claude/rules/dorian-dual-stack.md\` (framework split + 2x convention)
EOF

echo ""
echo "=== Bundle ready at $BUNDLE ==="
ls -la "$BUNDLE"
