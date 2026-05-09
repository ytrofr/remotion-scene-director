import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../constants';

/**
 * 40-44s — Success card summarising what the user got out of the scope use.
 */
export const OutcomeScene: React.FC<{
  outcomeTitle: string;
  outcomeBody: string;
}> = ({outcomeTitle, outcomeBody}) => {
  const frame = useCurrentFrame();
  const cardOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardY = interpolate(frame, [0, 18], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
      }}
    >
      <div
        style={{
          maxWidth: 880,
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 96,
            marginBottom: 30,
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            fontFamily: FONTS.heading,
            color: COLORS.text,
            marginBottom: 28,
            lineHeight: 1.15,
          }}
        >
          {outcomeTitle}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            fontFamily: FONTS.body,
            color: COLORS.textSecondary,
            lineHeight: 1.45,
          }}
        >
          {outcomeBody}
        </div>
      </div>
    </AbsoluteFill>
  );
};
