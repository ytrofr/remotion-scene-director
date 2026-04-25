import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../constants';

/**
 * 0-3s — Σ logo expands + glows + scope title fades in.
 * Reuses Sigma brand spec (purple→cyan gradient, white Σ).
 */
export const IntroScene: React.FC<{
  scopeTitle: string;
  scopeSubtitle: string;
}> = ({scopeTitle, scopeSubtitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoScale = spring({frame, fps, config: {damping: 11, mass: 0.7}});
  const logoSizeScale = interpolate(frame, [0, 25], [0.1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glowOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleOpacity = interpolate(frame, [45, 65], [0, 1], {
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
        flexDirection: 'column',
        gap: 40,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: 50,
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${logoScale * logoSizeScale})`,
          boxShadow: `0 0 ${120 * glowOpacity}px ${COLORS.accent}55, 0 0 ${240 * glowOpacity}px ${COLORS.accent}22`,
        }}
      >
        <div
          style={{
            fontSize: 124,
            fontWeight: 900,
            fontFamily: FONTS.body,
            color: 'white',
            lineHeight: 1,
          }}
        >
          {'Σ'}
        </div>
      </div>

      {/* AgentSmith wordmark */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          fontFamily: FONTS.heading,
          color: COLORS.text,
          opacity: titleOpacity,
          letterSpacing: -1,
        }}
      >
        AgentSmith
      </div>

      {/* Scope title + subtitle */}
      <div
        style={{
          textAlign: 'center',
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 46,
            fontWeight: 600,
            fontFamily: FONTS.heading,
            color: COLORS.text,
            marginBottom: 18,
          }}
        >
          {scopeTitle}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            fontFamily: FONTS.mono,
            color: COLORS.accentLight,
            opacity: subtitleOpacity,
          }}
        >
          {scopeSubtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
