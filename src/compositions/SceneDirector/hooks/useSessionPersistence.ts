/**
 * Session persistence hook - saves/restores SceneDirector state to localStorage.
 */

import { useMemo, useEffect } from 'react';
import type { DirectorState } from '../state';

const STORAGE_KEY = 'scene-director-session';

export interface SavedSession {
  compositionId?: string;
  selectedScene?: string | null;
  frame?: number;
  sceneGesture?: Record<string, string>;
  sceneAnimation?: Record<string, string>;
  sceneDark?: Record<string, boolean>;
}

export function loadSession(): SavedSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

function saveSessionData(s: SavedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* ignore quota errors */ }
}

export function useSessionPersistence(state: DirectorState, frame: number) {
  const savedSession = useMemo(() => loadSession(), []);

  useEffect(() => {
    saveSessionData({
      compositionId: state.compositionId,
      selectedScene: state.selectedScene,
      frame,
      sceneGesture: state.sceneGesture,
      sceneAnimation: state.sceneAnimation,
      sceneDark: state.sceneDark,
    });
  }, [state.compositionId, state.selectedScene, frame, state.sceneGesture, state.sceneAnimation, state.sceneDark]);

  return savedSession;
}
