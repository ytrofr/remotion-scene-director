#!/bin/bash
# PostToolUse hook: Auto-validate hand paths when codedPaths.ts or layers.ts is edited
# Fires after: Edit, Write on gesture-related files

# Read tool input from stdin
JSON_INPUT=$(timeout 2 cat 2>/dev/null || true)

# Extract file_path from the tool input
FILE_PATH=$(echo "$JSON_INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('file_path',''))" 2>/dev/null)

# Only run for codedPaths.ts or layers.ts edits
if [[ "$FILE_PATH" == *"codedPaths.ts"* ]] || [[ "$FILE_PATH" == *"SceneDirector/layers.ts"* ]]; then
  echo ""
  echo "── Hand Path Validation (auto) ──"
  cd "${CLAUDE_PROJECT_DIR:-$PWD}" && npx tsx scripts/validate-hand-paths.ts 2>&1 | tail -30
  echo "──────────────────────────────────"
fi
