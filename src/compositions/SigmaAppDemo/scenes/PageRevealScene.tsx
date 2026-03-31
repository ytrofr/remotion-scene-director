/**
 * Scene 3: Generated page reveal — crossfade from chat to the published Hebrew page,
 * then slow scroll down through the page.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
import { FONTS } from '../constants';

export const PageRevealScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Crossfade: chat fades out, page fades in (0-20 frames)
  const pageOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Slow scroll through the page (frames 20-240)
  // Hero image is 1920x1080, we scroll down to show services
  const scrollProgress = interpolate(frame, [30, 220], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // We stack hero + services images and scroll through them
  const totalHeight = 2160; // Two 1080 images stacked
  const viewportHeight = 1080;
  const maxScroll = totalHeight - viewportHeight;
  const scrollOffset = scrollProgress * maxScroll;

  // Subtle zoom
  const scale = interpolate(frame, [0, 240], [1.0, 1.03], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: '#ffffff' }}>
      {/* Scrolling page content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          opacity: pageOpacity,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `scale(${scale})`,
            transformOrigin: 'center top',
          }}
        >
          {/* Hero section */}
          <Img
            src={staticFile('sigma-demo/generated_page_hero.png')}
            style={{
              width: '100%',
              height: 1080,
              objectFit: 'cover',
              display: 'block',
              marginTop: -scrollOffset,
            }}
          />
          {/* Services section */}
          <Img
            src={staticFile('sigma-demo/generated_page_services.png')}
            style={{
              width: '100%',
              height: 1080,
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* "Grade A" badge overlay */}
      {frame >= 40 && (
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
            opacity: interpolate(frame, [40, 55], [0, 1], {
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.heading,
              fontSize: 18,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            A
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
              GQI 92 — Grade A
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 11,
                color: '#a1a1aa',
              }}
            >
              Generated in 90s | $0.0024
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
