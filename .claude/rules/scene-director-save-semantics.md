# SceneDirector Save Semantics — Save All Scenes for Current Composition

**Scope**: SceneDirector Save button + any new "persist to disk" flow
**Authority**: MANDATORY — overrides the "save selected scene" pattern
**Evidence**: 2026-05-04 — user repeatedly lost waypoint work because Save only POSTed `state.selectedScene`. Edits in non-selected scenes stayed in localStorage and got wiped on HMR / refresh / composition switch.

---

## Core Rule

**Click Save → persist EVERY scene with state for the current composition, in deterministic order, sequentially via `/api/save-path`. Selected-scene-only saves are forbidden. The action of clicking Save MUST be the user's single source of truth that "all my edits are now on disk".**

## Required Behaviour

1. Iterate via `collectScenesToSave(state)` → all scene names with data in any of the 9 scene-keyed maps + scenes with hand layers.
2. Build proposals via `buildProposalForScene(state, scene)` (pure, in `saveAll.ts`).
3. Filter via `filterPersistableProposals` → drop empty paths that aren't locked (would trigger server's delete-on-empty path).
4. POST sequentially to `/api/save-path` — disk thrash on parallel writes corrupts the JSON file.
5. On any failure: stop, show error, but ALWAYS flush `saveSession()` to localStorage so partial work survives.
6. Diff prompt fires for the SELECTED scene only (destructive-save guard preserved). Locked-scenes get one consolidated confirm prompt listing all of them.

## Forbidden

- Save persisting only `state.selectedScene`
- Auto-save (user said: never, ever)
- Parallel `/api/save-path` calls (Vite middleware reads/mutates/writes JSON file — race-prone)
- Skipping `saveSession()` on error (would lose in-progress edits to localStorage on top of the disk failure)

## When to Apply

- Touching `Toolbar.tsx::handleSave`
- Adding any new "persist all" flow (e.g. Save & Render, Export-with-save)
- Adding a new scene-keyed field that should be persistable → ensure `collectScenesToSave` picks it up and `buildProposalForScene` includes it

## Verification

`npm test` → 15 saveAll tests must pass, including the regression test "the scenario that broke for the user" which asserts 3 scenes (`2-HomeScroll`, `3-TapBubble`, `4-ChatOpen`) all get included even when only one is selected.

## Companion

`.claude/rules/scene-director-state-isolation.md` — slicing invariant that prevents cross-composition contamination during save.

---

**Last Updated**: 2026-05-04
