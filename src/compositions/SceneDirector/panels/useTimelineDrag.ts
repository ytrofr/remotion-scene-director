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
import { MIN_CLICK_DURATION } from '../gestures';

// ─── Shared types ───────────────────────────────────────────────

type DragEdge = 'left' | 'right' | 'move' | 'separator';

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

// ─── useCaptionDrag ─────────────────────────────────────────────

export interface CaptionDragResult {
  captionDrag: AudioDragState | null;
  handleCaptionEdgeDown: (
    e: React.MouseEvent,
    layerId: string,
    sceneName: string,
    edge: DragEdge,
    currentStart: number,
    currentDuration: number,
  ) => void;
}

export function useCaptionDrag({
  state,
  dispatch,
  tracksRef,
  totalFrames,
}: UseAudioDragParams): CaptionDragResult {
  const [captionDrag, setCaptionDrag] = useState<AudioDragState | null>(null);

  const handleCaptionEdgeDown = useCallback(
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
      setCaptionDrag({
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
    if (!captionDrag) return;
    const handleMove = (e: MouseEvent) => {
      const el = tracksRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pxPerFrame = rect.width / totalFrames;
      const deltaPx = e.clientX - captionDrag.startX;
      const deltaFrames = Math.round(deltaPx / pxPerFrame);
      if (captionDrag.edge === 'move') {
        const newStart = Math.max(0, captionDrag.originalStart + deltaFrames);
        dispatch({
          type: 'UPDATE_LAYER_DATA',
          scene: captionDrag.scene,
          layerId: captionDrag.layerId,
          data: { startFrame: newStart },
        });
      } else if (captionDrag.edge === 'left') {
        const newStart = Math.max(0, captionDrag.originalStart + deltaFrames);
        const endFrame =
          captionDrag.originalStart + captionDrag.originalDuration;
        const newDuration = Math.max(1, endFrame - newStart);
        dispatch({
          type: 'UPDATE_LAYER_DATA',
          scene: captionDrag.scene,
          layerId: captionDrag.layerId,
          data: { startFrame: newStart, durationInFrames: newDuration },
        });
      } else {
        const newDuration = Math.max(
          1,
          captionDrag.originalDuration + deltaFrames,
        );
        dispatch({
          type: 'UPDATE_LAYER_DATA',
          scene: captionDrag.scene,
          layerId: captionDrag.layerId,
          data: { durationInFrames: newDuration },
        });
      }
    };
    const handleUp = () => {
      const label =
        captionDrag.edge === 'move'
          ? 'Move'
          : captionDrag.edge === 'left'
            ? 'Trim start'
            : 'Trim end';
      dispatch({
        type: 'LOG_ACTIVITY',
        action: `${label} caption`,
        scene: captionDrag.scene,
        snapshot: captionDrag.preDragState,
      });
      setCaptionDrag(null);
    };
    const handleBlur = () => setCaptionDrag(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [captionDrag, totalFrames, dispatch, tracksRef]);

  return { captionDrag, handleCaptionEdgeDown };
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
      const wps = handDrag.originalWaypoints;
      if (handDrag.edge === 'move') {
        // Shift ALL waypoints by the same frame delta
        const shifted = wps.map((wp) => ({
          ...wp,
          frame: Math.max(0, (wp.frame ?? 0) + deltaFrames),
        }));
        if (handDrag.layerId) {
          dispatch({
            type: 'UPDATE_LAYER_DATA',
            scene: handDrag.scene,
            layerId: handDrag.layerId,
            data: { waypoints: shifted },
          });
        } else {
          dispatch({
            type: 'SET_WAYPOINTS',
            scene: handDrag.scene,
            waypoints: shifted,
          });
        }
      } else if (wps.length <= 1) {
        // Single-waypoint: adjust frame/duration directly
        if (handDrag.edge === 'left') {
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
      } else {
        // Multi-waypoint: click-aware proportional scaling
        const firstFrame = wps[0].frame ?? 0;
        const lastWp = wps[wps.length - 1];
        const lastFrame = lastWp.frame ?? 0;
        const hasClickEnd = lastWp.gesture === 'click';
        const moveWps = hasClickEnd ? wps.slice(0, -1) : wps;
        const origMoveSpan =
          moveWps.length > 1
            ? (moveWps[moveWps.length - 1].frame ?? 0) - firstFrame
            : lastFrame - firstFrame;

        if (
          handDrag.edge === 'separator' &&
          hasClickEnd &&
          moveWps.length > 0
        ) {
          // ── Separator: move click boundary, scale movement proportionally ──
          const newClickFrame = Math.max(
            firstFrame + 1,
            lastFrame + deltaFrames,
          );
          const newMoveSpan = newClickFrame - firstFrame;
          const scaled = wps.map((wp, i) => {
            if (i === wps.length - 1) {
              // Click waypoint: change frame, keep duration
              return { ...wp, frame: newClickFrame };
            }
            // Movement waypoints: scale proportionally
            if (origMoveSpan <= 0) return wp;
            const f = wp.frame ?? 0;
            const relativePos = (f - firstFrame) / origMoveSpan;
            return {
              ...wp,
              frame: Math.round(firstFrame + relativePos * newMoveSpan),
            };
          });
          if (handDrag.layerId) {
            dispatch({
              type: 'UPDATE_LAYER_DATA',
              scene: handDrag.scene,
              layerId: handDrag.layerId,
              data: { waypoints: scaled },
            });
          } else {
            dispatch({
              type: 'SET_WAYPOINTS',
              scene: handDrag.scene,
              waypoints: scaled,
            });
          }
        } else if (handDrag.edge === 'right' && hasClickEnd) {
          // ── Right edge on click bar: only change click duration ──
          const newDuration = Math.max(
            MIN_CLICK_DURATION,
            (lastWp.duration ?? 0) + deltaFrames,
          );
          if (handDrag.layerId) {
            const updated = wps.map((wp, i) =>
              i === wps.length - 1 ? { ...wp, duration: newDuration } : wp,
            );
            dispatch({
              type: 'UPDATE_LAYER_DATA',
              scene: handDrag.scene,
              layerId: handDrag.layerId,
              data: { waypoints: updated },
            });
          } else {
            dispatch({
              type: 'UPDATE_WAYPOINT',
              scene: handDrag.scene,
              index: wps.length - 1,
              point: { duration: newDuration },
            });
          }
        } else if (handDrag.edge === 'left' && hasClickEnd && wps.length > 1) {
          // ── Left edge on click bar: scale movement only, click untouched ──
          const origSpan = lastFrame - firstFrame;
          if (origSpan <= 0) return;
          let newFirstFrame = Math.max(0, firstFrame + deltaFrames);
          if (newFirstFrame >= lastFrame) newFirstFrame = lastFrame - 1;
          const newSpan = lastFrame - newFirstFrame;
          const scaled = wps.map((wp, i) => {
            if (i === wps.length - 1) return wp; // Click wp untouched
            const f = wp.frame ?? 0;
            const relativePos = (f - firstFrame) / origSpan;
            return {
              ...wp,
              frame: Math.round(newFirstFrame + relativePos * newSpan),
            };
          });
          if (handDrag.layerId) {
            dispatch({
              type: 'UPDATE_LAYER_DATA',
              scene: handDrag.scene,
              layerId: handDrag.layerId,
              data: { waypoints: scaled },
            });
          } else {
            dispatch({
              type: 'SET_WAYPOINTS',
              scene: handDrag.scene,
              waypoints: scaled,
            });
          }
        } else {
          // ── Default: proportionally scale ALL waypoint frames (non-click bars) ──
          const origSpan = lastFrame - firstFrame;
          if (origSpan <= 0) return;
          let newFirstFrame = firstFrame;
          let newLastFrame = lastFrame;
          if (handDrag.edge === 'left') {
            newFirstFrame = Math.max(0, firstFrame + deltaFrames);
            if (newFirstFrame >= lastFrame) newFirstFrame = lastFrame - 1;
          } else {
            newLastFrame = Math.max(firstFrame + 1, lastFrame + deltaFrames);
          }
          const newSpan = newLastFrame - newFirstFrame;
          const scaled = wps.map((wp) => {
            const f = wp.frame ?? 0;
            const relativePos = (f - firstFrame) / origSpan;
            return {
              ...wp,
              frame: Math.round(newFirstFrame + relativePos * newSpan),
            };
          });
          if (handDrag.layerId) {
            dispatch({
              type: 'UPDATE_LAYER_DATA',
              scene: handDrag.scene,
              layerId: handDrag.layerId,
              data: { waypoints: scaled },
            });
          } else {
            dispatch({
              type: 'SET_WAYPOINTS',
              scene: handDrag.scene,
              waypoints: scaled,
            });
          }
        }
      }
    };
    const handleUp = () => {
      const labelMap: Record<DragEdge, string> = {
        move: 'Move',
        left: 'Trim start',
        right: 'Trim end',
        separator: 'Move separator',
      };
      dispatch({
        type: 'LOG_ACTIVITY',
        action: `${labelMap[handDrag.edge]} hand`,
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
