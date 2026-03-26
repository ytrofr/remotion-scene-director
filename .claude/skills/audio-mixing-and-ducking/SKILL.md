---
name: audio-mixing-and-ducking
description: "Per-frame volume envelope computation with fade and ducking for Remotion videos. Use when mixing multiple audio layers, implementing voiceover ducking, or controlling volume dynamically."
user-invocable: false
---

# Audio Mixing and Ducking

## WHEN TO USE (Triggers)
1. When a video has multiple audio layers (SFX + voiceover + music)
2. When music should duck (reduce volume) during voiceover
3. When audio needs fade-in/fade-out at scene boundaries
4. When audio clips need precise frame-level volume control
5. When adding audio layers scattered across 10+ scene files

## FAILED ATTEMPTS
| # | Attempt | Why Failed | Lesson |
|---|---------|-----------|--------|
| 1 | Inline `<Audio>` in each scene component | Audio scattered across 10 files, impossible to manage globally | Centralize all audio in one registry (layers.ts) |
| 2 | Baked volume into audio files (Audacity export) | Couldn't adjust fades without re-exporting every time | Compute volume per-frame at render time |
| 3 | Used CSS opacity for volume transitions | CSS opacity doesn't affect audio, only visual | Use Remotion's volume function: `volume={(f) => computeVolume(f)}` |

## CORRECT PATTERN

### Audio Layer Registry (Single Source of Truth)
```typescript
// layers.ts -- all audio defined here, nowhere else
interface AudioEntry {
  id: string;
  file: string;           // 'audio/send-click.wav'
  globalFrom: number;     // Composition-level frame
  durationInFrames: number;
  volume: number;         // Base volume (0-1)
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

const MIXING_LEVELS = {
  voiceover: 0.85,
  sfx: 0.6,
  music: 0.15,
  musicDucked: 0.05,
} as const;
```

### Volume Envelope Computation
```typescript
function computeVolumeAtFrame(localFrame: number, envelope: VolumeEnvelope): number {
  const { baseVolume, fadeInFrames = 0, fadeOutFrames = 0, totalFrames } = envelope;
  if (localFrame < 0 || localFrame >= totalFrames) return 0;

  let multiplier = 1;

  // Fade in
  if (fadeInFrames > 0 && localFrame < fadeInFrames) {
    multiplier = localFrame / fadeInFrames;
  }

  // Fade out
  const fadeOutStart = totalFrames - fadeOutFrames;
  if (fadeOutFrames > 0 && localFrame >= fadeOutStart) {
    multiplier = Math.min(multiplier, (totalFrames - localFrame) / fadeOutFrames);
  }

  return baseVolume * Math.max(0, Math.min(1, multiplier));
}
```

### Ducking (Sidechain Compression)
```typescript
interface DuckTrigger {
  startFrame: number;
  endFrame: number;
  duckLevel: number;  // 0.3 = reduce to 30% during trigger
}

function computeDuckingAtFrame(globalFrame: number, triggers: DuckTrigger[]): number {
  for (const t of triggers) {
    if (globalFrame >= t.startFrame && globalFrame < t.endFrame) {
      return t.duckLevel;  // Music ducks during voiceover
    }
  }
  return 1.0;  // No ducking
}

// Combined: final volume = envelope x ducking
const finalVolume = computeVolumeAtFrame(localFrame, env) * computeDuckingAtFrame(globalFrame, duckTriggers);
```

### Renderer (Remotion integration)
```tsx
<Sequence from={entry.globalFrom} durationInFrames={entry.durationInFrames}>
  <Audio
    src={staticFile(entry.file)}
    volume={(f) => computeVolumeAtFrame(f, {
      baseVolume: entry.volume,
      fadeInFrames: entry.fadeInFrames,
      fadeOutFrames: entry.fadeOutFrames,
      totalFrames: entry.durationInFrames,
    })}
  />
</Sequence>
```

## EVIDENCE
| Metric | Value | Source |
|--------|-------|--------|
| Audio layers managed | 21 concurrent in DorianStores | Production |
| Mix consistency | 100% deterministic (same output every render) | Render-time computation |
| Fade accuracy | Frame-perfect (30fps resolution) | Visual waveform verification |

## QUICK START (< 5 minutes)
1. **Create audio registry** (1 min): Define all AudioEntry objects in one file
2. **Add envelope function** (1 min): Copy computeVolumeAtFrame
3. **Add ducking** (1 min): Define DuckTriggers for music during voiceover
4. **Render** (1 min): Map entries to `<Sequence><Audio>` with volume function
5. **Test** (1 min): Play and verify fades + ducking at scene boundaries
