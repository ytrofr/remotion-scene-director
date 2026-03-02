# Claude Remotion Editor

> **Programmatic video creation toolkit with 90+ Lottie animations, interactive hand-path editor, and AI-powered scene composition.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Remotion](https://img.shields.io/badge/Remotion-4.0.419-purple)](https://www.remotion.dev)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Lottie Animations](https://img.shields.io/badge/Lottie_Animations-92-green)](public/lottie/)
[![Cursor Variants](https://img.shields.io/badge/Cursor_Variants-49-orange)](public/lottie/)

Create professional demo videos programmatically with React, Remotion, and animated hand cursors. Draw paths visually in SceneDirector, preview animations in real-time, and render pixel-perfect marketing content — all from code.

---

## Features

- **Animation Gallery** — 92 curated Lottie animations across 8 categories: tap, swipe, scroll, drag, click effects, cursor states, pointer shapes, and pointer animations
- **SceneDirector** — Visual hand-path editor with gesture presets, live preview, undo/redo, and TypeScript code export
- **FloatingHand System** — Physics-based animated hand cursor with 10+ gestures (tap, click, scroll, swipe, drag, pinch)
- **Real Arrow Animations** — 26 generated cursor animations (13 types x 2 styles) with tip-aligned sunburst effects
- **Pointer Shape Library** — 49 cursor variants across 5 shapes (Standard, Compact, Low-Wing, Mid-Wing, Real Arrow) with fill/outline/inverted styles
- **Phone Mockup Components** — iPhone-style frames with scrollable content, sticky headers, and zoom transitions
- **Screenshot Capture Pipeline** — Playwright-based capture with dark mode injection and API interception
- **Debug Tools** — Shared library of coordinate pickers, crosshair overlays, scene timelines, and path visualizations
- **Multiple Demo Templates** — Mobile chat, dashboard scroll, marketplace browse compositions

---

## Quick Start

```bash
# Install dependencies
npm install

# Start Remotion Studio (live preview)
npm run dev          # http://localhost:3000

# Open SceneDirector (hand-path editor)
npm run scene-director  # http://localhost:3001

# Render a video
npm run render:dorian   # Marketplace demo → out/dorian-demo.mp4
npm run render:v2       # Mobile chat → out/mobile-demo-v2.mp4
```

---

## Animation Gallery

92 professional Lottie animations organized by category:

| Category           | Count | Examples                                        |
| ------------------ | ----- | ----------------------------------------------- |
| Tap Gestures       | 6     | Single tap, double tap, long press              |
| Swipe & Scroll     | 7     | Swipe left/right/up/down, mouse scroll          |
| Touch & Drag       | 5     | Drag, pinch zoom, hand gestures                 |
| Click Effects      | 7     | Sunburst, ripple, CTA indicator                 |
| Cursor States      | 9     | Blinking, busy, move, right-click               |
| Pointer Shapes     | 49    | 5 shapes x multiple fill/outline/color variants |
| Pointer Animations | 40    | Click, bounce, wobble, swish trail, hover pulse |

### Real Arrow Animations (Generated)

26 high-quality cursor animations generated via `scripts/generate-real-arrow-anims.py`:

| Animation Type   | Description                               |
| ---------------- | ----------------------------------------- |
| click            | Scale squeeze on click                    |
| dblclick         | Double pulse effect                       |
| slide            | Horizontal oscillation                    |
| wobble           | Damped rotation swing                     |
| idle             | Subtle breathing scale                    |
| drag             | Vertical move with scale grab/release     |
| bounce           | Vertical bounce with decreasing amplitude |
| swish-trail      | Fast slide with ghost copies trailing     |
| swish-dash       | Fast slide with dashed line trail         |
| swish-slide      | Smooth slide with slight tilt             |
| hover-pulse      | Scale + opacity breathing                 |
| click-burst      | Click + 12-ray sunburst at cursor tip     |
| click-burst-soft | Click + 8-ray soft sunburst at cursor tip |

Each type available in **black filled** and **outline** variants = 26 total files.

---

## Compositions

| Composition      | Format | Description                                         |
| ---------------- | ------ | --------------------------------------------------- |
| MobileChatDemoV2 | 9:16   | Mobile chat app demo with typing animation          |
| MobileChatDemoV4 | 9:16   | Chat demo with professional Lottie hand-click       |
| DashmorDemo      | 9:16   | Dashboard scrolling demo with scroll-synced hand    |
| DorianDemo       | 9:16   | AI marketplace demo with product discovery and chat |

### Debug Compositions

- `MobileChatDemoV4-INTERACTIVE` — Click-to-place markers for hand positioning
- `DorianDemo-INTERACTIVE` — Interactive debug for marketplace demo
- `Debug-CoordinatePicker` — Find exact touch coordinates on screenshots
- `Debug-DashmorSections` — Interactive scroll position picker

---

## SceneDirector

Interactive hand-path editor with real-time preview:

```bash
npm run scene-director   # http://localhost:3001
```

### Capabilities

- **Gesture presets** — Click, scroll, drag, swipe, point (keyboard 1-5)
- **Hand style picker** — Multiple Lottie variants per gesture type
- **Live preview** — WYSIWYG hand animation on video frames
- **Drawing modes** — Click-to-place or draw-to-path
- **Layer system** — Multiple independent hand layers per scene
- **Zoom controls** — Mouse wheel zoom-to-cursor, pan with drag
- **Undo/redo** — Ctrl+Z / Ctrl+Shift+Z with full state history
- **Animation gallery** — Browse and preview all 92 animations
- **TypeScript export** — Copy generated code for compositions
- **Session persistence** — Auto-saves on close, restores on reload

---

## FloatingHand System

Physics-based animated hand cursor with 10+ Lottie gestures.

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

| Animation           | Best For        | Size  |
| ------------------- | --------------- | ----- |
| `hand-click`        | Button clicks   | 10KB  |
| `hand-tap`          | Quick taps      | 14KB  |
| `hand-scroll-clean` | Scrolling demos | 3KB   |
| `hand-swipe-up`     | Vertical swipes | 5KB   |
| `hand-drag`         | Drag and drop   | 64KB  |
| `hand-pinch`        | Pinch zoom      | 106KB |
| `hand-point`        | Highlighting    | 4KB   |

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
├── Root.tsx                              # Composition registry
├── compositions/
│   ├── MobileChatDemo/                   # Mobile chat demo (V2/V4)
│   │   ├── constants.ts                  # Colors, timings, coordinates
│   │   ├── springConfigs.ts              # Animation spring presets
│   │   └── scenes/                       # 8 scene components
│   ├── DashmorDemo/                      # Dashboard scroll demo
│   ├── DorianDemo/                       # AI marketplace demo (10 scenes)
│   │   ├── DorianDemo.tsx                # Main composition
│   │   ├── DorianPhoneMockup.tsx         # Phone frame with scrollable content
│   │   ├── constants.ts                  # Colors, timing, spring configs
│   │   └── scenes/                       # 10 scene files
│   ├── SceneDirector/                    # Interactive hand-path editor (port 3001)
│   │   ├── App.tsx                       # Main editor application
│   │   ├── state.ts                      # Zustand-style state management
│   │   ├── panels/                       # Toolbar, Inspector, Gallery, Timeline
│   │   │   ├── galleryData.ts            # 92 animation entries, 8 categories
│   │   │   ├── GalleryView.tsx           # Gallery browser with categories
│   │   │   └── PointerShapeCard.tsx      # Grouped pointer variant picker
│   │   ├── hooks/                        # useGallerySelection, useToComp
│   │   └── styles/                       # Modular CSS (8 files)
│   └── HandGestureGallery/              # Standalone gallery composition
├── components/
│   ├── PhoneMockup.tsx                   # iPhone-style frame
│   ├── TouchAnimation.tsx                # Tap ripple effects
│   ├── ClickEffect/                      # Click visual effects
│   ├── FloatingHand/                     # Animated hand cursor system
│   │   ├── FloatingHand.tsx              # Main component - moving hand
│   │   ├── ScrollingHand.tsx             # Static hand for scroll demos
│   │   ├── ScrollSyncedHand.tsx          # Hand synced with scroll state
│   │   └── hands/LottieHand.tsx          # Lottie animation renderer
│   ├── debug/                            # Shared debug component library
│   │   ├── DebugCrosshair.tsx            # Crosshair overlay
│   │   ├── DebugClickMarkers.tsx         # Numbered click markers
│   │   ├── DebugSceneOverlay.tsx         # Frame/scene/time info
│   │   ├── DebugPathVisualization.tsx    # SVG path lines
│   │   └── DebugSceneTimeline.tsx        # Horizontal progress bar
│   └── DorianPhone/                      # Shared Dorian UI components
├── lib/fonts.ts                          # Centralized Rubik font loading
└── audio/AudioLayer.tsx                  # Sound effects sequencing

scripts/
├── generate-real-arrow-anims.py          # Lottie cursor animation generator
├── capture-mobile-chat-dark.ts           # Playwright full capture
└── capture-user-message.ts               # Playwright user message only

public/
├── lottie/                               # 92+ Lottie animation files
│   ├── hand-*.json                       # Hand gesture animations
│   ├── cursor-*.json                     # Cursor pointer variants
│   ├── cursor-anim-*.json               # Generic pointer animations (14)
│   ├── cursor-real-anim-*.json          # Real Arrow animations (26)
│   └── click-sunburst*.json             # Click effect overlays
├── sunburst-picker.html                  # Coordinate picker tool
├── mobile/                               # Mobile screenshots
└── audio/                                # Sound effects
```

---

## Render Commands

```bash
npm run render              # Desktop demo (1920x1080)
npm run render:v2           # Mobile chat V2 (1080x1920)
npm run render:dorian       # Marketplace demo (standard)
npm run render:dorian:hq    # Marketplace demo (high quality, CRF 16)
npm run render:dashmor      # Dashboard scroll demo
npm run postrender:2x       # 2x speed post-processing via ffmpeg
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

### Animation Generation

Generate cursor animations programmatically:

```bash
python3 scripts/generate-real-arrow-anims.py
# Generates 26 Lottie files in public/lottie/
# 13 animation types × 2 bases (black + outline)
```

---

## Frequently Asked Questions

### What is Claude Remotion Editor?

Claude Remotion Editor is a programmatic video creation toolkit built on Remotion. It provides an interactive hand-path editor (SceneDirector), 92+ Lottie animations, physics-based hand cursors, phone mockup components, and debug tools for creating professional demo videos with React and TypeScript.

### How does the Animation Gallery work?

The Animation Gallery in SceneDirector provides a browsable catalog of 92 Lottie animations across 8 categories. Each animation can be previewed in real-time, selected for use in scenes, and filtered by category. Pointer shapes are grouped by shape variant with fill/outline/color dropdowns.

### How do I generate new cursor animations?

Run `python3 scripts/generate-real-arrow-anims.py` to generate 26 Real Arrow cursor animations. The script combines base cursor shapes with animation keyframes and effects (sunburst, ghost trails, dash trails). Edit the script to add new animation types or modify existing ones.

### How do I add a new hand animation?

Download a Lottie JSON from [LottieFiles](https://lottiefiles.com/free-animations), save it to `public/lottie/`, register it in `src/compositions/SceneDirector/panels/galleryData.ts`, and reference it by filename in the `animation` prop of `FloatingHand`.

### How do I find touch coordinates?

Use SceneDirector (`npm run scene-director`) to visually place hand waypoints on video frames. For precise positioning, use the `-INTERACTIVE` debug compositions in Remotion Studio which support click-to-place markers with coordinate copy.

### How do I create a new composition?

Create a directory in `src/compositions/YourDemo/`, add your scenes, register the composition in `src/Root.tsx`, and add a render script to `package.json`. Follow the scene-based architecture pattern used by existing compositions.

### What's the difference between FloatingHand, ScrollingHand, and ScrollSyncedHand?

`FloatingHand` follows a path of coordinates with physics-based movement. `ScrollingHand` stays in one place for simple scroll demos. `ScrollSyncedHand` stays in place but its animation only plays during active scroll transitions, freezing during pauses.

### How does SceneDirector work?

SceneDirector is a standalone web app (port 3001) for visually editing hand animations on video scenes. Select a gesture preset (click, scroll, drag, swipe, point), click or draw on the video frame to place waypoints, adjust timing and physics in the inspector panel, then export as TypeScript code to paste into your composition.

---

## Built With

- [Remotion](https://www.remotion.dev) — React framework for programmatic video
- [React](https://reactjs.org) — UI component library
- [TypeScript](https://www.typescriptlang.org) — Type-safe JavaScript
- [Lottie](https://lottiefiles.com) — Professional vector animations
- [Vite](https://vitejs.dev) — Fast development server and SceneDirector bundler
- [Playwright](https://playwright.dev) — Screenshot capture automation

---

## License

MIT License — See [LICENSE](LICENSE)

---

_Built with Remotion 4.0.419, React 18, and 92+ Lottie animations._
