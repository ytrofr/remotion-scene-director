#!/bin/bash
# Post-render feedback collector
# Captures render metadata and appends to docs/video-learnings.md
#
# Usage: Called automatically after render, or manually:
#   ./scripts/post-render-feedback.sh <composition> <output-file>
#
# Example:
#   ./scripts/post-render-feedback.sh DorianDemo out/DorianDemo.mp4

COMPOSITION="${1:-unknown}"
OUTPUT_FILE="${2:-out/video.mp4}"
LEARNINGS_FILE="docs/video-learnings.md"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)

# Collect metadata
if [ -f "$OUTPUT_FILE" ]; then
  FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
  DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUTPUT_FILE" 2>/dev/null | cut -d'.' -f1)
  RESOLUTION=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$OUTPUT_FILE" 2>/dev/null)
  FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$OUTPUT_FILE" 2>/dev/null)
else
  FILE_SIZE="N/A"
  DURATION="N/A"
  RESOLUTION="N/A"
  FPS="N/A"
fi

# Append render entry
cat >> "$LEARNINGS_FILE" << EOF

---

### $DATE $TIME — $COMPOSITION — Render

**File**: $OUTPUT_FILE ($FILE_SIZE)
**Duration**: ${DURATION}s | **Resolution**: $RESOLUTION | **FPS**: $FPS

**Visual Quality**
- [ ] Animations smooth (no jank/stutter)
- [ ] Colors match art direction
- [ ] Text readable at target size
- [ ] No overlapping elements

**Timing**
- [ ] Scene transitions feel natural
- [ ] No dead frames
- [ ] Total duration appropriate

**What Worked Well**
- (fill in after review)

**What Needs Improvement**
- (fill in after review)
EOF

echo "✓ Render metadata captured in $LEARNINGS_FILE"
echo "  Composition: $COMPOSITION"
echo "  File: $OUTPUT_FILE ($FILE_SIZE)"
echo "  Duration: ${DURATION}s"
echo ""
echo "→ Review the render and fill in the checklist in $LEARNINGS_FILE"
