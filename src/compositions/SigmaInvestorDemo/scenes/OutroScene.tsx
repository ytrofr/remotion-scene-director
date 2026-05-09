import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

// Particle/star positions (pre-computed for deterministic render)
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  x: ((i * 137.5) % 1080), // golden-angle distribution
  y: ((i * 251.7) % 1920),
  size: 2 + (i % 4),
  speed: 0.3 + (i % 5) * 0.15,
  delay: i * 3,
}));

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [0, 20, 190, 210], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo pulses with expanding rings (sonar effect)
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 10, mass: 1.2 },
  });

  // Sonar rings
  const ringCount = 3;
  const rings = Array.from({ length: ringCount }, (_, i) => {
    const ringDelay = 15 + i * 20;
    const ringScale = interpolate(
      frame,
      [ringDelay, ringDelay + 40],
      [0.5, 3],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const ringOpacity = interpolate(
      frame,
      [ringDelay, ringDelay + 15, ringDelay + 40],
      [0, 0.4, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    return { scale: ringScale, opacity: ringOpacity };
  });

  // "SIGMA" wordmark
  const wordmarkOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // "Your own AI agency" -- gradient
  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // "Agentify Your Business"
  const sloganOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Contact slides up from bottom
  const contactY = interpolate(frame, [70, 95], [80, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const contactOpacity = interpolate(frame, [70, 90], [0, 1], {
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
        gap: 24,
        opacity: containerOpacity,
      }}
    >
      {/* Subtle particle/star background */}
      {PARTICLES.map((p, i) => {
        const particleOpacity = interpolate(
          frame,
          [p.delay, p.delay + 10, p.delay + 60, p.delay + 80],
          [0, 0.6, 0.6, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const particleY = p.y - frame * p.speed;
        const wrappedY = ((particleY % 1920) + 1920) % 1920;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: wrappedY,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: COLORS.accent,
              opacity: particleOpacity * 0.4,
            }}
          />
        );
      })}

      {/* Expanding sonar rings */}
      {rings.map((ring, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: `2px solid ${COLORS.accent}`,
            transform: `scale(${ring.scale})`,
            opacity: ring.opacity,
          }}
        />
      ))}

      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accent}15 0%, transparent 70%)`,
          opacity: Math.sin(frame * 0.05) * 0.3 + 0.7,
        }}
      />

      {/* Logo */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 28,
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${logoScale})`,
          boxShadow: `0 0 80px ${COLORS.accent}44`,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: 'white',
            fontFamily: FONTS.body,
          }}
        >
          {'\u03A3'}
        </div>
      </div>

      {/* SIGMA wordmark */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 600,
          color: COLORS.text,
          fontFamily: FONTS.wordmark,
          letterSpacing: -2,
          opacity: wordmarkOpacity,
        }}
      >
        SIGMA
      </div>

      {/* Your own AI agency -- gradient */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 400,
          fontFamily: FONTS.body,
          background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: taglineOpacity,
        }}
      >
        Your own AI agency.
      </div>

      {/* Agentify Your Business */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 500,
          fontFamily: FONTS.heading,
          color: COLORS.textSecondary,
          opacity: sloganOpacity,
        }}
      >
        Agentify Your Business
      </div>

      {/* Contact info slides up */}
      <div
        style={{
          opacity: contactOpacity,
          transform: `translateY(${contactY}px)`,
          textAlign: 'center',
          marginTop: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: COLORS.textSecondary,
            fontFamily: FONTS.body,
          }}
        >
          jordan@example.com
        </div>
        <div
          style={{
            fontSize: 24,
            color: COLORS.textSecondary,
            fontFamily: FONTS.body,
          }}
        >
          +1 (555) 0142
        </div>
        <div
          style={{
            fontSize: 18,
            color: COLORS.textMuted,
            fontFamily: FONTS.body,
            marginTop: 8,
          }}
        >
          linkedin.com/in/jordan-avery
        </div>
      </div>
    </AbsoluteFill>
  );
};
