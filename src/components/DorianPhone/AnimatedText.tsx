import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { SPRING_CONFIG } from '../../compositions/DorianDemo/constants';

export const AnimatedText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ children, delay = 0, style = {}, direction = 'up' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  const directionMap = {
    up: { x: 0, y: 50 },
    down: { x: 0, y: -50 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 },
  };

  const offset = directionMap[direction];

  return (
    <div
      style={{
        opacity: progress,
        transform: `translate(${offset.x * (1 - progress)}px, ${offset.y * (1 - progress)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
