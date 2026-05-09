import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

export const ProblemIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Phase 1: Typewriter headline (frames 0-50) ---
  const headlineText = 'Every small business depends on multiple vendors and tools';
  const charCount = Math.floor(
    interpolate(frame, [0, 50], [0, headlineText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const displayText = headlineText.substring(0, charCount);

  // Cursor blink
  const cursorVisible = frame < 55 && Math.floor(frame / 4) % 2 === 0;

  // Headline fade/zoom out to make room for pain points
  const headlineBlur = interpolate(frame, [55, 70], [0, 12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headlineScale = interpolate(frame, [55, 70], [1, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headlineOpacity = interpolate(frame, [55, 70], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- Phase 2: Pain points SLAM in (frames 65-110) ---
  const painPoints = [
    { text: 'EXPENSIVE', direction: 'left' as const },
    { text: 'PAINFULLY SLOW', direction: 'right' as const },
    { text: 'FRAGMENTED', direction: 'top' as const },
    { text: 'NO SHARED DATA', direction: 'bottom' as const },
  ];

  // Scene exit: everything zooms out + blur
  const exitBlur = interpolate(frame, [105, 120], [0, 20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [105, 120], [1, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(frame, [105, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        opacity: exitOpacity,
        filter: `blur(${exitBlur}px)`,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Label */}
      <div
        style={{
          position: 'absolute',
          top: 280,
          fontSize: 24,
          fontWeight: 500,
          fontFamily: FONTS.mono,
          color: COLORS.accent,
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        THE PROBLEM
      </div>

      {/* Typewriter headline */}
      <div
        style={{
          position: 'absolute',
          top: 400,
          left: 90,
          right: 90,
          fontSize: 72,
          fontWeight: 800,
          fontFamily: FONTS.heading,
          color: COLORS.text,
          textAlign: 'center',
          lineHeight: 1.15,
          opacity: headlineOpacity,
          filter: `blur(${headlineBlur}px)`,
          transform: `scale(${headlineScale})`,
        }}
      >
        {displayText}
        {cursorVisible && (
          <span style={{ color: COLORS.accent, fontWeight: 400 }}>|</span>
        )}
      </div>

      {/* Pain points that SLAM in from different directions */}
      <div
        style={{
          position: 'absolute',
          top: 500,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
        }}
      >
        {painPoints.map((point, i) => {
          const delay = 68 + i * 8;
          const pointSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 8, mass: 0.6, stiffness: 200 },
          });

          // Direction-based slide
          let translateX = 0;
          let translateY = 0;
          const slideAmount = 600;
          if (point.direction === 'left')
            translateX = interpolate(pointSpring, [0, 1], [-slideAmount, 0]);
          if (point.direction === 'right')
            translateX = interpolate(pointSpring, [0, 1], [slideAmount, 0]);
          if (point.direction === 'top')
            translateY = interpolate(pointSpring, [0, 1], [-slideAmount, 0]);
          if (point.direction === 'bottom')
            translateY = interpolate(pointSpring, [0, 1], [slideAmount, 0]);

          const pointOpacity = interpolate(frame, [delay, delay + 5], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Bounce overshoot scale
          const bounceScale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 6, mass: 0.4, stiffness: 300 },
          });

          return (
            <div
              key={point.text}
              style={{
                fontSize: 64,
                fontWeight: 900,
                fontFamily: FONTS.heading,
                color: COLORS.red,
                opacity: pointOpacity,
                transform: `translate(${translateX}px, ${translateY}px) scale(${bounceScale})`,
                textShadow: `0 0 60px ${COLORS.red}55, 0 0 120px ${COLORS.red}22`,
                letterSpacing: 2,
              }}
            >
              {point.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
