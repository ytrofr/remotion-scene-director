/**
 * GestureIcon - SVG gesture indicators rendered next to waypoint markers.
 * Extracted from WaypointMarkers.tsx for modularity.
 */

import React from 'react';
import type { HandGesture } from '../../../components/FloatingHand/types';

// Gesture label abbreviations + colors
export const GESTURE_DISPLAY: Record<string, { abbr: string; color: string }> = {
  pointer: { abbr: 'PTR', color: 'var(--accent)' },
  click:   { abbr: 'CLK', color: 'var(--green)' },
  drag:    { abbr: 'DRG', color: 'var(--orange)' },
  scroll:  { abbr: 'SCR', color: 'var(--accent)' },
  open:    { abbr: 'OPN', color: 'var(--text-muted)' },
};

interface Props {
  gesture: HandGesture;
  x: number;
  y: number;
  isTransition: boolean;
}

export const GestureIcon: React.FC<Props> = ({ gesture, x, y, isTransition }) => {
  const display = GESTURE_DISPLAY[gesture] || GESTURE_DISPLAY.pointer;
  const size = isTransition ? 16 : 12;
  const opacity = isTransition ? 0.9 : 0.6;
  const ix = x + 20;
  const iy = y + 14;

  return (
    <g opacity={opacity}>
      {/* Gesture type icon */}
      {gesture === 'pointer' && (
        <polygon
          points={`${ix},${iy - size / 2} ${ix + size * 0.6},${iy + size * 0.3} ${ix + size * 0.15},${iy + size * 0.15} ${ix + size * 0.3},${iy + size / 2} ${ix},${iy + size * 0.2} ${ix - size * 0.05},${iy + size * 0.25} ${ix},${iy - size / 2}`}
          fill={display.color}
        />
      )}
      {gesture === 'click' && (
        <>
          <circle cx={ix + 4} cy={iy} r={size * 0.35} fill={display.color} />
          <circle cx={ix + 4} cy={iy} r={size * 0.55} fill="none" stroke={display.color} strokeWidth={1.5} strokeDasharray="3,2" />
        </>
      )}
      {gesture === 'drag' && (
        <>
          <rect x={ix - 2} y={iy - size * 0.3} width={size * 0.5} height={size * 0.6} rx={2} fill={display.color} />
          <line x1={ix + size * 0.6} y1={iy} x2={ix + size} y2={iy} stroke={display.color} strokeWidth={1.5} />
          <polygon points={`${ix + size},${iy - 3} ${ix + size + 5},${iy} ${ix + size},${iy + 3}`} fill={display.color} />
          <line x1={ix - size * 0.3} y1={iy} x2={ix - size * 0.7} y2={iy} stroke={display.color} strokeWidth={1.5} />
          <polygon points={`${ix - size * 0.7},${iy - 3} ${ix - size * 0.7 - 5},${iy} ${ix - size * 0.7},${iy + 3}`} fill={display.color} />
        </>
      )}
      {gesture === 'scroll' && (
        <>
          <line x1={ix + 4} y1={iy - size * 0.5} x2={ix + 4} y2={iy + size * 0.5} stroke={display.color} strokeWidth={1.5} />
          <polygon points={`${ix + 4 - 3},${iy - size * 0.5} ${ix + 4},${iy - size * 0.5 - 4} ${ix + 4 + 3},${iy - size * 0.5}`} fill={display.color} />
          <polygon points={`${ix + 4 - 3},${iy + size * 0.5} ${ix + 4},${iy + size * 0.5 + 4} ${ix + 4 + 3},${iy + size * 0.5}`} fill={display.color} />
        </>
      )}
      {gesture === 'open' && (
        <circle cx={ix + 4} cy={iy} r={size * 0.4} fill="none" stroke={display.color} strokeWidth={1.5} />
      )}

      {/* Gesture abbreviation label */}
      <text
        x={ix + 4}
        y={iy + size * 0.5 + 11}
        textAnchor="middle"
        fill={display.color}
        fontSize={9}
        fontFamily="monospace"
        fontWeight={600}
        className="trail-gesture-label"
      >
        {display.abbr}
      </text>
    </g>
  );
};
