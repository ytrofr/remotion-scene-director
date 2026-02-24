/**
 * Timeline drag hooks - extracted from Timeline.tsx
 * Handles audio bar and hand bar drag interactions (move, trim-left, trim-right).
 */

import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type RefObject,
} from 'react';
import type { HandPathPoint } from '../../../components/FloatingHand/types';
import type { DirectorState, DirectorAction } from '../state.types';

// ─── Shared types ───────────────────────────────────────────────

type DragEdge = 'left' | 'right' | 'move';

interface AudioDragState {
  layerId: string;
  scene: string;
  edge: DragEdge;
  startX: number;
  originalStart: number;
  originalDuration: number;
  preDragState: DirectorState;
}

interface HandDragState {
  scene: string;
  edge: DragEdge;
  startX: number;
  originalFrame: number;
  originalDuration: number;
  /** All waypoint frames at drag start — used to shift entire gesture on move */
  originalWaypoints: HandPathPoint[];
  /** Layer ID if this is a secondary hand layer (data stored in layer.data.waypoints) */
  layerId: string | null;
  preDragState: DirectorState;
}

// ─── useAudioDrag ───────────────────────────────────────────────

interface UseAudioDragParams {
  state: DirectorState;
  dispatch: Dispatch<DirectorAction>;
  tracksRef: RefObject<HTMLDivElement | null>;
  totalFrames: number;
}

export interface AudioDragResult {
  audioDrag: AudioDragState | null;
  handleAudioEdgeDown: (
    e: React.MouseEvent,
    layerId: string,
    sceneName: string,
    edge: DragEdge,
    currentStart: number,
    currentDuration: number,
  ) => void;
}

