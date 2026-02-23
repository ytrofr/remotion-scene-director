/**
 * DrawingCanvas v3.2 - Unified edit/create interaction
 *
 * TWO MODES based on whether waypoints exist:
 *
 * EDIT MODE (waypoints visible):
 * - Click with selected dot → move that dot to click position
 * - Click without selection → add new waypoint at position
 * - Drag on empty space → freehand draw → replaces entire path
 *
 * CREATE MODE (no waypoints):
 * - activeTool === 'select': click deselects
 * - preset.inputMode === 'click': single click -> generatePath -> SET_WAYPOINTS
 * - preset.inputMode === 'draw': drag draws path -> simplify -> SET_WAYPOINTS
 */

import React, { useCallback, useRef, useState } from 'react';
import { useDirector } from '../context';
import { useToComp } from '../hooks/useToComp';
import { GESTURE_PRESETS, type GestureTool } from '../gestures';
import type { HandPathPoint } from '../../../components/FloatingHand/types';
import { Crosshairs } from './Crosshairs';
import { HandCursorPreview } from './HandCursorPreview';

export const DrawingCanvas: React.FC = () => {
  const {
    state,
    dispatch,
    frame,
    currentScene,
    sceneWaypoints,
    composition,
    activePreset,
  } = useDirector();
  const compWidth = composition.video.width;
  const compHeight = composition.video.height;
  const offsetY = composition.globalOffsetY ?? 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const rawPointsRef = useRef<{ x: number; y: number }[]>([]);

  const toCompRaw = useToComp(containerRef, compWidth, compHeight);
  // Wraps hook to accept React.MouseEvent for convenience
  const toComp = useCallback(
    (e: React.MouseEvent): { x: number; y: number } => {
      return toCompRaw(e.clientX, e.clientY);
    },
    [toCompRaw],
  );

  // Returns scene-space coordinates (for storage - subtracts globalOffsetY)
  const toScene = useCallback(
    (pos: { x: number; y: number }): { x: number; y: number } => {
      return { x: pos.x, y: pos.y - offsetY };
    },
    [offsetY],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = toComp(e);
      setMousePos(pos);

      // Track freehand drawing in both edit and create modes
      if (isDrawing) {
        rawPointsRef.current.push(pos);
      }
    },
    [toComp, isDrawing],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!currentScene) return;
      const pos = toComp(e);
      const scenePos = toScene(pos);
      const hasExistingWaypoints = sceneWaypoints.length > 0;

      // === EDIT MODE: dots are visible ===
      if (hasExistingWaypoints) {
        // Select tool in edit mode: just deselect, no drawing/adding
        if (state.activeTool === 'select') {
          dispatch({ type: 'SELECT_WAYPOINT', index: null });
          return;
        }
        if (state.selectedWaypoint !== null && state.selectedScene) {
          // A dot is selected → move it to this position, then deselect
          dispatch({
            type: 'UPDATE_WAYPOINT',
            scene: state.selectedScene,
            index: state.selectedWaypoint,
            point: { x: scenePos.x, y: scenePos.y },
          });
          dispatch({ type: 'SELECT_WAYPOINT', index: null });
          return;
        }
        // No dot selected → start potential draw (distinguish click vs drag on mouseUp)
        setIsDrawing(true);
        rawPointsRef.current = [pos];
        return;
      }

      // === CREATE MODE: no dots yet ===
      if (state.activeTool === 'select') {
        dispatch({ type: 'SELECT_WAYPOINT', index: null });
        return;
      }

      if (!activePreset) return;

      // Always start drawing — mouseUp distinguishes click vs drag
      setIsDrawing(true);
      rawPointsRef.current = [pos];
    },
    [
      state.activeTool,
      state.selectedWaypoint,
      state.selectedScene,
      sceneWaypoints.length,
      currentScene,
      activePreset,
      dispatch,
      toComp,
      toScene,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentScene) {
      setIsDrawing(false);
      return;
    }
    setIsDrawing(false);

    const raw = rawPointsRef.current;
    rawPointsRef.current = [];
    const hasExistingWaypoints = sceneWaypoints.length > 0;

    // Convert raw comp-space points to scene-space
    const rawScene = raw.map((p) => toScene(p));

    if (hasExistingWaypoints) {
      // EDIT MODE: distinguish click (short) vs freehand draw (long)
      const localFrame = Math.max(0, frame - currentScene.start);
      const gesture = (
        state.activeTool !== 'select' ? state.activeTool : 'click'
      ) as GestureTool;
      if (rawScene.length < 5) {
        // Short click → create NEW independent hand gesture
        const pos = rawScene[0];
        dispatch({
          type: 'ADD_HAND_GESTURE',
          scene: currentScene.name,
          points: [
            {
              x: pos.x,
              y: pos.y,
              frame: localFrame,
              gesture: 'pointer' as const,
              scale: 1,
            },
          ],
          gesture,
        });
      } else {
        // Freehand draw → create NEW independent hand gesture with 2 waypoints
        const first = rawScene[0];
        const last = rawScene[rawScene.length - 1];
        const sceneDuration = currentScene.end - currentScene.start;
        dispatch({
          type: 'ADD_HAND_GESTURE',
          scene: currentScene.name,
          points: [
            {
              x: first.x,
              y: first.y,
              frame: localFrame,
              gesture: 'pointer' as const,
              scale: 1,
            },
            {
              x: last.x,
              y: last.y,
              frame: Math.min(localFrame + 30, sceneDuration),
              gesture: 'pointer' as const,
              scale: 1,
            },
          ],
          gesture,
        });
      }
      return;
    }

    // CREATE MODE: click (short) vs drag (long)
    if (!activePreset) return;
    const localFrame = Math.max(0, frame - currentScene.start);
    const sceneDuration = currentScene.end - currentScene.start;

    if (rawScene.length < 5) {
      // Short interaction → single waypoint at click position
      const pos = rawScene[0];
      const path = activePreset.generatePath({
        target: pos,
        startFrame: localFrame,
        compWidth,
        compHeight,
      });
      for (const pt of path) {
        dispatch({ type: 'ADD_WAYPOINT', scene: currentScene.name, point: pt });
      }
    } else {
      // Drag → 2 waypoints: first + last position
      const first = rawScene[0];
      const last = rawScene[rawScene.length - 1];
      const newWaypoints: HandPathPoint[] = [
        {
          x: first.x,
          y: first.y,
          frame: localFrame,
          gesture: 'pointer' as const,
          scale: 1,
        },
        {
          x: last.x,
          y: last.y,
          frame: Math.min(localFrame + 30, sceneDuration),
          gesture: 'pointer' as const,
          scale: 1,
        },
      ];
      dispatch({
        type: 'SET_WAYPOINTS',
        scene: currentScene.name,
        waypoints: newWaypoints,
      });
    }
    if (state.activeTool !== 'select') {
      dispatch({
        type: 'SET_SCENE_GESTURE',
        scene: currentScene.name,
        gesture: state.activeTool as GestureTool,
      });
    }
  }, [
    isDrawing,
    currentScene,
    activePreset,
    frame,
    compWidth,
    compHeight,
    dispatch,
    state.activeTool,
    sceneWaypoints.length,
    toScene,
  ]);

  // Cursor logic: Lottie hand when gesture tool active, crosshair for precision placement
  const hasExistingWaypoints = sceneWaypoints.length > 0;
  const isSelectTool = state.activeTool === 'select';

  // Hand cursor: when gesture tool active and not in precision waypoint placement
  const showHandCursor =
    activePreset !== null && state.selectedWaypoint === null;

  const cursorStyle = showHandCursor
    ? 'none'
    : isSelectTool
      ? 'default'
      : hasExistingWaypoints
        ? state.selectedWaypoint !== null
          ? 'crosshair'
          : 'default'
        : 'crosshair';

  const showPrecisionCrosshairs =
    hasExistingWaypoints && state.selectedWaypoint !== null && !isSelectTool;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setMousePos(null);
        setIsDrawing(false);
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        cursor: cursorStyle,
        zIndex: 10,
      }}
    >
      {/* Hand cursor preview — always mounted when gesture tool active (avoids Lottie reload) */}
      {showHandCursor && activePreset && (
        <HandCursorPreview
          x={mousePos?.x ?? null}
          y={mousePos?.y ?? null}
          preset={activePreset}
        />
      )}

      {/* Precision crosshairs when placing a waypoint */}
      {mousePos && showPrecisionCrosshairs && (
        <Crosshairs x={mousePos.x} y={mousePos.y} />
      )}

      {/* Live drawing stroke */}
      {isDrawing && rawPointsRef.current.length > 1 && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 11,
          }}
          viewBox={`0 0 ${compWidth} ${compHeight}`}
          preserveAspectRatio="none"
        >
          <polyline
            points={rawPointsRef.current.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={3}
            opacity={0.8}
          />
        </svg>
      )}
    </div>
  );
};
