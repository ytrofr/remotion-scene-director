/**
 * Scene 5: Motion Blur Trail Effect
 * Demonstrates @remotion/motion-blur — afterimage trail on moving elements
 */

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Trail } from '@remotion/motion-blur';
import { fontFamily } from '../../../lib/fonts';

const MovingCircle: React.FC = () => {
  const frame = useCurrentFrame();

  // Circle moves in a figure-8 pattern
  const t = (frame / 90) * Math.PI * 2;
  const x = Math.sin(t) * 300 + 540;
  const y = Math.sin(t * 2) * 200 + 700;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: x - 50,
          top: y - 50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2DD4BF, #14B8A6)',
          boxShadow: '0 0 30px rgba(45, 212, 191, 0.6)',
        }}
      />
    </AbsoluteFill>
  );
};

export const MotionBlurScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      }}
    >
      {/* Moving circle with trail effect */}
      <Trail layers={6} lagInFrames={0.3} trailOpacity={0.6}>
        <MovingCircle />
      </Trail>

      {/* Title */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexDirection: 'column',
          paddingBottom: 300,
          gap: 20,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 72,
            fontWeight: 700,
            fontFamily,
            opacity: titleOpacity,
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          Motion Blur
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 36,
            fontFamily,
            opacity: titleOpacity,
          }}
        >
          @remotion/motion-blur
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
