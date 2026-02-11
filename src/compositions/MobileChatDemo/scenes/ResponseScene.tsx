import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { COLORS, PHONE } from '../constants';

/**
 * ResponseScene - AI response appears in chat
 * Duration: 60 frames (2s)
 * Scene 7 - AI response slides up from below while fading in
 */
export const ResponseScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade in the response (frames 0-20)
  const fadeProgress = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Slide up from below (starts 30px down, ends at 0)
  const slideY = interpolate(frame, [0, 25], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Glow fades in with response
  const glowOpacity = interpolate(frame, [5, 25], [0, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Background glow - fades in with response */}
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

      {/* Base layer: User message (stays visible as base) */}
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
          opacity: 1 - fadeProgress,
        }}
      >
        <PhoneMockup
          screenshot="mobile-chat-user-message.png"
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        />
      </div>

      {/* AI response - slides up from below while fading in */}
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
          transform: `scale(${PHONE.baseScale}) translateY(${slideY / PHONE.baseScale}px)`,
          opacity: fadeProgress,
        }}
      >
        <PhoneMockup
          screenshot="mobile-chat-5-response.png"
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.7}
        />
      </div>
    </AbsoluteFill>
  );
};
