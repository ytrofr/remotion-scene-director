/**
 * Crosshairs - Position indicator overlay
 * Renders in composition coordinate space (inside SVG viewBox).
 */

import React from 'react';
import { useDirector } from '../context';

interface CrosshairsProps {
  x: number;
  y: number;
}

export const Crosshairs: React.FC<CrosshairsProps> = ({ x, y }) => {
  const { composition } = useDirector();
  const compWidth = composition.video.width;
  const compHeight = composition.video.height;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 13,
      }}
      viewBox={`0 0 ${compWidth} ${compHeight}`}
      preserveAspectRatio="none"
    >
      {/* Vertical line */}
      <line x1={x} y1={0} x2={x} y2={compHeight}
        stroke="rgba(88,166,255,0.35)" strokeWidth={1} />
      {/* Horizontal line */}
      <line x1={0} y1={y} x2={compWidth} y2={y}
        stroke="rgba(88,166,255,0.35)" strokeWidth={1} />
      {/* Center circle */}
      <circle cx={x} cy={y} r={6}
        fill="none" stroke="#58a6ff" strokeWidth={2} />
      {/* Coordinate label */}
      <rect x={x + 14} y={y - 24} width={80} height={20}
        rx={3} fill="rgba(0,0,0,0.8)" />
      <text x={x + 18} y={y - 10}
        fill="#58a6ff" fontSize={12} fontFamily="monospace">
        {x},{y}
      </text>
    </svg>
  );
};
