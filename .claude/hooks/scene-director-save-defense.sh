#!/bin/bash
# PreToolUse — defensive gate when Claude (not the SD UI) edits scene-keyed JSON.
#
# Protects: codedPaths.data.json, sceneConfig.data.json (future), layers.ts.
# Detects: emptying a scene's path[] when disk has prior non-empty + scene is not
# explicitly _locked. Per s1 concern 5: WARN-ONLY first 2 weeks (canary). The only
# BLOCK case is "truly destructive" — empty-path overwrites non-locked scene with
# prior waypoints (see plan §4.5 P0 row, §6 axis-1 risks).
#
# Logs to: .claude/logs/sd-defense.jsonl (gitignored).
#
# Tool matchers (settings.json): Edit | Write | NotebookEdit
# File filter (in-script): file_path ends with codedPaths.data.json | sceneConfig.data.json
#
# Kill switch: SD_SAVE_DEFENSE_ENABLED=false → exit 0 silently.
# Kill switch: ~/.claude/state/sd-save-defense-disabled → exit 0 silently.
#
# Safety: set +eu — must NEVER block the chain on internal error. Exit 0 on parse fail.

set +eu

# Feature toggle (default ON; fail-closed when explicitly false)
if [ "${SD_SAVE_DEFENSE_ENABLED:-true}" = "false" ]; then
    exit 0
fi
[ -f "$HOME/.claude/state/sd-save-defense-disabled" ] && exit 0

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
LOG_FILE="$PROJECT_DIR/.claude/logs/sd-defense.jsonl"
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null

# Read tool input via stdin JSON
INPUT="$(timeout 2 cat 2>/dev/null || true)"
[ -z "$INPUT" ] && exit 0

TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)"
FILE_PATH="$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"

# Only inspect Edit/Write/NotebookEdit
case "$TOOL_NAME" in
    Edit|Write|NotebookEdit) ;;
    *) exit 0 ;;
esac

# File filter — only protected JSON files
case "$FILE_PATH" in
    */codedPaths.data.json|*/sceneConfig.data.json) ;;
    *) exit 0 ;;
esac

# Build proposed content
NEW_CONTENT=""
case "$TOOL_NAME" in
    Write)
        NEW_CONTENT="$(echo "$INPUT" | jq -r '.tool_input.content // empty' 2>/dev/null)"
        ;;
    Edit|NotebookEdit)
        # Read current file + apply old_string→new_string substitution
        if [ -f "$FILE_PATH" ]; then
            OLD_STR="$(echo "$INPUT" | jq -r '.tool_input.old_string // empty' 2>/dev/null)"
            NEW_STR="$(echo "$INPUT" | jq -r '.tool_input.new_string // empty' 2>/dev/null)"
            if [ -n "$OLD_STR" ]; then
                # Use python for safe substitution (preserves all chars including newlines)
                NEW_CONTENT="$(python3 -c "
import sys, json
with open('$FILE_PATH', 'r') as f:
    content = f.read()
old = json.loads(sys.stdin.read())['old']
new = json.loads(sys.stdin.read())['new'] if False else ''
" 2>/dev/null)"
                # Simpler: read file + apply replacement via python single call
                NEW_CONTENT="$(python3 <<PYEOF 2>/dev/null
import json
with open('$FILE_PATH', 'r') as f:
    content = f.read()
inp = json.loads('''$INPUT''')
old = inp.get('tool_input', {}).get('old_string', '')
new = inp.get('tool_input', {}).get('new_string', '')
print(content.replace(old, new, 1))
PYEOF
)"
            fi
        fi
        ;;
esac

# If we couldn't reconstruct proposed content, exit clean (don't false-block)
[ -z "$NEW_CONTENT" ] && exit 0

# Parse proposed + on-disk JSON, compare per-scene path arrays
DEFENSE_RESULT="$(python3 <<PYEOF 2>&1
import json, sys, os

file_path = "$FILE_PATH"
new_content = """$NEW_CONTENT"""

# Parse proposed
try:
    proposed = json.loads(new_content)
