# Version-Safe Iteration — V1.0X Sub-Versioning for Rendered Compositions

**Scope**: ALL visual changes to Remotion compositions or scene files that have been rendered + approved
**Authority**: MANDATORY — enforced by `.claude/hooks/protect-frozen-compositions.sh`
**Created**: 2026-04-26

---

## Core Rule

**Every shipped composition is frozen. Visual iteration creates the next sub-version (`V1.01`, `V1.02`, ...) — never edits the frozen file.**

The original is V1.00. The first iteration is V1.01. Versioning is per-composition (DorianFull V1.01, DorianStores V1.02 are independent counters).

When a render is approved, the new version's files get added to `src/compositions/.frozen.json` via `/freeze`.

---

## Naming

| Concept                      | Format                                                   | Example                    |
| ---------------------------- | -------------------------------------------------------- | -------------------------- |
| Composition file             | `<Name>V<X>.<YY>.tsx`                                    | `DorianFullV1.01.tsx`      |
| React export                 | `<Name>V<X>_<YY>` (underscore — `.` invalid in JS ident) | `DorianFullV1_01`          |
| Composition `id` in Root.tsx | `<Name>V<X>.<YY>`                                        | `DorianFullV1.01`          |
| Output MP4                   | `<name>-v<X>.<YY>.mp4`                                   | `dorian-full-v1.01.mp4`    |
| npm script                   | `render:<name>:v<X>.<YY>`                                | `render:dorian-full:v1.01` |

`X` (major) bumps only when a fundamentally different concept is being explored. Day-to-day iteration always bumps `YY`.

---

## When to Apply

- Visual change to a frozen composition file (scene tsx, composition assembler tsx)
- User has shown / will show the rendered output to anyone

## When NOT to Apply

- Editing tooling: SceneDirector, hooks, scripts, lib utilities
- Editing rules, skills, docs
- Adding NEW composition files (no frozen version exists yet)
- Bug fix that the user explicitly says "patch in place" (rare; document the override)

---

## Bump Procedure

There are TWO bump paths. Use the auto path for incremental sub-versions (V1.0X → V1.0Y); the manual path is only required for the first ever V1.00 → V1.01 of a brand-new family.

### Path A — Auto bump (V1.0X → V1.0Y, X ≥ 1)

In SceneDirector, click **Save as Version** on the Toolbar. The `/api/versions/bump` endpoint (in `vite.config.ts`) does ALL of this in one shot:

1. Clones `<Family>V1.0X.tsx` → `<Family>V1.0Y.tsx` (component identifier renamed).
2. Auto-seeds `codedPaths.data.json` — copies the OLD compId's saved-scene block under the NEW compId so your in-progress waypoints carry over.
3. Auto-wires all 5 registry files:
   - `src/Root.tsx` — adds the import + `<Composition id="<Family>V1-0Y" .../>` block
   - `src/compositions/SceneDirector/compositions.ts` — adds the import + COMPOSITIONS entry + component-map row
   - `src/compositions/SceneDirector/codedPaths.ts` — adds the CODED_PATHS_REGISTRY entry
   - `src/compositions/SceneDirector/layers.ts` — clones the CODED_AUDIO_REGISTRY block
   - `package.json` — clones any render scripts containing the old compId+label
4. Returns a popover showing ✓/✗ per file. Each helper is **idempotent** (skips if NEW already present) and **fail-soft** (one failure doesn't break the others). Anything ✗ surfaces as a manual step.
5. Edit the new `.tsx` freely (it's not in `.frozen.json` yet).
6. Render. On approval, run `/freeze <Name>V1.0Y` to seal.
7. Next iteration: hook blocks V1.0Y → click Save as Version again.

The auto-wire helpers live near the top of `vite.config.ts` (`wireRootTsx`, `wireCompositionsTs`, `wireCodedPathsTs`, `wireLayersTs`, `wirePackageJson`, `cloneRegistryBlock`, `findBalancedBlockEnd`). Each anchors on the OLD entry's exact text shape — preserve that shape if you ever add registry entries by hand.

### Path B — Manual first bump (V1.00 → V1.01 of a new family)

The auto endpoint deliberately rejects V1.00 → V1.01 because the rename can't safely word-boundary-match `${family}` as an identifier in peer files. Do this once per family:

1. **Identify scope**: which composition's render does this touch? (e.g. DorianFull)
2. **Selective clone**: copy `<Name>.tsx` → `<Name>V1.01.tsx`, rename component, update internal imports.
3. **Register in Root.tsx**: add `<Composition id="<Name>V1-01" component={<Name>V1_01} ... />` next to the V1.00 entry. Don't unregister V1.00.
4. **Add render scripts** to `package.json` (`render:<name>:v1.01` etc.).
5. **Append registries**: `compositions.ts` COMPOSITIONS + component-map, `codedPaths.ts` CODED_PATHS_REGISTRY, `layers.ts` CODED_AUDIO_REGISTRY.
6. **Make the edit** in the new V1.01 files. Hook allows it.
7. **Render + show user**.
8. **On user approval**: run `/freeze <Name>V1.01`. V1.01 is now sealed.
9. **Next iteration**: use Path A.

---

## Frozen Registry

Source of truth: `src/compositions/.frozen.json`

```json
{
  "version": 1,
  "frozen": [
    {
      "file": "src/compositions/DorianFull/DorianFull.tsx",
      "version": "DorianFull V1.00",
      "frozenAt": "2026-04-26"
    }
  ]
}
```

The hook `protect-frozen-compositions.sh` reads this file on every Write/Edit and blocks if the target path matches a `file` entry.

---

## Anti-Patterns

| Wrong                                                       | Right                                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| Edit `ProductDetailScene.tsx` directly to "tweak" the click | Bump V1.01, edit `ProductDetailSceneV1.01.tsx`                              |
| Use `git stash` / branches to "save" the prior version      | Files on disk + Root.tsx registration is the version system                 |
| Reuse same composition `id` for V1.00 and V1.01             | Distinct IDs — both render simultaneously                                   |
| Skip the bump because "it's just a tiny fix"                | If the file is in `.frozen.json`, the hook will block; follow the procedure |
| Bypass with `--no-verify` or by editing `.frozen.json`      | Only `/freeze` modifies `.frozen.json`; never hand-edit to delete entries   |

---

## Companion Hook

`.claude/hooks/protect-frozen-compositions.sh` is registered in `.claude/settings.json` as a PreToolUse hook on `Write|Edit`. It blocks Edit/Write to any file listed in `.frozen.json` with a clear error message instructing to bump.

---

**Last Updated**: 2026-04-26
