#!/bin/bash
# SessionEnd — prompt /document skill when session has ≥3 commits worth capturing.
#
# Counts commits authored in this session window (since SessionStart, tracked via
# state file written on first invocation per session_id). On SessionEnd, if commit
# count ≥3, emit additionalContext suggesting /document.
#
# State file: ~/.claude/state/session-start-sha-<sid> stores HEAD SHA at session
# start; SessionEnd diffs current HEAD against it.
#
# Kill switch: SESSION_END_DOCUMENT_ENABLED=false → exit 0 silently.
#
# Safety: set +eu — never break SessionEnd chain.

set +eu

if [ "${SESSION_END_DOCUMENT_ENABLED:-true}" = "false" ]; then
    exit 0
fi

INPUT="$(timeout 1 cat 2>/dev/null || true)"
SID="$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)"
EVENT="$(echo "$INPUT" | jq -r '.hook_event_name // empty' 2>/dev/null)"

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
STATE_DIR="$HOME/.claude/state"
mkdir -p "$STATE_DIR" 2>/dev/null

# On SessionStart, snapshot HEAD (we register this hook on both events;
# the SessionStart fork records, the SessionEnd fork compares)
if [ "$EVENT" = "SessionStart" ]; then
    [ -z "$SID" ] && exit 0
    HEAD_SHA="$(cd "$PROJECT_DIR" && git rev-parse HEAD 2>/dev/null)"
    [ -n "$HEAD_SHA" ] && echo "$HEAD_SHA" > "$STATE_DIR/session-start-sha-$SID" 2>/dev/null
    exit 0
fi

# SessionEnd path
[ "$EVENT" = "SessionEnd" ] || [ -z "$EVENT" ] || exit 0
[ -z "$SID" ] && exit 0

START_FILE="$STATE_DIR/session-start-sha-$SID"
[ -f "$START_FILE" ] || exit 0
START_SHA="$(cat "$START_FILE" 2>/dev/null)"
[ -z "$START_SHA" ] && { rm -f "$START_FILE" 2>/dev/null; exit 0; }

CURRENT_SHA="$(cd "$PROJECT_DIR" && git rev-parse HEAD 2>/dev/null)"
[ -z "$CURRENT_SHA" ] && exit 0

# Count commits between start and now
if [ "$START_SHA" = "$CURRENT_SHA" ]; then
    COMMIT_COUNT=0
else
    COMMIT_COUNT="$(cd "$PROJECT_DIR" && git rev-list --count "$START_SHA..$CURRENT_SHA" 2>/dev/null || echo 0)"
fi

# Cleanup state file
rm -f "$START_FILE" 2>/dev/null

# Gate: only nudge on ≥3 commits
if [ "${COMMIT_COUNT:-0}" -ge 3 ]; then
    COMMIT_LIST="$(cd "$PROJECT_DIR" && git log --oneline "$START_SHA..$CURRENT_SHA" 2>/dev/null | head -10)"
    cat <<EOF
[session-end] $COMMIT_COUNT commits this session:
$COMMIT_LIST
  → Consider running /document to capture session learnings + update memory/feedback files.
  → kill switch: SESSION_END_DOCUMENT_ENABLED=false
EOF
fi

exit 0
