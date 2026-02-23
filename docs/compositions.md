# Compositions & Debug Tools

On-demand reference for all video compositions, debug utilities, coordinate system, and audio setup.
See also: `CLAUDE.md` for project overview, `docs/floating-hand.md` for hand components.

---

## MobileChatDemoV2 (Main - 9:16 Vertical)

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

## DashmorDemo (Labor Cost Dashboard - 9:16 Vertical)

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

---

## DorianDemo (Marketplace Demo - 9:16 Vertical)

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

## Debug-CoordinatePicker (Utility)

Interactive tool to find exact touch coordinates on screenshots.

- Click on screen to record coordinates
- Shows crosshair following mouse
- COPY button to export coordinates
- CLEAR button to reset

**Usage**: Use this to find exact x,y positions for touch animations.

## Debug-DashmorSections (Utility) ★

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
