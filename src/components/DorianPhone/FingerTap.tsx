import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const FingerTap: React.FC<{
  x: number;
  y: number;
  delay: number;
  show: boolean;
}> = ({ x, y, delay, show }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tapProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 200 },
  });

  if (!show || frame < delay) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${tapProgress})`,
        opacity: interpolate(tapProgress, [0, 0.5, 1], [0, 1, 0.8]),
      }}
    >
      {/* Finger circle */}
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '3px solid rgba(255, 255, 255, 0.8)',
        }}
      />
      {/* Ripple effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${1 + tapProgress * 0.5})`,
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '2px solid rgba(45, 212, 191, 0.5)',
          opacity: 1 - tapProgress,
        }}
      />
    </div>
  );
};
