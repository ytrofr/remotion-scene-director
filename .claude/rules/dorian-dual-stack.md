# Dorian Dual-Stack — Framework Split + 2x Speed Convention

**Scope**: `DorianFull` composition (13 scenes, 2430 frames = 81s at 1x, ~40s at 2x)
**Authority**: MANDATORY — defines HF vs Remotion split for all Dorian scenes
**Evidence**: Session 2026-04-23 — post-pilot full-video buildout

---

## Core Split (DorianFull)

| Scene | Name          | Framework | Reason                                       |
| ----- | ------------- | --------- | -------------------------------------------- |
| 1     | Intro         | **HF**    | Motion graphics (logo spring + subtitle)     |
| 2-9   | Dorian demo   | Remotion  | Gesture-heavy (SceneDirector + FloatingHand) |
| 10-12 | Dorian Stores | Remotion  | Dashboard/map/product gestures               |
| 13    | Closing       | **HF**    | Motion graphics (logo + tagline + CTA)       |

**Default mode**: Both (Hybrid). Pure HF and Pure Remotion exist as comparison targets, not default.

## 2x Speed Convention

**Author at 1x normal timing. Post-process final MP4 to 2x:**

```bash
ffmpeg -i in.mp4 -filter_complex \
  "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" \
  -map '[v]' -map '[a]' out-2x.mp4
```

- DO NOT change composition fps as a speed hack — breaks spring timing (Remotion rule 18).
- DO NOT use `minterpolate=blend` — ghost frames at scene boundaries.
- DO NOT author at half-duration — timing math diverges between HF and Remotion.
- `atempo=2.0` preserves pitch on audio.

## Directory Layout

HF uses sibling-relative paths (not `../`) because its file server does NOT follow path escapes above the index.html's directory. The `.render-work/` scratch dir mirrors a stock HF project layout via symlinks.

| Path                                       | Contents                                               |
| ------------------------------------------ | ------------------------------------------------------ |
| `src/compositions/DorianFull/`             | Remotion composition (existing)                        |
| `hf/scenes/<NN>-<name>.html`               | HF scene HTML, one per scene                           |
| `hf/lib/dorian-phone.js`                   | Shared phone mockup builder                            |
| `hf/.render-work/`                         | Render scratch dir (scene swapped in as `index.html`)  |
| `hf/.render-work/components/` (symlink)    | → `../lib/` (so `components/dorian-phone.js` resolves) |
| `hf/.render-work/audio/` (symlink)         | → `../../public/audio/` (legacy + `sfx/` subfolder)    |
| `hf/.render-work/lottie/` (symlink)        | → `../../public/lottie/`                               |
| `hf/.render-work/public/dorian/` (symlink) | → `../../public/dorian/`                               |
| `public/hf-clips/`                         | Rendered HF MP4s (gitignored)                          |
| `public/hf-clips/dorian-full-pure-hf.mp4`  | Pure HF 1x render (concat of 13 scene MP4s)            |
| `out/dorian-full.mp4`                      | Remotion-only 1x                                       |
| `out/dorian-hybrid.mp4`                    | Hybrid 1x (HF 1+13 + Remotion slice concat)            |
| `out/dorian-full-*-2x.mp4`                 | All three 2x post-processed outputs                    |

### HF scene path conventions (MANDATORY in `hf/scenes/*.html`)

| Asset                | Use path                                        | Resolves via                         |
| -------------------- | ----------------------------------------------- | ------------------------------------ |
| Phone lib            | `components/dorian-phone.js`                    | `.render-work/components` symlink    |
| Cursor Lottie        | `lottie/cursor-real-black.json`                 | `.render-work/lottie` symlink        |
| Audio (legacy files) | `audio/send-click.wav`, `audio/typing-soft.wav` | directly in `public/audio/`          |
| Audio (SFX lib)      | `audio/sfx/whoosh.wav`, `audio/sfx/pop-up.wav`  | `public/audio/sfx/`                  |
| Dorian images        | `public/dorian/woodmart/X.png`                  | `.render-work/public/dorian` symlink |

**Never use `../` in HF scene asset paths** — HF's file server serves only from the `index.html` directory and below.

## Four Modular Concerns

Independent files per concern — edits in one don't touch others:

| Concern  | Remotion                                       | HF                               |
| -------- | ---------------------------------------------- | -------------------------------- |
| Scenes   | `src/compositions/DorianFull/*.tsx`            | `hf/scenes/<NN>-<name>.html`     |
| Gestures | `SceneDirector/codedPaths.ts` + JSON           | Inline `tl.to('#cursor', ...)`   |
| Sounds   | `SceneDirector/layers.ts` CODED_AUDIO_REGISTRY | `<audio data-start data-volume>` |
| Effects  | CSS / Remotion primitives                      | CSS / GSAP                       |

