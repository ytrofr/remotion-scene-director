/**
 * useRestoredInitialState - Restores SceneDirector initial state from localStorage session.
 *
 * INVARIANT: Saved session data is NEVER modified on load.
 * The Save button is the single source of truth. Once the user saves,
 * their waypoints, layers, gestures, and all state are restored exactly
 * as-is on next load. No auto-sync, no coded-path overwrite, no silent mutation.
 * Only ENSURE_SCENE_LAYERS may add NEW layers for scenes that have none.
 */

import { useMemo } from 'react';
import type { DirectorState } from '../state';
import { loadSession, type SavedSession } from './useSessionPersistence';

/**
 * Loads the saved session and merges it over the provided initial state.
 * Saved data always wins — codedPaths are only used as initial defaults
 * when no saved data exists (via ENSURE_SCENE_LAYERS, not here).
 */
export function useRestoredInitialState(initialState: DirectorState) {
  const savedSession = useMemo(() => loadSession(), []);

  const restoredInitial = useMemo(() => {
    // User-saved waypoints and layers are trusted as-is.
    // No auto-sync with coded paths — manual edits always win.
    const waypoints = savedSession.waypoints
      ? { ...savedSession.waypoints }
      : undefined;
    const layers = savedSession.layers ? { ...savedSession.layers } : undefined;

    return {
      ...initialState,
      ...(savedSession.compositionId
        ? { compositionId: savedSession.compositionId }
        : {}),
      ...(savedSession.selectedScene
        ? { selectedScene: savedSession.selectedScene }
        : {}),
      ...(savedSession.sceneGesture
        ? { sceneGesture: savedSession.sceneGesture }
        : {}),
      ...(savedSession.sceneAnimation
        ? { sceneAnimation: savedSession.sceneAnimation }
        : {}),
      ...(savedSession.sceneDark ? { sceneDark: savedSession.sceneDark } : {}),
      ...(savedSession.clearedSceneLayers
        ? { clearedSceneLayers: savedSession.clearedSceneLayers }
        : {}),
      ...(layers ? { layers } : {}),
      ...(waypoints ? { waypoints } : {}),
      ...(savedSession.savedSnapshots
        ? { savedSnapshots: savedSession.savedSnapshots }
        : {}),
      ...(savedSession.sidebarTab
        ? { sidebarTab: savedSession.sidebarTab }
        : {}),
      ...(savedSession.versionHistory
        ? { versionHistory: savedSession.versionHistory }
        : {}),
    };
  }, []);

  return { restoredInitial, savedSession };
}
