import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

const METRICS = [
  { target: 11, suffix: '', label: 'AI Agents', color: COLORS.accent },
  { target: 71, suffix: '+', label: 'Tools', color: COLORS.cyan },
  { target: 19, suffix: '', label: 'Integrations', color: COLORS.emerald },
  { target: 300, suffix: '+', label: 'SMBs Validated', color: COLORS.amber },
];

// Corner positions for 2x2 grid fly-in (relative to grid center)
const CORNERS = [
  { fromX: -600, fromY: -600 }, // top-left
  { fromX: 600, fromY: -600 }, // top-right
  { fromX: -600, fromY: 600 }, // bottom-left
  { fromX: 600, fromY: 600 }, // bottom-right
];

export const MetricsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [0, 8, 100, 120], [0, 1, 1, 0], {
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
        gap: 48,
        opacity: containerOpacity,
      }}
    >
      {/* Title */}
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
        BUILT. WORKING. READY TO SCALE.
      </div>

      {/* 2x2 Grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          justifyContent: 'center',
          maxWidth: 900,
        }}
      >
        {METRICS.map((metric, i) => {
          const delay = 10 + i * 12;
          const corner = CORNERS[i];

          // Fly in from corners
          const flyX = interpolate(frame, [delay, delay + 20], [corner.fromX, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const flyY = interpolate(frame, [delay, delay + 20], [corner.fromY, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const cardOpacity = interpolate(frame, [delay, delay + 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const cardScale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 10, mass: 0.5, stiffness: 180 },
          });

          // Count up number
          const countStart = delay + 5;
          const countEnd = delay + 30;
          const countValue = Math.floor(
            interpolate(frame, [countStart, countEnd], [0, metric.target], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          );

          return (
            <div
              key={metric.label}
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.textMuted}33`,
                borderRadius: 24,
                padding: '48px 40px',
                textAlign: 'center',
                width: 380,
                opacity: cardOpacity,
                transform: `translate(${flyX}px, ${flyY}px) scale(${cardScale})`,
              }}
            >
              <div
                style={{
                  fontSize: 80,
                  fontWeight: 900,
                  fontFamily: FONTS.heading,
                  background: `linear-gradient(135deg, ${metric.color}, ${COLORS.accent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                }}
              >
                {countValue}
                {metric.suffix}
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: COLORS.textSecondary,
                  fontFamily: FONTS.body,
                  marginTop: 12,
                }}
              >
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: 24,
          color: COLORS.textSecondary,
          fontFamily: FONTS.body,
          textAlign: 'center',
          opacity: interpolate(frame, [70, 85], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Not a prototype -- a production-grade AI agency.
      </div>
    </AbsoluteFill>
  );
};
