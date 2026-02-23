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

## Compositions

### MobileChatDemoV2 (Main - 9:16 Vertical)

**Dimensions**: 1080x1920 | **Duration**: ~11 seconds @ 30fps (320 frames)

| #   | Scene Name  | Duration  | Description                         | File                 |
| --- | ----------- | --------- | ----------------------------------- | -------------------- |
| 1   | Intro       | 35 frames | Phone slides in                     | IntroScene.tsx       |
| 2   | ChatEmpty   | 45 frames | Empty chat UI                       | ChatEmptyScene.tsx   |
| 3   | Typing      | 70 frames | Tap input + letter-by-letter + zoom | TypingScene.tsx      |
| 4   | Send        | 30 frames | Pan to send, tap send               | SendScene.tsx        |
| 5   | UserMessage | 30 frames | User prompt appears in chat         | UserMessageScene.tsx |
| 6   | Thinking    | 45 frames | AI thinking with animated dots      | ThinkingScene.tsx    |
| 7   | Response    | 60 frames | AI response appears                 | ResponseScene.tsx    |
| 8   | Outro       | 35 frames | CTA overlay                         | OutroScene.tsx       |

### MobileChatDemoV4 (Lottie Hand Version - 9:16 Vertical)

**Dimensions**: 1080x1920 | **Duration**: ~11 seconds @ 30fps (335 frames)

Same as V3 but uses professional Lottie hand-click animation instead of simple finger indicator.

| #   | Scene Name       | Duration  | Description                | Hand                  |
| --- | ---------------- | --------- | -------------------------- | --------------------- |
| 1   | Intro            | 35 frames | Phone slides in            | none                  |
| 2   | ChatWithResponse | 45 frames | Shows first Q&A            | none                  |
| 3   | Typing           | 85 frames | Click input, wait 1s, type | hand-click @ frame 5  |
| 4   | Send             | 30 frames | Pan to send, click send    | hand-click @ frame 13 |
| 5   | UserMessage      | 30 frames | Second question appears    | none                  |
| 6   | Thinking         | 45 frames | AI thinking dots           | none                  |
| 7   | Response         | 60 frames | AI response slides up      | none                  |
| 8   | Outro            | 35 frames | CTA overlay                | none                  |

**Debug Compositions**:

- `MobileChatDemoV4-INTERACTIVE` ★ - **ALWAYS USE THIS** for debugging hand movements, clicks, positions

**Interactive Debug Workflow** (MobileChatDemoV4-INTERACTIVE):

1. Navigate to the frame with the issue
2. Click on video to drop markers (M1, M2, M3...)
3. Markers show: position + frame number
4. Tell Claude: "Move hand from M1 (828, 1033) to M2 (814, 1545) at frame 225"
5. Use COPY ALL to export marker coordinates as code

**Hand Position Adjustments** (in scene files):

- `baseHandX` - Horizontal position (negative = left)
- `baseHandY` - Vertical position (negative = up)
- Current: TypingScene -140 up, SendScene -190 up and -40 left

---

### DashmorDemo (Labor Cost Dashboard - 9:16 Vertical)

**Dimensions**: 1080x1920 | **Duration**: ~20 seconds @ 30fps

Dashboard scrolling demo with section-by-section navigation and scroll-synced hand gesture.

| #   | Scene Name    | Duration  | Description                | File             |
| --- | ------------- | --------- | -------------------------- | ---------------- |
| 1   | Intro         | 45 frames | Phone enters from bottom   | IntroScene.tsx   |
| 2   | Header        | 60 frames | Dashboard header + summary | SectionScene.tsx |
| 3   | Summary Cards | 45 frames | Key metrics cards          | SectionScene.tsx |
| 4   | Main Data     | 60 frames | Employee-level breakdown   | SectionScene.tsx |
| 5   | Shift Status  | 45 frames | Current shift overview     | SectionScene.tsx |
| 6   | Forecast      | 60 frames | Cost projections           | SectionScene.tsx |
| 7   | Analytics     | 60 frames | Historical trends          | SectionScene.tsx |
| 8   | Details       | 60 frames | Detailed reports           | SectionScene.tsx |
| 9   | Outro         | 45 frames | Phone exits                | OutroScene.tsx   |

**Key Features**:

- **Scroll-synced hand** - Hand gesture ONLY animates during scroll transitions
- **Scene-based architecture** - Each section is a separate Sequence
- **Named timeline** - Visible in Remotion Studio for easy navigation

**Files**:

```
src/compositions/DashmorDemo/
├── DashmorDemo.tsx           # Main composition with Sequences
├── constants.ts              # Colors, sections, timing
└── scenes/
    ├── index.ts              # Exports
    ├── types.ts              # Scene type definitions
    ├── shared.tsx            # PhoneFrame, Callout, etc.
    ├── IntroScene.tsx        # Phone entrance
    ├── SectionScene.tsx      # Generic section (reused 7x)
    └── OutroScene.tsx        # Phone exit
```

### DorianDemo (Marketplace Demo - 9:16 Vertical)

**Dimensions**: 1080x1920 | **Duration**: ~38 seconds @ 30fps (1140 frames)

AI-powered marketplace demo showing product discovery and chat assistant (V2 - 10 scenes).

