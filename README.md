# Claude Remotion Editor

> **Interactive hand-path editor for Remotion video compositions with Lottie animations.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Remotion](https://img.shields.io/badge/Remotion-4.0.419-purple)](https://www.remotion.dev)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

Create professional demo videos programmatically with React, Remotion, and animated hand cursors. Draw paths, preview animations, and render pixel-perfect marketing content.

---

## Features

- **FloatingHand System** - Physics-based animated hand cursor with 10+ Lottie gestures (tap, click, scroll, swipe, drag, pinch)
- **Interactive Debug Tools** - Click-to-place coordinate markers, copy coordinates, frame-by-frame debugging
- **Scene-Based Architecture** - Modular compositions with named timelines and reusable scenes
- **Phone Mockup Components** - iPhone-style frames with scrollable content and sticky headers
- **Scroll-Synced Animations** - Hand gestures that play only during active scroll transitions
- **Screenshot Capture Pipeline** - Playwright-based capture with dark mode injection and API interception
- **Multiple Demo Templates** - Mobile chat, dashboard scroll, marketplace browse compositions

---

## Quick Start

```bash
# Install dependencies
npm install

# Start Remotion Studio (live preview)
npm run dev          # http://localhost:3000

# Render a video
npm run render:v2    # Mobile 9:16 demo → out/mobile-demo-v2.mp4
```

---

## Compositions

| Composition      | Format | Description                                         |
| ---------------- | ------ | --------------------------------------------------- |
| MobileChatDemoV2 | 9:16   | Mobile chat app demo with typing animation          |
| MobileChatDemoV4 | 9:16   | Chat demo with professional Lottie hand-click       |
| DashmorDemo      | 9:16   | Dashboard scrolling demo with scroll-synced hand    |
| DorianDemo       | 9:16   | AI marketplace demo with product discovery and chat |

### Debug Compositions

- `MobileChatDemoV4-INTERACTIVE` - Click-to-place markers for hand positioning
- `DorianDemo-INTERACTIVE` - Interactive debug for marketplace demo
- `Debug-CoordinatePicker` - Find exact touch coordinates on screenshots
- `Debug-DashmorSections` - Interactive scroll position picker

---

## FloatingHand System

Universal animated hand cursor with physics-based movement and 10+ Lottie gestures.

### Quick Usage

```tsx
import { FloatingHand } from './components/FloatingHand';

<FloatingHand
  path={[
    { x: 200, y: 400, frame: 0, gesture: 'pointer' },
    { x: 400, y: 600, frame: 30, gesture: 'drag' },
    { x: 400, y: 800, frame: 60, gesture: 'click', duration: 20 },
  ]}
  animation="hand-click"
  size={120}
  showRipple={true}
/>;
```

### Available Animations

| Animation           | Best For          | Size  |
| ------------------- | ----------------- | ----- |
| `hand-click`        | Button clicks     | 10KB  |
| `hand-tap`          | Quick taps        | 14KB  |
| `hand-scroll-clean` | Scrolling demos   | 3KB   |
| `hand-swipe-up`     | Vertical swipes   | 5KB   |
| `hand-swipe-right`  | Horizontal swipes | 5KB   |
| `hand-point`        | Highlighting      | 4KB   |
| `hand-drag`         | Drag and drop     | 64KB  |
| `hand-pinch`        | Pinch zoom        | 106KB |

### Hand Components

| Component          | Use When                                     |
| ------------------ | -------------------------------------------- |
| `FloatingHand`     | Moving hand that follows a path              |
| `ScrollingHand`    | Static hand for single-scroll demos          |
| `ScrollSyncedHand` | Multi-section demos with pause/scroll cycles |

---

## Project Structure

```
src/
├── Root.tsx                    # Composition registry
├── compositions/
│   ├── MobileChatDemo/         # Mobile chat demo (V2/V4)
│   │   ├── constants.ts        # Colors, timings, coordinates
│   │   ├── springConfigs.ts    # Animation spring presets
│   │   └── scenes/             # 8 scene components
│   ├── DashmorDemo/            # Dashboard scroll demo
│   └── DorianDemo/             # Marketplace demo
├── components/
│   ├── PhoneMockup.tsx         # iPhone-style frame
│   ├── TouchAnimation.tsx      # Tap ripple effects
│   └── FloatingHand/           # Animated hand cursor system
│       ├── FloatingHand.tsx    # Main component
│       ├── ScrollingHand.tsx   # Static scroll hand
│       ├── ScrollSyncedHand.tsx # Scroll-synced hand
│       ├── useHandAnimation.ts # Physics hook
│       └── hands/
│           └── LottieHand.tsx  # Lottie animation renderer
└── audio/
    └── AudioLayer.tsx          # Sound effects sequencing

public/
├── mobile/                     # Screenshot assets
├── lottie/                     # Lottie animation files (10+)
└── audio/                      # Sound effects
```

---

## Render Commands

```bash
npm run render           # Desktop demo (1920x1080)
npm run render:v2        # Mobile chat demo V2 (1080x1920)
npm run render:mobile    # Legacy mobile demo
npm run render:dorian    # Marketplace demo
npm run render:dashmor   # Dashboard scroll demo
npm run render:720p      # 720p scaled render
```

---

## Scene Director UI

Interactive hand-path editor running on a separate port:

```bash
npm run scene-director   # http://localhost:3001
```

---

## Key Patterns

### Determinism

- Use `random('seed')` instead of `Math.random()` for reproducible renders
- Use `staticFile()` for all assets in `/public`
- Avoid `Date.now()` or any non-deterministic values

### Phone Viewport

- **Phone viewport**: 390x844 pixels (iPhone 14 Pro)
- **Composition**: 1080x1920 pixels (scaled 2.4x)

### Sticky Header

{% raw %}

```tsx
// Content scrolls while header stays fixed
<div style={{ transform: `translateY(${-scrollY * scale}px)` }}>
  <Img src={fullPageImage} />
</div>
<div style={{ position: 'absolute', top: 0, height: STICKY_HEADER_HEIGHT * scale, zIndex: 10 }}>
  <Img src={fullPageImage} /> {/* Clipped to header height */}
</div>
```

{% endraw %}

### Scroll-Synced Hand

```tsx
const playbackRate = isScrolling ? 2 : 0.001;
// Scrolling: animate fast (2x)
// Paused: nearly frozen (0.001x)
```

---

## Frequently Asked Questions

### What is Claude Remotion Editor?

Claude Remotion Editor is an interactive hand-path editor and video composition toolkit built on top of Remotion. It provides physics-based animated hand cursors, phone mockup components, and debug tools for creating professional demo videos programmatically with React and TypeScript.

### How do I add a new hand animation?

Download a Lottie JSON from [LottieFiles](https://lottiefiles.com/free-animations), save it to `public/lottie/`, and reference it by filename in the `animation` prop of `FloatingHand`. Use `delayRender()` + `continueRender()` for async loading.

### How do I find touch coordinates?

Open Remotion Studio (`npm run dev`), select the `Debug-CoordinatePicker` composition, and click on screen elements. Coordinates are displayed and can be copied. For interactive compositions, use the `-INTERACTIVE` variant which supports click-to-place markers.

### How do I create a new composition?

Create a directory in `src/compositions/YourDemo/`, add your scenes, register the composition in `src/Root.tsx`, and add a render script to `package.json`. Follow the scene-based architecture pattern used by existing compositions.

### What's the difference between FloatingHand, ScrollingHand, and ScrollSyncedHand?

`FloatingHand` follows a path of coordinates with physics-based movement. `ScrollingHand` stays in one place for simple scroll demos. `ScrollSyncedHand` stays in place but its animation only plays during active scroll transitions, freezing during pauses.

---

## Built With

- [Remotion](https://www.remotion.dev) - React framework for programmatic video
- [React](https://reactjs.org) - UI component library
- [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- [Lottie](https://lottiefiles.com) - Professional vector animations
- [Vite](https://vitejs.dev) - Fast development server
- [Playwright](https://playwright.dev) - Screenshot capture automation

---

## License

MIT License - See [LICENSE](LICENSE)

---

_Built with Remotion 4.0.419 and React 18._
