# Browser Event Capture — Auto-Trigger Rule

**Scope**: ALL projects with frontend UI
**Authority**: MANDATORY when user reports UI not working

---

## When to Activate

**Auto-read capture data when the user says:**
- "it doesn't work" / "nothing happens" / "I can't drag/click/select"
- "it works in Playwright but not for me"
- "my experience is different from yours"
- Any UI interaction that works in automated tests but fails for the user

---

## How It Works (Zero User Steps)

The capture system is **always running**:
- Server auto-starts on every terminal open (`.bashrc` → `ensure-running.sh`)
- Inject script auto-loads via Vite plugin (dev mode only)
- Passive capture always on: clicks, pointerdown/up, dragstart/end
- Page refresh = auto-clean (new session signal)

---

## Workflow (Claude Side)

When user reports a UI issue:

1. **Read diagnosis**: `curl -s http://localhost:9876/summary | jq .`
2. **Diagnose** based on red flags in the summary
3. If passive data insufficient, **tell user**: run `__capture.start()` in console, reproduce the issue, then `__capture.stop()`
4. **Re-read**: `curl -s http://localhost:9876/summary | jq .`

---

## Key Diagnostics

| Red Flag | Root Cause | Fix Direction |
|----------|-----------|---------------|
| 0 handle hits | Click target wrong | Check z-index, pointer-events, element overlap |
| Shadow DOM intercepts | Shadow content consuming events | Set pointer-events:none on shadow content |
| pointer-events:none | CSS blocking | Check computed styles on drag handle |
| Native dragstart | Browser drag conflicts | Add `user-select: none` or prevent default |
| 0 pointermove after down | Pointer captured elsewhere | Check pointer capture, iframe boundaries |

---

## Port

- **9876** — browser capture server (registered in global port registry)
- **Skill**: `~/.claude/skills/browser-capture/SKILL.md`

---

**Last Updated**: 2026-03-02