| #   | Scene Name    | Duration   | Description                        | File                   |
| --- | ------------- | ---------- | ---------------------------------- | ---------------------- |
| 1   | Intro         | 75 frames  | Logo animation                     | IntroScene.tsx         |
| 2   | HomeScroll    | 150 frames | Scroll through products            | HomeScrollScene.tsx    |
| 3   | TapBubble     | 75 frames  | Tap AI assistant bubble            | TapBubbleScene.tsx     |
| 4   | ChatOpen      | 90 frames  | Chat panel slides up               | ChatOpenScene.tsx      |
| 5   | UserTyping    | 150 frames | User types message + sends         | UserTypingScene.tsx    |
| 6   | AIThinking    | 60 frames  | AI thinking dots                   | AIThinkingScene.tsx    |
| 7   | AIResponse    | 120 frames | AI response + View Products button | AIResponseScene.tsx    |
| 8   | ProductPage   | 150 frames | LG TV listing with scroll          | ProductPageScene.tsx   |
| 9   | ProductDetail | 90 frames  | Product detail crossfade           | ProductDetailScene.tsx |
| 10  | Outro         | 180 frames | CTA/Outro                          | OutroScene.tsx         |

**Key Standards**:

- **ALWAYS use `dark={true}`** for FloatingHand - dark pointers on light backgrounds
- **Hand animations**: Use `hand-tap` for click scenes, `hand-scroll-clean` for scrolling
- **Physics presets**: Use `HAND_PHYSICS` from constants.ts (scroll, tap, trail)
- **Spring presets**: Use `SPRING_CONFIG` from constants.ts (gentle, bouncy, snappy, zoom, slide, response)
- **FPS-relative timing**: Use `f(frame30, fps)` from timing.ts for all interpolate() calls
- **Shared components**: Use components from `src/components/DorianPhone/` (StatusBar, DynamicIsland, DorianNavHeader, AIBubble, ChatHeader, AnimatedText, FingerTap, DorianLogo)

**Files**:

```
src/compositions/DorianDemo/
├── DorianDemo.tsx           # Main composition (orchestrator) + debug compositions
├── DorianPhoneMockup.tsx    # Phone frame with scrollable content
├── constants.ts             # Colors, timing, text, spring configs, hand physics
├── timing.ts                # FPS-relative frame helpers (f, sec)
├── transitions.ts           # Reusable transition hooks (useZoom, useCrossfade, useSlide)
├── index.ts                 # Exports
└── scenes/
    ├── index.ts             # Barrel exports
    ├── IntroScene.tsx
    ├── HomeScrollScene.tsx
    ├── TapBubbleScene.tsx
    ├── ChatOpenScene.tsx
    ├── UserTypingScene.tsx
    ├── AIThinkingScene.tsx
    ├── AIResponseScene.tsx
    ├── ProductPageScene.tsx
    ├── ProductDetailScene.tsx
    └── OutroScene.tsx

src/components/DorianPhone/  # Shared UI components
├── index.ts                 # Barrel exports
├── StatusBar.tsx            # iOS status bar (10:45, signal, battery)
├── DynamicIsland.tsx        # Black pill notch
├── DorianNavHeader.tsx      # Hamburger + logo + account + search
├── AIBubble.tsx             # Teal AI assistant circle (single source)
├── ChatHeader.tsx           # Chat panel header
├── AnimatedText.tsx         # Fade/slide-in text wrapper
├── FingerTap.tsx            # Tap ripple effect
└── DorianLogo.tsx           # Large logo for intro/outro
```

**Debug Compositions**:

- `DorianDemo-INTERACTIVE` ★ - **ALWAYS USE THIS** for debugging hand movements, clicks, positions
- `DorianDemo-DEBUG` - Overlay showing current scene, frame, hand info
- `DorianDebug` - Scroll position picker
- `DorianDebug-TapBubble` - AI bubble click position finder

**Interactive Debug Workflow** (DorianDemo-INTERACTIVE):

1. Navigate to the frame with the issue
2. Click on video to drop markers (M1, M2, M3...)
3. Markers show: position + frame number
4. Tell Claude: "Move hand from M1 (828, 1033) to M2 (814, 1545) at frame 225"
5. Use COPY ALL to export marker coordinates as code

---

### Debug-CoordinatePicker (Utility)

Interactive tool to find exact touch coordinates on screenshots.

- Click on screen to record coordinates
- Shows crosshair following mouse
- COPY button to export coordinates
- CLEAR button to reset

**Usage**: Use this to find exact x,y positions for touch animations.

### Debug-DashmorSections (Utility) ★

**Interactive scroll position picker for dashboard scenes.**

Use this to find the exact `scrollY` value for each section of a scrolling demo.

**How to Use:**

1. Open Remotion Studio → Select **Debug-DashmorSections**
2. Click section buttons (0, 1, 2...) on the LEFT to select a section
3. Click +/- buttons on the RIGHT to adjust scrollY
4. Find the position where the content you want is at the top of the screen
5. Copy the scrollY value shown at the bottom
6. Update `constants.ts` with the new value

**Controls:**

- `-100` / `+100` - Big jumps
- `-50` / `+50` - Medium jumps
- `-10` / `+10` - Small steps
- `-1` / `+1` - Fine tuning
- `Reset` - Return to default value

---

## Scene Debug Methodology ★

**Standard workflow for debugging scroll positions in multi-section demos:**

