---
name: hand-animation-framework
description: "Multi-layer hand gesture animation with physics, Lottie preloading, and click feedback. Use when adding hand interactions to videos, implementing gesture-based UI demos, or building interactive overlays."
user-invocable: false
---

# Hand Animation Framework

## WHEN TO USE (Triggers)
1. When adding hand/finger interactions to a video composition
2. When implementing tap, swipe, drag, scroll, or click gestures
3. When hand movement needs physics-based natural motion (float, tilt)
4. When click feedback needs visual effect (burst, press animation)
5. When multiple hand layers need independent gesture control
6. When hand animation coordinates don't align with phone mockup position

## FAILED ATTEMPTS
| # | Attempt | Why Failed | Lesson |
|---|---------|-----------|--------|
| 1 | Linear interpolation between waypoints | Movement looked robotic, no natural feel | Use ultraSmoothEasing (Bezier 0.25, 0.1, 0.25, 1) for natural flow |
| 2 | Single hand layer for all scenes | Can't have independent gestures (tap in one area, scroll in another) | Multi-layer: Primary (scene-synced) + Secondary (independent) |
| 3 | Click animation loaded on-demand (async) | Visible delay between tap and click effect (~200ms gap) | Pre-load BOTH hand and click Lottie animations in parallel |
| 4 | Calculated hand position relative to zoom wrapper | Coordinates broke when zoom/pan changed | Calculate in COMPOSITION space (1080x1920), never relative to zoom |

## CORRECT PATTERN

### Core Data Structures
```typescript
interface HandPathPoint {
  x: number; y: number;          // Composition space coordinates
  scale?: number;                 // 0.5-2.0 (default 1)
  duration?: number;              // Frames to pause at this point
  gesture?: 'pointer'|'click'|'drag'|'scroll'|'open';
  rotation?: number;              // Override rotation (degrees)
}

interface HandPhysicsConfig {
  smoothing: number;              // 0-1 (default 0.15)
  velocityScale: number;          // Velocity->rotation mapping (0.3)
  maxRotation: number;            // Max tilt degrees (25)
  floatAmplitude: number;         // Hover float pixels (8)
  floatSpeed: number;             // Oscillation speed (0.08)
  autoRotate?: boolean;           // Cursor follows movement direction
}
```

### Animation Pipeline
```
1. Build timeline: HandPathPoint[] -> frame-indexed positions
2. Enforce click duration: Click gestures >= 45 frames (1.5s at 30fps)
3. Find segment: Binary search for current frame in timeline
4. Interpolate: ultraSmoothEasing on segment progress
5. Compute velocity: sin(progress * pi) peak velocity
6. Calculate rotation: physics-based tilt or auto-rotate
7. Scale pulse: Subtle size increase during peak velocity
8. Gesture transition: Click at 90% arrival, others at 30%
```

### Click Animation (Pre-loaded)
```typescript
// Pre-load both animations in parallel
const [handLottie, clickLottie] = await Promise.all([
  loadAnimation(handPath),
  loadAnimation(clickEffectPath),
]);

// On waypoint reach: instant swap (no async delay)
if (gesture === 'click' && segmentProgress > 0.9) {
  activeAnimation = clickLottie;  // Swap to click effect
  // Play full 45-frame cycle before reverting to hand
}
```

### Phone Coordinate Mapping
```
Phone frame center: (207, 434)
Composition center: (540, 960)
At zoom S: compX = 540 + S * (phoneX - 207)
           compY = 960 + offsetY + S * (phoneY - 434)
```

## EVIDENCE
| Metric | Value | Source |
|--------|-------|--------|
| Compositions using framework | 8 (all active) | Production |
| Hand animation presets | 26+ (gestures + pointers + click effects) | galleryData.ts |
| Click feedback latency | 0ms (pre-loaded) | Was 200ms with on-demand |
| Coordinate accuracy | Pixel-perfect on all zoom levels | Tested at 1x, 1.8x, 2.76x |

## QUICK START (< 5 minutes)
1. **Define path** (1 min): Array of HandPathPoint with x/y coordinates
2. **Choose physics** (30 sec): DEFAULT_PHYSICS works for most cases
3. **Call hook** (1 min): `useHandAnimation(path, startFrame, physics)`
4. **Render** (1 min): Use HandState for position/rotation/scale
5. **Add click** (1.5 min): Pre-load click Lottie, swap at 90% arrival
