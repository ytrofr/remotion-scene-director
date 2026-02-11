import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { COLORS, PHONE, SCREENSHOTS } from '../constants';

/**
 * OutroScene - CTA overlay
 * Duration: 35 frames
 * Scene 8 - Final CTA
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // CTA fades in
  const ctaOpacity = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Phone with response */}
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
          screenshot={SCREENSHOTS.response}
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.7}
        />
      </div>

      {/* CTA overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: ctaOpacity,
        }}
      >
        <div
          style={{
            padding: '20px 40px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 'bold',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            LIMOR AI
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
