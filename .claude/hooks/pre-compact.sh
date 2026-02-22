#!/bin/bash
# Pre-Compact Hook - Claude Code Hook (NOT Git Hook)
# Created: 2025-12-19
# Source: Anthropic blog - "How to Configure Hooks"
# Purpose: Backup transcript before context compaction
# Hook Type: PreCompact (runs before Claude Code compacts context window)

# ═══════════════════════════════════════════════════════════════════
# TRANSCRIPT BACKUP BEFORE COMPACTION
# ═══════════════════════════════════════════════════════════════════

BACKUP_DIR="$HOME/.claude/session-backups"
mkdir -p "$BACKUP_DIR"

# Read JSON input from stdin (Claude Code provides session info)
JSON_INPUT=$(timeout 2 cat)
TRANSCRIPT_PATH=$(echo "$JSON_INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)
SESSION_ID=$(echo "$JSON_INPUT" | jq -r '.session_id // empty' 2>/dev/null)

# Backup the transcript if it exists
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
    # Create backup filename with timestamp and session ID
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BACKUP_NAME="${TIMESTAMP}-${SESSION_ID}.jsonl"

    # Copy transcript to backup directory
    cp "$TRANSCRIPT_PATH" "$BACKUP_DIR/$BACKUP_NAME"

    # Return JSON response to Claude Code
    echo "{\"backed_up\": \"$BACKUP_DIR/$BACKUP_NAME\", \"size\": \"$(du -h "$TRANSCRIPT_PATH" | cut -f1)\"}"

    # Success
    exit 0
else
    # Transcript not found - return error but don't block
    echo "{\"error\": \"Transcript not found\", \"transcript_path\": \"$TRANSCRIPT_PATH\"}"
    exit 0  # Exit 0 = non-blocking error
fi
