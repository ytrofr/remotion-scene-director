import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  staticFile,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

interface ScreenSceneProps {
  image: string;
  caption: string;
  isClosing?: boolean;
}

export const ScreenScene: React.FC<ScreenSceneProps> = ({
  image,
  caption,
  isClosing,
}) => {
  const frame = useCurrentFrame();

  // Fade in: 0-15 frames
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Subtle zoom: 1.0 → 1.02 over scene duration (slow Ken Burns)
  const scale = interpolate(frame, [0, 300], [1.0, 1.02], {
    extrapolateRight: 'clamp',
  });

  // Caption fade in: 10-30 frames
  const captionOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const captionY = interpolate(frame, [10, 30], [20, 0], {
    extrapolateRight: 'clamp',
  });

  if (isClosing) {
    return <ClosingScene frame={frame} caption={caption} image={image} />;
  }

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Screenshot with subtle zoom */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 80,
          overflow: 'hidden',
          opacity: fadeIn,
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Caption bar at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to top, rgba(9,9,11,1), rgba(9,9,11,0.95))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 60px',
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
        }}
      >
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 24,
            color: COLORS.text,
            textAlign: 'center',
            lineHeight: 1.5,
            letterSpacing: '0.02em',
          }}
        >
          {caption}
        </p>
      </div>

      {/* Top-left SIGMA badge */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          opacity: captionOpacity * 0.6,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTS.heading,
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {'Σ'}
        </div>
        <span
          style={{
            fontFamily: FONTS.heading,
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.textMuted,
            letterSpacing: 2,
          }}
        >
          SIGMA
        </span>
      </div>
    </AbsoluteFill>
  );
};

// Closing scene with fade to logo
const ClosingScene: React.FC<{
  frame: number;
  caption: string;
  image: string;
}> = ({ frame, caption, image }) => {
  // Phase 1: Show hub (0-180 frames = 6s)
  // Phase 2: Fade to dark + logo (180-270 = 3s transition)
  // Phase 3: Logo + tagline (270-720 = 15s)

  const hubOpacity = interpolate(frame, [0, 15, 180, 270], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  const logoOpacity = interpolate(frame, [210, 300], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const taglineOpacity = interpolate(frame, [330, 390], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const contactOpacity = interpolate(frame, [420, 480], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Hub screenshot fading out */}
      <div style={{ position: 'absolute', inset: 0, opacity: hubOpacity }}>
        <Img
          src={staticFile(image)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Logo reveal */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          opacity: logoOpacity,
        }}
      >
        {/* Sigma circle */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTS.heading,
            fontSize: 52,
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 0 60px rgba(139,92,246,0.4)',
          }}
        >
          {'Σ'}
        </div>

        {/* SIGMA wordmark */}
        <h1
          style={{
            fontFamily: FONTS.heading,
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.text,
            letterSpacing: 12,
            margin: 0,
          }}
        >
          SIGMA
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 28,
            color: COLORS.textMuted,
            opacity: taglineOpacity,
            margin: 0,
          }}
        >
          Agentify Your Business
        </p>

        {/* Caption */}
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 22,
            color: COLORS.accent,
            opacity: taglineOpacity,
            marginTop: 20,
          }}
        >
          {caption}
        </p>

        {/* Contact */}
        <div
          style={{
            opacity: contactOpacity,
            marginTop: 40,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: COLORS.textMuted,
            }}
          >
            jordan@example.com · +1 (555) 0142
          </p>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 14,
              color: '#71717a',
              marginTop: 8,
            }}
          >
            Pre-Seed · 2026
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
