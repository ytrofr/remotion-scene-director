import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { COLORS, TEXT_CONTENT, SPRING_CONFIG } from '../constants';
import { DorianLogo } from '../../../components/DorianPhone/DorianLogo';
import { fontFamily } from '../../../lib/fonts';

// Scene 1: Intro
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  const subtitleOpacity = spring({
    frame: frame - 20,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.white,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      <div style={{ transform: `scale(${logoScale})` }}>
        <DorianLogo size={180} />
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          fontSize: 48,
          color: COLORS.primary,
          fontWeight: 500,
          letterSpacing: 8,
          fontFamily,
        }}
      >
        {TEXT_CONTENT.intro.subtitle.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};
