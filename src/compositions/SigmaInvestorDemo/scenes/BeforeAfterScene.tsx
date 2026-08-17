import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

export const BeforeAfterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [0, 8, 100, 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // BEFORE section springs in
  const beforeScale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.8 },
  });

  // Strikethrough animates across the old price
  const strikeWidth = interpolate(frame, [25, 40], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Arrow sweeps down with glow trail
  const arrowY = interpolate(frame, [35, 50], [-80, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const arrowOpacity = interpolate(frame, [35, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const arrowGlow = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // WITH SIGMA section
  const afterScale = spring({
    frame: frame - 45,
    fps,
    config: { damping: 10, mass: 0.8, stiffness: 180 },
  });
  const afterOpacity = interpolate(frame, [45, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // savings badge
  const badgeScale = spring({
    frame: frame - 70,
    fps,
    config: { damping: 6, mass: 0.5, stiffness: 250 },
  });
  const badgeOpacity = interpolate(frame, [70, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 80,
        opacity: containerOpacity,
      }}
    >
      {/* TOP: BEFORE */}
      <div
        style={{
          textAlign: 'center',
          transform: `scale(${beforeScale})`,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontFamily: FONTS.mono,
            color: COLORS.textMuted,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          BEFORE SIGMA
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            fontFamily: FONTS.heading,
            color: COLORS.red,
            position: 'relative',
            display: 'inline-block',
          }}
        >
          $2,750
          {/* Animated strikethrough */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: `${strikeWidth}%`,
              height: 8,
              background: COLORS.red,
              borderRadius: 4,
              transform: 'translateY(-50%)',
            }}
          />
        </div>
        <div
          style={{
            fontSize: 22,
            color: COLORS.textSecondary,
            fontFamily: FONTS.body,
            marginTop: 12,
          }}
        >
          per month
        </div>
      </div>

      {/* Arrow with glow trail */}
      <div
        style={{
          opacity: arrowOpacity,
          transform: `translateY(${arrowY}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 80,
            color: COLORS.accent,
            fontFamily: FONTS.body,
            textShadow: `0 0 ${40 * arrowGlow}px ${COLORS.accent}66, 0 ${20 * arrowGlow}px ${60 * arrowGlow}px ${COLORS.accent}33`,
          }}
        >
          {'\u2193'}
        </div>
      </div>

      {/* BOTTOM: WITH SIGMA */}
      <div
        style={{
          textAlign: 'center',
          transform: `scale(${afterScale})`,
          opacity: afterOpacity,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontFamily: FONTS.mono,
            color: COLORS.emerald,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          WITH SIGMA
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            fontFamily: FONTS.heading,
            color: COLORS.emerald,
            textShadow: `0 0 60px ${COLORS.emerald}44`,
          }}
        >
          $XXX
        </div>
        <div
          style={{
            fontSize: 22,
            color: COLORS.textSecondary,
            fontFamily: FONTS.body,
            marginTop: 12,
          }}
        >
          per month
        </div>
      </div>

      {/* savings badge */}
      <div
        style={{
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          borderRadius: 60,
          padding: '20px 56px',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            fontFamily: FONTS.heading,
            color: 'white',
            letterSpacing: 2,
          }}
        >
          XX% SAVINGS
        </div>
      </div>
    </AbsoluteFill>
  );
};
