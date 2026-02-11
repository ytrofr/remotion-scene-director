import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { COLORS, PHONE, SCREENSHOTS } from '../constants';

/**
 * ThinkingScene - AI is thinking with animated dots
 * Duration: 45 frames
 * Scene 6 - Shows user message with thinking dots animation
 */
export const ThinkingScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Animated thinking dots (cycle every 18 frames)
  const dotCycle = frame % 18;
  const dotOpacity1 = interpolate(dotCycle, [0, 4, 8, 12, 18], [0.3, 1, 0.3, 0.3, 0.3]);
  const dotOpacity2 = interpolate(dotCycle, [0, 4, 8, 12, 18], [0.3, 0.3, 1, 0.3, 0.3]);
  const dotOpacity3 = interpolate(dotCycle, [0, 4, 8, 12, 18], [0.3, 0.3, 0.3, 1, 0.3]);

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
          screenshot={SCREENSHOTS.userMessage}
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        >
          {/* Animated thinking dots - positioned in chat area */}
          <div
            style={{
              position: 'absolute',
              bottom: 210,
              left: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #1a1a3e 0%, #1e1e4a 100%)',
              borderRadius: 18,
              borderLeft: `3px solid ${COLORS.primary}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: COLORS.primary,
                opacity: dotOpacity1,
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: COLORS.primary,
                opacity: dotOpacity2,
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: COLORS.primary,
                opacity: dotOpacity3,
              }}
            />
          </div>
        </PhoneMockup>
      </div>
    </AbsoluteFill>
  );
};
