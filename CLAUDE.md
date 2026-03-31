# Claude Remotion Editor

**Project**: Programmatic video creation with Remotion + interactive hand-path editor
**Framework**: React + Remotion 4.0.443 + Vite
**Purpose**: Demo videos, mobile app mockups, marketing content
**Ports**: 3000 (Remotion Studio), 3001 (Scene Director UI)
**MCP**: 3 servers in `.mcp.json` (Perplexity, ElevenLabs, Remotion MCP)
**Sandbox**: Use `/sandbox` for isolated dev tasks — reduces permission prompts by 84%.

---

## Quick Commands

```bash
npm run dev                    # Remotion Studio → http://localhost:3000
npm run scene-director         # SceneDirector UI → http://localhost:3001
npm run render:dorian          # DorianDemo 30fps (standard)
npm run render:dorian:preview  # DorianDemo fast preview (CRF 28)
npm run render:dorian:hq       # DorianDemo high quality (CRF 16)
npm run render:v4              # MobileChatDemoV4
npm run render:combined        # MobileChatDemoCombined
npm run render:v2              # Mobile 9:16 demo (MobileChatDemoV2)
npm run render:dashmor         # DashmorDemo (labor dashboard)
npm run render:capabilities    # CapabilitiesDemo + post-render feedback
npm run render:stores          # DorianStores (3 store scenes)
npm run render:full            # DorianFull (Demo + Stores combined, 75s)
npm run render:sigma-app       # SigmaAppDemo (landscape 1920x1080)
npm run render:sigma-investor  # SigmaInvestorDemo (pitch deck, 60s)
npm run postrender:2x          # 2x speed post-processing (setpts only)
npm run capture:mobile         # Dark mode mobile capture (needs port 8080)
npx remotion benchmark         # Find optimal --concurrency value
```

---

## Project Structure

```
src/
├── Root.tsx                              # Composition registry (22 compositions)
├── compositions/
│   ├── MobileChatDemoRefactored.tsx      # Main mobile demo (V2)
│   ├── MobileChatDemo/                   # 8 scenes + constants + springs
│   ├── DashmorDemo/                      # Labor Cost Dashboard (7 sections)
│   ├── DorianDemo/                       # Marketplace demo (10 scenes)
│   │   ├── DorianDemo.tsx                # Main composition + debug comps
│   │   ├── DorianPhoneMockup.tsx         # Phone frame with scrollable content
│   │   ├── constants.ts                  # Colors, timing, springs, hand physics
│   │   ├── timing.ts                     # FPS-relative helpers: f(), sec()
│   │   └── scenes/                       # 10 scene files
│   ├── DorianStores/                     # Store management UI (3 scenes)
│   │   ├── DorianStores.tsx              # Main comp + DorianStoresDebug
│   │   ├── constants.ts                  # SCENES timing, COLORS
│   │   └── scenes/                       # StoreDashboard, MapSearch, AIProducts
│   ├── DorianFull/                       # Combined: DorianDemo (1-9) + DorianStores
│   ├── DorianDemoEnhanced.tsx            # Dorian + captions + audio envelopes
│   ├── SigmaAppDemo/                     # SIGMA product walkthrough (5 scenes)
│   │   ├── SigmaAppDemo.tsx              # Chat-based UI demo
│   │   ├── constants.ts                  # CHAT_SCENES timing, COLORS
│   │   ├── components/ChatPanel.tsx      # Shared chat component
│   │   └── scenes/                       # HubChatOpen, WebsiteRequest, PageReveal, CreativeRequest, Screen
│   ├── SigmaInvestorDemo/                # Investor pitch deck (13 scenes)
│   │   ├── SigmaInvestorDemo.tsx         # Grid-background presentation
│   │   ├── constants.ts                  # SCENES timing, COLORS (purple theme)
│   │   └── scenes/                       # ProblemIntro → VendorStack → Sigma → Metrics → TheAsk → Outro
│   ├── CapabilitiesDemo/                 # AI video toolkit showcase (7 scenes)
│   ├── SharedComponentsDemo.tsx          # Shared component showcase (6 scenes)
│   ├── HandGestureGallery/               # Hand gesture showcase
│   └── SceneDirector/                    # Interactive hand-path editor
├── lib/
│   ├── fonts.ts                          # Centralized Rubik font loading
│   ├── springs.ts                        # 9 named spring presets + springConfig()
│   ├── easings.ts                        # 7 named easings + applyNamedEasing()
│   ├── audioEnvelope.ts                  # Volume envelope, ducking, MIXING_LEVELS
│   └── pointers.ts                       # Pointer cursor detection utilities
├── components/
│   ├── PhoneMockup.tsx                   # iPhone-style frame
│   ├── TouchAnimation.tsx                # Tap ripple effects
│   ├── FloatingHand/                     # Animated hand cursor system
│   ├── ClickEffect/                      # Click ripple/highlight effects
│   ├── BackgroundMusic.tsx               # Music layer with ducking support
│   ├── CaptionOverlay.tsx                # SRT-based subtitle overlay
│   ├── CrossfadeTransition.tsx           # TransitionSeries crossfade presets
│   ├── SequenceCrossfade.tsx             # Sequence-based crossfade wrapper
│   ├── ZoomTransition.tsx                # Zoom-based scene transitions
│   ├── debug/                            # Shared debug component library
│   └── DorianPhone/                      # Shared Dorian UI components
├── audio/AudioLayer.tsx                  # Sound effects sequencing
scripts/                                  # Playwright capture + post-render
public/
├── lottie/                               # Lottie animations (hand cursors, pointers)
├── audio/                                # typing-soft.wav, send-click.wav
│   └── sfx/                             # whoosh, whip, page-turn, switch, mouse-click, shutter-*
└── voiceover/                            # ElevenLabs TTS output (gitignored)
```

