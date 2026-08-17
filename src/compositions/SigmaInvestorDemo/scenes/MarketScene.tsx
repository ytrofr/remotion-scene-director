import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

const MARKET = [
  {
    label: 'TAM',
    value: '$XXB', // REDACTED
    numericValue: 0,
    desc: 'Global SMB services',
    color: COLORS.cyan,
    widthPercent: 100,
  },
  {
    label: 'SAM',
    value: '$X.XB', // REDACTED
    numericValue: 0,
    desc: 'AI-ready SMBs',
    color: COLORS.accent,
    widthPercent: 15,
  },
  {
    label: 'SOM',
    value: '$XXXM', // REDACTED
    numericValue: 0,
    desc: 'Year 3 target',
    color: COLORS.emerald,
    widthPercent: 2.2,
  },
];

export const MarketScene: React.FC = () => {
  const frame = useCurrentFrame();

  const containerOpacity = interpolate(frame, [0, 10, 100, 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const maxBarWidth = 800;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 80,
        opacity: containerOpacity,
        padding: '0 90px',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          fontFamily: FONTS.heading,
          color: COLORS.text,
          textAlign: 'center',
          opacity: titleOpacity,
        }}
      >
        The{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          $XXB+
        </span>{' '}
        opportunity
      </div>

      {/* Stacked bars */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 60,
          width: '100%',
          maxWidth: 900,
        }}
      >
        {MARKET.map((item, i) => {
          const delay = 15 + i * 25;

          // Bar grows from 0 to full width
          const barWidth = interpolate(
            frame,
            [delay, delay + 25],
            [0, (item.widthPercent / 100) * maxBarWidth],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Number fades in as bar reaches full size
          const numberOpacity = interpolate(
            frame,
            [delay + 20, delay + 28],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Label
          const labelOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div key={item.label} style={{ width: '100%' }}>
              {/* Label + desc */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 12,
                  opacity: labelOpacity,
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontFamily: FONTS.mono,
                    color: COLORS.textMuted,
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontFamily: FONTS.body,
                    color: COLORS.textSecondary,
                  }}
                >
                  {item.desc}
                </div>
              </div>

              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  height: 80,
                  background: `${COLORS.card}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: barWidth,
                    height: '100%',
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: barWidth > 0 ? 60 : 0,
                  }}
                />

                {/* Value overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 24,
                    opacity: numberOpacity,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      fontFamily: FONTS.heading,
                      color: 'white',
                      letterSpacing: -1,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
