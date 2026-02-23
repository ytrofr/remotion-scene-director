# FloatingHand & Lottie Reference

On-demand reference for all hand cursor components, Lottie animations, and gesture patterns.
See also: `CLAUDE.md` for project overview, `docs/compositions.md` for composition details.

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
