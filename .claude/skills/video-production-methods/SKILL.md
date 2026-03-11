---
name: video-production-methods
description: 'Complete reference for all video production methods available in this project. Covers 6 workflows: phone mockup demos, motion graphics, narrated explainers, reference-based recreation, batch/parametric video, and the self-learning feedback loop. Use when planning any new video or choosing a production approach.'
---

# Video Production Methods — Complete Reference

## Available Methods

| #   | Method               | Best For                              | Skills Used                                |
| --- | -------------------- | ------------------------------------- | ------------------------------------------ |
| 1   | Phone Mockup Demo    | App showcases, feature walkthroughs   | SceneDirector, FloatingHand, DorianPhone   |
| 2   | Motion Graphics      | Marketing, social media, promos       | noise, shapes, light-leaks, animated-emoji |
| 3   | Narrated Explainer   | Product tours, tutorials, onboarding  | voiceover-pipeline, captions               |
| 4   | Reference Recreation | Replicating professional video styles | video-storyboard, AI analysis              |
| 5   | Batch/Parametric     | Multiple variations from one template | Zod schemas, calculateMetadata             |
| 6   | Self-Learning Loop   | Improving quality across renders      | video-feedback-loop                        |

---

## Method 1: Phone Mockup Demo

Our primary method. Interactive phone with cursor/hand animations.

### Workflow

1. Capture app screenshots → `public/dorian/` or `public/mobile/`
2. Plan scenes in SceneDirector (select composition, draw paths)
3. Build scenes using DorianPhoneMockup + shared DorianPhone components
4. Add hand gestures via SceneDirector (click, scroll, drag, swipe)
5. Add SFX (mouse-click, whoosh) via audio layers
6. Preview in Remotion Studio, iterate
7. Render with `npm run render:dorian`

### Key Components

- `DorianPhoneMockup.tsx` — phone frame with scrollable content
- `FloatingHand/` — animated cursor system (Lottie-based)
- `SceneDirector/` — visual hand-path editor
- `DorianPhone/` — shared UI (StatusBar, NavHeader, AIBubble)

### Example Scene Structure

```tsx
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <IntroScene />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition timing={springTiming({ config: SPRING_CONFIG.snappy })}>
    <fade() />
  </TransitionSeries.Transition>
  <TransitionSeries.Sequence durationInFrames={120}>
    <BrowseScene />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

---

## Method 2: Motion Graphics

Full-screen animated compositions for marketing/social content.

### Workflow

1. Define art direction (colors, typography, mood) in storyboard doc
2. Create scene components with animated text, shapes, backgrounds
3. Use `@remotion/noise` for animated gradient backgrounds
4. Use `@remotion/shapes` for decorative SVG elements
5. Use `@remotion/light-leaks` for transitions
6. Add `@remotion/animated-emoji` for reaction overlays
7. Apply `@remotion/motion-blur` Trail for dramatic movement

### Available Building Blocks

| Package                    | Component                             | Effect                        |
| -------------------------- | ------------------------------------- | ----------------------------- |
| `@remotion/noise`          | `noise2D/3D('seed', x, y)`            | Animated gradient backgrounds |
| `@remotion/shapes`         | `<Star>`, `<Heart>`, `<Circle>`       | Decorative SVG animations     |
| `@remotion/light-leaks`    | `<LightLeak seed={n} hueShift={deg}>` | Cinematic transition overlays |
| `@remotion/animated-emoji` | `<AnimatedEmoji emoji="fire">`        | 411 animated emoji overlays   |
| `@remotion/motion-blur`    | `<Trail layers={6}>`                  | Afterimage on moving elements |

---

## Method 3: Narrated Explainer

Voice-over driven videos with captions. See `voiceover-pipeline` skill for full details.

### Workflow

1. Write script per scene
2. Generate TTS: ElevenLabs API → `public/voiceover/{scene}.mp3`
3. (Optional) Transcribe → SRT → TikTok-style captions
4. Use `calculateMetadata` to size composition to audio duration
5. Layer: visual content + `<Audio>` + `<CaptionOverlay>`
6. Add light leak transitions between narrated scenes
7. Render final video

### Key Pattern: Dynamic Duration

```tsx
export const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const duration = await getAudioDurationInSeconds(
    staticFile(`voiceover/${props.scene}.mp3`),
  );
  return { durationInFrames: Math.ceil(duration * 30) + 30 }; // +1s padding
};
```

---

## Method 4: Reference Recreation

Analyze a reference video, extract style/timing, recreate in Remotion.

### Workflow

1. **Capture reference**: Screen record or download target video
2. **Analyze**: Use Google AI Studio (Gemini) to analyze frame-by-frame
   - Prompt: "Watch this video and describe every visual element, animation, timing, color, and transition in detail. Output as a scene-by-scene breakdown with frame counts."
3. **Convert to storyboard**: Take Gemini's analysis → create art direction + scene breakdown
4. **Implement**: Feed storyboard to Claude Code → generate Remotion scenes
5. **Iterate**: Preview in Studio, compare with reference, refine

### Alternative: Perplexity for Style Research

```
Use perplexity_ask: "What animation techniques does [brand] use in their product videos?
Describe specific motion patterns, timing, color palettes, and typography choices."
```

---

## Method 5: Batch/Parametric Video

Generate multiple video variations from one template + dataset.

### Workflow

1. Define composition props as Zod schema
2. Create template composition that reads props
3. Use `calculateMetadata()` for dynamic duration/dimensions
4. Prepare dataset (JSON, CSV, or API response)
5. Batch render: `npx remotion render --props=data.json`

### Example: Product Showcase Variants

```tsx
import { z } from 'zod';

