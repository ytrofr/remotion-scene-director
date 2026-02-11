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
import { simplifyPath } from '../utils';
import { GESTURE_PRESETS, type GestureTool } from '../gestures';
import type { HandPathPoint } from '../../../components/FloatingHand/types';
import { Crosshairs } from './Crosshairs';

export const DrawingCanvas: React.FC = () => {
  const { state, dispatch, frame, currentScene, sceneWaypoints, composition, activePreset } = useDirector();
  const compWidth = composition.video.width;
  const compHeight = composition.video.height;

  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const rawPointsRef = useRef<{ x: number; y: number }[]>([]);

  const toComp = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (compWidth / rect.width));
    const y = Math.round((e.clientY - rect.top) * (compHeight / rect.height));
    return {
      x: Math.max(0, Math.min(compWidth, x)),
      y: Math.max(0, Math.min(compHeight, y)),
    };
  }, [compWidth, compHeight]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = toComp(e);
    setMousePos(pos);

    // Track freehand drawing in both edit and create modes
    if (isDrawing) {
      rawPointsRef.current.push(pos);
    }
  }, [toComp, isDrawing]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!currentScene) return;
    const pos = toComp(e);
    const hasExistingWaypoints = sceneWaypoints.length > 0;

    // === EDIT MODE: dots are visible ===
    if (hasExistingWaypoints) {
      if (state.selectedWaypoint !== null && state.selectedScene) {
        // A dot is selected → move it to this position, then deselect
        dispatch({
          type: 'UPDATE_WAYPOINT',
          scene: state.selectedScene,
          index: state.selectedWaypoint,
          point: { x: pos.x, y: pos.y },
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
    const tool = state.activeTool;
    if (tool === 'select') {
      dispatch({ type: 'SELECT_WAYPOINT', index: null });
      return;
    }

    if (!activePreset) return;

    if (activePreset.inputMode === 'click') {
      // Single click generates complete path
      const localFrame = Math.max(0, frame - currentScene.start);
      const path = activePreset.generatePath({
        target: pos,
        startFrame: localFrame,
        compWidth,
        compHeight,
      });
      if (path.length > 0) {
        dispatch({ type: 'SET_WAYPOINTS', scene: currentScene.name, waypoints: path });
        dispatch({ type: 'SET_SCENE_GESTURE', scene: currentScene.name, gesture: tool as GestureTool });
      }
    } else if (activePreset.inputMode === 'draw') {
      // Start drawing
      setIsDrawing(true);
      rawPointsRef.current = [pos];
    }
  }, [state.activeTool, state.selectedWaypoint, state.selectedScene, sceneWaypoints.length, currentScene, activePreset, dispatch, toComp, frame, compWidth, compHeight]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentScene) {
      setIsDrawing(false);
      return;
    }
    setIsDrawing(false);

    const raw = rawPointsRef.current;
    rawPointsRef.current = [];
    const hasExistingWaypoints = sceneWaypoints.length > 0;

    if (hasExistingWaypoints) {
      // EDIT MODE: distinguish click (short) vs freehand draw (long)
      if (raw.length < 5) {
        // Short interaction → add single new waypoint
        const pos = raw[0];
        const localFrame = Math.max(0, frame - currentScene.start);
        dispatch({
          type: 'ADD_WAYPOINT',
          scene: currentScene.name,
          point: {
            x: pos.x,
            y: pos.y,
            frame: localFrame,
            gesture: 'pointer' as const,
            scale: 1,
          },
        });
      } else {
        // Freehand draw → simplify → replace entire path with drawn curve
        const simplified = simplifyPath(raw, 15);
        const sceneDuration = currentScene.end - currentScene.start;
        const newWaypoints: HandPathPoint[] = simplified.map((p, i) => ({
          x: p.x,
          y: p.y,
          frame: Math.round((i / Math.max(1, simplified.length - 1)) * sceneDuration),
          gesture: 'pointer' as const,
          scale: 1,
        }));
        dispatch({ type: 'SET_WAYPOINTS', scene: currentScene.name, waypoints: newWaypoints });
      }
      return;
    }

    // CREATE MODE: original behavior
    if (!activePreset || raw.length < 2) return;

    const simplified = simplifyPath(raw, 15);
    const localFrame = Math.max(0, frame - currentScene.start);

    const path = activePreset.generatePath({
      drawnPoints: simplified,
      startFrame: localFrame,
      compWidth,
      compHeight,
    });

    if (path.length > 0) {
      dispatch({ type: 'SET_WAYPOINTS', scene: currentScene.name, waypoints: path });
      dispatch({ type: 'SET_SCENE_GESTURE', scene: currentScene.name, gesture: state.activeTool as GestureTool });
    }
  }, [isDrawing, currentScene, activePreset, frame, compWidth, compHeight, dispatch, state.activeTool, sceneWaypoints.length]);

  // Cursor: crosshair when a dot is selected (ready to place), otherwise default
  const hasExistingWaypoints = sceneWaypoints.length > 0;
  const isSelectTool = state.activeTool === 'select';
  const cursorStyle = hasExistingWaypoints
    ? (state.selectedWaypoint !== null ? 'crosshair' : 'default')
    : (isSelectTool ? 'default' : 'crosshair');

  // Show crosshairs: in edit mode when dot selected, in create mode when gesture tool active
  const showCrosshairs = hasExistingWaypoints
    ? state.selectedWaypoint !== null
    : !isSelectTool;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { setMousePos(null); setIsDrawing(false); }}
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
      {/* Crosshairs */}
      {mousePos && showCrosshairs && (
        <Crosshairs x={mousePos.x} y={mousePos.y} />
      )}

      {/* Live drawing stroke */}
      {isDrawing && rawPointsRef.current.length > 1 && (
        <svg
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 11,
          }}
          viewBox={`0 0 ${compWidth} ${compHeight}`}
          preserveAspectRatio="none"
        >
          <polyline
            points={rawPointsRef.current.map(p => `${p.x},${p.y}`).join(' ')}
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
