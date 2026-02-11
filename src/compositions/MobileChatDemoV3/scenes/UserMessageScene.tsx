import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { COLORS, PHONE, SCREENSHOTS } from '../constants';

/**
 * UserMessageScene - User prompt appears in chat
 * Duration: 30 frames
 * Scene 5 - Crossfade from ready-to-send to user message with smooth pan
 */
export const UserMessageScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Crossfade (frames 0-15)
  const crossfadeProgress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Smooth pan back to center (SendScene ends at offsetX: 100)
  const zoomOffsetX = interpolate(frame, [0, 20], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Before: Ready to send state */}
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
          screenshot={SCREENSHOTS.readyToSend}
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        />
      </div>

      {/* After: User message appears */}
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
          screenshot={SCREENSHOTS.userMessage}
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        />
      </div>
    </AbsoluteFill>
  );
};