### Step 1: Create Debug Composition

```tsx
// Interactive picker with on-screen buttons
<Composition
  id="Debug-YourDemo"
  component={DebugSectionPickerInteractive}
  ...
/>
```

### Step 2: Find Scroll Positions

1. Open debug composition in Remotion Studio
2. For each section, adjust scrollY until content is positioned correctly
3. Record the values

### Step 3: Update Constants

```typescript
// constants.ts
export const SECTIONS = [
  { id: 'section-1', scrollY: 0, ... },
  { id: 'section-2', scrollY: 750, ... },  // Found via debug tool
  { id: 'section-3', scrollY: 1500, ... }, // Found via debug tool
];
```

### Step 4: Preview Full Video

Select the main composition to verify all sections scroll correctly.

**Key Principle**: Each section's `scrollY` should position the **key content** at the top of the phone viewport when that scene starts.

---

## Sticky Header Pattern ★

For scrolling demos where the app header should stay fixed:

```tsx
// In ScrollableContent component (shared.tsx)
const STICKY_HEADER_HEIGHT = 56; // pixels before scaling

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
  <Img src={fullPageImage} /> {/* Shows only header (clipped) */}
</div>;
```

**Key**: The header overlay shows the same image but clips to header height, staying fixed while content scrolls behind it.

---

## Scroll-Synced Hand Pattern ★

For hand gestures that should ONLY animate during active scrolling:

```tsx
// playbackRate controls Lottie animation speed
const playbackRate = isScrolling ? 2 : 0.001;
// Scrolling: animate fast (2x)
// Paused: nearly frozen (0.001x)
```

**Use `ScrollSyncedHand` component:**

```tsx
<ScrollSyncedHand
  x={700} // Static position
  y={960}
  isScrolling={isScrolling} // From useScrollState hook
  scrollProgress={progress}
  enterFrame={0}
  exitFrame={outroStart}
  totalFrames={totalFrames}
  tilt={-20} // Tilted left
/>
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
│   │       ├── IntroScene.tsx
│   │       ├── ChatEmptyScene.tsx
│   │       ├── TypingScene.tsx
│   │       ├── SendScene.tsx
│   │       ├── UserMessageScene.tsx
│   │       ├── ThinkingScene.tsx
│   │       ├── ResponseScene.tsx
│   │       └── OutroScene.tsx
│   ├── DashmorDemo/                      # ★ Labor Cost Dashboard demo
│   │   ├── DashmorDemo.tsx               # Main composition with Sequences
│   │   ├── constants.ts                  # Sections, timing, colors
│   │   └── scenes/                       # Scene components
│   │       ├── IntroScene.tsx
│   │       ├── SectionScene.tsx          # Generic (used 7x)
│   │       ├── OutroScene.tsx
│   │       └── shared.tsx                # PhoneFrame, Callout, etc.
├── lib/
│   └── fonts.ts                          # ★ Centralized Rubik font loading (single source)
├── components/
│   ├── PhoneMockup.tsx                   # iPhone-style frame
│   ├── TouchAnimation.tsx                # Tap ripple effects
│   ├── FullPageCoordinatePicker.tsx      # Coordinate picker utility
│   ├── CoordinateFitScreen.tsx           # Screen fitting utility
│   └── FloatingHand/                     # ★ Animated hand cursor system
│       ├── FloatingHand.tsx              # Main component - moving hand
│       ├── ScrollingHand.tsx             # Static hand for scroll demos
│       ├── ScrollSyncedHand.tsx          # ★ Hand synced with scroll state
│       ├── useHandAnimation.ts           # Physics hook (smooth acceleration)
│       ├── types.ts                      # TypeScript interfaces
│       └── hands/                        # Hand style variants
│           ├── LottieHand.tsx            # ★ Professional Lottie animation
│           ├── TouchHand.tsx             # Single finger tap gesture
│           ├── SwipeHand.tsx             # Open palm swipe gesture
│           ├── PointHand.tsx             # Horizontal "look here" pointer
│           ├── ImageHand.tsx             # PNG image hand
│           ├── WindowsHand.tsx           # Classic Windows cursor
│           ├── GlovedHand.tsx            # Cartoon gloved hand
│           └── ...                       # More SVG variants
└── audio/
    └── AudioLayer.tsx                    # Sound effects sequencing

scripts/
├── capture-mobile-chat-dark.ts           # Playwright full capture (typing + response)
├── capture-user-message.ts               # Playwright user message only capture

public/
├── mobile/                               # Mobile screenshots
│   ├── mobile-chat-1-empty.png
│   ├── mobile-chat-type-01.png ... 21.png
│   ├── mobile-chat-3-ready.png
│   ├── mobile-chat-user-message.png      # User message only (no AI) - for Scenes 5,6,7
│   ├── mobile-chat-thinking.png          # User message + native thinking bubble
│   └── mobile-chat-5-response.png
├── lottie/                               # Lottie animations
│   └── hand-click.json                   # Hand click gesture (from LottieFiles)
├── hand-pointer.png                      # PNG hand for ImageHand style
└── audio/
    ├── typing-soft.wav                   # Keyboard typing sound
    └── send-click.wav                    # Button click sound
```

---

## Coordinate System

**Phone viewport**: 390x844 pixels (iPhone 14 Pro)
**Composition**: 1080x1920 pixels (scaled 2.4x)

