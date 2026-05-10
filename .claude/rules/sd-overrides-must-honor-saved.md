# SD Overrides Must Honor Saved — Frozen Scenes Need Opt-In Override

**Scope**: Versioned scene files used by multiple parent compositions in this project (DorianDemo scenes, DorianStores scenes, etc.)
**Authority**: MANDATORY when a scene is used by a versioned composition family
**Created**: 2026-05-10

---

## Core Rule

**Scene files used by versioned compositions MUST honor SceneDirector-saved waypoints via an opt-in `compositionId` prop. Hardcoding a path AND explicitly skipping `getSavedPath()` is an anti-pattern — it silently breaks "edit in SD → re-render → see edits" for every future version that re-uses the scene.**

The intent of "freeze old data from leaking forward" should be implemented as **opt-IN per parent comp**, not opt-OUT for everyone.

## When to Apply

- Editing a scene file under `src/compositions/<Family>/scenes/` that is imported by 2+ versioned wrapper comps (e.g. `HomeScrollSceneV1_09` used by V1.10–V1.22 of DorianFull)
- Adding a new scene to a versioned family
- Reviewing a scene whose docstring says "intentionally does NOT consult getSavedPath()" — that scene is broken for all future versions
- A `npm run test:parity` failure flags any prop divergence between SD preview and production render — see the parity harness companion (Phase 1 of partitioned-giggling-adleman.md)

## The 3-File Fix Pattern

When you discover a frozen scene file silently ignoring SD edits:

### File 1 — scene file (e.g. `HomeScrollSceneV1.09.tsx`)

Accept optional `compositionId` prop. If passed AND saved data has ≥2 waypoints, OVERRIDE the hardcoded fallback:

```tsx
import { getSavedPath } from '../../SceneDirector/codedPaths';

export const SceneV1_09: React.FC<{ compositionId?: string }> = ({
  compositionId,
}) => {
  // ... existing hardcoded path stays as fallback ...
  const hardcodedPath: HandPathPoint[] = [
    /* ... */
  ];

  // SD override: only triggered when caller opts in by passing compositionId
  // AND saved data exists. V1.10–V1.21 callers don't pass it → unchanged.
  const sdSaved = compositionId
    ? getSavedPath(compositionId, '<scene-name>')
    : null;
  const sdPath =
    sdSaved && Array.isArray(sdSaved.path) && sdSaved.path.length >= 2
      ? sdSaved.path
      : null;

  const path: HandPathPoint[] = sdPath ?? hardcodedPath;
  // ...
};
```

### File 2 — wrapper composition (e.g. `DorianDemoV1.12.tsx`)

Thread `compositionId` through:

```tsx
interface DorianDemoV1_12_Props {
  sceneOverrides?: SceneOverridesV1_12;
  compositionId?: string; // NEW — pass to scenes that opt-in to SD overrides
}

export const DorianDemoV1_12: React.FC<DorianDemoV1_12_Props> = ({
  sceneOverrides,
  compositionId,
} = {}) => {
  // ...
  <SceneV1_09 compositionId={compositionId} />;
};
```

### File 3 — leaf composition (e.g. `DorianFullV1.22.tsx`)

Pass the parent comp ID:

```tsx
<DorianDemoV1_12
  sceneOverrides={SCENE_OVERRIDES_V1_22}
  compositionId="DorianFullV1-22"
/>
```

V1.21 and below don't pass `compositionId` → scene falls through to hardcoded path → byte-stable behavior. V1.22+ passes it → SD edits land in render.

## Why Opt-In and Not Opt-Out

| Approach                                                                                               | Risk                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Opt-out (default-honor SD)**: scene reads SD by default, hardcoded fallback only when no save exists | V1.17–V1.21 already have saved JSON entries (e.g. 2-HomeScroll = 2wp at x=812). Switching to opt-out would mutate those renders silently, breaking byte-stability of frozen versions. |
| **Opt-in (explicit `compositionId`)** ✅                                                               | Old wrappers that don't know about the prop keep their hardcoded behavior unchanged. New wrappers explicitly opt in. Zero regression risk.                                            |

## Anti-Pattern (FORBIDDEN)

```tsx
// WRONG — scene refuses to honor SD entirely. Future versions inherit
// the silent disconnect; SD edits look correct in the editor but never
// render. This is what HomeScrollSceneV1_09 originally did.
/**
 * Hardcoded path; intentionally does NOT consult getSavedPath() so the
 * V1.09 pattern is locked regardless of any V1.00-era saved data.
 */
const path = [
  /* hardcoded coords */
];
```

The "lock from old saved data" intent is valid but mis-implemented. Use **opt-in via prop** instead.

## Companion Rules

- `.claude/rules/version-safe-iteration.md` — V1.0X system + when to clone vs modify a scene
- `.claude/rules/scene-director-save-semantics.md` — Save persists ALL scenes for current comp
- `.claude/rules/scene-director-state-isolation.md` — per-comp localStorage slices
- `.claude/rules/remotion-patterns.md` rule 7 (codedPaths key match) + rule 45 (3 data override layers) + rule 58 (diagnostic: grep scene file when SD↔render diverge)

## Props That Can Be Overridden

The pattern works for any FloatingHand prop that has a clear source-of-truth in SD. Today wired:

