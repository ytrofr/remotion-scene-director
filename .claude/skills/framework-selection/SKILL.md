---
name: framework-selection
description: Choose between Remotion, HyperFrames, or hybrid for new video work in this project. Use when asked "should I use Remotion or HyperFrames for X", "which framework for ___", before starting any new composition, or when evaluating migration of existing scenes. Covers the dual-stack decision matrix derived from the 2026-04-22 evaluation session.
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
---

# Framework Selection — Remotion vs HyperFrames

This project runs a **dual-stack** video pipeline. Pick the right tool per scene, not per project.

## Quick Decision Tree

```
Is the scene a phone-mockup + hand gesture + scroll/click demo?
  └── YES → Remotion (FloatingHand + HAND_PHYSICS + SceneDirector)
  └── NO ↓
Is the scene capturing content from a live website?
  └── YES → HyperFrames (bypasses Cloudflare; your Playwright gets 403'd)
  └── NO ↓
Is the scene pure motion graphics (text, logo, chart, transition)?
  └── YES → HyperFrames (92–96% fidelity, half the LoC, faster cold-start)
  └── NO ↓
Is the scene a composed mix of multiple styles in one composition?
  └── YES → Same framework as the enclosing composition (consistency beats theory)
```

## Trigger Scenarios (when to invoke this skill)

1. **Starting a new composition or scene** — before writing any TSX or HTML
2. **Evaluating a migration** — "should scene X move from Remotion to HyperFrames?"
3. **Asked about framework trade-offs** — licensing, ergonomics, render quality
4. **Planning a video feature that doesn't fit current compositions** — charts, captions, AI-generated content

## Decision Matrix (by scene type)

| Scene type                                                                | Framework                                               | Why                                                                                                                                                            | Evidence                                                    |
| ------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Phone mockup + hand gesture (DorianDemo, DorianStores, SigmaAppDemo chat) | **Remotion**                                            | `FloatingHand` + `HAND_PHYSICS` (spring smoothing, velocity-based autoRotate, multi-ring ripples) are bespoke Remotion investments. HF maxes at ~80% fidelity. | Gate 2 MapSearch port: 80% fidelity, 6/10 ergonomics        |
| Multi-gesture sequence with SceneDirector-authored waypoints              | **Remotion**                                            | SceneDirector emits Remotion-shaped codedPaths. HF has no gesture editor.                                                                                      | —                                                           |
| Investor pitch deck / kinetic type / title card / outro                   | **HyperFrames**                                         | 92–96% fidelity, ~50% less LoC per scene, 5–15 min cold-start                                                                                                  | Outro/Team/TheAsk/Metrics pilots                            |
| Data dashboards / animated charts / stat grids                            | **HyperFrames**                                         | Registry has `data-chart` block. Grid layout cleaner than React.                                                                                               | DashmorDemo is a candidate                                  |
| Captioned narrated explainer (TTS voiceover + word-by-word captions)      | **HyperFrames**                                         | Native `hyperframes tts` (local Kokoro-82M) + `hyperframes transcribe` (Whisper). No API cost.                                                                 | —                                                           |
| Website-to-video (e-commerce, landing-page demo)                          | **HyperFrames** (`capture` + `/website-to-hyperframes`) | Headless Chromium bypasses Cloudflare                                                                                                                          | Gate 3: 110 assets pulled in 60s from CF-protected Woodmart |
| Shader transitions, WebGL effects                                         | **Either**                                              | HF has `light-leaks`, `shader-transitions` packages; Remotion has `@remotion/transitions`                                                                      | Parity                                                      |

## When to Migrate Existing Scenes

**Migrate to HyperFrames if ALL**:

- No hand gestures, no phone mockup, no SceneDirector-authored paths
- Motion is pure CSS/GSAP (fade, slide, scale, stagger, count-up)
- You'd rewrite the scene anyway (deprecation, visual refresh)

**Keep on Remotion if ANY**:

- Uses `FloatingHand`, `HAND_PHYSICS`, or `codedPaths`
- Scene is part of a composition with other hand-gesture scenes (consistency)
- You've invested >10 hours tuning and wouldn't rebuild from scratch

