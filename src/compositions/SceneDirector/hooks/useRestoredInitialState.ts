/**
 * useRestoredInitialState - Restores SceneDirector initial state from localStorage session.
 * Merges saved session data over initial state and syncs stale waypoints with coded paths.
 */

import { useMemo } from 'react';
import type { DirectorState } from '../state';
import { getCodedPath } from '../codedPaths';
import { loadSession, type SavedSession } from './useSessionPersistence';

/**
 * Loads the saved session and merges it over the provided initial state.
 * Syncs stale localStorage waypoints with current coded paths so that
 * coded path updates (e.g. scale changes) propagate correctly.
 *
 * @returns { restoredInitial, savedSession } - merged state and raw session data
 */
export function useRestoredInitialState(initialState: DirectorState) {
  const savedSession = useMemo(() => loadSession(), []);

  const restoredInitial = useMemo(() => {
    // Sync stale localStorage waypoints with current coded paths.
    // If stored waypoints match a coded path's frame structure (auto-derived),
    // refresh them so coded path updates (e.g. scale changes) propagate.
    const waypoints = savedSession.waypoints
      ? { ...savedSession.waypoints }
      : undefined;
    if (waypoints && savedSession.compositionId) {
      for (const [scene, wp] of Object.entries(waypoints)) {
        if (!wp?.length) continue;
        const coded = getCodedPath(savedSession.compositionId, scene);
        if (!coded || coded.path.length !== wp.length) continue;
        if (wp.every((w, i) => w.frame === coded.path[i].frame)) {
          waypoints[scene] = coded.path.map((p) => ({ ...p }));
        }
      }
    }
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
      ...(savedSession.layers ? { layers: savedSession.layers } : {}),
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
