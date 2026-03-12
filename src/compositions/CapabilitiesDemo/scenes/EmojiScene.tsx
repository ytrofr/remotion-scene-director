/**
 * Scene 4: Animated Emoji Reactions
 * Demonstrates emoji overlay concept — uses native emoji with spring animations.
 * Note: @remotion/animated-emoji fetches Lottie from CDN (slow in preview).
 * For production, pre-download the Lottie files to public/lottie/ first.
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fontFamily } from '../../../lib/fonts';

const EMOJIS = [
  { char: '\u{1F525}', label: 'fire' },
  { char: '\u{1F60A}', label: 'smile' },
  { char: '\u{2728}', label: 'sparkles' },
  { char: '\u{1F680}', label: 'rocket' },
  { char: '\u{1F929}', label: 'star-struck' },
  { char: '\u{1F389}', label: 'party' },
];

const POSITIONS = [
  { x: 160, y: 350 },
  { x: 700, y: 280 },
  { x: 420, y: 550 },
  { x: 120, y: 750 },
  { x: 780, y: 650 },
  { x: 500, y: 900 },
];

export const EmojiScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
      }}
    >
      {/* Floating emojis with spring + float animation */}
      {EMOJIS.map((emoji, i) => {
        const delay = i * 6;
        const scale = spring({
          frame: frame - delay,
          fps,
          config: { damping: 8, stiffness: 100 },
        });
        const y = interpolate(frame - delay, [0, 90], [0, -80], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const rotation = interpolate(frame - delay, [0, 45, 90], [0, 15, -10], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={emoji.label}
            style={{
              position: 'absolute',
              left: POSITIONS[i].x,
              top: POSITIONS[i].y,
              fontSize: 120,
              transform: `scale(${scale * 1.2}) translateY(${y}px) rotate(${rotation}deg)`,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            }}
          >
            {emoji.char}
          </div>
        );
      })}

      {/* Title */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 72,
            fontWeight: 700,
            fontFamily,
            opacity: titleOpacity,
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          Animated Emoji
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 36,
            fontFamily,
            opacity: titleOpacity,
          }}
        >
          411 available via @remotion/animated-emoji
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
