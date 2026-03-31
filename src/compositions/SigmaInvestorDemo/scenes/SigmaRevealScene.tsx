import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

export const SigmaRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo starts tiny, ZOOMS to fill center
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 8, mass: 1.5, stiffness: 120 },
  });
  const logoSizeScale = interpolate(frame, [0, 25], [0.1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Radial glow expands behind logo
  const glowRadius = interpolate(frame, [5, 40], [0, 800], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glowOpacity = interpolate(frame, [5, 20, 60, 90], [0, 0.8, 0.6, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // "SIGMA" wordmark with letter-spacing animation (wide to tight)
  const wordmarkOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const letterSpacing = interpolate(frame, [30, 55], [40, -2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtitle slides up from bottom
  const subtitleY = interpolate(frame, [50, 70], [120, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit: everything shrinks to a point
  const exitScale = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(frame, [100, 120], [1, 0], {
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
        gap: 32,
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Expanding radial glow */}
      <div
        style={{
          position: 'absolute',
          width: glowRadius,
          height: glowRadius,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accent}30 0%, ${COLORS.cyan}15 40%, transparent 70%)`,
          opacity: glowOpacity,
          transition: 'none',
        }}
      />

      {/* Logo mark */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: 36,
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${logoScale * logoSizeScale})`,
          boxShadow: `0 0 ${100 * glowOpacity}px ${COLORS.accent}55, 0 0 ${200 * glowOpacity}px ${COLORS.accent}22`,
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            fontFamily: FONTS.body,
            color: 'white',
          }}
        >
          {'\u03A3'}
        </div>
      </div>

      {/* SIGMA wordmark */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 600,
          fontFamily: FONTS.wordmark,
          color: COLORS.text,
          opacity: wordmarkOpacity,
          letterSpacing,
        }}
      >
        SIGMA
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 400,
          fontFamily: FONTS.body,
          color: COLORS.textSecondary,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          textAlign: 'center',
          maxWidth: 800,
          lineHeight: 1.4,
        }}
      >
        Your own AI agency. They learn your business,{'\n'}
        share knowledge, and deliver.
      </div>
    </AbsoluteFill>
  );
};
