import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS } from '../constants';
import { SPRING_PRESETS } from '../springConfigs';

/**
 * OutroScene - CTA overlay
 * Duration: 35 frames (1.17s)
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in animation
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Scale spring for logo
  const scaleSpring = spring({
    frame,
    fps,
    config: SPRING_PRESETS.bouncy,
  });

  // CTA button delayed entrance
  const ctaOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ctaScale = spring({
    frame: frame - 15,
    fps,
    config: SPRING_PRESETS.snappy,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(10, 10, 21, 0.95)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          color: COLORS.primary,
          marginBottom: 30,
          textShadow: `0 0 40px ${COLORS.glowCyan}`,
          transform: `scale(${scaleSpring})`,
          fontFamily: 'Heebo, Arial, sans-serif',
        }}
      >
        LIMOR AI
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 36,
          color: COLORS.white,
          marginBottom: 60,
          direction: 'rtl',
          fontFamily: 'Heebo, Arial, sans-serif',
        }}
      >
        מערכת ניהול עלויות חכמה
      </div>

      {/* CTA Button */}
      <div
        style={{
          padding: '20px 60px',
          backgroundColor: COLORS.primary,
          borderRadius: 12,
          fontSize: 32,
          fontWeight: 'bold',
          color: COLORS.background,
          direction: 'rtl',
          fontFamily: 'Heebo, Arial, sans-serif',
          opacity: ctaOpacity,
          transform: `scale(${Math.max(0, ctaScale)})`,
          boxShadow: `0 0 30px ${COLORS.glowCyan}`,
        }}
      >
        נסו עכשיו - limor.app
      </div>
    </AbsoluteFill>
  );
};