## HF Authoring Rules

See `.claude/rules/hyperframes-patterns.md`. Critical reminders:

1. **ONE `class="clip"`** on root stage only. Content in `.scene-content` flex wrapper.
2. **Synchronous timeline registration**: `window.__timelines['main'] = tl` at module scope, never in `DOMContentLoaded` / `async`.
3. **Inline Lottie JSON** via `<script type="application/json">`. Never async `path:`.
4. **Cursor tip offset**: `setC(x,y) => ({x: x-45, y: y-55})` — coords are composition-space (1080×1920).
5. Run `npx hyperframes validate` after color/typography changes.

## SceneDirector Usage

- Remotion scenes (2-12): SceneDirector waypoints + audio layers as today.
- HF scenes (1, 13): motion graphics only, no gestures, authored in code.
- **HF gesture scenes (4-9, 11, 12)**: SceneDirector auto-sync on Save regenerates the cursor-path block in `hf/scenes/<N>-<name>.html` between `// @auto-generated-from-scene-director:start/:end` markers. See `.claude/rules/hf-auto-sync.md` for wiring protocol + API contract.

## Coord-system equivalence (load-bearing invariant)

**HF scenes 4-9 phone-stage transform MUST remain `scale: 1.528, y: -374` on top of `buildDorianPhone({ zoom: 1.8 })`.** This makes effective scale `1.8 × 1.528 = 2.75 ≈ Remotion's chat-zoom 2.76`, so a waypoint coord authored in SceneDirector (Remotion composition-space at chat-zoom) renders at the SAME visual target in HF.

Changing the phone-stage transform in any HF scene BREAKS auto-sync — the generated cursor coords will land at the wrong visual target even though the block regenerates correctly. Either use a coord-adapter helper in `hf/lib/dorian-phone.js`, or exclude that scene from auto-sync (remove markers, author manually).

The cursor element is a SIBLING of `#phone-stage`, so cursor coords are always composition-space regardless of phone-stage transform. But the VISUAL TARGET moves with the transform — that's where the coupling comes from.

Evidence: 2026-04-24 — scene 4 authored at (480, 1550) with transform 1.528/-374 landed BELOW the phone (composition-y > phone-bottom ≈ 1249). Same scene with (494, 1652) from Remotion waypoints lands ON the chat input. Same transform, different coords — coord-authoring was the bug, transform equivalence made the fix portable.

## Render Commands

| Command                           | Output                             |
| --------------------------------- | ---------------------------------- |
| `npm run render:dorian-full`      | Remotion-only DorianFull, 1x       |
| `npm run render:dorian-full:2x`   | Remotion-only, post-processed 2x   |
| `npm run render:hf-full`          | Pure HF concat (13 scenes), 1x     |
| `npm run render:hf-full:2x`       | Pure HF, post-processed 2x         |
| `npm run render:dorian-hybrid:2x` | Both (HF 1+13 + Remotion 2-12), 2x |

## Scene-Name ↔ Frame-Range Table

| Scene             | Start | End  | Duration (f) | Duration (s @1x) |
| ----------------- | ----- | ---- | ------------ | ---------------- |
| 1-Intro           | 0     | 75   | 75           | 2.5              |
| 2-HomeScroll      | 75    | 225  | 150          | 5.0              |
| 3-TapBubble       | 225   | 300  | 75           | 2.5              |
| 4-ChatOpen        | 300   | 390  | 90           | 3.0              |
| 5-UserTyping      | 390   | 540  | 150          | 5.0              |
| 6-AIThinking      | 540   | 630  | 90           | 3.0              |
| 7-AIResponse      | 630   | 780  | 150          | 5.0              |
| 8-ProductPage     | 780   | 870  | 90           | 3.0              |
| 9-ProductDetail   | 870   | 960  | 90           | 3.0              |
| 10-StoreDashboard | 960   | 1620 | 660          | 22.0             |
| 11-MapSearch      | 1620  | 1860 | 240          | 8.0              |
| 12-AIProducts     | 1860  | 2250 | 390          | 13.0             |
| 13-Closing        | 2250  | 2430 | 180          | 6.0              |

Source of truth: `FULL_SCENE_INFO` in `src/compositions/DorianFull/DorianFull.tsx`.

---

**Last Updated**: 2026-04-23
