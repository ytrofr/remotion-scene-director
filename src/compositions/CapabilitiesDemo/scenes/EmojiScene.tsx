/**
 * Scene 4: Animated Emoji Reactions
 * Demonstrates @remotion/animated-emoji — 411 animated Google Fonts emojis
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { AnimatedEmoji } from '@remotion/animated-emoji';
import { fontFamily } from '../../../lib/fonts';

const EMOJIS = ['fire', 'smile', 'sparkles', 'rocket', 'star-struck'] as const;

const POSITIONS = [
  { x: 200, y: 400 },
  { x: 750, y: 300 },
  { x: 450, y: 600 },
  { x: 150, y: 800 },
  { x: 800, y: 700 },
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
      {/* Floating emojis */}
      {EMOJIS.map((emoji, i) => {
        const delay = i * 8;
        const scale = spring({
          frame: frame - delay,
          fps,
          config: { damping: 8, stiffness: 100 },
        });
        const y = interpolate(frame - delay, [0, 90], [0, -100], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={emoji}
            style={{
              position: 'absolute',
              left: POSITIONS[i].x,
              top: POSITIONS[i].y,
              transform: `scale(${scale * 1.5}) translateY(${y}px)`,
            }}
          >
            <AnimatedEmoji emoji={emoji} />
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
          411 animated emojis
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
