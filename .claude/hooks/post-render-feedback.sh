#!/bin/bash
# PostToolUse — capture render commands + suggest video-feedback-loop skill.
#
# Fires on Bash tool calls. Filters to commands matching render scripts:
#   - npm run render:*
#   - npm run r:* / npm run r (P2a-mvp+)
#   - npx remotion render
#
# Gate: skip preview/short renders (<30s) — these are iteration loops, not ship.
# When render duration available via tool_response.totalDurationMs, use it.
# When not available (older harness versions), fall back to command-pattern heuristic
# (preview/debug intents skipped; standard/hq/full always logged).
#
# Outputs:
#   1. Append render entry to ~/.claude/projects/-home-ytr-limor-video-poc/memory/render-log.jsonl
#   2. Suggest video-feedback-loop skill in additionalContext (>30s renders only)
#
# Kill switch: POST_RENDER_FEEDBACK_ENABLED=false → exit 0 silently.
#
# Safety: set +eu — never break PostToolUse chain.

set +eu

if [ "${POST_RENDER_FEEDBACK_ENABLED:-true}" = "false" ]; then
    exit 0
fi

INPUT="$(timeout 2 cat 2>/dev/null || true)"
[ -z "$INPUT" ] && exit 0

TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)"
[ "$TOOL_NAME" != "Bash" ] && exit 0

CMD="$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "$CMD" ] && exit 0

# Filter to render commands only
case "$CMD" in
    *"npm run render:"*|*"npm run r:"*|*"npm run r "*|*"npx remotion render"*) ;;
    *) exit 0 ;;
esac

# Skip preview/debug intents (short renders, no feedback needed)
case "$CMD" in
    *"render:"*"preview"*|*"r:preview"*|*"r preview"*|*"render:"*"debug"*|*"r:debug"*|*"r debug"*)
        SKIP_FEEDBACK="true"
        ;;
    *)
        SKIP_FEEDBACK="false"
        ;;
esac

# Extract duration from tool_response if present
DURATION_MS="$(echo "$INPUT" | jq -r '.tool_response.totalDurationMs // .tool_response.duration_ms // empty' 2>/dev/null)"
DURATION_S=""
if [ -n "$DURATION_MS" ]; then
    DURATION_S="$((DURATION_MS / 1000))"
fi

# Extract exit code
EXIT_CODE="$(echo "$INPUT" | jq -r '.tool_response.exitCode // .tool_response.exit_code // empty' 2>/dev/null)"

# Extract output file path heuristically (look for `-o out/<file>.mp4` or `--output`)
OUTPUT_FILE="$(echo "$CMD" | grep -oE 'out/[a-zA-Z0-9_./-]+\.mp4' | head -1 || true)"
OUTPUT_SIZE=""
if [ -n "$OUTPUT_FILE" ] && [ -f "$OUTPUT_FILE" ]; then
    OUTPUT_SIZE="$(stat -c %s "$OUTPUT_FILE" 2>/dev/null || echo "")"
fi

# Log entry
LOG_DIR="$HOME/.claude/projects/-home-ytr-limor-video-poc/memory"
LOG_FILE="$LOG_DIR/render-log.jsonl"
mkdir -p "$LOG_DIR" 2>/dev/null

TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
# Truncate command at 200 chars for log compactness
CMD_TRUNC="$(echo "$CMD" | head -c 200)"

jq -nc \
    --arg ts "$TIMESTAMP" \
    --arg cmd "$CMD_TRUNC" \
    --arg dur "${DURATION_S:-unknown}" \
    --arg exit "${EXIT_CODE:-unknown}" \
    --arg out "${OUTPUT_FILE:-}" \
    --arg size "${OUTPUT_SIZE:-}" \
    '{ts:$ts,cmd:$cmd,duration_s:$dur,exit:$exit,output:$out,size_bytes:$size}' \
    >> "$LOG_FILE" 2>/dev/null

# Emit feedback nudge for non-preview renders that succeeded
if [ "$SKIP_FEEDBACK" = "true" ]; then
    exit 0
fi
if [ -n "$EXIT_CODE" ] && [ "$EXIT_CODE" != "0" ]; then
    exit 0  # render failed — no feedback nudge
fi
# If we have duration, gate on >30s. If we don't, only nudge on "render:" / "r " (heavy by default)
if [ -n "$DURATION_S" ] && [ "$DURATION_S" -lt 30 ]; then
    exit 0
fi

cat <<EOF
[post-render] $OUTPUT_FILE${OUTPUT_SIZE:+ ($OUTPUT_SIZE bytes)}${DURATION_S:+ in ${DURATION_S}s}
  → Consider invoking 'video-feedback-loop' skill to capture learnings.
  → Per rule 54: scrub the output, range-render any cursor scenes, archive frames you'll reference.
  → kill switch: POST_RENDER_FEEDBACK_ENABLED=false
EOF

exit 0
