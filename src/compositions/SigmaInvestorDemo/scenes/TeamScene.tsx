import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, TEAM, FONTS } from '../constants';

export const TeamScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [0, 10, 130, 150], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Quote at bottom
  const quoteOpacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const quoteY = interpolate(frame, [80, 100], [40, 0], {
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
        padding: '0 60px',
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
          opacity: titleOpacity,
        }}
      >
        THE TEAM
      </div>

      {/* Team members stacked vertically */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 36,
          alignItems: 'center',
          width: '100%',
          maxWidth: 900,
        }}
      >
        {TEAM.map((member, i) => {
          const delay = 10 + i * 18;

          // First slides from left, second from right
          const slideDir = i === 0 ? -1 : 1;
          const slideX = interpolate(
            frame,
            [delay, delay + 20],
            [600 * slideDir, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const cardOpacity = interpolate(
            frame,
            [delay, delay + 10],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const cardScale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 10, mass: 0.5, stiffness: 180 },
          });

          return (
            <div
              key={member.name}
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.textMuted}33`,
                borderRadius: 28,
                padding: '40px 48px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 32,
                opacity: cardOpacity,
                transform: `translateX(${slideX}px) scale(${cardScale})`,
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: member.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                  fontWeight: 800,
                  color: 'white',
                  fontFamily: FONTS.body,
                  flexShrink: 0,
                }}
              >
                {member.initials}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: COLORS.text,
                    fontFamily: FONTS.heading,
                  }}
                >
                  {member.name}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: member.roleColor,
                    fontFamily: FONTS.body,
                    marginBottom: 12,
                    fontWeight: 600,
                  }}
                >
                  {member.role}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: COLORS.textSecondary,
                    fontFamily: FONTS.body,
                    lineHeight: 1.6,
                  }}
                >
                  {member.bio}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quote with gradient border */}
      <div
        style={{
          opacity: quoteOpacity,
          transform: `translateY(${quoteY}px)`,
          background: COLORS.card,
          borderRadius: 20,
          padding: '28px 48px',
          maxWidth: 900,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient top border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
          }}
        />
        <span
          style={{
            color: COLORS.textSecondary,
            fontSize: 22,
            fontFamily: FONTS.body,
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          "We're not AI researchers who discovered a market. We're{' '}
          <strong style={{ color: COLORS.text }}>
            market experts who discovered AI
          </strong>
          ."
        </span>
      </div>
    </AbsoluteFill>
  );
};
