/**
 * Scene 6: Sound Effects Demo
 * Demonstrates SFX library — hand cursor clicks with send-click.wav
 * Audio is handled via SceneDirector audio layers or coded audio registry.
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

const SFX_LIST = [
  { name: 'Whoosh', icon: '💨' },
  { name: 'Whip', icon: '⚡' },
  { name: 'Page Turn', icon: '📄' },
  { name: 'Switch', icon: '🔀' },
  { name: 'Mouse Click', icon: '🖱️' },
  { name: 'Shutter', icon: '📸' },
];

export const SfxClickScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 40,
      }}
    >
      {/* Title */}
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
        Sound Effects
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 36,
          fontFamily,
          opacity: titleOpacity,
          marginBottom: 20,
        }}
      >
        7 free SFX files
      </div>

      {/* SFX grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: 'center',
          maxWidth: 800,
          opacity: titleOpacity,
        }}
      >
        {SFX_LIST.map((sfx, i) => {
          const scale = spring({
            frame: frame - 15 - i * 5,
            fps,
            config: { damping: 12, stiffness: 120 },
          });
          return (
            <div
              key={sfx.name}
              style={{
                background: 'rgba(45, 212, 191, 0.15)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: 16,
                padding: '20px 30px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transform: `scale(${scale})`,
              }}
            >
              <span style={{ fontSize: 36 }}>{sfx.icon}</span>
              <span
                style={{
                  color: 'white',
                  fontSize: 28,
                  fontFamily,
                  fontWeight: 500,
                }}
              >
                {sfx.name}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
