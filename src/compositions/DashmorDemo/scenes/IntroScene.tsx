/**
 * IntroScene - Phone enters from bottom
 */
import React from 'react';
import { AbsoluteFill, spring, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, PHONE, SECTIONS } from '../constants';
import { PhoneFrame, ScrollableContent, GradientBackground, TopBranding, ProgressDots } from './shared';

interface IntroSceneProps {
  durationInFrames: number;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone entrance animation
  const introProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const phoneY = interpolate(introProgress, [0, 1], [400, 0]);
  const phoneOpacity = introProgress;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <GradientBackground />
      <TopBranding opacity={introProgress} />

      {/* Phone entering */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${phoneY}px)`,
          opacity: phoneOpacity,
        }}
      >
        <PhoneFrame scale={PHONE.baseScale}>
          <ScrollableContent scrollY={0} />
        </PhoneFrame>
      </div>

      <ProgressDots currentIndex={0} totalSections={SECTIONS.length} opacity={introProgress} />
    </AbsoluteFill>
  );
};

export default IntroScene;
