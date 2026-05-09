import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

export const TransitionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line 1: "What if you had" - fade + slide up
  const line1Opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line1Y = interpolate(frame, [0, 15], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Line 2: "your own" - zoom in
  const line2Scale = spring({
    frame: frame - 18,
    fps,
    config: { damping: 8, mass: 0.8, stiffness: 200 },
  });
  const line2Opacity = interpolate(frame, [18, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Line 3: "AI agency?" - scale up with gradient glow
  const line3Scale = spring({
    frame: frame - 35,
    fps,
    config: { damping: 6, mass: 1.0, stiffness: 150 },
  });
  const line3Opacity = interpolate(frame, [35, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glow behind "AI agency?"
  const glowIntensity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit: everything scales up to 3x and fades (zoom through)
  const exitScale = interpolate(frame, [70, 90], [1, 3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24,
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Glow background */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accent}20 0%, ${COLORS.cyan}10 40%, transparent 70%)`,
          opacity: glowIntensity,
        }}
      />

      {/* Line 1 */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 400,
          fontFamily: FONTS.heading,
          color: COLORS.textSecondary,
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
        }}
      >
        What if you had
      </div>

      {/* Line 2 */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          fontFamily: FONTS.heading,
          color: COLORS.text,
          opacity: line2Opacity,
          transform: `scale(${line2Scale})`,
        }}
      >
        your own
      </div>

      {/* Line 3 */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          fontFamily: FONTS.heading,
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: line3Opacity,
          transform: `scale(${line3Scale})`,
          textShadow: `0 0 ${100 * glowIntensity}px ${COLORS.accent}44`,
        }}
      >
        AI agency?
      </div>
    </AbsoluteFill>
  );
};
