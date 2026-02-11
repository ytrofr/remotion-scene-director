/**
 * OutroScene - Phone exits, final branding
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, PHONE, SECTIONS } from '../constants';
import {
  PhoneFrame,
  ScrollableContent,
  GradientBackground,
  TopBranding,
  ProgressDots,
  BottomBranding,
} from './shared';

interface OutroSceneProps {
  durationInFrames: number;
  /** Final scroll position */
  finalScrollY: number;
}

export const OutroScene: React.FC<OutroSceneProps> = ({
  durationInFrames,
  finalScrollY,
}) => {
  const frame = useCurrentFrame();

  // Fade out animation
  const outroProgress = interpolate(
    frame,
    [0, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Phone exits downward (as outroProgress goes 1→0, phone moves down)
  const phoneY = interpolate(outroProgress, [0, 1], [200, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <GradientBackground />
      <TopBranding opacity={outroProgress} />

      {/* Phone exiting */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${phoneY}px)`,
          opacity: outroProgress,
        }}
      >
        <PhoneFrame scale={PHONE.baseScale}>
          <ScrollableContent scrollY={finalScrollY} />
        </PhoneFrame>
      </div>

      <ProgressDots
        currentIndex={SECTIONS.length - 1}
        totalSections={SECTIONS.length}
        opacity={outroProgress}
      />

      <BottomBranding opacity={outroProgress} />
    </AbsoluteFill>
  );
};

export default OutroScene;
