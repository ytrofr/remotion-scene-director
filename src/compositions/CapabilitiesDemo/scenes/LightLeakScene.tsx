/**
 * Scene 3: Light Leak Transition
 * Demonstrates @remotion/light-leaks — cinematic WebGL light leak overlays
 */

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { LightLeak } from '@remotion/light-leaks';
import { fontFamily } from '../../../lib/fonts';

export const LightLeakScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [15, 30, 65, 80], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Light leak effect fills the background */}
      <LightLeak durationInFrames={90} seed={7} hueShift={30} />

      {/* Title overlay */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 20,
          zIndex: 1,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 72,
            fontWeight: 700,
            fontFamily,
            opacity: titleOpacity,
            textShadow: '0 4px 30px rgba(0,0,0,0.8)',
          }}
        >
          Light Leaks
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 36,
            fontFamily,
            opacity: titleOpacity,
            textShadow: '0 2px 20px rgba(0,0,0,0.8)',
          }}
        >
          @remotion/light-leaks
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 28,
            fontFamily,
            opacity: titleOpacity,
            textShadow: '0 2px 20px rgba(0,0,0,0.8)',
          }}
        >
          WebGL cinematic transitions
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
