import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, TEXT_CONTENT, SPRING_CONFIG } from '../constants';
import { DorianLogo } from '../../../components/DorianPhone/DorianLogo';
import { fontFamily } from '../../../lib/fonts';

// Scene 10: Outro
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  const taglineOpacity = spring({
    frame: frame - 25,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  const ctaOpacity = spring({
    frame: frame - 50,
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
        gap: 50,
      }}
    >
      <div style={{ transform: `scale(${logoScale})` }}>
        <DorianLogo size={200} />
      </div>

      <div
        style={{
          opacity: taglineOpacity,
          fontSize: 48,
          fontWeight: 500,
          color: COLORS.textLight,
          fontFamily,
        }}
      >
        {TEXT_CONTENT.outro.tagline}
      </div>

      <div
        style={{
          opacity: ctaOpacity,
          background: COLORS.primary,
          padding: '25px 60px',
          borderRadius: 50,
          fontSize: 36,
          fontWeight: 700,
          color: COLORS.white,
          fontFamily,
        }}
      >
        {TEXT_CONTENT.outro.cta}
      </div>
    </AbsoluteFill>
  );
};