### Finding Touch Coordinates

1. Open Remotion Studio: `npm run dev`
2. Select **Debug-CoordinatePicker** composition
3. Click on the element you need coordinates for
4. Copy coordinates and update `constants.ts`

### Current Coordinates (390x844 viewport)

```typescript
// From: src/compositions/MobileChatDemo/constants.ts
export const COORDINATES = {
  chatInput: { x: 250, y: 687 },
  sendButton: { x: 43, y: 687 }, // Verified via Debug-CoordinatePicker
  responseArea: { x: 195, y: 350 },
  thumbsUp: { x: 100, y: 420 },
};
```

---

## Screenshot Capture Workflow

### Prerequisites

- Target web app running on port 8080
- Auth disabled or pre-configured for capture

### Capture Process

1. **Run capture**:

   ```bash
   npx tsx scripts/capture-mobile-chat-dark.ts
   ```

### Capture Script Features

- Dark mode CSS injection (CRITICAL - must match existing screenshots)
- Letter-by-letter typing (21 stages)
- Rapid capture after send (5 screenshots: 0ms, 50ms, 150ms, 300ms, 500ms)
- 2x scale (Retina) output

### Capturing User Message Only State

The AI responds too fast to capture "user message without AI response" naturally.
Use `scripts/capture-user-message.ts` which:

1. **Sets auth token** via localStorage before navigation
2. **Injects dark mode CSS** (same as capture-mobile-chat-dark.ts)
3. **Intercepts API** with `page.route()` to delay AI response by 15 seconds
4. **Captures** immediately after user message appears
5. **Hides thinking indicator** via JS for clean "user message only" state

```bash
npx tsx scripts/capture-user-message.ts
```

**Output**:

- `mobile-chat-user-message.png` - User message only (no AI)
- `mobile-chat-thinking.png` - User message + native thinking bubble

### Dark Mode CSS Injection (CRITICAL)

**DO NOT** just set `data-theme="dark"` - you MUST inject the full CSS to match existing screenshots.

Key CSS rules:

```css
/* Background */
html,
body {
  background-color: #0a0a15 !important;
}

/* Header gradient */
header,
nav {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
}

/* Chat area */
.chat-container,
.chat-messages {
  background-color: #0f0f1a !important;
}

/* IMPORTANT: Do NOT override user message bubble background! */
/* Only force white text, keep native teal/green bubble color */
.message.user * {
  color: #ffffff !important;
}
/* DO NOT: background: linear-gradient(...) - this changes bubble color! */
```

### API Route Interception Pattern

```javascript
// Delay AI response to capture intermediate states
await page.route('**/api/true-ai/**', async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 15000)); // 15 sec delay
  await route.fulfill({
    status: 200,
    contentType: 'text/event-stream',
    body: 'data: {"type":"done"}\n\n',
  });
});
```

### Hiding Native Thinking Indicator

```javascript
// After capturing with thinking, hide it for clean user message
await page.evaluate(() => {
  document
    .querySelectorAll('.thinking-message, .thinking-dots, .message:not(.user)')
    .forEach((el) => (el.style.display = 'none'));
});
```

---

## Audio Setup

### Audio Files (public/audio/)

- `typing-soft.wav` - Keyboard typing (loops during Scene 3)
- `send-click.wav` - Button tap sound (Scene 4)

### AudioLayer Timings

```typescript
const AUDIO_TIMINGS = {
  typingStart: 65,
  typingDuration: 60,
  sendFrame: 135 + 10, // 10 frames into Scene 4
  responseFrame: 215,
};
```

---

## Key Learnings & Patterns

### Scene Screenshot Mapping

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

### Animation Best Practices

- **No pulsing**: Remove `Math.sin()` animations - they look like bugs
- **Static glow**: Use fixed opacity (e.g., 0.15) not animated
- **Spring entrances only**: Use spring for one-time entrances, not continuous effects
- **Thinking dots position**: `bottom: 210` in ThinkingScene

### Zoom & Pan

- **TypingScene**: Zooms in + shifts to center input (zoomOffsetX: -120)
- **SendScene**: Pans from input (right) to send button (left)
- **Global offset**: 120px down (`translateY(120px)`) in main composition

### Remotion Specifics

- Use `useCurrentScale()` for interactive components in Studio
- Use `TransitionSeries` with `name` prop for labeled timeline
- Use `staticFile()` for all assets in `/public`

---

## Installed Packages

```json
{
  "@remotion/transitions": "4.0.419",
  "@remotion/light-leaks": "4.0.419",
  "@remotion/motion-blur": "4.0.419",
  "@remotion/captions": "4.0.419",
  "@remotion/layout-utils": "4.0.419",
  "@remotion/shapes": "4.0.419",
  "@remotion/lottie": "4.0.419",
  "lottie-web": "5.x"
}
```

---

## Lottie Animations

Remotion has native Lottie support for professional, smooth animations.

### Setup (Already Installed)

```bash
npm install @remotion/lottie@4.0.419 lottie-web --save-exact
```

### Available Lottie Files

