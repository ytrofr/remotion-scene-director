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

When the hook blocks an Edit, follow these steps EXACTLY (no shortcuts):

1. **Identify scope**: which composition's render does this touch? (e.g. DorianFull)
2. **Find current version**: highest `<Name>V*.tsx` in the comp's directory (or V1.00 if none)
3. **Compute next**: `V1.01` if current is `V1.00`, etc.
4. **Selective clone**: copy only the files you'll modify. Unchanged scenes can stay shared with V1.00 (they're frozen — safe).
   - Cloning `DorianFull.tsx` → `DorianFullV1.01.tsx`: rename component, update internal imports to point to V1.01 versions of any cloned scenes
   - Cloning a scene: rename component, identical contents otherwise
5. **Register in Root.tsx**: add `<Composition id="<Name>V1.01" component={<Name>V1_01} ... />` next to the V1.00 entry. Don't unregister V1.00.
6. **Add render scripts** to `package.json`:
   - `render:<name>:v1.01`
   - `render:<name>:v1.01:2x` (if a 2x variant exists for V1.00)
7. **Audio + waypoint registries**: append a new top-level key (`DorianFullV1.01`) to:
   - `src/compositions/SceneDirector/codedPaths.data.json`
   - `src/compositions/SceneDirector/layers.ts` `CODED_AUDIO_REGISTRY`
   - Initial value: deep-copy from V1.00's key, then mutate
8. **Make the edit** in the new V1.01 files. Hook allows it.
9. **Render + show user**.
10. **On user approval**: run `/freeze <Name>V1.01` (or manually add the cloned files to `.frozen.json`). V1.01 is now sealed.
11. **Next iteration**: hook blocks V1.01 — bump to V1.02.

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
