import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, VENDORS, FONTS } from '../constants';

export const VendorStackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene exit: all cards slide out to the left
  const exitSlide = interpolate(frame, [95, 115], [0, -1200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(frame, [95, 115], [1, 0], {
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
        gap: 24,
        opacity: exitOpacity,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 28,
          fontFamily: FONTS.mono,
          color: COLORS.accent,
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 20,
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        THE VENDOR STACK
      </div>

      {VENDORS.map((vendor, i) => {
        const delay = 8 + i * 10;

        // Slide in from right
        const slideX = interpolate(frame, [delay, delay + 18], [1100, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const cardSpring = spring({
          frame: frame - delay,
          fps,
          config: { damping: 10, mass: 0.5, stiffness: 180 },
        });

        const cardOpacity = interpolate(frame, [delay, delay + 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={vendor.name}
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.textMuted}33`,
              borderRadius: 20,
              padding: '24px 40px',
              width: 900,
              maxWidth: '90%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: cardOpacity,
              transform: `translateX(${slideX + exitSlide}px) scale(${cardSpring})`,
            }}
          >
            {/* Left: vendor name */}
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: FONTS.body,
                  color: COLORS.text,
                }}
              >
                {vendor.name}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontFamily: FONTS.mono,
                  color: COLORS.textMuted,
                  marginTop: 4,
                }}
              >
                {vendor.tool}
              </div>
            </div>

            {/* Right: cost */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                fontFamily: FONTS.mono,
                color: COLORS.red,
                textShadow: `0 0 30px ${COLORS.red}33`,
              }}
            >
              {vendor.cost}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
