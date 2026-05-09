# Use `??` Not `||` for Numeric Defaults

**Scope**: ALL TypeScript/JavaScript code in this project (animation, scene props, physics, opacity, frame numbers, anywhere a number can legitimately be 0)
**Authority**: MANDATORY — `||` silently corrupts data when `0` is a valid value
**Evidence**: 2026-04-27 — `useHandAnimation.ts` had `scale: point.scale || 1` (3 lines). My V1.08 path used `scale: 0` waypoints to hide the cursor between click targets. JavaScript: `0 || 1 === 1`. The cursor never went invisible — it stayed at scale 1 the whole scene, sliding visibly between Add to Cart → hamburger → My Store. User reported "not smooth" / "flickering" — that was the visible sliding.

---

## Core Rule

**When a numeric field has a default and `0` is a meaningful value, use `??` (nullish coalescing). Reserve `||` for boolean/string contexts where falsy means missing.**

```ts
// WRONG — eats explicit zeros
const scale = point.scale || 1;     // scale: 0 → 1 (BUG)
const opacity = props.opacity || 1; // opacity: 0 → 1 (BUG)
const delay = config.delay || 0;    // delay: 0 → 0 (no bug, but use ?? for consistency)

// CORRECT
const scale = point.scale ?? 1;     // scale: 0 → 0 ✓
const opacity = props.opacity ?? 1; // opacity: 0 → 0 ✓
```

## Suspect Field Inventory (this codebase)

| Type of field | Why 0 matters |
|---|---|
| `scale` (FloatingHand, Remotion `interpolate` outputs) | Hide-via-shrink. `scale: 0` = invisible. |
| `opacity` | Fade-out. `opacity: 0` = transparent. |
| `frame`, `startFrame`, `delay`, `from`, `durationInFrames` | Frame 0 is the FIRST frame of any composition/sequence. |
| `velocityScale`, `maxRotation`, `floatAmplitude`, `shadowDistance`, `shadowBlur` | All physics knobs accept 0 to mean "off / disable". |
| `volume` | `volume: 0` = silent (legitimate value). |
| `x`, `y`, `top`, `left`, `width`, `height` | (0, 0) and dimension 0 are meaningful. |
| `index`, `count`, `length` | Array index 0 is first element. |

## When `||` Is Acceptable

- String fallbacks: `name || 'Untitled'` — empty string IS "missing" semantically
- Object/array fallbacks: `obj || {}` — null/undefined IS "missing"
- Boolean coalescing where false IS missing: `enabled || true` (rare; usually `??` is still right)

## How to Audit

```bash
# Find all numeric `||` fallbacks in Remotion/animation paths
grep -rnE "(scale|opacity|rotation|velocity|frame|delay|duration|volume|x|y|width|height)\s*\|\|\s*[0-9]" src/
```

## Companions

- `remotion-patterns.md` rule 53/54/55 — cursor render fragility (where the V1.08 bug surfaced)
- `.claude/rules/visual-bug-render-trace.md` — the diagnostic discipline that found this bug

---

**Last Updated**: 2026-04-27
