/**
 * Scene 4b: Creative Studio reveal — crossfade from chat to the
 * Creative Studio agent page, showing the banner result in context.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
import { FONTS } from '../constants';

export const CreativeRevealScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Crossfade: chat fades out, creative page fades in (0-20 frames)
  const pageOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Subtle zoom on the page
  const scale = interpolate(frame, [0, 200], [1.0, 1.02], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: '#0f0f11' }}>
      {/* Creative Studio screenshot */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          opacity: pageOpacity,
        }}
      >
        <Img
          src={staticFile('sigma-demo/scene05_creative.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Agent badge overlay — Nano Banana */}
      {frame >= 30 && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            opacity: interpolate(frame, [30, 45], [0, 1], {
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.heading,
              fontSize: 16,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            N
          </div>
          <div>
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              Nano Banana — Creative Studio
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 11,
                color: '#a1a1aa',
              }}
            >
              Banners, logos, brand visuals | $0.001/image
            </div>
          </div>
        </div>
      )}

      {/* "2 agents, 1 conversation" callout */}
      {frame >= 80 && (
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            borderRadius: 14,
            padding: '12px 28px',
            opacity: interpolate(frame, [80, 95], [0, 1], {
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              textAlign: 'center',
            }}
          >
            2 agents. 1 conversation. Zero context switching.
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
