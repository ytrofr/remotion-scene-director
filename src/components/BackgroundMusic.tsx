/**
 * BackgroundMusic — Looping music track with fade-in/out and ducking
 * Render alongside your composition content for ambient audio.
 */
import React from 'react';
import { Audio, Loop, useVideoConfig } from 'remotion';
import {
  computeVolumeAtFrame,
  computeDuckingAtFrame,
  type DuckTrigger,
} from '../lib/audioEnvelope';

export interface BackgroundMusicProps {
  /** Audio source (use staticFile()) */
  src: string;
  /** Base volume (default 0.15 per mixing standards) */
  volume?: number;
  /** Frames to fade in at start (default 30) */
  fadeInFrames?: number;
  /** Frames to fade out at end (default 60) */
  fadeOutFrames?: number;
  /** Ducking triggers — reduce music during voiceover/SFX */
  duckTriggers?: DuckTrigger[];
  /** Loop duration in frames (default: loops to fill composition) */
  loopDuration?: number;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src,
  volume = 0.15,
  fadeInFrames = 30,
  fadeOutFrames = 60,
  duckTriggers = [],
  loopDuration,
}) => {
  const { durationInFrames } = useVideoConfig();

  const volumeCallback = (frame: number): number => {
    // Base envelope (fade in/out)
    const envelopeVolume = computeVolumeAtFrame(frame, {
      baseVolume: volume,
      fadeInFrames,
      fadeOutFrames,
      totalFrames: durationInFrames,
    });

    // Apply ducking
    const duckMultiplier = computeDuckingAtFrame(frame, duckTriggers);

    return envelopeVolume * duckMultiplier;
  };

  if (loopDuration) {
    return (
      <Loop durationInFrames={loopDuration}>
        <Audio src={src} volume={volumeCallback} />
      </Loop>
    );
  }

  return <Audio src={src} volume={volumeCallback} />;
};
