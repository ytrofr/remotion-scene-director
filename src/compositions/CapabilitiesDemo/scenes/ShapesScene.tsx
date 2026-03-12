/**
 * Scene 2: SVG Shapes Animation
 * Demonstrates @remotion/shapes — animated SVG shapes with springs
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Star, Circle, Triangle } from '@remotion/shapes';
import { fontFamily } from '../../../lib/fonts';

export const ShapesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animations for each shape
  const starScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const circleScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  const triangleScale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  // Rotation
  const rotation = interpolate(frame, [0, 90], [0, 360]);

  const titleOpacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {/* Shapes row */}
      <div
        style={{
          display: 'flex',
          gap: 80,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 80,
        }}
      >
        <div
          style={{ transform: `scale(${starScale}) rotate(${rotation}deg)` }}
        >
          <Star points={5} innerRadius={60} outerRadius={140} fill="#FFD700" />
        </div>
        <div style={{ transform: `scale(${circleScale})` }}>
          <Circle radius={100} fill="#2DD4BF" />
        </div>
        <div
          style={{
            transform: `scale(${triangleScale}) rotate(${-rotation * 0.5}deg)`,
          }}
        >
          <Triangle length={200} direction="up" fill="#FF6B6B" />
        </div>
      </div>

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
        SVG Shapes
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 36,
          fontFamily,
          opacity: titleOpacity,
          marginTop: 20,
        }}
      >
        @remotion/shapes
      </div>
    </AbsoluteFill>
  );
};
