#!/bin/bash
# SessionStart — surface a branch-lock nudge when 2+ peers detected on same branch.
#
# Reads `talk.sh peers` for live registered sessions, filters to peers whose
# registered cwd points at THIS project, and emits a coordination nudge in
# additionalContext if peer count >= 1 (i.e. me + 1 = 2 sessions on same branch).
#
# Why nudge, not block: per plan §6 axis-5 mitigation, branch-lock invocation
# annoys solo work, so we trigger ONLY on actual contention. The skill itself
# (`branch-lock`) is auto-invokable; this hook just surfaces the trigger.
#
# Kill switch: BRANCH_LOCK_HOOK_ENABLED=false → exit 0 silently.
# Kill switch: ~/.claude/state/branch-lock-disabled → exit 0 silently.
#
# Safety: set +eu — must NEVER break SessionStart chain.

set +eu

if [ "${BRANCH_LOCK_HOOK_ENABLED:-true}" = "false" ]; then
    exit 0
fi
[ -f "$HOME/.claude/state/branch-lock-disabled" ] && exit 0

ROOT="${INTER_AGENT_ROOT:-$HOME/shared/inter-agent}"
BIN="$ROOT/bin"
[ -x "$BIN/talk.sh" ] || exit 0

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
PROJECT_BASENAME="$(basename "$PROJECT_DIR")"

# Current git branch (skip gracefully if not a git repo)
BRANCH="$(cd "$PROJECT_DIR" && git rev-parse --abbrev-ref HEAD 2>/dev/null)"
[ -z "$BRANCH" ] || [ "$BRANCH" = "HEAD" ] && exit 0

# Read peers (talk.sh peers prints `me: <id>` then table)
PEERS_OUT="$("$BIN/talk.sh" peers 2>/dev/null || true)"
[ -z "$PEERS_OUT" ] && exit 0

# Count peers whose CWD basename matches this project
# Format: FULL_ID  SUB  STARTED  CWD  PID  (CWD is column 4 in space-separated table)
PEER_LIST="$(echo "$PEERS_OUT" | awk -v proj="$PROJECT_BASENAME" '
    NR == 1 { next }       # skip "me: ..." line
    NR == 2 {
        # detect which column has CWD (varies as talk.sh evolves)
        cwd_col = 0
        for (i = 1; i <= NF; i++) if ($i == "CWD") cwd_col = i
        next
    }
    /^[a-z0-9-]+:/ {
        if (cwd_col > 0 && ($cwd_col == proj || index($cwd_col, proj) > 0)) print $1
    }
' 2>/dev/null)"

if [ -n "$PEER_LIST" ]; then
    PEER_COUNT="$(echo "$PEER_LIST" | grep -cE '^[a-z0-9-]+:' 2>/dev/null)"
else
    PEER_COUNT=0
fi

# Only nudge when 2+ peers present (me + at least 1 other)
if [ "${PEER_COUNT:-0}" -ge 1 ]; then
    cat <<EOF
[branch-lock / $PROJECT_BASENAME] $PEER_COUNT peer(s) detected on branch '$BRANCH':
$PEER_LIST
  → Coordinate before parallel edits. Suggested:
    \`~/shared/inter-agent/bin/talk.sh sync "<one-line topic>"\`
  → Or invoke the 'branch-lock' skill to enforce single-writer.
EOF
fi

exit 0
