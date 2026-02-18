/**
 * WaypointMarkers v3.2 - SVG dots + connection lines + drag-to-move + frame position indicator + gesture labels
 * Receives containerRef for coordinate conversion during drag.
 * `editable` prop controls whether waypoints can be dragged (disabled in preview mode).
 */

import React, { useCallback, useRef } from 'react';
import { useDirector } from '../context';
import { useToComp } from '../hooks/useToComp';
import type { HandGesture, HandPathPoint } from '../../../components/FloatingHand/types';
import { GestureIcon, GESTURE_DISPLAY } from './GestureIcon';

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>;
  editable?: boolean;
  /** Override waypoints (e.g. coded paths). Falls back to context sceneWaypoints if not provided. */
  waypoints?: HandPathPoint[];
}

export const WaypointMarkers: React.FC<Props> = ({ containerRef, editable = true, waypoints: waypointsProp }) => {
  const { state, dispatch, frame, currentScene, sceneWaypoints, composition } = useDirector();
  const displayWaypoints = waypointsProp ?? sceneWaypoints;
  const compWidth = composition.video.width;
  const compHeight = composition.video.height;
  const offsetY = composition.globalOffsetY ?? 0;
  const selectedIndex = state.selectedWaypoint;
  const scene = state.selectedScene;

  // Drag state from global store (enables hand snap-to-waypoint)
  const dragging = state.draggingIndex;
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const toComp = useToComp(containerRef, compWidth, compHeight);

  const handleDotMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: 'START_DRAG', index });
    dragStartRef.current = toComp(e.clientX, e.clientY);
  }, [editable, dispatch, toComp]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null || !scene || !editable) return;
    const pos = toComp(e.clientX, e.clientY);
    // Subtract globalOffsetY: screen coords → scene-space coords
    dispatch({ type: 'UPDATE_WAYPOINT', scene, index: dragging, point: { x: pos.x, y: pos.y - offsetY } });
  }, [dragging, scene, editable, dispatch, toComp, offsetY]);

  const handleMouseUp = useCallback(() => {
    dispatch({ type: 'END_DRAG' });
    dragStartRef.current = null;
  }, [dispatch]);

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
        {/* Shift markers to match composition's global offset (e.g. translateY(120px) in Combined) */}
        <g transform={offsetY ? `translate(0, ${offsetY})` : undefined}>
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
        </g>
      </svg>
    </div>
  );
};
