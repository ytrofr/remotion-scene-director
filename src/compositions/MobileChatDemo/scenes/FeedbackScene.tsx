import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { TouchAnimation, createTouchPath } from '../../../components/TouchAnimation';
import { COLORS, PHONE, COORDINATES } from '../constants';

/**
 * FeedbackScene - Tap thumbs up
 * Duration: 30 frames (1s)
 * Scene 7 - Static glow, no pulse
 */
export const FeedbackScene: React.FC = () => {
  // Touch path - tap thumbs up
  const touchPath = createTouchPath(
    [
      { x: COORDINATES.thumbsUp.x, y: COORDINATES.thumbsUp.y, tap: true },
    ],
    15,
    5 // Small delay before tap
  );

  // Static glow - no animation
  const glowOpacity = 0.15;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Background glow - static */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 40%, rgba(0, 217, 255, ${glowOpacity}) 0%, transparent 50%)`,
        }}
      />

      {/* Phone mockup */}
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
          transform: `scale(${PHONE.baseScale})`,
        }}
      >
        <PhoneMockup
          screenshot="mobile-chat-5-response.png"
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        >
          {/* Thumbs up tap animation */}
          <TouchAnimation
            path={touchPath}
            startFrame={0}
            fingerSize={45}
            rippleColor={COLORS.primary}
          />
        </PhoneMockup>
      </div>
    </AbsoluteFill>
  );
};
