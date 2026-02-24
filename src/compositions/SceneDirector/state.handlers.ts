/**
 * SceneDirector Reducer Handlers
 * Extracted handler groups for waypoint and scene-management actions.
 * Layer handlers live in ./state.layerHandlers.ts.
 * Each handler takes (state, action) and returns the new DirectorState.
 */

import type { HandPathPoint } from '../../components/FloatingHand/types';
import { GESTURE_PRESETS, type GestureTool } from './gestures';
import { createHandLayer, type Layer } from './layers';
import type {
  ActivityEntry,
  DirectorAction,
  DirectorState,
  SceneSnapshot,
} from './state.types';
import { syncHandLayer, MAX_LOG } from './state.helpers';

// Re-export layer handlers so state.ts can import from a single module
export { handleLayerAction } from './state.layerHandlers';

// ── Waypoint action types ──────────────────────────────────────────────────────

type WaypointAction = Extract<
  DirectorAction,
  | { type: 'ADD_WAYPOINT' }
  | { type: 'UPDATE_WAYPOINT' }
  | { type: 'DELETE_WAYPOINT' }
  | { type: 'SET_WAYPOINTS' }
  | { type: 'ADD_HAND_GESTURE' }
  | { type: 'ADOPT_CODED_PATH' }
  | { type: 'IMPORT_PATHS' }
>;

export function handleWaypointAction(
  state: DirectorState,
  action: WaypointAction,
): DirectorState {
  switch (action.type) {
    case 'ADD_WAYPOINT': {
      const prev = state.waypoints[action.scene] || [];
      const withWp = {
        ...state,
        waypoints: {
          ...state.waypoints,
          [action.scene]: [...prev, action.point],
        },
        selectedWaypoint: prev.length,
      };
      return syncHandLayer(withWp, action.scene);
    }
    case 'ADD_HAND_GESTURE': {
      // Create a new independent hand layer with its own waypoints
      const sceneLayers = state.layers[action.scene] || [];
      const order = sceneLayers.length;
      const newLayer = createHandLayer(
        action.scene,
        action.points,
        action.gesture,
        order,
      );
      const cleared = { ...state.clearedSceneLayers };
      delete cleared[action.scene];
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.scene]: [...sceneLayers, newLayer],
        },
        selectedLayerId: newLayer.id,
        selectedWaypoint: 0,
        clearedSceneLayers: cleared,
        // Don't override scene-level gesture/animation — secondary layers carry their own
      };
    }
    case 'UPDATE_WAYPOINT': {
      // Check if selected layer is a secondary hand layer (not synced via state.waypoints)
      if (state.selectedLayerId) {
        const sceneLayers = state.layers[action.scene] || [];
        const selIdx = sceneLayers.findIndex(
          (l) => l.id === state.selectedLayerId,
        );
        const selLayer = selIdx >= 0 ? sceneLayers[selIdx] : null;
        const primaryIdx = sceneLayers.findIndex((l) => l.type === 'hand');
        if (selLayer?.type === 'hand' && selIdx !== primaryIdx) {
          // Secondary hand layer: modify layer.data.waypoints directly
          const layerWps = [
            ...((selLayer.data as { waypoints?: HandPathPoint[] }).waypoints ||
              []),
          ];
          if (layerWps[action.index]) {
            layerWps[action.index] = {
              ...layerWps[action.index],
              ...action.point,
            };
          }
          const updated = sceneLayers.map((l, i) =>
            i === selIdx
              ? ({ ...l, data: { ...l.data, waypoints: layerWps } } as Layer)
              : l,
          );
          return {
            ...state,
            layers: { ...state.layers, [action.scene]: updated },
          };
        }
      }
      const wps = [...(state.waypoints[action.scene] || [])];
      if (wps[action.index]) {
        wps[action.index] = { ...wps[action.index], ...action.point };
      }
      const withWp = {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: wps },
      };
      return syncHandLayer(withWp, action.scene);
    }
    case 'DELETE_WAYPOINT': {
      // Check if selected layer is a secondary hand layer
      if (state.selectedLayerId) {
        const sceneLayers = state.layers[action.scene] || [];
        const selIdx = sceneLayers.findIndex(
          (l) => l.id === state.selectedLayerId,
        );
        const selLayer = selIdx >= 0 ? sceneLayers[selIdx] : null;
        const primaryIdx = sceneLayers.findIndex((l) => l.type === 'hand');
        if (selLayer?.type === 'hand' && selIdx !== primaryIdx) {
          const layerWps = [
            ...((selLayer.data as { waypoints?: HandPathPoint[] }).waypoints ||
              []),
          ];
          layerWps.splice(action.index, 1);
          if (layerWps.length === 0) {
            // No waypoints left: remove the layer entirely
            return {
              ...state,
              layers: {
                ...state.layers,
                [action.scene]: sceneLayers.filter((_, i) => i !== selIdx),
              },
              selectedLayerId: null,
              selectedWaypoint: null,
            };
          }
          const updated = sceneLayers.map((l, i) =>
            i === selIdx
              ? ({ ...l, data: { ...l.data, waypoints: layerWps } } as Layer)
              : l,
          );
          return {
            ...state,
            layers: { ...state.layers, [action.scene]: updated },
            selectedWaypoint: null,
          };
        }
      }
      const wps = [...(state.waypoints[action.scene] || [])];
      wps.splice(action.index, 1);
      const withWp = {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: wps },
        selectedWaypoint: null,
      };
      return syncHandLayer(withWp, action.scene);
    }
    case 'SET_WAYPOINTS': {
      const withWp = {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: action.waypoints },
      };
      return syncHandLayer(withWp, action.scene);
    }
    case 'ADOPT_CODED_PATH': {
      const updated: DirectorState = {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: action.waypoints },
      };
      if (action.gesture) {
        updated.sceneGesture = {
          ...state.sceneGesture,
          [action.scene]: action.gesture,
        };
      }
      return syncHandLayer(updated, action.scene);
    }
    case 'IMPORT_PATHS': {
      const withWp = {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: action.waypoints },
        sceneGesture: {
          ...state.sceneGesture,
          [action.scene]: action.gesture,
        },
        importOpen: false,
      };
      return syncHandLayer(withWp, action.scene);
    }
    default:
      return state;
  }
}

