/**
 * Keyboard shortcuts hook for SceneDirector.
 * Handles gesture tools (1-5), undo, play/pause, seek, delete, trail, export, zoom reset.
 */

import { useCallback, useEffect, type Dispatch, type RefObject } from 'react';
import type { PlayerRef } from '@remotion/player';
import type { DirectorAction, DirectorState } from '../state';
import type { CompositionEntry } from '../state';
import { GESTURE_KEYS } from '../gestures';

interface KeyboardShortcutDeps {
  frame: number;
  composition: CompositionEntry;
  state: DirectorState;
  dispatch: Dispatch<DirectorAction>;
  playerRef: RefObject<PlayerRef | null>;
  setZoom: (v: number) => void;
  setPan: (v: { x: number; y: number }) => void;
}

export function useKeyboardShortcuts({
  frame,
  composition,
  state,
  dispatch,
  playerRef,
  setZoom,
  setPan,
}: KeyboardShortcutDeps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Gesture tool shortcuts: 1-5
      // First press: select tool. Same key again: toggle dark/light hand.
      const gestureTool = GESTURE_KEYS[e.key];
      if (gestureTool) {
        e.preventDefault();
        if (state.activeTool === gestureTool && state.selectedScene) {
          const currentDark = state.sceneDark[state.selectedScene] ?? false;
          dispatch({
            type: 'SET_SCENE_DARK',
            scene: state.selectedScene,
            dark: !currentDark,
          });
        } else {
          dispatch({ type: 'SET_TOOL', tool: gestureTool });
        }
        return;
      }

      // Ctrl+Z → Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z → Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        return;
      }

      switch (e.key) {
        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('scene-director-save'));
          } else {
            e.preventDefault();
            dispatch({ type: 'SET_TOOL', tool: 'select' });
          }
          break;
        case ' ':
          e.preventDefault();
          if (playerRef.current) {
            if (playerRef.current.isPlaying()) {
              playerRef.current.pause();
            } else {
              playerRef.current.play();
            }
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (playerRef.current) {
            const step = e.shiftKey ? 10 : 1;
            const next = Math.max(0, frame - step);
            playerRef.current.seekTo(next);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (playerRef.current) {
            const step = e.shiftKey ? 10 : 1;
            const next = Math.min(composition.video.frames - 1, frame + step);
            playerRef.current.seekTo(next);
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (state.selectedWaypoint !== null && state.selectedScene) {
            e.preventDefault();
            dispatch({
              type: 'DELETE_WAYPOINT',
              scene: state.selectedScene,
              index: state.selectedWaypoint,
            });
          } else if (state.selectedLayerId && state.selectedScene) {
            e.preventDefault();
            dispatch({
              type: 'REMOVE_LAYER',
              scene: state.selectedScene,
              layerId: state.selectedLayerId,
            });
          }
          break;
        case 't':
        case 'T':
          e.preventDefault();
          dispatch({ type: 'TOGGLE_TRAIL' });
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          dispatch({ type: 'TOGGLE_EXPORT' });
          break;
        case '0':
          e.preventDefault();
          setZoom(1);
          setPan({ x: 0, y: 0 });
          break;
        case 'Escape':
          e.preventDefault();
          if (state.exportOpen) {
            dispatch({ type: 'TOGGLE_EXPORT' });
          } else if (state.selectedWaypoint !== null) {
            dispatch({ type: 'SELECT_WAYPOINT', index: null });
          }
          break;
      }
    },
    [
      frame,
      composition.video.frames,
      state.activeTool,
      state.selectedWaypoint,
      state.selectedScene,
      state.selectedLayerId,
      state.sceneDark,
      state.exportOpen,
      dispatch,
      playerRef,
      setZoom,
      setPan,
    ],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
