# Shared Components Reference

Reusable video production components. Import from `src/components/` and `src/lib/`.

## Libraries

### springs.ts

```tsx
import { SPRING_CONFIG, springConfig } from '../lib/springs';

// Use a preset directly
spring({ fps, config: SPRING_CONFIG.bouncy });

// Get preset with overrides
spring({ fps, config: springConfig('gentle', { damping: 25 }) });
```

Available presets: `default`, `gentle`, `bouncy`, `snappy`, `zoom`, `slide`, `response`, `fadeIn`, `popIn`.

### easings.ts

```tsx
import { applyNamedEasing } from '../lib/easings';

const easedProgress = applyNamedEasing(t, 'ease-out');
```

Available: `linear`, `ease-in`, `ease-out`, `ease-in-out`, `spring`, `bounce`, `elastic`.

### audioEnvelope.ts

```tsx
import { computeVolumeAtFrame, MIXING_LEVELS } from '../lib/audioEnvelope';

const vol = computeVolumeAtFrame(frame, {
  baseVolume: MIXING_LEVELS.music,
  fadeInFrames: 30,
  fadeOutFrames: 60,
  totalFrames: 900,
});
```

### pointers.ts

```tsx
import { isPointerAnimation, getRotationOffset } from '../lib/pointers';

if (isPointerAnimation('cursor-real-black')) {
  // Enable autoRotate with correct offset
  physics.autoRotate = true;
  physics.rotationOffset = getRotationOffset('cursor-real-black'); // -45
}
```

## Components

### ZoomTransition

Wraps content with zoom-in → hold → zoom-out animation.

```tsx
<ZoomTransition
  zoomTo={2.5}
  centerX={0.3} // 0-1 normalized
  centerY={0.2}
  zoomInDuration={20}
  zoomOutDuration={20}
  durationInFrames={120}
>
  <MyScene />
</ZoomTransition>
```

### BackgroundMusic

Looping music track with envelope and ducking.

```tsx
<BackgroundMusic
  src={staticFile('audio/ambient.mp3')}
  volume={0.15}
  fadeInFrames={30}
  fadeOutFrames={60}
  duckTriggers={[{ startFrame: 100, endFrame: 200, duckLevel: 0.3 }]}
/>
```

### CrossfadeTransition

For TransitionSeries compositions:

```tsx
import { crossfadeTiming, CROSSFADE } from '../components/CrossfadeTransition';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition {...CROSSFADE.standard()} />
  <TransitionSeries.Sequence durationInFrames={90}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

### SequenceCrossfade

For Sequence-based layouts:

```tsx
<SequenceCrossfade from={0} durationInFrames={90} fadeIn={20} fadeOut={20}>
  <SceneA />
</SequenceCrossfade>
<SequenceCrossfade from={70} durationInFrames={90} fadeIn={20} fadeOut={20}>
  <SceneB />
</SequenceCrossfade>
```

### CaptionOverlay

SRT-based caption display:

```tsx
<CaptionOverlay
  srtContent={srtString}
  style="word-highlight"
  position="bottom"
  fontSize={48}
  color="#FFFFFF"
/>
```

### FloatingHand — autoRotate

For pointer cursor animations:

```tsx
<FloatingHand
  path={waypoints}
  animation="cursor-real-black"
  physics={{ autoRotate: true, rotationOffset: -45 }}
/>
```
