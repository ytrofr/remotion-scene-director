---
name: ai-video-toolkit
description: 'AI-powered video production tools for Remotion. Use when adding voiceover, captions, light leaks, sound effects, noise, shapes, motion blur, animated emoji, audio visualization, or AI-generated assets to video compositions.'
---

# AI Video Toolkit — Remotion + ElevenLabs + Media Tools

**Installed**: 2026-03-11 | **Tested**: 2026-03-11
**Packages**: `@remotion/light-leaks`, `@remotion/captions`, `@remotion/noise`, `@remotion/shapes`, `@remotion/motion-blur`, `@remotion/animated-emoji`, `@remotion/media-utils` (all @4.0.419)
**MCP**: ElevenLabs (TTS, voice cloning, transcription)
**Agent Skills**: `remotion-best-practices` (37 rule files)

---

## When to Use

- Adding voiceover/narration to a video
- Adding captions/subtitles (TikTok-style, word highlighting)
- Adding light leak transitions between scenes
- Adding sound effects (free SFX — local files in `public/audio/sfx/`)
- Animated backgrounds with Perlin noise
- SVG shapes (circles, stars, hearts, polygons)
- Motion blur effects (Trail, CameraMotionBlur)
- Animated emoji overlays (411 Google Fonts emojis)
- Audio visualization (spectrum bars, waveforms, bass-reactive)
- Transcribing audio to generate captions
- Importing .srt subtitle files

---

## 1. ElevenLabs TTS (Voiceover)

**Free tier**: 10K characters/month (~20 min audio)
**MCP**: Configured in `.mcp.json` → tools available in Claude Code when API key is set
**API key env var**: `ELEVENLABS_API_KEY`

### Direct API Pattern (from Remotion skill)

```ts
// generate-voiceover.ts — run with: node --strip-types generate-voiceover.ts
const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel (default)
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: 'Welcome to our product demo.',
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
    }),
  },
);
const audioBuffer = Buffer.from(await response.arrayBuffer());
writeFileSync('public/voiceover/scene-intro.mp3', audioBuffer);
```

### Use in Remotion Composition

```tsx
import { Audio, staticFile, Sequence } from 'remotion';

// Inside your scene:
<Sequence from={0}>
  <Audio src={staticFile('voiceover/scene-intro.mp3')} />
</Sequence>;
```

### Dynamic Duration from Audio

```tsx
import { CalculateMetadataFunction, staticFile } from 'remotion';
import { getAudioDuration } from '@remotion/media-utils';

export const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const duration = await getAudioDuration(
    staticFile('voiceover/scene-intro.mp3'),
  );
  return { durationInFrames: Math.ceil(duration * 30) }; // 30fps
};
```

---

## 2. Light Leaks (Scene Transitions)

**Package**: `@remotion/light-leaks` (installed, v4.0.419)

### As TransitionSeries Overlay

```tsx
import { TransitionSeries } from '@remotion/transitions';
import { LightLeak } from '@remotion/light-leaks';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Overlay durationInFrames={30}>
    <LightLeak seed={3} hueShift={30} />
  </TransitionSeries.Overlay>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

### Standalone Decorative Overlay

```tsx
import { AbsoluteFill } from 'remotion';
import { LightLeak } from '@remotion/light-leaks';

<AbsoluteFill>
  <MyContent />
  <LightLeak durationInFrames={60} seed={5} hueShift={240} />
</AbsoluteFill>;
```

### Props

- `seed` — pattern shape (different numbers = different patterns)
- `durationInFrames` — reveals first half, retracts second half
- `hueShift` — color rotation: 0=yellow/orange, 120=green, 240=blue

---

## 3. Captions & Subtitles

**Package**: `@remotion/captions` (installed, v4.0.419)

### From SRT File

```tsx
import { parseSrt } from '@remotion/captions';
const response = await fetch(staticFile('subtitles.srt'));
const text = await response.text();
const { captions } = parseSrt({ input: text });
```

### TikTok-Style Word-by-Word Display

```tsx
import { createTikTokStyleCaptions } from '@remotion/captions';

const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200, // words per page
});

