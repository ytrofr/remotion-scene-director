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

## Evidence

2026-05-10 — User authored 2-HomeScroll scroll waypoints in SD on V1.22, hit Save (SD slice → JSON file mtime updated), re-rendered → cursor still at hardcoded x=880, not at the saved x=812. ~30min of diagnosis (coord transform theories, slice isolation theories, save semantics theories) before I grepped `getSavedPath` in the actual scene file and found the explicit opt-out comment. One-line opt-in in 3 files unblocked V1.22 + all future versions. V1.10–V1.21 untouched (don't pass `compositionId`).

---

**Last Updated**: 2026-05-10
