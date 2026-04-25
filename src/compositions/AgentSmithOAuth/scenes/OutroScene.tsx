import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../constants';

/**
 * 44-50s — Σ logo + AgentSmith wordmark + URL.
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoScale = spring({frame, fps, config: {damping: 13, mass: 0.6}});
  const wordmarkOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const urlOpacity = interpolate(frame, [40, 70], [0, 1], {
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
        gap: 50,
      }}
    >
      <div
        style={{
          width: 240,
          height: 240,
          borderRadius: 54,
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${logoScale})`,
          boxShadow: `0 0 160px ${COLORS.accent}55, 0 0 320px ${COLORS.accent}22`,
        }}
      >
        <div
          style={{
            fontSize: 132,
            fontWeight: 900,
            fontFamily: FONTS.body,
            color: 'white',
          }}
        >
          {'Σ'}
        </div>
      </div>

      <div
        style={{
          fontSize: 88,
          fontWeight: 700,
          fontFamily: FONTS.heading,
          color: COLORS.text,
          opacity: wordmarkOpacity,
          letterSpacing: -2,
        }}
      >
        AgentSmith
      </div>

      <div
        style={{
          fontSize: 34,
          fontFamily: FONTS.mono,
          color: COLORS.accentLight,
          opacity: urlOpacity,
        }}
      >
        agent.sigmafier.com
      </div>
    </AbsoluteFill>
  );
};