// Render each page in a <Sequence> with word highlighting
{
  pages.map((page, i) => {
    const startFrame = (page.startMs / 1000) * fps;
    return (
      <Sequence key={i} from={startFrame} durationInFrames={duration}>
        {page.tokens.map((token) => (
          <span
            style={{
              color:
                token.fromMs <= currentMs && token.toMs > currentMs
                  ? '#39E508'
                  : 'white',
            }}
          >
            {token.text}
          </span>
        ))}
      </Sequence>
    );
  });
}
```

### Transcribe Audio (Whisper, local)

```bash
npx remotion add @remotion/install-whisper-cpp  # install first
```

```ts
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from '@remotion/install-whisper-cpp';

await installWhisperCpp({ to: './whisper.cpp', version: '1.5.5' });
await downloadWhisperModel({ model: 'medium.en', folder: './whisper.cpp' });

const output = await transcribe({
  model: 'medium.en',
  whisperPath: './whisper.cpp',
  whisperCppVersion: '1.5.5',
  inputPath: '/path/to/audio.wav',
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ whisperCppOutput: output });
fs.writeFileSync('public/captions.json', JSON.stringify(captions, null, 2));
```

---

## 4. Free Sound Effects

**Local files**: `public/audio/sfx/` (downloaded from Remotion CDN, tested 2026-03-11)

```tsx
import { Audio, staticFile } from 'remotion';

// Use local files (offline, faster):
<Audio src={staticFile('audio/sfx/whoosh.wav')} />
<Audio src={staticFile('audio/sfx/whip.wav')} />
<Audio src={staticFile('audio/sfx/page-turn.wav')} />
<Audio src={staticFile('audio/sfx/switch.wav')} />
<Audio src={staticFile('audio/sfx/mouse-click.wav')} />
<Audio src={staticFile('audio/sfx/shutter-modern.wav')} />
<Audio src={staticFile('audio/sfx/shutter-old.wav')} />
```

Available files: whoosh (14KB), whip (67KB), page-turn (35KB), switch (58KB), mouse-click (70KB), shutter-modern (43KB), shutter-old (56KB)

More SFX: https://github.com/kapishdima/soundcn/tree/main/assets

---

## 5. Audio Visualization

**Package**: `@remotion/media-utils` (already installed with Remotion)

### Spectrum Bars

```tsx
import { useWindowedAudioData, visualizeAudio } from '@remotion/media-utils';

const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
  src: staticFile('music.mp3'),
  frame,
  fps,
  windowInSeconds: 30,
});

const frequencies = visualizeAudio({
  fps,
  frame,
  audioData,
  numberOfSamples: 256,
  optimizeFor: 'speed',
  dataOffsetInSeconds,
});
// frequencies = array of 0-1 values (left=bass, right=highs)
```

### Bass-Reactive Effects

```tsx
const lowFreqs = frequencies.slice(0, 32);
const bass = lowFreqs.reduce((s, v) => s + v, 0) / lowFreqs.length;
const scale = 1 + bass * 0.5; // pulse with beat
```

---

## 6. Perlin Noise (Animated Backgrounds)

**Package**: `@remotion/noise` (installed, tested 2026-03-11)

Deterministic, seeded noise — safe for Remotion (no `Math.random()`).

```tsx
import { noise2D, noise3D } from '@remotion/noise';
import { useCurrentFrame } from 'remotion';

const AnimatedNoiseBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const COLS = 50,
    ROWS = 50;

  return (
    <AbsoluteFill>
      {Array.from({ length: COLS * ROWS }).map((_, i) => {
        const x = (i % COLS) / COLS;
        const y = Math.floor(i / COLS) / ROWS;
        const value = noise3D('bg', x * 5, y * 5, frame * 0.02); // -1 to 1
        const brightness = Math.floor((value + 1) * 127);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: `${100 / COLS}%`,
              height: `${100 / ROWS}%`,
              backgroundColor: `rgb(${brightness},${brightness * 0.8},${brightness * 1.2})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
```

### API

- `noise2D(seed, x, y)` → number in [-1, 1]
- `noise3D(seed, x, y, z)` → number in [-1, 1] (use z for time/frame)
- `noise4D(seed, x, y, z, w)` → number in [-1, 1]
- All are deterministic (same seed + coords = same result)

---

## 7. SVG Shapes

**Package**: `@remotion/shapes` (installed, tested 2026-03-11)

16 exports: `Circle`, `Ellipse`, `Heart`, `Pie`, `Polygon`, `Rect`, `Star`, `Triangle` + `make*` path generators.

```tsx
import { Circle, Star, Heart, Triangle } from '@remotion/shapes';
import { interpolate, useCurrentFrame } from 'remotion';

// Animated star rating
const frame = useCurrentFrame();
const rotation = interpolate(frame, [0, 60], [0, 360]);

<Star
  points={5}
  innerRadius={20}
  outerRadius={50}
  fill="gold"
  stroke="orange"
  strokeWidth={2}
  style={{ transform: `rotate(${rotation}deg)` }}
/>;

// Path generation (for custom SVG)
import { makeStar, makeHeart } from '@remotion/shapes';
const starPath = makeStar({ points: 5, innerRadius: 20, outerRadius: 50 });
// starPath.path = SVG path string, starPath.width, starPath.height
```

---

## 8. Motion Blur

**Package**: `@remotion/motion-blur` (installed, tested 2026-03-11)

Two components: `Trail` (afterimage trail) and `CameraMotionBlur` (full-frame blur).

```tsx
import { Trail, CameraMotionBlur } from '@remotion/motion-blur';

// Trail effect — renders multiple semi-transparent copies behind moving element
<Trail layers={6} lagInFrames={0.3}>
  <MovingElement />
</Trail>

// Camera motion blur — blurs the entire frame during movement
<CameraMotionBlur samples={10} shutterAngle={180}>
  <MyScene />
</CameraMotionBlur>
```

**Performance**: Both increase render time proportionally (Trail: `layers` x, CameraMotionBlur: `samples` x). Use sparingly.

---

## 9. Animated Emoji

**Package**: `@remotion/animated-emoji` (installed, tested 2026-03-11)

411 Google Fonts animated emojis with built-in durations.

```tsx
import { AnimatedEmoji, getAvailableEmojis } from '@remotion/animated-emoji';

// Simple usage
<AnimatedEmoji emoji="smile" style={{ width: 100 }} />
<AnimatedEmoji emoji="fire" style={{ width: 80 }} />
<AnimatedEmoji emoji="thumbs-up" style={{ width: 60 }} />

// Browse available emojis
const emojis = getAvailableEmojis();
// Returns: [{ name: 'smile', categories: ['Smileys and emotions'],
//            tags: [':smile:'], durationInSeconds: 2.33, codepoint: '1f600' }, ...]

// Available categories: 'Smileys and emotions', 'People', 'Animals and nature',
//   'Food and drink', 'Travel and places', 'Activities', 'Objects', 'Symbols', 'Flags'
```

---

## 10. Shared Video Components

Reusable components in `src/components/` and utilities in `src/lib/`:

### Libraries (`src/lib/`)

- **springs.ts** — `SPRING_CONFIG` (9 presets) + `springConfig()` helper
- **easings.ts** — `applyNamedEasing()` with 7 named easings
- **audioEnvelope.ts** — `computeVolumeAtFrame()` + `MIXING_LEVELS` + ducking
- **pointers.ts** — `POINTER_PRESETS` + `isPointerAnimation()` + `getRotationOffset()`

### Components (`src/components/`)

- **ZoomTransition** — Zoom-in → hold → zoom-out wrapper
- **BackgroundMusic** — Looping music with fade envelope + ducking
- **CrossfadeTransition** — `crossfadeTiming()` + `CROSSFADE` presets for TransitionSeries
- **SequenceCrossfade** — Opacity crossfade for Sequence layouts
- **CaptionOverlay** — SRT caption display (full-sentence / word-highlight)

### FloatingHand Enhancements

- **autoRotate**: `physics.autoRotate: true` for direction-based cursor rotation
- **Pointer cursors**: Pass any `cursor-*` gallery ID as `animation` prop

---

## Pipeline: Full Narrated Video with Captions

1. Write script text per scene
2. Generate voiceover: ElevenLabs API → `public/voiceover/{scene}.mp3`
3. Transcribe: Whisper → `public/captions/{scene}.json`
4. Use `calculateMetadata` to size composition to audio duration
5. Render `<Audio>` + `<CaptionPage>` alongside scene content
6. Add light leak transitions between scenes
7. Export final video with `npx remotion render`
