import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

export const TheAskScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [0, 10, 130, 150], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // "$X,XXX,XXX" types in digit by digit like a cash register
  const fullAmount = '$X,XXX,XXX';
  const digitCount = Math.floor(
    interpolate(frame, [10, 50], [0, fullAmount.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const displayAmount = fullAmount.substring(0, digitCount);

  // Flash/glow on each new digit
  const lastDigitFrame = Math.floor(
    interpolate(digitCount, [0, fullAmount.length], [10, 50])
  );
  const digitGlow =
    frame > 10 && frame < 55
      ? interpolate(
          (frame - lastDigitFrame) % 5,
          [0, 2, 5],
          [1, 0.3, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 0;

  // Pulsing gradient glow behind the number
  const glowPulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  // 50/50 cards slide in
  const leftCardX = interpolate(frame, [55, 75], [-600, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rightCardX = interpolate(frame, [55, 75], [600, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardsOpacity = interpolate(frame, [55, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardScale = spring({
    frame: frame - 55,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 180 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 48,
        opacity: containerOpacity,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 24,
          fontFamily: FONTS.mono,
          color: COLORS.accent,
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        PRE-SEED ROUND
      </div>

      {/* Gradient glow background */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accent}20 0%, ${COLORS.cyan}10 40%, transparent 70%)`,
          opacity: glowPulse,
        }}
      />

      {/* Cash register number */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          fontFamily: FONTS.heading,
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: -2,
          textShadow: `0 0 ${60 * digitGlow}px ${COLORS.accent}55`,
          minHeight: 120,
        }}
      >
        {displayAmount}
      </div>

      {/* 50/50 cards */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          opacity: cardsOpacity,
        }}
      >
        {/* R&D card */}
        <div
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.textMuted}33`,
            borderRadius: 24,
            padding: '40px 56px',
            textAlign: 'center',
            transform: `translateX(${leftCardX}px) scale(${cardScale})`,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: COLORS.accent,
              fontFamily: FONTS.heading,
            }}
          >
            50%
          </div>
          <div
            style={{
              fontSize: 24,
              color: COLORS.textSecondary,
              fontFamily: FONTS.body,
              marginTop: 12,
            }}
          >
            R&D
          </div>
        </div>

        {/* Go-to-Market card */}
        <div
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.textMuted}33`,
            borderRadius: 24,
            padding: '40px 56px',
            textAlign: 'center',
            transform: `translateX(${rightCardX}px) scale(${cardScale})`,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: COLORS.cyan,
              fontFamily: FONTS.heading,
            }}
          >
            50%
          </div>
          <div
            style={{
              fontSize: 24,
              color: COLORS.textSecondary,
              fontFamily: FONTS.body,
              marginTop: 12,
            }}
          >
            Go-to-Market
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
