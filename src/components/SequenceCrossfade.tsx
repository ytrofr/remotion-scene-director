/**
 * SequenceCrossfade — Opacity crossfade wrapper for Sequence-based layouts
 * Use when you can't use TransitionSeries (e.g., overlapping content).
 */
import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';

export interface SequenceCrossfadeProps {
  children: React.ReactNode;
  /** Frame to start this sequence */
  from: number;
  /** Total duration of this sequence */
  durationInFrames: number;
  /** Fade-in frames at start (default 15) */
  fadeIn?: number;
  /** Fade-out frames at end (default 15) */
  fadeOut?: number;
}

const CrossfadeContent: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  fadeIn: number;
  fadeOut: number;
}> = ({ children, durationInFrames, fadeIn, fadeOut }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const SequenceCrossfade: React.FC<SequenceCrossfadeProps> = ({
  children,
  from,
  durationInFrames,
  fadeIn = 15,
  fadeOut = 15,
}) => {
  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <CrossfadeContent
        durationInFrames={durationInFrames}
        fadeIn={fadeIn}
        fadeOut={fadeOut}
      >
        {children}
      </CrossfadeContent>
    </Sequence>
  );
};