export function useAudioDrag({
  state,
  dispatch,
  tracksRef,
  totalFrames,
}: UseAudioDragParams): AudioDragResult {
  const [audioDrag, setAudioDrag] = useState<AudioDragState | null>(null);

  const handleAudioEdgeDown = useCallback(
    (
      e: React.MouseEvent,
      layerId: string,
      sceneName: string,
      edge: DragEdge,
      currentStart: number,
      currentDuration: number,
    ) => {
      e.stopPropagation();
      e.preventDefault();
      setAudioDrag({
        layerId,
        scene: sceneName,
        edge,
        startX: e.clientX,
        originalStart: currentStart,
        originalDuration: currentDuration,
        preDragState: state,
      });
    },
    [state],
  );

  useEffect(() => {
    if (!audioDrag) return;
    const handleMove = (e: MouseEvent) => {
      const el = tracksRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pxPerFrame = rect.width / totalFrames;
      const deltaPx = e.clientX - audioDrag.startX;
      const deltaFrames = Math.round(deltaPx / pxPerFrame);
      if (audioDrag.edge === 'move') {
        const newStart = Math.max(0, audioDrag.originalStart + deltaFrames);
        dispatch({
          type: 'UPDATE_LAYER_DATA',
          scene: audioDrag.scene,
          layerId: audioDrag.layerId,
          data: { startFrame: newStart },
        });
      } else if (audioDrag.edge === 'left') {
        const newStart = Math.max(0, audioDrag.originalStart + deltaFrames);
        const endFrame = audioDrag.originalStart + audioDrag.originalDuration;
        const newDuration = Math.max(1, endFrame - newStart);
        dispatch({
          type: 'UPDATE_LAYER_DATA',
          scene: audioDrag.scene,
          layerId: audioDrag.layerId,
          data: { startFrame: newStart, durationInFrames: newDuration },
        });
      } else {
        const newDuration = Math.max(
          1,
          audioDrag.originalDuration + deltaFrames,
        );
        dispatch({
          type: 'UPDATE_LAYER_DATA',
          scene: audioDrag.scene,
          layerId: audioDrag.layerId,
          data: { durationInFrames: newDuration },
        });
      }
    };
    const handleUp = () => {
      // Log a single activity entry with pre-drag snapshot for restore
      const label =
        audioDrag.edge === 'move'
          ? 'Move'
          : audioDrag.edge === 'left'
            ? 'Trim start'
            : 'Trim end';
      dispatch({
        type: 'LOG_ACTIVITY',
        action: `${label} audio`,
        scene: audioDrag.scene,
        snapshot: audioDrag.preDragState,
      });
      setAudioDrag(null);
    };
    // Clear drag on window blur (e.g. Alt+Tab) to prevent stuck state
    const handleBlur = () => setAudioDrag(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [audioDrag, totalFrames, dispatch, tracksRef]);

  return { audioDrag, handleAudioEdgeDown };
}

// ─── useHandDrag ────────────────────────────────────────────────

interface UseHandDragParams {
  state: DirectorState;
  dispatch: Dispatch<DirectorAction>;
  tracksRef: RefObject<HTMLDivElement | null>;
  totalFrames: number;
}

export interface HandDragResult {
  handDrag: HandDragState | null;
  handleHandEdgeDown: (
    e: React.MouseEvent,
    sceneName: string,
    edge: DragEdge,
    currentFrame: number,
    currentDuration: number,
    waypoints: HandPathPoint[],
    layerId: string | null,
  ) => void;
}

export function useHandDrag({
  state,
  dispatch,
  tracksRef,
  totalFrames,
}: UseHandDragParams): HandDragResult {
  const [handDrag, setHandDrag] = useState<HandDragState | null>(null);

  const handleHandEdgeDown = useCallback(
    (
      e: React.MouseEvent,
      sceneName: string,
      edge: DragEdge,
      currentFrame: number,
      currentDuration: number,
      waypoints: HandPathPoint[],
      layerId: string | null,
    ) => {
      e.stopPropagation();
      e.preventDefault();
      setHandDrag({
        scene: sceneName,
        edge,
        startX: e.clientX,
        originalFrame: currentFrame,
        originalDuration: currentDuration,
        originalWaypoints: waypoints,
        layerId,
        preDragState: state,
      });
    },
    [state],
  );

  useEffect(() => {
    if (!handDrag) return;
    const handleMove = (e: MouseEvent) => {
      const el = tracksRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pxPerFrame = rect.width / totalFrames;
      const deltaPx = e.clientX - handDrag.startX;
      const deltaFrames = Math.round(deltaPx / pxPerFrame);
      if (handDrag.edge === 'move') {
        // Shift ALL waypoints by the same frame delta
        const shifted = handDrag.originalWaypoints.map((wp) => ({
          ...wp,
          frame: Math.max(0, (wp.frame ?? 0) + deltaFrames),
        }));
        if (handDrag.layerId) {
          // Secondary hand layer — update via layer data
          dispatch({
            type: 'UPDATE_LAYER_DATA',
            scene: handDrag.scene,
            layerId: handDrag.layerId,
            data: { waypoints: shifted },
          });
        } else {
          // Primary hand layer — update via flat waypoints
          dispatch({
            type: 'SET_WAYPOINTS',
            scene: handDrag.scene,
            waypoints: shifted,
          });
        }
      } else if (handDrag.edge === 'left') {
        const rightEdge = handDrag.originalFrame + handDrag.originalDuration;
        const newFrame = Math.max(0, handDrag.originalFrame + deltaFrames);
        const newDuration = Math.max(0, rightEdge - newFrame);
        dispatch({
          type: 'UPDATE_WAYPOINT',
          scene: handDrag.scene,
          index: 0,
          point: { frame: newFrame, duration: newDuration },
        });
      } else {
        const newDuration = Math.max(
          0,
          handDrag.originalDuration + deltaFrames,
        );
        dispatch({
          type: 'UPDATE_WAYPOINT',
          scene: handDrag.scene,
          index: 0,
          point: { duration: newDuration },
        });
      }
    };
    const handleUp = () => {
      const label =
        handDrag.edge === 'move'
          ? 'Move'
          : handDrag.edge === 'left'
            ? 'Trim start'
            : 'Trim end';
      dispatch({
        type: 'LOG_ACTIVITY',
        action: `${label} hand`,
        scene: handDrag.scene,
        snapshot: handDrag.preDragState,
      });
      setHandDrag(null);
    };
    // Clear drag on window blur (e.g. Alt+Tab) to prevent stuck state
    const handleBlur = () => setHandDrag(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handDrag, totalFrames, dispatch, tracksRef]);

  return { handDrag, handleHandEdgeDown };
}
