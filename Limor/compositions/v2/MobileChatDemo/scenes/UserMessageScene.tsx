import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { COLORS, PHONE } from '../constants';

/**
 * UserMessageScene - User prompt appears in chat
 * Duration: 30 frames (1s)
 * Scene 5 - Crossfade from input state to user message in chat
 *
 * IMPORTANT: Must match SendScene's ending zoom state (offsetX: 100)
 * and smoothly transition back to center
 */
export const UserMessageScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Crossfade from input to user message (frames 0-15)
  const crossfadeProgress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Smooth pan back to center (SendScene ends at offsetX: 100)
  // Transition over first 20 frames
  const zoomOffsetX = interpolate(frame, [0, 20], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Before: Input state with typed text */}
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
          transform: `scale(${PHONE.baseScale}) translateX(${zoomOffsetX / PHONE.baseScale}px)`,
          opacity: 1 - crossfadeProgress,
        }}
      >
        <PhoneMockup
          screenshot="mobile-chat-3-ready.png"
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        />
      </div>

      {/* After: User message appears in chat (no AI response) */}
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
          transform: `scale(${PHONE.baseScale}) translateX(${zoomOffsetX / PHONE.baseScale}px)`,
          opacity: crossfadeProgress,
        }}
      >
        <PhoneMockup
          screenshot="mobile-chat-user-message.png"
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        />
      </div>
    </AbsoluteFill>
  );
};
