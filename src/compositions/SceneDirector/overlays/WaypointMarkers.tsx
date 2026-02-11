/**
 * WaypointMarkers v3.1 - SVG dots + connection lines + drag-to-move + frame position indicator + gesture labels
 * Receives containerRef for coordinate conversion during drag.
 * `editable` prop controls whether waypoints can be dragged (disabled in preview mode).
 */

import React, { useCallback, useState, useRef } from 'react';
import { useDirector } from '../context';
import type { HandGesture, HandPathPoint } from '../../../components/FloatingHand/types';

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>;
  editable?: boolean;
  /** Override waypoints (e.g. coded paths). Falls back to context sceneWaypoints if not provided. */
  waypoints?: HandPathPoint[];
}

// Gesture label abbreviations + colors
const GESTURE_DISPLAY: Record<string, { abbr: string; color: string }> = {
  pointer: { abbr: 'PTR', color: 'var(--accent)' },
  click:   { abbr: 'CLK', color: 'var(--green)' },
  drag:    { abbr: 'DRG', color: 'var(--orange)' },
  scroll:  { abbr: 'SCR', color: 'var(--accent)' },
  open:    { abbr: 'OPN', color: 'var(--text-muted)' },
};

// Simple SVG gesture icons (rendered next to each waypoint dot)
const GestureIcon: React.FC<{ gesture: HandGesture; x: number; y: number; isTransition: boolean }> = ({
  gesture, x, y, isTransition,
}) => {
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

export const WaypointMarkers: React.FC<Props> = ({ containerRef, editable = true, waypoints: waypointsProp }) => {
  const { state, dispatch, frame, currentScene, sceneWaypoints, composition } = useDirector();
  const displayWaypoints = waypointsProp ?? sceneWaypoints;
  const compWidth = composition.video.width;
  const compHeight = composition.video.height;
  const selectedIndex = state.selectedWaypoint;
  const scene = state.selectedScene;

  // Drag state (only when editable)
  const [dragging, setDragging] = useState<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const toComp = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = Math.round((clientX - rect.left) * (compWidth / rect.width));
    const y = Math.round((clientY - rect.top) * (compHeight / rect.height));
    return {
      x: Math.max(0, Math.min(compWidth, x)),
      y: Math.max(0, Math.min(compHeight, y)),
    };
  }, [containerRef, compWidth, compHeight]);

  const handleDotMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();
    setDragging(index);
    dragStartRef.current = toComp(e.clientX, e.clientY);
    dispatch({ type: 'SELECT_WAYPOINT', index });
  }, [editable, dispatch, toComp]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null || !scene || !editable) return;
    const pos = toComp(e.clientX, e.clientY);
    dispatch({ type: 'UPDATE_WAYPOINT', scene, index: dragging, point: { x: pos.x, y: pos.y } });
  }, [dragging, scene, editable, dispatch, toComp]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    dragStartRef.current = null;
  }, []);

  // Frame position indicator: interpolate along path at current frame
  let frameIndicator: { x: number; y: number } | null = null;
  if (currentScene && displayWaypoints.length >= 2) {
    const localFrame = frame - currentScene.start;
    const sortedWps = [...displayWaypoints].sort((a, b) => (a.frame ?? 0) - (b.frame ?? 0));
    const firstFrame = sortedWps[0].frame ?? 0;
    const lastFrame = sortedWps[sortedWps.length - 1].frame ?? 0;

    if (localFrame >= firstFrame && localFrame <= lastFrame) {
      // Find surrounding waypoints
      let prevWp = sortedWps[0];
      let nextWp = sortedWps[sortedWps.length - 1];
      for (let i = 0; i < sortedWps.length - 1; i++) {
        const f0 = sortedWps[i].frame ?? 0;
        const f1 = sortedWps[i + 1].frame ?? 0;
        if (localFrame >= f0 && localFrame <= f1) {
          prevWp = sortedWps[i];
          nextWp = sortedWps[i + 1];
          break;
        }
      }
      const f0 = prevWp.frame ?? 0;
      const f1 = nextWp.frame ?? 0;
      const t = f1 > f0 ? (localFrame - f0) / (f1 - f0) : 0;
      frameIndicator = {
        x: prevWp.x + (nextWp.x - prevWp.x) * t,
        y: prevWp.y + (nextWp.y - prevWp.y) * t,
      };
    }
  }

  if (displayWaypoints.length === 0 && !frameIndicator) return null;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: (editable && dragging !== null) ? 'auto' : 'none',
        zIndex: 12,
      }}
    >
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        viewBox={`0 0 ${compWidth} ${compHeight}`}
        preserveAspectRatio="none"
      >
        {/* Connection lines */}
        {displayWaypoints.length > 1 && (
          <polyline
            points={displayWaypoints.map(wp => `${wp.x},${wp.y}`).join(' ')}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeDasharray="8,5"
            opacity={0.5}
          />
        )}

        {/* Direction arrows */}
        {displayWaypoints.slice(1).map((wp, i) => {
          const prev = displayWaypoints[i];
          const mx = (prev.x + wp.x) / 2;
          const my = (prev.y + wp.y) / 2;
          const angle = Math.atan2(wp.y - prev.y, wp.x - prev.x) * (180 / Math.PI);
          return (
            <g key={`arrow-${i}`} transform={`translate(${mx},${my}) rotate(${angle})`}>
              <polygon points="0,-5 10,0 0,5" fill="var(--accent)" opacity={0.4} />
            </g>
          );
        })}

        {/* Waypoint dots with enlarged hit targets */}
        {displayWaypoints.map((wp, i) => {
          const isSelected = i === selectedIndex;
          const isDraggingThis = dragging === i;
          const isClick = wp.gesture === 'click';
          const r = isSelected || isDraggingThis ? 14 : 10;
          const hitR = 25; // Larger invisible hit target for easier clicking
          const fill = isSelected ? '#f0883e' : isClick ? '#3fb950' : '#58a6ff';
          return (
            <g key={`wp-${i}`}>
              {/* Invisible hit target (larger than visible dot) */}
              <circle
                cx={wp.x}
                cy={wp.y}
                r={hitR}
                fill="transparent"
                style={{
                  cursor: editable ? 'grab' : 'pointer',
                  pointerEvents: editable ? 'auto' : 'auto',
                }}
                onMouseDown={(e) => handleDotMouseDown(e, i)}
              />
              {/* Visible dot */}
              <circle
                cx={wp.x}
                cy={wp.y}
                r={r}
                fill={fill}
                stroke={isSelected || isDraggingThis ? '#fff' : 'rgba(0,0,0,0.5)'}
                strokeWidth={2}
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={wp.x}
                y={wp.y + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize={10}
                fontWeight={700}
                fontFamily="monospace"
                style={{ pointerEvents: 'none' }}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Frame labels with gesture type */}
        {displayWaypoints.map((wp, i) => {
          const gesture = wp.gesture || 'pointer';
          const display = GESTURE_DISPLAY[gesture] || GESTURE_DISPLAY.pointer;
          return (
            <text
              key={`label-${i}`}
              x={wp.x + 16}
              y={wp.y - 4}
              fill="#8b949e"
              fontSize={10}
              fontFamily="monospace"
              style={{ pointerEvents: 'none' }}
            >
              f{wp.frame ?? '?'} {display.abbr}
            </text>
          );
        })}

        {/* Gesture icons at each waypoint */}
        {displayWaypoints.map((wp, i) => {
          const gesture = (wp.gesture || 'pointer') as HandGesture;
          // Detect gesture transitions (gesture differs from previous waypoint)
          const prevGesture = i > 0 ? (displayWaypoints[i - 1].gesture || 'pointer') : gesture;
          const isTransition = i > 0 && gesture !== prevGesture;
          return (
            <GestureIcon
              key={`gesture-${i}`}
              gesture={gesture}
              x={wp.x}
              y={wp.y}
              isTransition={isTransition}
            />
          );
        })}

        {/* Frame position indicator */}
        {frameIndicator && (
          <>
            <circle
              cx={frameIndicator.x}
              cy={frameIndicator.y}
              r={8}
              fill="none"
              stroke="var(--orange)"
              strokeWidth={2.5}
              opacity={0.9}
              className="frame-indicator"
            />
            <circle
              cx={frameIndicator.x}
              cy={frameIndicator.y}
              r={3}
              fill="var(--orange)"
              opacity={0.9}
            />
          </>
        )}
      </svg>
    </div>
  );
};
