/**
 * CapabilitiesDemo — Showcase of all new Remotion capabilities.
 *
 * Each scene demonstrates one package/feature:
 * 1. Noise Background (@remotion/noise)
 * 2. SVG Shapes (@remotion/shapes)
 * 3. Light Leak (@remotion/light-leaks)
 * 4. Animated Emoji (@remotion/animated-emoji)
 * 5. Motion Blur (@remotion/motion-blur)
 * 6. SFX Click (sound effects + hand cursor)
 * 7. Captions (@remotion/captions)
 *
 * Registered in Root.tsx + SceneDirector compositions.ts
 */

import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { AudioFromLayers } from '../SceneDirector/AudioLayerRenderer';
import { getCodedAudio } from '../SceneDirector/layers';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';
import { NoiseScene } from './scenes/NoiseScene';
import { ShapesScene } from './scenes/ShapesScene';
import { LightLeakScene } from './scenes/LightLeakScene';
import { EmojiScene } from './scenes/EmojiScene';
import { MotionBlurScene } from './scenes/MotionBlurScene';
import { SfxClickScene } from './scenes/SfxClickScene';
import { CaptionsScene } from './scenes/CaptionsScene';

export const CAPABILITIES_VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 630,
};

export const CAPABILITIES_SCENES = [
  { name: '1-NoiseBackground', start: 0, end: 90 },
  { name: '2-SVGShapes', start: 90, end: 180 },
  { name: '3-LightLeak', start: 180, end: 270 },
  { name: '4-AnimatedEmoji', start: 270, end: 360 },
  { name: '5-MotionBlur', start: 360, end: 450 },
  { name: '6-SFXClick', start: 450, end: 540 },
  { name: '7-Captions', start: 540, end: 630 },
];

/** Renders coded audio — skips in SceneDirector (audio layers handle it there) */
const CapabilitiesAudio: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of CAPABILITIES_SCENES) {
    const entries = getCodedAudio('CapabilitiesDemo', scene.name);
    for (const entry of entries) {
      const globalFrom = scene.start + entry.startFrame;
      audioElements.push(
        <Sequence
          key={`${scene.name}-${entry.file}-${entry.startFrame}`}
          from={globalFrom}
          durationInFrames={entry.durationInFrames}
        >
          <Audio src={staticFile(entry.file)} volume={entry.volume} />
        </Sequence>,
      );
    }
  }
  return <>{audioElements}</>;
};

export const CapabilitiesDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0a0a0a' }}>
      <CapabilitiesAudio />
      <AudioFromLayers />

      <Sequence from={0} durationInFrames={90} name="1-NoiseBackground">
        <NoiseScene />
      </Sequence>

      <Sequence from={90} durationInFrames={90} name="2-SVGShapes">
        <ShapesScene />
      </Sequence>

      <Sequence from={180} durationInFrames={90} name="3-LightLeak">
        <LightLeakScene />
      </Sequence>

      <Sequence from={270} durationInFrames={90} name="4-AnimatedEmoji">
        <EmojiScene />
      </Sequence>

      <Sequence from={360} durationInFrames={90} name="5-MotionBlur">
        <MotionBlurScene />
      </Sequence>

      <Sequence from={450} durationInFrames={90} name="6-SFXClick">
        <SfxClickScene />
      </Sequence>

      <Sequence from={540} durationInFrames={90} name="7-Captions">
        <CaptionsScene />
      </Sequence>
    </AbsoluteFill>
  );
};
