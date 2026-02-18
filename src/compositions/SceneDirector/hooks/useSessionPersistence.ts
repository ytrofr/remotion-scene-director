/**
 * Session persistence hook - saves/restores SceneDirector state to localStorage.
 * MANUAL SAVE ONLY — nothing is saved unless the user clicks Save.
 */

import { useMemo, useCallback } from 'react';
import type { DirectorState, SceneSnapshot, VersionEntry } from '../state';
import type { Layer } from '../layers';
import type { HandPathPoint } from '../../../components/FloatingHand/types';

const STORAGE_KEY = 'scene-director-session';

export interface SavedSession {
  compositionId?: string;
  selectedScene?: string | null;
  frame?: number;
  sceneGesture?: Record<string, string>;
  sceneAnimation?: Record<string, string>;
  sceneDark?: Record<string, boolean>;
  clearedSceneLayers?: Record<string, boolean>;
  layers?: Record<string, Layer[]>;
  waypoints?: Record<string, HandPathPoint[]>;
  savedSnapshots?: Record<string, SceneSnapshot>;
  sidebarTab?: 'editor' | 'history';
  versionHistory?: Record<string, VersionEntry[]>;
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

  // Manual save — only called when user clicks Save
  const saveSession = useCallback(() => {
    saveSessionData({
      compositionId: state.compositionId,
      selectedScene: state.selectedScene,
      frame,
      sceneGesture: state.sceneGesture,
      sceneAnimation: state.sceneAnimation,
      sceneDark: state.sceneDark,
      clearedSceneLayers: state.clearedSceneLayers,
      layers: state.layers,
      waypoints: state.waypoints,
      savedSnapshots: state.savedSnapshots,
      sidebarTab: state.sidebarTab,
      versionHistory: state.versionHistory,
    });
  }, [state, frame]);

  return { savedSession, saveSession };
}
