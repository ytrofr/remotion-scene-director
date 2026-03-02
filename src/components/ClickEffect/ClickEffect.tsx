/**
 * ClickEffect — visual click feedback for Remotion compositions.
 *
 * Styles:
 *   - sunburst: Radial lines radiating outward (comic-book impact)
 *   - ripple: Expanding circle ring (classic click indicator)
 *
 * Usage:
 *   <ClickEffect x={500} y={300} triggerFrame={45} style="sunburst" />
 */
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import type { ClickEffectProps } from './types';

const SunburstEffect: React.FC<{
  progress: number;
  color: string;
  size: number;
  lineCount: number;
  lineWidth: number;
}> = ({ progress, color, size, lineCount, lineWidth }) => {
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 0]);
  const scale = interpolate(progress, [0, 1], [0.3, 1.2]);
  const innerRadius = size * 0.15;
  const outerRadius = size * interpolate(progress, [0, 1], [0.4, 1]);

  const lines: React.ReactNode[] = [];
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const x1 = Math.cos(angle) * innerRadius;
    const y1 = Math.sin(angle) * innerRadius;
    const x2 = Math.cos(angle) * outerRadius;
    const y2 = Math.sin(angle) * outerRadius;
    lines.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={lineWidth}
        strokeLinecap="round"
      />,
    );
  }

  return (
    <svg
      width={size * 2}
      height={size * 2}
      viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {lines}
    </svg>
  );
};

const RippleEffect: React.FC<{
  progress: number;
  color: string;
  size: number;
  lineWidth: number;
}> = ({ progress, color, size, lineWidth }) => {
  const opacity = interpolate(progress, [0, 0.2, 1], [0.8, 0.6, 0]);
  const radius = size * interpolate(progress, [0, 1], [0.2, 1]);

  return (
    <svg
      width={size * 2}
      height={size * 2}
      viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
      style={{ opacity }}
    >
      <circle
        cx={0}
        cy={0}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={lineWidth}
      />
    </svg>
  );
};

export const ClickEffect: React.FC<ClickEffectProps> = ({
  x,
  y,
  triggerFrame,
  style = 'sunburst',
  color = '#00d9ff',
  size = 80,
  lineCount = 12,
  duration = 20,
  lineWidth = 2,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - triggerFrame;

  if (elapsed < 0 || elapsed >= duration) return null;

  const progress = elapsed / duration;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    >
      {style === 'sunburst' ? (
        <SunburstEffect
          progress={progress}
          color={color}
          size={size}
          lineCount={lineCount}
          lineWidth={lineWidth}
        />
      ) : (
        <RippleEffect
          progress={progress}
          color={color}
          size={size}
          lineWidth={lineWidth}
        />
      )}
    </div>
  );
};
