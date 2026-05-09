#!/bin/bash
# Post-Compact Hook - Claude Code 2.1.76+
# Created: 2026-03-15
# Purpose: Reload critical context after compaction completes
# Hook Type: PostCompact (runs AFTER Claude Code compacts context window)

cat << 'EOF'

═══════════════════════════════════════════════════════════════════
🔄 POST-COMPACTION: Context restored — reload critical files
═══════════════════════════════════════════════════════════════════

Compaction complete. Re-read these files NOW to restore context:

1. CLAUDE.md (project rules + Remotion patterns)
2. Active plan file (check ~/.claude/plans/)

PRIORITY: Re-read any file the user referenced in last 3 messages.
WARNING: Do NOT assume pre-compaction context is intact.

═══════════════════════════════════════════════════════════════════
EOF

exit 0