| Prop               | SD source                                        | Migration shape                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path` (waypoints) | `getSavedPath(compId, scene).path`               | Opt-in `compositionId` per the 3-file pattern above                                                                                                                                                           |
| `size`             | overlay computes `120 × (sceneZoom / 1.8)`       | Add `zoom` to composition entry's `scenes[]`; overlay reads it. NO scene-file edit needed                                                                                                                     |
| `animation`        | `state.sceneAnimation[scene] ?? saved.animation` | Scene reads `getCodedPath/getSavedPath(compId, scene).animation` first                                                                                                                                        |
| `dark`             | `state.sceneDark[scene] ?? saved.dark`           | Scene reads `getCodedPath/getSavedPath(compId, scene).dark` first                                                                                                                                             |
| `physics`          | `{...DEFAULT_PHYSICS, ...gesturePreset.physics}` | NOT yet in saved JSON. To migrate: extend `CodedPath` schema with `physics?: Partial<HandPhysicsConfig>`; SD writes it on Save; scenes read it via `getCodedPath(compId, scene).physics ?? hardcodedFallback` |
| `showRipple`       | `gesturePreset.showRipple`                       | Same as physics — extend `CodedPath` schema, or scenes adopt preset value                                                                                                                                     |

## Companion: Parity Test

`npm run test:parity` runs a Vitest harness that, for every probe in `productionPropProbes.ts`, compares SD-preview prop bag (via `floatingHandPropResolver.ts`) against production prop bag (manually mirrored). Field-level diff is the source of truth for "what's still divergent." Add a probe for every new `<FloatingHand>` instance in a versioned composition. Known-deferred divergences live in `ALLOWED_DIVERGENCE` map at the top of `floatingHandParity.test.ts` — remove entries as migrations close gaps.

**Probe coverage is load-bearing.** A scene with a `<FloatingHand>` that has NO probe is invisible to the parity test. Stage 3 of the original SD↔render plan (skipOverlayRender) was reverted because Stores scenes 10-12 had no probes AND no `<SDOverrideProvider>` — the harness reported "fully green" while a structural bug was waiting. **When adding a probe, also confirm the scene's FloatingHand call site is wrapped in a Provider; "no Provider" + "no probe" is a silent gap.**

## Hazard: Disabling the SD Overlay Cursor (skipOverlayRender)

The SD overlay's cursor is the **safety net** for any FloatingHand call site that is NOT wrapped in `<SDOverrideProvider>`. Disabling the overlay (e.g. via a `skipOverlayRender` composition flag) is only safe when **100% of FloatingHand instances reachable from the composition's tree are inside a Provider**.

| Provider coverage | Overlay enabled? | Safe?                        | Reason                                                                                                                                   |
| ----------------- | ---------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 100%              | yes              | yes                          | Both paths render; overlap is harmless                                                                                                   |
| 100%              | no               | yes                          | Production cursor is the only render — single source of truth                                                                            |
| **partial**       | yes              | yes                          | Overlay covers the un-wrapped scenes                                                                                                     |
| **partial**       | **no**           | **NO — silent invisibility** | Un-wrapped scenes return null in the FloatingHand gate (`isSceneDirector && !sdContext`) AND have no overlay fallback → no cursor at all |

**Audit before flipping a `skipOverlayRender`-style flag**:

```bash
# 1. List every FloatingHand call site reachable from the composition
grep -rln "<FloatingHand" src/compositions/<Family>/ src/compositions/<SubFamily>/

# 2. For each, confirm an SDOverrideProvider ancestor in its tree
#    (manually trace from leaf comp through wrappers)

# 3. Add a probe for each in productionPropProbes.ts so parity test
#    notices any subsequent regression
```

**Evidence**: 2026-05-10 — Stage 3 enabled `skipOverlayRender: true` on V1.22. Parity test was green (7/7 probes — all Dorian scenes 1-9). Stores scenes 10-12 in the same composition tree had no Provider and no probes; cursor went invisible there at runtime. Reverted via commit `7cb28a1`. Stages 0-2 already deliver full parity for probed scenes; the "single render path" optimization was dropped in favor of the overlay safety net. See `SDOverrideContext.tsx` docstring for the failure-mode notes.

**Known parity gap (post-revert)**: V1.22 Stores scenes (10-StoreDashboard, 11-MapSearch, 12-AIProducts) are NOT wrapped in `<SDOverrideProvider>`. SD overlay shows their cursor correctly from saved JSON, but production rendering uses the scene files' literal coords — saved edits to those scenes do NOT flow into MP4. Closing the gap requires wrapping each Sequence in `DorianFullV1.22.tsx` with a Provider AND adding parity probes; not done as of revert because no user-reported divergence yet.

## Evidence

2026-05-10 — User authored 2-HomeScroll scroll waypoints in SD on V1.22, hit Save (SD slice → JSON file mtime updated), re-rendered → cursor still at hardcoded x=880, not at the saved x=812. ~30min of diagnosis (coord transform theories, slice isolation theories, save semantics theories) before I grepped `getSavedPath` in the actual scene file and found the explicit opt-out comment. One-line opt-in in 3 files unblocked V1.22 + all future versions. V1.10–V1.21 untouched (don't pass `compositionId`).

2026-05-10 (later) — User reported cursor SIZE diverged in V1.22 render. Built parity harness; surfaced 4 divergence categories (size, physics, wrong-saved-data-source, showRipple). Category A (size) closed by adding `zoom` to V1.22 composition entry `scenes[]`. Category C closed for editable scenes (8-ProductPage, 9-ProductDetail). Frozen scenes (3, 4, 5, 7 at V1.00) still divergent — closing requires sub-version forks or a freeze-bypass strategy.

---

**Last Updated**: 2026-05-10