**Don't migrate just to migrate.** Port + debug costs 5–15 min per scene; add audio + physics approximation costs more. Only migrate if you were going to touch the scene anyway.

## Failed Attempts (session learnings)

| Attempt                                                  | Outcome                                                                                             | Fix                                                                                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Build MapSearch in HyperFrames with full hand physics    | Got to 80% fidelity; autoRotate + multi-ring ripple impossible without weeks of GSAP work           | Verdict: don't migrate hand-gesture scenes. Kept Remotion.                                                               |
| Naively inline Lottie JSON via `path: 'hand-click.json'` | Async XHR raced HyperFrames' synchronous timeline registration → Lottie stayed at frame 0 in render | Inline the JSON as `<script type="application/json">`; load with `animationData:`                                        |
| Put `class="clip"` on every animated child               | All elements stacked at (0,0); flex-column layout dead                                              | `class="clip"` ONLY on root composition div; content in `.scene-content` flex wrapper with NO `class="clip"` or `data-*` |

## Reference Projects (on-disk)

| Path                                      | Purpose                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `~/hyperframes-test/dorian-hyperframes/`  | Gate 0 Lottie-seek probe (canonical pattern for Lottie + hand gestures in HF) |
| `~/hyperframes-test/gate1-scene1/`        | Gate 1 motion-graphics cold-start (simple intro)                              |
| `~/hyperframes-test/gate2-scene5/`        | Gate 2 MapSearch port (the 80% hand-gesture ceiling)                          |
| `~/hyperframes-test/gate3-capture/`       | Gate 3 website capture (Woodmart promo)                                       |
| `~/hyperframes-test/sigma-outro-pilot/`   | SigmaInvestor Outro pilot — reference for `.clip` layout rule                 |
| `~/hyperframes-test/sigma-team-pilot/`    | Team scene — card-based layout with gradient avatars                          |
| `~/hyperframes-test/sigma-ask-pilot/`     | TheAsk scene — digit-by-digit count-up reference                              |
| `~/hyperframes-test/sigma-metrics-pilot/` | Metrics scene — 2x2 grid stagger-in reference                                 |

## Framework-specific capabilities (no cross-over)

**HyperFrames-only** (do not expect from Remotion):

- `hyperframes validate` — WCAG contrast checker (3:1 / 4.5:1). Catches issues Remotion ships silently.
- `hyperframes capture <url>` — Puppeteer-based website capture bypassing Cloudflare
- `hyperframes tts` — Local Kokoro-82M TTS (no API cost)
- `hyperframes transcribe` — Local Whisper, word-level timestamps
- `hyperframes benchmark` — Auto-tune fps/quality/workers
- `hyperframes doctor` — System deps check
- Registry of 50+ installable blocks (shader transitions, data charts, social overlays)
- Apache 2.0 licensing (Remotion is source-available, per-company thresholds apply)

**Remotion-only** (do not expect from HyperFrames):

- `@remotion/lottie` (HF handles Lottie via inlined-JSON pattern, but no first-class adapter)
- SceneDirector bespoke gesture editor
- React component ecosystem (spread across TSX files, shared hooks, typed props)
- Hot-reload preview in Remotion Studio (HF has `hyperframes preview` but less polished)
- @remotion/noise, @remotion/animated-emoji, @remotion/layout-utils packages
- @remotion/mcp for live agent tooling

## When in doubt — 3 checks

1. **Does the scene touch any file in `src/components/FloatingHand/`, `src/compositions/SceneDirector/`, or reference `codedPaths.ts`?** → Remotion.
2. **Is there live website content involved?** → HyperFrames capture pipeline (even if you end up rendering in Remotion).
3. **Is this a net-new motion-graphics scene you'd build from scratch?** → HyperFrames.

## See Also

- `.claude/rules/hyperframes-patterns.md` — HOW to author HF scenes (the `.clip` rule, GSAP mappings, Lottie seek)
- `.claude/rules/remotion-patterns.md` — 51 rules for Remotion scenes
- Basic Memory: `limor-video-poc/session-summaries/hyperframes-vs-remotion-evaluation-session-2026-04-22`
- Windows Desktop: `C:\Users\ytr_o\Desktop\hyperframes-vs-remotion-2026-04-22\README.md`

---

**Last Updated**: 2026-04-22