// ── Scene management action types ──────────────────────────────────────────────

type SceneManagementAction = Extract<
  DirectorAction,
  | { type: 'REVERT_SCENE' }
  | { type: 'MARK_SAVED' }
  | { type: 'RESTORE_VERSION' }
  | { type: 'LOG_ACTIVITY' }
  | { type: 'RESTORE_ACTIVITY' }
>;

export function handleSceneManagementAction(
  state: DirectorState,
  action: SceneManagementAction,
): DirectorState {
  switch (action.type) {
    case 'REVERT_SCENE': {
      const snap = state.savedSnapshots[action.scene];
      if (!snap) return state; // No saved state to revert to
      return {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: [...snap.waypoints] },
        sceneGesture: { ...state.sceneGesture, [action.scene]: snap.gesture },
        sceneAnimation: {
          ...state.sceneAnimation,
          [action.scene]: snap.animation,
        },
        sceneDark: { ...state.sceneDark, [action.scene]: snap.dark },
        selectedWaypoint: null,
      };
    }
    case 'MARK_SAVED': {
      const scene = action.scene;
      const snap: SceneSnapshot = {
        waypoints: [...(state.waypoints[scene] || [])],
        gesture: state.sceneGesture[scene] || 'click',
        animation:
          state.sceneAnimation[scene] ||
          GESTURE_PRESETS[state.sceneGesture[scene] || 'click'].animation,
        dark: state.sceneDark[scene] ?? false,
      };
      // Push version entry
      const sceneVersions = [...(state.versionHistory[scene] || [])];
      const nextVersion =
        sceneVersions.length > 0
          ? sceneVersions[sceneVersions.length - 1].version + 1
          : 1;
      sceneVersions.push({
        version: nextVersion,
        timestamp: Date.now(),
        snapshot: { ...snap },
      });
      return {
        ...state,
        savedSnapshots: { ...state.savedSnapshots, [scene]: snap },
        versionHistory: { ...state.versionHistory, [scene]: sceneVersions },
      };
    }
    case 'RESTORE_VERSION': {
      const s = action.snapshot;
      return {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: [...s.waypoints] },
        sceneGesture: { ...state.sceneGesture, [action.scene]: s.gesture },
        sceneAnimation: {
          ...state.sceneAnimation,
          [action.scene]: s.animation,
        },
        sceneDark: { ...state.sceneDark, [action.scene]: s.dark },
        selectedWaypoint: null,
      };
    }
    case 'LOG_ACTIVITY': {
      const entry: ActivityEntry = {
        time: Date.now(),
        action: action.action,
        scene: action.scene,
        snapshot: action.snapshot,
      };
      return {
        ...state,
        activityLog: [entry, ...state.activityLog].slice(0, MAX_LOG),
      };
    }
    case 'RESTORE_ACTIVITY': {
      // Restore full state but keep activityLog and versionHistory
      return {
        ...action.snapshot,
        activityLog: state.activityLog,
        versionHistory: state.versionHistory,
        savedSnapshots: state.savedSnapshots,
        sidebarTab: state.sidebarTab,
      };
    }
    default:
      return state;
  }
}
