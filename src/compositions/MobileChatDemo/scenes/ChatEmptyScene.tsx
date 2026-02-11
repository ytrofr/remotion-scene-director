import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { COLORS, PHONE } from '../constants';

/**
 * ChatEmptyScene - Show empty chat UI with brand title
 * Duration: 45 frames (1.5s)
 */
export const ChatEmptyScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Phone mockup centered */}
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
          screenshot="mobile-chat-1-empty.png"
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        />
      </div>

    </AbsoluteFill>
  );
};