---

## Installed Remotion Packages (all @4.0.443)

| Package                              | Purpose                                           |
| ------------------------------------ | ------------------------------------------------- |
| `@remotion/player`, `cli`, `bundler` | Core playback + rendering                         |
| `@remotion/transitions`              | Fade, slide, wipe, flip, clockWipe                |
| `@remotion/lottie`                   | Lottie animations (hand cursors)                  |
| `@remotion/media-utils`              | Audio viz, duration detection, waveforms          |
| `@remotion/noise`                    | Perlin noise (deterministic animated backgrounds) |
| `@remotion/captions`                 | SRT parsing, TikTok-style word-by-word captions   |
| `@remotion/light-leaks`              | WebGL light leak transitions                      |
| `@remotion/shapes`                   | SVG shapes (Circle, Star, Heart, Triangle...)     |
| `@remotion/motion-blur`              | Trail + CameraMotionBlur effects                  |
| `@remotion/animated-emoji`           | 411 Google Fonts animated emojis                  |
| `@remotion/layout-utils`             | Layout measurement                                |

## MCP Servers (`.mcp.json`)

| Server           | Tools                                         | API Key Env Var      | Status   |
| ---------------- | --------------------------------------------- | -------------------- | -------- |
| **Perplexity**   | `perplexity_ask`, `perplexity_search`         | `PERPLEXITY_API_KEY` | Active   |
| **ElevenLabs**   | TTS (21 voices), voice cloning, transcription | `ELEVENLABS_API_KEY` | Disabled |
| **Remotion MCP** | Vector-indexed Remotion docs for AI           | None                 | Active   |

## Audio Assets

| Type       | Location            | Contents                                                                                                                                                                         |
| ---------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SFX        | `public/audio/sfx/` | 18 files: whoosh, whip, page-turn, switch, mouse-click, shutter-\*, bass-impact, chime, notification, pop-up, riser, slide, soft-click, sparkle, swoosh-transition, success-ding |
| Voiceover  | `public/voiceover/` | ElevenLabs TTS (10K chars/month free, gitignored)                                                                                                                                |
| App sounds | `public/audio/`     | typing-soft.wav, send-click.wav                                                                                                                                                  |

---

## Key Constants

- **Composition**: 1080x1920 (9:16 vertical), 30fps. Exception: SigmaAppDemo is 1920x1080 (16:9 landscape)
- **Phone viewport**: 390x844 (iPhone 14 Pro), baseScale 2.4
- **Phone bezel**: 414x868, background #1a1a1a, borderRadius 55/45
- **Dorian colors**: primary=#2DD4BF, primaryDark=#14B8A6, text=#1E293B
- **Global offset**: 120px down (`translateY(120px)`) in Combined composition
- **Font**: Rubik (400-800 weights, latin subset) via `src/lib/fonts.ts`

---

## On-Demand Documentation

Read these files ONLY when working on the relevant area:

| Topic                               | File                                       |
| ----------------------------------- | ------------------------------------------ |
| Composition tables, debug tools     | `docs/compositions.md`                     |
| FloatingHand, Lottie, hand gestures | `docs/floating-hand.md`                    |
| Screenshot capture, Playwright      | `docs/capture-workflow.md`                 |
| SceneDirector editor architecture   | `docs/scene-director.md`                   |
| Gallery & picker architecture       | `docs/scene-director.md` (Gallery section) |
| Shared debug component library      | `docs/debug-tools.md`                      |
| Video learnings (feedback loop)     | `docs/video-learnings.md`                  |
| Shared components (transitions etc) | `docs/shared-components.md`                |
| Enforced coding rules (45 rules)    | `.claude/rules/remotion-patterns.md`       |
| Dorian phone UI requirements        | `.claude/rules/dorian-standards.md`        |

## Skills (auto-loaded when relevant)

| Skill                      | Trigger                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `video-production-methods` | Planning any new video — 6 methods: phone demo, motion graphics, narrated, reference, batch, feedback loop |
| `ai-video-toolkit`         | Adding voiceover, captions, light leaks, SFX, noise, shapes, motion blur, emoji, audio viz                 |
| `voiceover-pipeline`       | End-to-end narrated video (script → TTS → captions → render)                                               |
| `video-storyboard`         | Planning compositions (art direction, scene breakdown, assets)                                             |
| `video-feedback-loop`      | Post-render review → capture learnings → improve next video                                                |
| `remotion-best-practices`  | Remotion framework patterns (37 official rules from remotion-dev)                                          |

## SceneDirector Composition Registry (12 compositions)

MobileChatDemoCombined, DorianDemo, DashmorDemo, AudioTest, CapabilitiesDemo,
SharedComponentsDemo, DorianDemoEnhanced, DorianStores, DorianStoresDebug,
DorianFull, SigmaAppDemo, SigmaInvestorDemo.
