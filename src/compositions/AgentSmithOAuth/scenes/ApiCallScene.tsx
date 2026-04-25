import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../constants';

/**
 * 37-40s — Code-style card showing the literal Google API endpoint(s) called.
 * Reviewer wants to see exactly which API the scope drives.
 */
export const ApiCallScene: React.FC<{
  apiCall: string;
  apiNotes: string;
}> = ({apiCall, apiNotes}) => {
  const frame = useCurrentFrame();
  const cardScale = interpolate(frame, [0, 12], [0.85, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardOpacity = interpolate(frame, [0, 14], [0, 1], {
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
        padding: '0 80px',
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontFamily: FONTS.heading,
          color: COLORS.textSecondary,
          marginBottom: 36,
          fontWeight: 500,
          letterSpacing: 0.4,
        }}
      >
        Google API call
      </div>

      <div
        style={{
          background: COLORS.card,
          border: '1px solid #2a2a32',
          borderRadius: 18,
          padding: '40px 48px',
          maxWidth: 920,
          width: '100%',
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: FONTS.mono,
            fontSize: 28,
            lineHeight: 1.5,
            color: COLORS.cyan,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {apiCall}
        </pre>
      </div>

      <div
        style={{
          marginTop: 50,
          fontSize: 26,
          fontFamily: FONTS.body,
          color: COLORS.textSecondary,
          fontWeight: 400,
          maxWidth: 900,
          textAlign: 'center',
          lineHeight: 1.4,
          opacity: cardOpacity,
        }}
      >
        {apiNotes}
      </div>
    </AbsoluteFill>
  );
};