except Exception as e:
    print("PARSE_FAIL:" + str(e))
    sys.exit(0)

# Read on-disk
disk = {}
if os.path.exists(file_path):
    try:
        with open(file_path, 'r') as f:
            disk = json.load(f)
    except Exception:
        pass

warnings = []
blocks = []

# codedPaths.data.json shape: { compId: { sceneName: { gesture, path[], _locked?, ... } } }
# sceneConfig.data.json shape (future): { compId: { _scenes: { sceneName: { hand: { path[] }, _locked? } } } }

def iter_scenes(data, kind):
    """Yield (compId, sceneName, scene_obj, path_list, locked) tuples."""
    if not isinstance(data, dict):
        return
    for comp_id, comp_data in data.items():
        if not isinstance(comp_data, dict):
            continue
        # Try sceneConfig shape first
        scenes = comp_data.get('_scenes') if isinstance(comp_data.get('_scenes'), dict) else comp_data
        for scene_name, scene_obj in scenes.items():
            if scene_name.startswith('_'):
                continue
            if not isinstance(scene_obj, dict):
                continue
            locked = bool(scene_obj.get('_locked', False))
            # codedPaths shape: scene_obj.path
            # sceneConfig shape: scene_obj.hand.path
            path = scene_obj.get('path', [])
            if not path and isinstance(scene_obj.get('hand'), dict):
                path = scene_obj['hand'].get('path', [])
            yield (comp_id, scene_name, scene_obj, path or [], locked)

# Index disk scenes by (comp, scene) → path-len + locked
disk_idx = {}
for comp, scene, _, path, locked in iter_scenes(disk, 'disk'):
    disk_idx[(comp, scene)] = (len(path), locked)

# Compare proposed against disk
for comp, scene, scene_obj, path, locked in iter_scenes(proposed, 'proposed'):
    disk_entry = disk_idx.get((comp, scene))
    if not disk_entry:
        continue  # New scene — fine
    disk_len, disk_locked = disk_entry
    if len(path) == 0 and disk_len > 0:
        if locked or disk_locked:
            warnings.append(f"emptying path[] on locked scene {comp}/{scene} (disk had {disk_len} waypoints) — allowed because _locked")
        else:
            blocks.append(f"emptying path[] on UNLOCKED scene {comp}/{scene} (disk had {disk_len} waypoints) — refuse without _locked:true")
    elif disk_len > 5 and len(path) <= 1:
        warnings.append(f"shrinking path[] on {comp}/{scene} from {disk_len} to {len(path)} waypoints — confirm intentional")

if blocks:
    print("BLOCK:" + " | ".join(blocks))
elif warnings:
    print("WARN:" + " | ".join(warnings))
else:
    print("OK")
PYEOF
)"

# Log every invocation
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "{\"ts\":\"$TIMESTAMP\",\"tool\":\"$TOOL_NAME\",\"file\":\"$FILE_PATH\",\"result\":\"$(echo "$DEFENSE_RESULT" | head -1 | sed 's/"/\\"/g')\"}" >> "$LOG_FILE"

case "$DEFENSE_RESULT" in
    OK*|PARSE_FAIL*)
        exit 0
        ;;
    WARN:*)
        # Canary: emit WARN to stderr but allow tool call (exit 0)
        echo "[sd-save-defense] WARN: ${DEFENSE_RESULT#WARN:}" >&2
        echo "[sd-save-defense] kill switch: SD_SAVE_DEFENSE_ENABLED=false" >&2
        exit 0
        ;;
    BLOCK:*)
        # Truly destructive: emit BLOCK to stderr + exit 2 (PreToolUse blocking)
        echo "[sd-save-defense] BLOCK: ${DEFENSE_RESULT#BLOCK:}" >&2
        echo "[sd-save-defense] To force: add _locked:true to that scene, or set SD_SAVE_DEFENSE_ENABLED=false" >&2
        exit 2
        ;;
    *)
        # Unknown result — fail-open (canary phase)
        echo "[sd-save-defense] internal: $DEFENSE_RESULT" >&2
        exit 0
        ;;
esac
