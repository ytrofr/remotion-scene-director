#!/bin/bash
# protect-frozen-compositions.sh — PreToolUse hook on Write|Edit
#
# Reads src/compositions/.frozen.json and blocks edits to any file listed
# there. Prevents accidental mutation of shipped video versions.
#
# Bypass: bump to next version per .claude/rules/version-safe-iteration.md
#
# Hook stdin (JSON):
#   { "tool_name": "Edit"|"Write", "tool_input": { "file_path": "..." } }
#
# Output (JSON via stdout):
#   { "hookSpecificOutput": { "hookEventName": "PreToolUse",
#       "permissionDecision": "deny", "permissionDecisionReason": "..." } }
#
# Allow-through (silent exit 0): file not in frozen list, or frozen.json missing.

set -u

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
FROZEN_FILE="$PROJECT_ROOT/src/compositions/.frozen.json"

# Read stdin (timeout protects against hang)
INPUT=$(timeout 2 cat 2>/dev/null || true)
[ -z "$INPUT" ] && exit 0

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Only protect Write|Edit (defensive — matcher should already filter)
case "$TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

[ -z "$FILE_PATH" ] && exit 0
[ ! -f "$FROZEN_FILE" ] && exit 0

# Normalize: convert absolute paths under PROJECT_ROOT to repo-relative
REL_PATH="$FILE_PATH"
case "$FILE_PATH" in
  "$PROJECT_ROOT"/*) REL_PATH="${FILE_PATH#$PROJECT_ROOT/}" ;;
esac

# Check if REL_PATH appears in frozen.json's "file" entries
MATCH=$(jq -r --arg p "$REL_PATH" \
  '.frozen[] | select(.file == $p) | "\(.version)|\(.frozenAt)"' \
  "$FROZEN_FILE" 2>/dev/null | head -1)

[ -z "$MATCH" ] && exit 0

VERSION=$(echo "$MATCH" | cut -d'|' -f1)
FROZEN_AT=$(echo "$MATCH" | cut -d'|' -f2)

REASON="🔒 FROZEN: $REL_PATH belongs to $VERSION (frozen $FROZEN_AT).

Per .claude/rules/version-safe-iteration.md, do NOT edit frozen composition files.

Next steps:
  1. Identify which composition this scene belongs to (e.g. DorianFull).
  2. Bump to next sub-version (V1.00 → V1.01) per the rule's Bump Procedure.
  3. Selectively clone files you'll modify, register in Root.tsx, add render scripts.
  4. Edit the V1.0X copy — hook will allow it.

Frozen registry: src/compositions/.frozen.json
Bypass is by /freeze AFTER user approves a render — never by hand-editing the JSON."

# Emit JSON deny decision
jq -n --arg reason "$REASON" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: $reason
  }
}'

exit 0
