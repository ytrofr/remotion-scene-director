import React from 'react';
import { useCurrentFrame } from 'remotion';

export const AIBubble: React.FC<{ scale?: number; pulse?: boolean }> = ({
  scale = 1,
  pulse = false,
}) => {
  const frame = useCurrentFrame();
  const pulseScale = pulse ? 1 + Math.sin(frame * 0.15) * 0.05 : 1;

  return (
    <div
      style={{
        width: 56 * scale,
        height: 56 * scale,
        borderRadius: '50%',
        background: '#2DD4BF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(45, 212, 191, 0.4)',
        transform: `scale(${pulseScale})`,
      }}
    >
      {/* Face */}
      <div style={{ position: 'relative', width: 28 * scale, height: 20 * scale }}>
        {/* Left eye */}
        <div
          style={{
            position: 'absolute',
            left: 2 * scale,
            top: 0,
            width: 10 * scale,
            height: 10 * scale,
            borderRadius: '50%',
            background: 'white',
          }}
        />
        {/* Right eye */}
        <div
          style={{
            position: 'absolute',
            right: 2 * scale,
            top: 0,
            width: 10 * scale,
            height: 10 * scale,
            borderRadius: '50%',
            background: 'white',
          }}
        />
        {/* Smile */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: 14 * scale,
            height: 7 * scale,
            borderRadius: `0 0 ${14 * scale}px ${14 * scale}px`,
            border: '2px solid white',
            borderTop: 'none',
          }}
        />
      </div>
    </div>
  );
};
