#!/bin/bash
# Prettier Format Hook - PostToolUse for Write|Edit
# Created: 2026-02-07
# Purpose: Format files after Write/Edit operations
#
# CRITICAL: Uses stdin JSON parsing (NOT environment variables!)
# Claude Code passes data via stdin as JSON, not via env vars.
#
# ═══════════════════════════════════════════════════════════════════

# Read JSON from stdin with timeout (prevents hang if stdin pipe not closed)
JSON_INPUT=$(timeout 2 cat)

# Extract file path from JSON (the CORRECT way!)
FILE_PATH=$(echo "$JSON_INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Validate file exists and path is not empty
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

if [ ! -f "$FILE_PATH" ]; then
    exit 0
fi

# Only format supported file types (skip binary, images, etc.)
case "$FILE_PATH" in
    *.js|*.jsx|*.ts|*.tsx|*.json|*.css|*.scss|*.html|*.md|*.yaml|*.yml)
        timeout 10 npx prettier --write "$FILE_PATH" 2>/dev/null || true
        ;;
esac

# Always exit 0 (non-blocking hook)
exit 0
