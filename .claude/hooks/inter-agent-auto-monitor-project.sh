#!/bin/bash
# SessionStart — project-scoped bus activity summarizer.
#
# Adds project context to the machine-wide inter-agent auto-monitor
# (~/.claude/hooks/inter-agent-auto-monitor.sh). Does NOT duplicate the auto-arm
# logic — that lives in the machine-wide hook and runs anyway. This hook just
# surfaces project-relevant bus state in additionalContext.
#
# What it adds:
#   1. Cleans up orphaned bus-monitor-* state files older than 2 days (per-session
#      cleanup is in machine-wide hook; this is a wider sweep including dead-pid
#      entries the TTL doesn't catch).
#   2. Counts unread project-tagged threads, surfaces top 3 in additionalContext.
#   3. Lists live peers in this project's cwd (sub-id + last activity).
#
# Kill switch: INTER_AGENT_PROJECT_HOOKS_ENABLED=false → exit 0 silently.
# Kill switch: ~/.claude/state/bus-monitor-disabled → exit 0 silently.
#
# Safety: set +eu — must NEVER break SessionStart chain.

set +eu

# Feature toggle (default ON; fail-closed when explicitly false)
if [ "${INTER_AGENT_PROJECT_HOOKS_ENABLED:-true}" = "false" ]; then
    exit 0
fi

STATE_DIR="$HOME/.claude/state"
[ -f "$STATE_DIR/bus-monitor-disabled" ] && exit 0

ROOT="${INTER_AGENT_ROOT:-$HOME/shared/inter-agent}"
INDEX="$ROOT/threads.json"
BIN="$ROOT/bin"

# Read SessionStart stdin for session_id
INPUT="$(timeout 1 cat 2>/dev/null || true)"
SID="$(printf '%s' "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)"
[ -n "$SID" ] && [ -f "$STATE_DIR/bus-monitor-disabled-$SID" ] && exit 0

# Bus infra check — silent skip if not installed
[ -f "$INDEX" ] || exit 0
[ -x "$BIN/talk.sh" ] || exit 0

# Resolve identity (machine-wide resolver)
ME="$("$BIN/resolve-identity.sh" 2>/dev/null)" || exit 0
[ -n "$ME" ] || exit 0
BASE_ME="${ME%%:*}"

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
PROJECT_BASENAME="$(basename "$PROJECT_DIR")"

# Cleanup orphaned bus-monitor state files (>2d) — wider sweep than machine-wide
# Only removes per-session pending/armed/warned markers (NOT kill switches).
find "$STATE_DIR" -maxdepth 1 -mtime +2 \
    \( -name 'bus-monitor-armed-*' -o -name 'bus-monitor-pending-*' -o -name 'bus-monitor-warned-*' \) \
    -delete 2>/dev/null

# Count unread threads where I'm a participant + cwd matches this project
UNREAD_JSON="$(jq -c --arg me "$ME" --arg base "$BASE_ME" '
  [.threads | to_entries
    | map(select(
        .value.status == "active" and
        (.value.participants | map(. == $base or . == $me or startswith($base + ":")) | any)
      ))
    | sort_by(.value.last_activity) | reverse | .[:3]
    | .[] | {tid: .key, last: .value.last_activity, participants: .value.participants}
  ]
' "$INDEX" 2>/dev/null)"

UNREAD_COUNT=0
if [ -n "$UNREAD_JSON" ]; then
    UNREAD_COUNT="$(echo "$UNREAD_JSON" | jq 'length' 2>/dev/null || echo 0)"
fi

# Live peers on same project (best-effort — uses talk.sh peers output)
PEERS_RAW="$("$BIN/talk.sh" peers 2>/dev/null | tail -n +2 || true)"
PEER_COUNT=0
if [ -n "$PEERS_RAW" ]; then
    PEER_COUNT="$(echo "$PEERS_RAW" | grep -cE '^[a-z0-9-]+:' 2>/dev/null || echo 0)"
fi

# Emit additionalContext only when there's something to surface
if [ "${UNREAD_COUNT:-0}" -gt 0 ] || [ "${PEER_COUNT:-0}" -gt 0 ]; then
    echo "[inter-agent / $PROJECT_BASENAME] me=$ME peers=$PEER_COUNT active-threads=$UNREAD_COUNT"
    if [ "${UNREAD_COUNT:-0}" -gt 0 ]; then
        echo "$UNREAD_JSON" | jq -r '.[] | "  thread: \(.tid) (last: \(.last))"' 2>/dev/null
        echo "  → ~/shared/inter-agent/bin/talk.sh show <tid> to read"
    fi
fi

exit 0