| File                     | Size  | Description                           | Source                                                                                             |
| ------------------------ | ----- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `hand-click.json`        | 10KB  | Click gesture with finger press       | [LottieFiles](https://lottiefiles.com/free-animation/hand-click-gesture-9MTQM8gTjD)                |
| `hand-tap.json`          | 14KB  | Quick tap gesture                     | LottieFiles                                                                                        |
| `hand-tap-alt.json`      | 12KB  | Alternative tap (James Lashmar)       | LottieFiles CDN                                                                                    |
| `hand-point.json`        | 4KB   | Pointing finger icon                  | [Eray Asena](https://lottiefiles.com/free-animation/hand-pointing-icon-q2Q1A7r3KH)                 |
| `hand-swipe-up.json`     | 5KB   | Swipe up gesture                      | LottieFiles                                                                                        |
| `hand-swipe-right.json`  | 5KB   | Swipe right gesture                   | LottieFiles                                                                                        |
| `hand-scroll.json`       | 36KB  | Scroll gesture with cards             | LottieFiles                                                                                        |
| `hand-scroll-clean.json` | 5KB   | ★ Clean dark finger scroll (no arrow) | [Lai](https://lottiefiles.com/free-animation/finger-scroll-up-1icmMbTAJ3)                          |
| `hand-drag.json`         | 64KB  | Drag and drop gesture                 | LottieFiles                                                                                        |
| `hand-pinch.json`        | 106KB | Pinch zoom in/out                     | [David Tanner](https://lottiefiles.com/free-animation/pinch-zoom-in-out-mobile-gesture-5ocGtC4BZf) |

### Usage Example

```tsx
import { Lottie, LottieAnimationData } from '@remotion/lottie';
import { staticFile, delayRender, continueRender } from 'remotion';

// Load animation
const [animationData, setAnimationData] = useState<LottieAnimationData | null>(
  null,
);
const [handle] = useState(() => delayRender('Loading Lottie'));

useEffect(() => {
  fetch(staticFile('lottie/hand-click.json'))
    .then((res) => res.json())
    .then((data) => {
      setAnimationData(data);
      continueRender(handle);
    });
}, []);

// Render
<Lottie
  animationData={animationData}
  playbackRate={1}
  loop={true}
  direction="forward"
/>;
```

### Finding More Lottie Animations

1. **LottieFiles**: https://lottiefiles.com/free-animations
2. **IconScout**: https://iconscout.com/lottie-animations
3. Download as **Lottie JSON** format
4. Save to `public/lottie/` folder

### Lottie Best Practices

- Use `delayRender()` + `continueRender()` for async loading
- Use `staticFile()` for files in `public/` folder
- Keep animations small (<100KB) for performance
- Test animations in Studio before rendering

---

## FloatingHand Component

Universal animated hand cursor using professional Lottie animations.

### Location

```
src/components/FloatingHand/
├── FloatingHand.tsx       # Main component - moving hand cursor
├── ScrollingHand.tsx      # ★ Static hand for scroll demos (stays in place)
├── useHandAnimation.ts    # Physics-based animation hook (ultra-smooth bezier)
├── types.ts               # TypeScript interfaces
├── index.ts               # Exports
└── hands/
    └── LottieHand.tsx     # Lottie animation renderer
```

### Quick Usage

```tsx
import { FloatingHand } from './components/FloatingHand';

<FloatingHand
  path={[
    { x: 200, y: 400, frame: 0, gesture: 'pointer' },
    { x: 400, y: 600, frame: 30, gesture: 'drag' },
    { x: 400, y: 800, frame: 60, gesture: 'click', duration: 20 },
  ]}
  animation="hand-click" // See Lottie files above
  size={120}
  showRipple={true}
/>;
```

### Available Animations

| Animation           | Best For                                      | File Size |
| ------------------- | --------------------------------------------- | --------- |
| `hand-click`        | Button clicks, taps                           | 10KB      |
| `hand-tap`          | Quick taps                                    | 14KB      |
| `hand-tap-alt`      | Alternative tap style                         | 12KB      |
| `hand-point`        | Highlighting elements                         | 4KB       |
| `hand-scroll-clean` | ★ **Scrolling demos** (dark finger, no arrow) | 3KB       |
| `hand-swipe-up`     | Vertical swipes (has arrow)                   | 5KB       |
| `hand-swipe-right`  | Horizontal swipes                             | 5KB       |
| `hand-scroll`       | Scroll with UI cards (legacy)                 | 36KB      |
| `hand-drag`         | Drag and drop                                 | 64KB      |
| `hand-pinch`        | Pinch zoom                                    | 106KB     |

### Hand Path Points

```typescript
interface HandPathPoint {
  x: number; // X position
  y: number; // Y position
  frame?: number; // Frame to reach this point
  gesture?: HandGesture; // 'pointer' | 'drag' | 'click' | 'scroll'
  scale?: number; // Size multiplier (default: 1)
  rotation?: number; // Manual rotation override
  duration?: number; // Frames to pause at this point
}
```

### Physics Configuration

```typescript
<FloatingHand
  physics={{
    floatAmplitude: 8,     // Hover bob height (px)
    floatSpeed: 0.06,      // Hover bob speed
    velocityScale: 0.35,   // Movement → rotation factor
    maxRotation: 25,       // Max tilt (degrees)
    shadowEnabled: true,
    shadowDistance: 20,
    shadowBlur: 25,
    smoothing: 0.15,
  }}
/>
```

### Effects

| Prop                | Description                         |
| ------------------- | ----------------------------------- |
| `showRipple={true}` | Ripple effect on click gesture      |
| `dark={true}`       | Invert colors for light backgrounds |

### Debug Composition

Select **Debug-FloatingHand** in Remotion Studio to:

- Test animated movement with physics
- Preview different animations
- Compare gestures (pointer, drag, click)

### Speed Control

Adjust movement speed by changing frame intervals in your path:

```tsx
// Slower movement (50 frames between points)
{ x: 100, y: 200, frame: 0 },
{ x: 400, y: 400, frame: 50 },  // Takes 50 frames

// Faster movement (25 frames between points)
{ x: 100, y: 200, frame: 0 },
{ x: 400, y: 400, frame: 25 },  // Takes 25 frames
```

---

## ScrollingHand Component ★

**The correct way to show scroll gestures in demos.**

### Key Pattern (Learned Feb 2024)

- Hand **stays in ONE PLACE** (doesn't move during scroll)
- Uses `hand-scroll-clean` animation (dark finger, NO arrow)
- **Tilted 20° to the left** for natural look
- No floating/velocity - completely static position
- **Screen/content scrolls** while hand stays still
- Hand enters from right, exits to right

### Quick Usage

```tsx
import { ScrollingHand } from './components/FloatingHand';

<ScrollingHand
  x={600} // Static X position
  y={960} // Static Y position
  scrollStartFrame={35} // When scroll gesture starts
  scrollEndFrame={200} // When scroll gesture ends
  totalFrames={300} // Total video frames
  tilt={-20} // Tilted 20° left (default)
  size={140} // Hand size
/>;
```

### Full Props

```typescript
interface ScrollingHandProps {
  x: number; // X position where hand stays
  y: number; // Y position where hand stays
  enterFrame?: number; // When hand enters (default: 0)
  scrollStartFrame: number; // When scroll gesture starts
  scrollEndFrame: number; // When scroll gesture ends
  exitFrame?: number; // When hand exits (default: scrollEndFrame + 10)
  totalFrames: number; // Total video frames
  size?: number; // Hand size (default: 140)
  tilt?: number; // Tilt angle, negative = left (default: -20)
  dark?: boolean; // Dark variant for light backgrounds
}
```

### Example: Dashboard Scroll Demo

```tsx
// Hand stays at x=700, y=960 while dashboard scrolls
<ScrollingHand
  x={700}
  y={960}
  scrollStartFrame={35}
  scrollEndFrame={VIDEO.durationInFrames - 50}
  totalFrames={VIDEO.durationInFrames}
  size={140}
  tilt={-20}
/>
```

### Why This Pattern Works

1. **Static hand = Focus on content** - Viewers watch the scrolling content, not the hand
2. **Tilted angle = Natural grip** - Looks like someone holding their phone
3. **No arrow = Clean look** - The scroll gesture animation is enough
4. **Synced timing** - Hand enters before scroll, exits after

---

## ScrollSyncedHand Component ★★

**For demos with multiple scroll sections** (like DashmorDemo).

The hand animation ONLY plays during active scroll transitions, freezing during pauses.

### Key Pattern

- Hand stays in ONE place
- Animation plays at 2x speed during scroll
- Animation freezes (0.001x) during pause
- Perfect sync with screen scroll

### Quick Usage

```tsx
import { ScrollSyncedHand } from './components/FloatingHand';

// In your composition:
const { isScrolling, scrollProgress } = useScrollState(frame);

<ScrollSyncedHand
  x={700}
  y={960}
  isScrolling={isScrolling} // TRUE only during scroll
  scrollProgress={scrollProgress} // 0-1 scroll progress
  enterFrame={0}
  exitFrame={outroStart}
  totalFrames={VIDEO.durationInFrames}
  size={140}
  tilt={-20}
/>;
```

### Full Props

```typescript
interface ScrollSyncedHandProps {
  x: number; // Static X position
  y: number; // Static Y position
  isScrolling: boolean; // Whether screen is currently scrolling
  scrollProgress: number; // Progress of current scroll (0-1)
  enterFrame?: number; // When hand enters (default: 0)
  exitFrame: number; // When hand exits
  totalFrames: number; // Total video frames
  size?: number; // Hand size (default: 140)
  tilt?: number; // Tilt angle (default: -20)
}
```

### When to Use Which

| Component          | Use When                                     |
| ------------------ | -------------------------------------------- |
| `ScrollingHand`    | Simple single-scroll demos                   |
| `ScrollSyncedHand` | Multi-section demos with pause/scroll cycles |
| `FloatingHand`     | Moving hand that follows a path              |

---

## FloatingHand Variations & Customization

### Creating Different Movement Styles

#### 1. Quick Tap Pattern

```tsx
<FloatingHand
  path={[
    { x: 300, y: 400, frame: 0, gesture: 'pointer' },
    { x: 300, y: 420, frame: 8, gesture: 'click' }, // Quick down
    { x: 300, y: 400, frame: 16, gesture: 'pointer' }, // Quick up
  ]}
  animation="hand-tap"
/>
```

#### 2. Scroll Demo Pattern ★

```tsx
// USE ScrollingHand for scroll demos (hand stays in place)
import { ScrollingHand } from './components/FloatingHand';

<ScrollingHand
  x={600}
  y={960}
  scrollStartFrame={35}
  scrollEndFrame={200}
  totalFrames={300}
  tilt={-20}
/>;
```

#### 3. Swipe Gesture

```tsx
<FloatingHand
  path={[
    { x: 200, y: 500, frame: 0, gesture: 'pointer' },
    { x: 800, y: 500, frame: 20, gesture: 'drag' }, // Fast horizontal swipe
    { x: 850, y: 500, frame: 30, gesture: 'pointer' },
  ]}
  animation="hand-swipe-right"
/>
```

#### 4. Navigate & Click Pattern

```tsx
<FloatingHand
  path={[
    { x: 100, y: 200, frame: 0, gesture: 'pointer' },
    { x: 400, y: 350, frame: 40, gesture: 'pointer' },
    { x: 400, y: 350, frame: 50, gesture: 'click', duration: 10 }, // Pause & click
    { x: 600, y: 500, frame: 80, gesture: 'pointer' },
  ]}
  animation="hand-click"
/>
```

### Physics Presets

#### Snappy (Fast, responsive)

```tsx
physics={{
  floatAmplitude: 2,
  floatSpeed: 0.08,
  velocityScale: 0.6,
  maxRotation: 20,
  smoothing: 0.1,
}}
```

#### Floaty (Slow, dreamy)

```tsx
physics={{
  floatAmplitude: 8,
  floatSpeed: 0.03,
  velocityScale: 0.2,
  maxRotation: 10,
  smoothing: 0.3,
}}
```

#### Professional (Balanced)

```tsx
physics={{
  floatAmplitude: 4,
  floatSpeed: 0.04,
  velocityScale: 0.4,
  maxRotation: 15,
  smoothing: 0.2,
}}
```

### Adding More Lottie Animations

1. **Find animations**: https://lottiefiles.com/search?q=hand+gesture
2. **Download** as Lottie JSON
3. **Save** to `public/lottie/`
4. **Use**:

```tsx
// In LottieHand.tsx or directly
<LottieHand animationFile="your-new-animation" size={120} />
```

**Recommended searches on LottieFiles:**

- "hand tap" - Tap/click gestures
- "hand swipe" - Swipe animations
- "hand scroll" - Scroll gestures
- "hand drag" - Drag and drop
- "finger touch" - Touch interactions
- "cursor click" - Click effects

### Animation Timing Guide

| Use Case     | Frames Between Points | Feel                 |
| ------------ | --------------------- | -------------------- |
| Quick tap    | 8-15                  | Snappy, responsive   |
| Normal click | 20-30                 | Natural pace         |
| Smooth drag  | 40-60                 | Flowing, elegant     |
| Slow scroll  | 60-90                 | Deliberate, readable |
| Swipe        | 15-25                 | Quick but visible    |

---

## Choosing the Right Animation

| Demo Type         | Recommended Animation                 |
| ----------------- | ------------------------------------- |
| Button clicks     | `hand-click` or `hand-tap`            |
| Mobile taps       | `hand-tap` or `hand-tap-alt`          |
| Scrolling content | `hand-scroll-clean` ★                 |
| Swipe gestures    | `hand-swipe-up` or `hand-swipe-right` |
| Drag and drop     | `hand-drag`                           |
| Pinch zoom        | `hand-pinch`                          |
| Highlighting      | `hand-point`                          |

### Files Location

```
src/components/FloatingHand/
├── FloatingHand.tsx       # Main wrapper (use this)
├── useHandAnimation.ts    # Physics & easing (bezier curves)
├── types.ts               # TypeScript types
├── index.ts               # Exports
└── hands/
    └── LottieHand.tsx     # Lottie animation renderer

public/lottie/             # All Lottie animation files
├── hand-click.json        # 10KB
├── hand-tap.json          # 14KB
├── hand-tap-alt.json      # 12KB
├── hand-point.json        # 4KB
├── hand-swipe-up.json     # 5KB
├── hand-swipe-right.json  # 5KB
├── hand-scroll.json       # 36KB
├── hand-drag.json         # 64KB
└── hand-pinch.json        # 106KB
```

---

## Determinism Rules

- **NEVER** use `Math.random()` - causes different renders
- **ALWAYS** use `random('seed')` from Remotion for randomness
- **ALWAYS** use `staticFile()` for assets in `/public`

---

## External App Integration (Playwright MCP)

For capturing screenshots from external web apps, use Playwright MCP tools (`browser_navigate`, `browser_click`, `browser_evaluate`, etc.) to automate interactions without modifying the target app.

### Route Interception Pattern

```javascript
// Intercept API for controlled demo responses
await page.route('/api/endpoint*', async (route) => {
  await route.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: 'data: {"type":"chunk","data":{"text":"Response text"}}\n\n',
  });
});
```

### Demo Automation Example

```javascript
// Using Playwright MCP tools
await browser_navigate({ url: 'http://localhost:8080/your-page' });
await browser_evaluate({
  function: `() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }`,
});
await browser_snapshot({});
await browser_type({ ref: '#inputField', text: 'Query text', delay: 100 });
await browser_click({ ref: '#sendButton', element: 'Send button' });
await browser_wait_for({ selector: '.response', timeout: 30000 });
await browser_take_screenshot({ path: 'demo-response.png' });
```

---

## SceneDirector Editor ★

Interactive hand-path editor (port 3001) with timeline, waypoint markers, and layer system.

### Architecture

```
src/compositions/SceneDirector/
├── App.tsx                     # Root: player + overlays + context provider
├── state.ts                    # directorReducer + all action types
├── undoReducer.ts              # Undo/redo wrapper (past/present/future stacks)
├── context.tsx                 # DirectorContextValue interface + useDirector()
├── gestures.ts                 # GESTURE_PRESETS (click/scroll/drag/swipe/point)
├── layers.ts                   # Layer types: HandLayer, AudioLayer, ZoomLayer
├── codedPaths.ts               # getCodedPath() — source-of-truth paths per scene
├── compositions.ts             # COMPOSITIONS registry + COMPOSITION_COMPONENTS
├── panels/
│   ├── Toolbar.tsx             # Top bar: tool buttons, dark toggle, save
│   ├── SceneList.tsx           # Left: scene list + layer stack per scene
│   ├── Inspector.tsx           # Right: waypoint/layer editor tabs
│   └── Timeline.tsx            # Bottom: multi-row timeline (scenes/hand/audio)
├── overlays/
│   ├── DrawingCanvas.tsx       # Click/drag interaction layer (zIndex 10)
│   ├── FloatingHandOverlay.tsx # Renders ALL visible hand layers (zIndex 11)
│   ├── WaypointMarkers.tsx     # Draggable dots for selected hand layer
│   ├── HandCursorPreview.tsx   # Lottie cursor preview while hovering
│   └── Crosshairs.tsx          # Precision crosshair for waypoint placement
└── hooks/
    ├── useKeyboardShortcuts.ts # 1-5 gesture keys, Ctrl+Z/Y, space, arrows
    ├── usePlayerControls.ts    # Zoom-to-cursor + Alt-drag pan
    ├── useSessionPersistence.ts# localStorage save/restore
    └── useToComp.ts            # Screen → composition coordinate mapping
```

### Layer System

**Primary vs Secondary hand layers:**

- **Primary** (index 0): waypoints synced from `state.waypoints[scene]` via `syncHandLayer()`. Uses scene-level `sceneAnimation` + `sceneDark` overrides.
- **Secondary** (index 1+): created by `ADD_HAND_GESTURE`. Waypoints live exclusively in `layer.data.waypoints`. Use gesture preset defaults for animation/dark.
- `UPDATE_WAYPOINT` / `DELETE_WAYPOINT` route to secondary layers when `state.selectedLayerId` matches a non-primary hand layer.
- `REMOVE_LAYER` only clears `state.waypoints[scene]` when removing the primary hand layer.

**Adding independent gestures:**

```typescript
dispatch({ type: 'ADD_HAND_GESTURE', scene, points: [wp], gesture: 'click' });
// Creates a new HandLayer with its own waypoints — never modifies primary
```

### DrawingCanvas Interaction Modes

| Mode   | Condition             | Short click (<5 mouse points)   | Freehand drag (>=5 points)            |
| ------ | --------------------- | ------------------------------- | ------------------------------------- |
| CREATE | No waypoints in scene | `ADD_WAYPOINT` × generatePath() | `SET_WAYPOINTS` (2 pts)               |
| EDIT   | Waypoints exist       | `ADD_HAND_GESTURE` (new layer)  | `ADD_HAND_GESTURE` (2 pts, new layer) |

### Keyboard Shortcuts

| Key                       | Action                                              |
| ------------------------- | --------------------------------------------------- |
| `1`–`5`                   | Select gesture tool (Click/Scroll/Drag/Swipe/Point) |
| Same key again            | Toggle dark/light hand for current scene            |
| `S`                       | Select tool (deselect)                              |
| `Ctrl+S`                  | Save session                                        |
| `Ctrl+Z`                  | Undo                                                |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo                                                |
| `Space`                   | Play/pause                                          |
| `←` / `→`                 | Step 1 frame                                        |
| `Shift+←` / `Shift+→`     | Step 10 frames                                      |
| `Delete` / `Backspace`    | Delete selected waypoint or layer                   |
| `T`                       | Toggle trail                                        |
| `E`                       | Toggle export                                       |
| `0`                       | Reset zoom/pan                                      |
| `Escape`                  | Deselect waypoint / close export                    |

### Undo/Redo Stack

`undoReducer.ts` wraps `directorReducer` with three stacks:

- `past`: states before last undoable action
- `present`: current state
- `future`: states available for redo (cleared on any new undoable action)

**Undoable actions**: `ADD_WAYPOINT`, `DELETE_WAYPOINT`, `SET_WAYPOINTS`, `UPDATE_WAYPOINT` (outside drag), `ADD_HAND_GESTURE`, `ADD_LAYER`, `REMOVE_LAYER`, `UPDATE_LAYER_DATA`, `SET_SCENE_GESTURE`, `REVERT_SCENE`, `RESTORE_VERSION`, `IMPORT_PATHS`, all layer visibility/lock/reorder actions.

**Drag coalescing**: `START_DRAG` creates one undo point; `UPDATE_WAYPOINT` mid-drag is coalesced (no new entry).

### Zoom / Pan

- **Scroll wheel**: zoom toward cursor (refs track current zoom/pan; pan adjusted so content under cursor stays fixed)
- **Alt+drag** or **middle-click drag**: pan
- **`0` key**: reset zoom and pan
- CSS transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` on `.player-frame`

---

**Docs**: https://www.remotion.dev/docs
