import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { COLORS, PHONE, SCREENSHOTS } from '../constants';

/**
 * ChatWithResponseScene - Shows existing conversation
 * Duration: 45 frames
 * Scene 2 - Displays first Q&A before user types second question
 */
export const ChatWithResponseScene: React.FC = () => {
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
          transform: `scale(${PHONE.baseScale})`,
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
