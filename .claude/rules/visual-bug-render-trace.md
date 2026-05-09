# Render and Zoom BEFORE Theorizing on Visual Bugs

**Scope**: ALL visual bug reports in Remotion compositions (cursor artifacts, layout glitches, color issues, motion artifacts, anything the user describes by what they SEE)
**Authority**: MANDATORY before changing any code in response to a visual bug
**Evidence**: 2026-04-27 — User reported "cursor flickering and rectangle around it" in V1.07. I jumped straight to V1.07→V1.08 architecture refactor (collapsing 4 FloatingHand instances into 1) on a mount-count theory I never validated. V1.08 still had the issue. Cost: 2 full version bumps + ~25 min of render time + one frustrated user. The actual diagnosis took 30 seconds once I rendered + zoomed: the "rectangle" was the FloatingHand shadow blob, and the "flicker" was a `scale: 0` truthy bug. Both invisible to my mount-count theory.

---

## Core Rule

**When a user reports a visual artifact, FIRST render the affected scene + zoom into the area BEFORE forming a fix theory. Code changes only after the artifact has been visually inspected and identified.**

Architectural changes (refactor, version bump, component restructure) are NEVER an appropriate first response to a visual bug. If you're tempted to refactor before rendering, STOP.

## The 30-Second Diagnostic

1. **Render a still at the problem frame** (rule 54 tier 1):
   ```bash
   npx remotion still src/index.ts <Comp> probe-frames/probe-fN.png --frame=<N> --gl=angle
   ```
2. **Crop to the affected element** (`ffmpeg -i probe.png -vf "crop=W:H:X:Y" zoom.png`) or open at full resolution
3. **Enumerate ALL elements visible in the zoom**: cursor, shadow, ripple, halo, background, overlay, etc. Name each one.
4. **Match each element to a known DOM/render source**: `physics.shadowEnabled`, `<FloatingHand showRipple>`, scene background, etc.
5. **The artifact IS one of the elements you enumerated.** Pick it. Then form the fix theory.

For TEMPORAL artifacts (flicker, jump, blink), use rule 54 tier 2 (range render) instead of stills.

## When to Apply

- User says "rectangle around it", "halo", "shadow", "blob", "smudge", "trailing thing", "weird artifact" — any vague visual description
- User says "flickering", "jumping", "not smooth" — temporal language; use range render (tier 2)
- After ANY 1st failed fix attempt on a visual bug — STOP and render before fixing again (rule from `~/.claude/rules/debugging/no-band-aids.md`)
- Before committing to an architecture/version change driven by a visual claim

## Anti-Patterns

| Wrong | Right |
|---|---|
| User reports artifact → I theorize cause → I refactor | User reports artifact → I render + zoom → I name the element → I fix that element |
| Render a still at "a representative frame" | Render at the SPECIFIC frame the user complained about (or worst-case frame for temporal bugs) |
| Trust mid-segment stills (e.g. f920, f950) for transition bugs | Stills at f920 are CLEAN by design — transition bugs hide between waypoints (rule 54) |
| "It's probably the X component" | "Element at (x, y) in frame N is Y; that's what needs to change" |

## Companion Rules

- `remotion-patterns.md` rule 54 — verification funnel (still / range / full)
- `~/.claude/rules/debugging/no-band-aids.md` — 1st failed fix = stop fixing, start tracing
- `.claude/rules/typescript-nullish-coalescing.md` — bug class found by following this rule

---

**Last Updated**: 2026-04-27
