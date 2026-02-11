import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { COLORS, PHONE } from '../constants';
import { SPRING_PRESETS } from '../springConfigs';

/**
 * IntroScene - Phone slides in from bottom
 * Duration: 35 frames (1.17s)
 */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides in from bottom with spring animation
  const springProgress = spring({
    frame,
    fps,
    config: SPRING_PRESETS.phoneEntrance,
  });

  const translateY = interpolate(springProgress, [0, 1], [PHONE.height + 200, 0]);
  const opacity = interpolate(frame, [0, 15], [0, 1], {
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
          screenshot="mobile-chat-1-empty.png"
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        />
      </div>
    </AbsoluteFill>
  );
};
