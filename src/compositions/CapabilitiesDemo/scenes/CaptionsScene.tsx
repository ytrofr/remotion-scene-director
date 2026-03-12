/**
 * Scene 7: TikTok-Style Captions Demo
 * Demonstrates @remotion/captions — word-by-word animated subtitles
 * Shows a simulated caption sequence (no audio needed for visual demo)
 */

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { fontFamily } from '../../../lib/fonts';

const WORDS = [
  { text: 'Create', start: 5, end: 20 },
  { text: 'stunning', start: 15, end: 30 },
  { text: 'videos', start: 25, end: 40 },
  { text: 'with', start: 35, end: 50 },
  { text: 'AI-powered', start: 45, end: 60 },
  { text: 'captions', start: 55, end: 75 },
];

export const CaptionsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 10, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0c0c0c 0%, #1a1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 60,
      }}
    >
      {/* Title */}
      <div
        style={{
          color: 'white',
          fontSize: 64,
          fontWeight: 700,
          fontFamily,
          opacity: titleOpacity,
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        TikTok Captions
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 32,
          fontFamily,
          opacity: titleOpacity,
        }}
      >
        @remotion/captions
      </div>

      {/* Caption display area */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'center',
          maxWidth: 900,
          padding: '40px 60px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 24,
          opacity: titleOpacity,
        }}
      >
        {WORDS.map((word) => {
          const isActive = frame >= word.start && frame <= word.end;
          const appeared = frame >= word.start;
          const wordOpacity = appeared
            ? interpolate(frame, [word.start, word.start + 5], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 0;
          const wordScale = appeared
            ? interpolate(frame, [word.start, word.start + 5], [0.8, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 0.8;

          return (
            <span
              key={word.text}
              style={{
                fontSize: 56,
                fontWeight: 800,
                fontFamily,
                color: isActive ? '#2DD4BF' : 'white',
                opacity: wordOpacity,
                transform: `scale(${wordScale})`,
                transition: 'color 0.1s',
                textShadow: isActive
                  ? '0 0 20px rgba(45, 212, 191, 0.5)'
                  : 'none',
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
