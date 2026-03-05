/**
 * AudioTest — Minimal 2-scene composition for debugging audio in SceneDirector.
 *
 * Scene 1 (0-90): Blue, click sound at local frame 30 (global 30)
 * Scene 2 (90-180): Green, click sound at local frame 45 (global 135)
 *
 * Audio registry is in layers.ts (AUDIO_TEST_AUDIO → CODED_AUDIO_REGISTRY).
 * No hands, no zoom, no complexity. Just audio + colored backgrounds.
 */

import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { getCodedAudio } from '../SceneDirector/layers';
import { AudioFromLayers } from '../SceneDirector/AudioLayerRenderer';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';

export const AUDIO_TEST_VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 180,
};

export const AUDIO_TEST_SCENES = [
  { name: '1-Blue', start: 0, end: 90 },
  { name: '2-Green', start: 90, end: 180 },
];

const FrameDisplay: React.FC<{ label: string; color: string }> = ({
  label,
  color,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 40,
      }}
    >
      <div style={{ color: 'white', fontSize: 80, fontWeight: 'bold' }}>
        {label}
      </div>
      <div style={{ color: 'white', fontSize: 120, fontFamily: 'monospace' }}>
        f{frame}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 40 }}>
        {label === '1-Blue' ? 'Click at local f30' : 'Click at local f45'}
      </div>
    </AbsoluteFill>
  );
};

/** Renders coded audio — skips in SceneDirector (audio layers handle it there) */
const AudioTestAudio: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of AUDIO_TEST_SCENES) {
    const entries = getCodedAudio('AudioTest', scene.name);
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

export const AudioTest: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Coded audio (always renders) */}
      <AudioTestAudio />
      {/* User-added audio from SceneDirector (if any) */}
      <AudioFromLayers />

      <Sequence from={0} durationInFrames={90} name="1-Blue">
        <FrameDisplay label="1-Blue" color="#2563EB" />
      </Sequence>

      <Sequence from={90} durationInFrames={90} name="2-Green">
        <FrameDisplay label="2-Green" color="#16A34A" />
      </Sequence>
    </AbsoluteFill>
  );
};
