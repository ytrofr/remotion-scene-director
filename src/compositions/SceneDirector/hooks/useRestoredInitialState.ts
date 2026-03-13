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

    // Playhead localStorage has the latest scene/comp (auto-saved, not dependent on Save button)
    let playheadScene: string | null = null;
    let playheadComp: string | null = null;
    try {
      const playhead = JSON.parse(
        localStorage.getItem('scene-director-playhead') || '{}',
      );
      if (typeof playhead.scene === 'string') playheadScene = playhead.scene;
      if (typeof playhead.comp === 'string') playheadComp = playhead.comp;
    } catch {
      /* ignore */
    }

    return {
      ...initialState,
      ...(playheadComp || savedSession.compositionId
        ? { compositionId: playheadComp || savedSession.compositionId }
        : {}),
      ...(playheadScene || savedSession.selectedScene
        ? { selectedScene: playheadScene || savedSession.selectedScene }
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