export const ProductVideoSchema = z.object({
  productName: z.string(),
  tagline: z.string(),
  primaryColor: z.string(),
  screenshotPath: z.string(),
  voiceoverPath: z.string().optional(),
});

// In Root.tsx:
<Composition
  id="ProductVideo"
  component={ProductVideo}
  schema={ProductVideoSchema}
  defaultProps={{
    productName: 'Dorian',
    tagline: 'AI-Powered Marketplace',
    primaryColor: '#2DD4BF',
    screenshotPath: 'dorian/home.png',
  }}
  calculateMetadata={calculateMetadata}
/>;
```

### Batch Render

```bash
# Render multiple variations
npx remotion render ProductVideo --props='{"productName":"AppA","primaryColor":"#FF6B6B"}'
npx remotion render ProductVideo --props='{"productName":"AppB","primaryColor":"#4ECDC4"}'
```

---

## Method 6: Self-Learning Feedback Loop

See `video-feedback-loop` skill for full details.

### Summary

```
Render → Review (checklist) → Capture (docs/video-learnings.md) → Promote (rules/memory) → Feed Forward
```

### Promotion Ladder

1. **Learnings doc** — one-time observation, composition-specific
2. **Memory** — project preference that persists across sessions
3. **Rule** — universal pattern, same mistake happened 2+ times

### Key File: `docs/video-learnings.md`

- Universal timing/spring/audio/hand patterns
- Per-composition notes
- Per-render history with what worked/failed

---

## External Tools Integration

### Currently Installed

| Tool                  | Access           | Use Case                              |
| --------------------- | ---------------- | ------------------------------------- |
| ElevenLabs            | MCP + Direct API | Voiceover TTS, voice cloning          |
| Perplexity            | MCP              | Research, style analysis, trends      |
| Remotion SFX          | Local files      | whoosh, whip, page-turn, click sounds |
| Remotion Agent Skills | Auto-loaded      | 37 best-practice rules                |

### Available to Add (free tiers)

| Tool               | Setup                       | Use Case                                  |
| ------------------ | --------------------------- | ----------------------------------------- |
| Image Gen (Gemini) | MCP server + Google API key | Generate scene backgrounds, illustrations |
| Figma MCP          | MCP server + Figma token    | Extract designs → Remotion components     |
| Suno / Udio        | mcpmarket skills            | Background music generation               |
| Blender MCP        | MCP server + Blender        | 3D assets for Three.js scenes             |

---

## Decision Guide: Which Method to Use?

```
Is it an app demo with phone UI?
  → YES → Method 1 (Phone Mockup)
  → NO ↓

Does it need voiceover narration?
  → YES → Method 3 (Narrated Explainer)
  → NO ↓

Is it based on a reference video?
  → YES → Method 4 (Reference Recreation)
  → NO ↓

Do you need multiple variations?
  → YES → Method 5 (Batch/Parametric)
  → NO ↓

Is it marketing/social content?
  → YES → Method 2 (Motion Graphics)
  → NO → Combine methods as needed
```

Always use Method 6 (Feedback Loop) after every render.
