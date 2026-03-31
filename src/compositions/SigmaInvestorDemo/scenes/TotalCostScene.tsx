import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

export const TotalCostScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Count up from $0 to $2,750
  const targetAmount = 2750;
  const countUpValue = Math.floor(
    interpolate(frame, [0, 45], [0, targetAmount], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const displayAmount = `$${countUpValue.toLocaleString()}+`;

  // Red glow pulse
  const glowPulse =
    Math.sin(frame * 0.15) * 0.4 + 0.6;

  // Sub-text fade in after count finishes
  const subTextOpacity = interpolate(frame, [48, 58], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit: number shrinks while screen darkens
  const exitScale = interpolate(frame, [70, 90], [1, 0.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitBlur = interpolate(frame, [70, 90], [0, 15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Entrance scale spring for the number
  const entranceScale = interpolate(frame, [0, 8], [0.3, 1], {
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
        filter: `blur(${exitBlur}px)`,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Red glow background */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.red}25 0%, transparent 70%)`,
          opacity: glowPulse,
        }}
      />

      {/* Massive number */}
      <div
        style={{
          fontSize: 140,
          fontWeight: 900,
          fontFamily: FONTS.heading,
          color: COLORS.red,
          letterSpacing: -4,
          transform: `scale(${entranceScale})`,
          textShadow: `0 0 ${80 * glowPulse}px ${COLORS.red}66, 0 0 ${160 * glowPulse}px ${COLORS.red}33`,
        }}
      >
        {displayAmount}
      </div>

      {/* Sub text */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 400,
          fontFamily: FONTS.body,
          color: COLORS.textSecondary,
          textAlign: 'center',
          opacity: subTextOpacity,
        }}
      >
        per month, per business.
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 500,
          fontFamily: FONTS.body,
          color: COLORS.textMuted,
          textAlign: 'center',
          maxWidth: 800,
          opacity: subTextOpacity,
        }}
      >
        None of them share data.
      </div>
    </AbsoluteFill>
  );
};
