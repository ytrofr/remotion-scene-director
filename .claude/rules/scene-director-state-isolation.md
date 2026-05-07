# SceneDirector State Isolation — Composition-Scoped Slicing

**Scope**: SceneDirector state shape + localStorage persistence
**Authority**: MANDATORY — violating reintroduces cross-composition bleed
**Evidence**: 2026-05-04 — user lost work repeatedly because `state.waypoints["4-ChatOpen"]` was shared across V1.10 / V1.13 / V1.14 / DorianFull / DorianDemo. Switching compositions left prior data in the same map slots → next Save wrote contaminated data to disk → refresh appeared to "delete" work.

---

## Core Rule

**The 9 scene-keyed maps in `DirectorState` are SHARED ACROSS compositions when keyed by sceneName alone. localStorage MUST persist them under per-composition slice keys, and `SET_COMPOSITION` MUST atomically swap slices via the dispatch wrapper. Never touch these fields' shape without preserving slicing.**

The 9 fields:
`waypoints`, `layers`, `sceneGesture`, `sceneAnimation`, `sceneDark`,
`sceneLocked`, `clearedSceneLayers`, `savedSnapshots`, `versionHistory`

## Architecture (load-bearing — do NOT regress)

| Concern             | Mechanism                                                                                                        | File                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| localStorage layout | `scene-director-meta` (top-level) + `scene-director-slice-{compId}` (per-comp)                                   | `hooks/useSessionPersistence.ts`                   |
| Reducer atomicity   | `SET_COMPOSITION` reads optional `action.slice` and replaces all 9 fields atomically; absent → empty defaults    | `state.ts`                                         |
| Slice swap          | App.tsx `dispatch` wrapper: synchronously persists outgoing slice + loads incoming slice + attaches to action    | `App.tsx`                                          |
| Migration           | Legacy `scene-director-session` blob auto-migrates on first load; backup written to `scene-director-backup-{ts}` | `useSessionPersistence.ts::migrateLegacySession()` |
| Tests               | 19 tests covering round-trip, isolation, migration, full bleed-prevention lifecycle                              | `__tests__/sceneDirectorSlice.test.ts`             |

## When to Apply

- Adding a new scene-keyed field to `DirectorState` → add to `DirectorSlice` + `extractSlice()` + `SET_COMPOSITION` reducer
- Adding a new SET_COMPOSITION dispatcher → use the wrapped `dispatch`, never bypass it
- Editing localStorage key names → update `META_KEY` / `SLICE_PREFIX` consistently + add migration shim

## Anti-Pattern

```ts
// WRONG — flat state shared across compositions
state.waypoints["4-ChatOpen"] = [...]; // bleeds V1.10 → V1.14

// WRONG — reducer reads localStorage directly (impure)
case "SET_COMPOSITION":
  return { ...state, waypoints: JSON.parse(localStorage.getItem(...)) };

// WRONG — bypassing the dispatch wrapper
rawDispatch({ type: "SET_COMPOSITION", id: "X" }); // skips slice swap
```

## Correct Pattern

```ts
// Wrapper handles I/O before dispatch
const dispatch = useCallback((action) => {
  if (action.type === 'SET_COMPOSITION' && action.id !== state.compositionId) {
    saveSlice(state.compositionId, extractSlice(state));
    rawDispatch({ ...action, slice: loadSlice(action.id) });
  } else rawDispatch(action);
}, []);
```

## Verification

`npm test` → 19 slice tests + 15 save-all tests must pass. The "full bleed-prevention scenario" test exercises the V1.10→V1.14→V1.10 round-trip — if it ever fails, the slicing invariant is broken.

---

**Last Updated**: 2026-05-04
