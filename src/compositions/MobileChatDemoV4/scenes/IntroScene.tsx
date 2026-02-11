import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { COLORS, PHONE, SCREENSHOTS } from '../constants';

/**
 * IntroScene - Phone slides in from bottom
 * Duration: 35 frames
 * Scene 1 - Shows chat with existing Q&A (first conversation)
 */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides in from bottom with spring
  const slideProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  const translateY = interpolate(slideProgress, [0, 1], [600, 0]);
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${PHONE.baseScale}) translateY(${translateY / PHONE.baseScale}px)`,
          opacity,
        }}
      >
        <PhoneMockup
          screenshot={SCREENSHOTS.chatWithResponse}
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        />
      </div>
    </AbsoluteFill>
  );
};
