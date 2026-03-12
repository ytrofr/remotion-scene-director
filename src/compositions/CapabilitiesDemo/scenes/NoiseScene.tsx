/**
 * Scene 1: Perlin Noise Animated Background
 * Demonstrates @remotion/noise — deterministic animated gradients
 */

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { noise3D } from '@remotion/noise';
import { fontFamily } from '../../../lib/fonts';

export const NoiseScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Generate animated gradient using Perlin noise
  const noiseVal1 = noise3D('color1', frame * 0.02, 0, 0);
  const noiseVal2 = noise3D('color2', 0, frame * 0.02, 0);
  const noiseVal3 = noise3D('color3', 0, 0, frame * 0.02);

  // Map noise [-1,1] to hue values for a shifting gradient
  const hue1 = interpolate(noiseVal1, [-1, 1], [160, 200]); // teal range
  const hue2 = interpolate(noiseVal2, [-1, 1], [260, 320]); // purple range
  const hue3 = interpolate(noiseVal3, [-1, 1], [20, 60]); // orange range

  const titleOpacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleOpacity = interpolate(frame, [10, 25, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg,
          hsl(${hue1}, 70%, 40%) 0%,
          hsl(${hue2}, 60%, 30%) 50%,
          hsl(${hue3}, 80%, 35%) 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 30,
      }}
    >
      <div
        style={{
          color: 'white',
          fontSize: 72,
          fontWeight: 700,
          fontFamily,
          opacity: titleOpacity,
          textAlign: 'center',
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        Perlin Noise
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: 36,
          fontFamily,
          opacity: subtitleOpacity,
          textAlign: 'center',
        }}
      >
        @remotion/noise
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: 28,
          fontFamily,
          opacity: subtitleOpacity,
          textAlign: 'center',
          maxWidth: 800,
          lineHeight: 1.4,
        }}
      >
        Deterministic animated gradients
      </div>
    </AbsoluteFill>
  );
};
