---
name: voiceover-pipeline
description: 'End-to-end narrated video pipeline: script writing, ElevenLabs TTS generation, optional Whisper transcription, caption overlay, and dynamic duration sizing. Use when adding voiceover narration or captions to any Remotion composition.'
---

# Voiceover Pipeline — Script to Narrated Video

## When to Use

- Adding narration/voiceover to a video composition
- Creating captions/subtitles from audio
- Building a narrated product demo or explainer
- Dynamic composition duration based on audio length

---

## Pipeline Steps

### 1. Write Script

Create a scene-by-scene script. Each scene gets its own audio file.

```ts
const SCRIPT = {
  intro: 'Welcome to Dorian, your AI-powered marketplace.',
  browse: 'Browse thousands of products with intelligent search.',
  chat: 'Get instant help from our AI assistant.',
  outro: 'Download Dorian today and start shopping smarter.',
};
```

### 2. Generate TTS (ElevenLabs)

```ts
// scripts/generate-voiceover.ts
import { writeFileSync } from 'fs';

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (default female)
// Other voices: EXAVITQu4vr4xnSDxMaL (Bella), ErXwobaYiN019PkySvjV (Antoni)

async function generateVoiceover(text: string, outputPath: string) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`TTS failed: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath} (${buffer.length} bytes)`);
}

// Generate all scenes
for (const [scene, text] of Object.entries(SCRIPT)) {
  await generateVoiceover(text, `public/voiceover/${scene}.mp3`);
}
```

Run with: `npx tsx scripts/generate-voiceover.ts`

### 3. Dynamic Duration from Audio

```tsx
import { CalculateMetadataFunction } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const durations = await Promise.all(
    props.scenes.map((scene) =>
      getAudioDurationInSeconds(staticFile(`voiceover/${scene}.mp3`)),
    ),
  );
  const totalSeconds = durations.reduce((sum, d) => sum + d, 0) + 2; // +2s padding
  return {
    durationInFrames: Math.ceil(totalSeconds * 30),
    props: { ...props, sceneDurations: durations },
  };
};
```

### 4. Add Captions (Optional)

#### From SRT file:

```tsx
import { parseSrt, createTikTokStyleCaptions } from '@remotion/captions';

const srtText = await fetch(staticFile('captions/intro.srt')).then((r) =>
  r.text(),
);
const { captions } = parseSrt({ input: srtText });
const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200,
});
```

#### Render caption page:

```tsx
const CaptionOverlay: React.FC<{ pages: TikTokPage[]; fps: number }> = ({
  pages,
  fps,
}) => {
  const frame = useCurrentFrame();
  const currentMs = (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', padding: 40 }}>
      {pages.map((page, i) => {
        if (currentMs < page.startMs || currentMs > page.endMs) return null;
        return (
          <div
            key={i}
            style={{ textAlign: 'center', fontSize: 48, fontWeight: 700 }}
          >
            {page.tokens.map((token, j) => (
              <span
                key={j}
                style={{
                  color:
                    token.fromMs <= currentMs && token.toMs > currentMs
                      ? '#39E508'
                      : 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {token.text}
              </span>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

### 5. Compose Scene with Audio

```tsx
import { Audio, Sequence, staticFile } from 'remotion';

const NarratedScene: React.FC<{
  sceneName: string;
  durationInFrames: number;
}> = ({ sceneName, durationInFrames }) => {
  return (
    <>
      <Sequence from={0} durationInFrames={durationInFrames}>
        <SceneContent name={sceneName} />
      </Sequence>
      <Sequence from={0} durationInFrames={durationInFrames}>
        <Audio src={staticFile(`voiceover/${sceneName}.mp3`)} />
      </Sequence>
    </>
  );
};
```

### 6. Add Light Leak Transitions

```tsx
import { TransitionSeries } from '@remotion/transitions';
import { LightLeak } from '@remotion/light-leaks';

<TransitionSeries>
  {scenes.map((scene, i) => (
    <React.Fragment key={scene.name}>
      <TransitionSeries.Sequence durationInFrames={scene.duration}>
        <NarratedScene
          sceneName={scene.name}
          durationInFrames={scene.duration}
        />
      </TransitionSeries.Sequence>
      {i < scenes.length - 1 && (
        <TransitionSeries.Overlay durationInFrames={20}>
          <LightLeak seed={i} hueShift={i * 60} />
        </TransitionSeries.Overlay>
      )}
    </React.Fragment>
  ))}
</TransitionSeries>;
```

---

## ElevenLabs Free Tier Limits

- 10,000 characters/month (~20 min audio)
- 3 custom voices
- API access included
- Monitor usage: `curl -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/user/subscription`

## File Conventions

- Voiceover: `public/voiceover/{scene-name}.mp3` (gitignored)
- Captions: `public/captions/{scene-name}.srt` or `.json`
- Scripts: `scripts/generate-voiceover.ts`
