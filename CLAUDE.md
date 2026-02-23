# Claude Remotion Editor

**Project**: Programmatic video creation with Remotion + interactive hand-path editor
**Framework**: React + Remotion 4.0.419 + Vite
**Purpose**: Demo videos, mobile app mockups, marketing content
**Ports**: 3000 (Remotion Studio), 3001 (Scene Director UI)

---

## Quick Commands

```bash
# Start Remotion Studio (live preview) - ALWAYS USE PORT 3000
npm run dev   # http://localhost:3000

# Render videos
npm run render:dorian          # DorianDemo 30fps (standard)
npm run render:dorian:preview  # DorianDemo fast preview (CRF 28)
npm run render:dorian:hq       # DorianDemo high quality (CRF 16)
npm run render:v4              # MobileChatDemoV4
npm run render:combined        # MobileChatDemoCombined
npm run render:v2              # Mobile 9:16 demo (MobileChatDemoV2)
npm run render:mobile          # Legacy mobile demo
npm run render                 # Desktop demo

# 2x speed post-processing
npm run postrender:2x          # ffmpeg blend interpolation + 2x speed

# Capture screenshots (requires target app running on port 8080)
npm run capture:mobile   # Dark mode mobile capture
```

---

## Project Structure

```
src/
├── Root.tsx                              # Composition registry
├── compositions/
│   ├── MobileChatDemoRefactored.tsx      # Main mobile demo (V2)
│   ├── MobileChatDemo/
│   │   ├── constants.ts                  # Colors, timings, coordinates
│   │   ├── springConfigs.ts              # Animation spring presets
│   │   └── scenes/                       # Scene components (8 scenes)
│   ├── DashmorDemo/                      # Labor Cost Dashboard demo
│   │   ├── DashmorDemo.tsx               # Main composition with Sequences
│   │   ├── constants.ts                  # Sections, timing, colors
│   │   └── scenes/                       # IntroScene, SectionScene (7x), OutroScene, shared
│   ├── DorianDemo/                       # Marketplace demo (10 scenes)
│   │   ├── DorianDemo.tsx                # Main composition + debug compositions
│   │   ├── DorianPhoneMockup.tsx         # Phone frame with scrollable content
│   │   ├── constants.ts                  # Colors, timing, spring configs, hand physics
│   │   ├── timing.ts                     # FPS-relative frame helpers (f, sec)
│   │   ├── transitions.ts               # Reusable transition hooks
│   │   └── scenes/                       # 10 scene files
│   └── SceneDirector/                    # Interactive hand-path editor (port 3001)
├── lib/
│   └── fonts.ts                          # Centralized Rubik font loading (single source)
├── components/
│   ├── PhoneMockup.tsx                   # iPhone-style frame
│   ├── TouchAnimation.tsx                # Tap ripple effects
│   ├── FullPageCoordinatePicker.tsx      # Coordinate picker utility
│   ├── CoordinateFitScreen.tsx           # Screen fitting utility
│   ├── FloatingHand/                     # Animated hand cursor system
│   │   ├── FloatingHand.tsx              # Main component - moving hand
│   │   ├── ScrollingHand.tsx             # Static hand for scroll demos
│   │   ├── ScrollSyncedHand.tsx          # Hand synced with scroll state
│   │   ├── useHandAnimation.ts           # Physics hook
│   │   ├── types.ts                      # TypeScript interfaces
│   │   └── hands/LottieHand.tsx          # Professional Lottie animation
│   └── DorianPhone/                      # Shared Dorian UI components
│       ├── StatusBar.tsx, DynamicIsland.tsx, DorianNavHeader.tsx
│       ├── AIBubble.tsx, ChatHeader.tsx, AnimatedText.tsx
│       ├── FingerTap.tsx, DorianLogo.tsx
│       └── index.ts
└── audio/
    └── AudioLayer.tsx                    # Sound effects sequencing

scripts/
├── capture-mobile-chat-dark.ts           # Playwright full capture
├── capture-user-message.ts               # Playwright user message only

public/
├── mobile/                               # Mobile screenshots
├── lottie/                               # Lottie animations (hand-click, hand-tap, etc.)
├── hand-pointer.png                      # PNG hand for ImageHand
└── audio/                                # typing-soft.wav, send-click.wav
```

---

## Key Patterns

### Sticky Header Pattern

For scrolling demos where the app header should stay fixed:

```tsx
const STICKY_HEADER_HEIGHT = 56;

{
  /* Scrolling content */
}
<div style={{ transform: `translateY(${-scrollY * scale}px)` }}>
  <Img src={fullPageImage} />
</div>;

{
  /* Sticky header overlay - stays at top */
}
<div
  style={{
    position: 'absolute',
    top: 0,
    height: STICKY_HEADER_HEIGHT * scale,
    overflow: 'hidden',
    zIndex: 10,
    boxShadow: scrollY > 10 ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
  }}
>
  <Img src={fullPageImage} />
</div>;
```

### Scroll-Synced Hand Pattern

For hand gestures that ONLY animate during active scrolling:

```tsx
const playbackRate = isScrolling ? 2 : 0.001;

<ScrollSyncedHand
  x={700}
  y={960}
  isScrolling={isScrolling}
  scrollProgress={progress}
  enterFrame={0}
  exitFrame={outroStart}
  totalFrames={totalFrames}
  tilt={-20}
/>;
```

### Scene Screenshot Mapping (MobileChatDemo)

| Scene           | Screenshot                                | Overlay/Effect                       |
| --------------- | ----------------------------------------- | ------------------------------------ |
| 3 - Typing      | `mobile-chat-type-XX.png`                 | Finger tap at start (frames 0-8)     |
| 4 - Send        | `mobile-chat-3-ready.png`                 | Finger tap on send button            |
| 5 - UserMessage | `mobile-chat-user-message.png`            | Crossfade from input state           |
| 6 - Thinking    | `mobile-chat-user-message.png`            | Animated thinking dots (bottom: 210) |
| 7 - Response    | Crossfade to `mobile-chat-5-response.png` | Glow effect fades in                 |

### Finger Visibility Pattern

| Scene      | Finger Behavior                                              |
| ---------- | ------------------------------------------------------------ |
| 3 - Typing | Tap input (frames 0-8) → disappears during typing            |
| 4 - Send   | No finger during pan → appears at send button (frames 12-25) |
| 5-7        | No finger                                                    |

### Zoom & Pan (MobileChatDemo)

- **TypingScene**: Zooms in + shifts to center input (zoomOffsetX: -120)
- **SendScene**: Pans from input (right) to send button (left)
- **Global offset**: 120px down (`translateY(120px)`) in main composition

---

## On-Demand Documentation

Read these files when working on the relevant area:

| Topic                               | File                                 |
| ----------------------------------- | ------------------------------------ |
| Composition tables, debug tools     | `docs/compositions.md`               |
| FloatingHand, Lottie, hand gestures | `docs/floating-hand.md`              |
| Screenshot capture, Playwright      | `docs/capture-workflow.md`           |
| SceneDirector editor architecture   | `docs/scene-director.md`             |
| Enforced coding rules (26 rules)    | `.claude/rules/remotion-patterns.md` |
| Dorian phone UI requirements        | `.claude/rules/dorian-standards.md`  |
| Remotion framework docs             | https://www.remotion.dev/docs        |
