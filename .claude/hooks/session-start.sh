#!/bin/bash
# Session Start Hook - Shows git context on session start
# Purpose: Quick orientation — branch, status, recent commits
# Hook Type: SessionStart

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

echo "Branch: $CURRENT_BRANCH"
echo ""
echo "Git Status:"
git status --short 2>/dev/null | head -10 || echo "Clean"
echo ""
echo "Recent Commits:"
git log --oneline -5 2>/dev/null || echo "No commits"

exit 0
