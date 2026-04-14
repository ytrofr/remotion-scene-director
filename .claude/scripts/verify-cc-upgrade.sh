#!/bin/bash
# Remotion (limor-video-poc) verify — CC 2.1.98 Monitor tool for render watching
set -euo pipefail

BLU=$'\033[34m'; GRN=$'\033[32m'; RED=$'\033[31m'; NC=$'\033[0m'
info() { printf "${BLU}INFO${NC}: %s\n" "$*"; }
pass() { printf "${GRN}PASS${NC}: %s\n" "$*"; }
fail() { printf "${RED}FAIL${NC}: %s\n" "$*"; exit 2; }

cc_ver=$(claude --version 2>/dev/null | awk '{print $1}')
info "CC version: $cc_ver"
case "$cc_ver" in
  2.1.98|2.1.99|2.1.10[0-9]*) pass "CC $cc_ver >= 2.1.98 (Monitor tool available)" ;;
  *) fail "CC $cc_ver < 2.1.98" ;;
esac

info "Monitor tool usage (CC 2.1.98) for long Remotion renders:"
info "  In a CC session: start render with run_in_background=true"
info "  Then use Monitor tool on the background task to stream progress"
info "  Replaces: watching logs via periodic Read calls"

[ -f package.json ] && pass "Node project detected" || fail "package.json missing"

pass "Remotion verify complete — adopt Monitor tool for next long render job"
