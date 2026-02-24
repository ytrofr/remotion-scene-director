/**
 * SceneDirector State Helpers
 * Pure helper functions used by the director reducer.
 */

import type { HandPathPoint } from '../../components/FloatingHand/types';
import { createHandLayer, type Layer, type LayerBase } from './layers';
import type { GestureTool } from './gestures';
import type {
  ActivityEntry,
  DirectorAction,
  DirectorState,
} from './state.types';

export const MAX_LOG = 50;

// Type-safe layer update helper — preserves discriminated union type through spread
export function updateLayer(layer: Layer, changes: Partial<LayerBase>): Layer {
  return { ...layer, ...changes, id: layer.id, type: layer.type } as Layer;
}

/**
 * Sync hand layer in state.layers after any waypoint mutation.
 * If hand layer exists, update its waypoints+gesture data.
 * If no hand layer exists and waypoints are non-empty, create one.
 * Also clears clearedSceneLayers flag since user is actively editing.
 */
export function syncHandLayer(st: DirectorState, scene: string): DirectorState {
  const wps = st.waypoints[scene] || [];
  const sceneLayers = st.layers[scene] || [];
  const existingIdx = sceneLayers.findIndex((l) => l.type === 'hand');
  const gesture: GestureTool = st.sceneGesture[scene] || 'click';

  if (existingIdx >= 0) {
    // Update existing hand layer's waypoints + gesture
    const updated = sceneLayers.map((l, i) =>
      i === existingIdx
        ? ({ ...l, data: { ...l.data, waypoints: wps, gesture } } as Layer)
        : l,
    );
    return {
      ...st,
      layers: { ...st.layers, [scene]: updated },
    };
  }

  // No hand layer yet — create one if waypoints exist
  if (wps.length === 0) return st;

  const order = sceneLayers.length;
  const handLayer = createHandLayer(scene, wps, gesture, order);
  const cleared = { ...st.clearedSceneLayers };
  delete cleared[scene];
  return {
    ...st,
    layers: { ...st.layers, [scene]: [...sceneLayers, handLayer] },
    clearedSceneLayers: cleared,
  };
}

export function log(
  state: DirectorState,
  action: string,
  scene?: string,
): DirectorState {
  const entry: ActivityEntry = {
    time: Date.now(),
    action,
    scene,
    snapshot: { ...state },
  };
  return {
    ...state,
    activityLog: [entry, ...state.activityLog].slice(0, MAX_LOG),
  };
}

export function describeAction(
  action: DirectorAction,
  state: DirectorState,
): { msg: string; scene?: string } | null {
  switch (action.type) {
    case 'SET_COMPOSITION':
      return { msg: `Switch composition → ${action.id}` };
    case 'SET_SCENE_GESTURE':
      return { msg: `Set gesture → ${action.gesture}`, scene: action.scene };
    case 'ADD_WAYPOINT':
      return {
        msg: `Add waypoint #${(state.waypoints[action.scene]?.length ?? 0) + 1}`,
        scene: action.scene,
      };
    case 'ADD_HAND_GESTURE':
      return {
        msg: `Add ${action.gesture} gesture`,
        scene: action.scene,
      };
    case 'UPDATE_WAYPOINT':
      return { msg: `Move waypoint #${action.index + 1}`, scene: action.scene };
    case 'DELETE_WAYPOINT':
      return {
        msg: `Delete waypoint #${action.index + 1}`,
        scene: action.scene,
      };
    case 'SET_WAYPOINTS':
      return {
        msg: `Set ${action.waypoints.length} waypoints`,
        scene: action.scene,
      };
    case 'SET_SCENE_ANIMATION':
      return {
        msg: `Set animation → ${action.animation}`,
        scene: action.scene,
      };
    case 'SET_SCENE_DARK':
      return {
        msg: `Set hand ${action.dark ? 'light' : 'dark'}`,
        scene: action.scene,
      };
    case 'REVERT_SCENE':
      return { msg: `Revert scene`, scene: action.scene };
    case 'MARK_SAVED':
      return { msg: `Saved`, scene: action.scene };
    case 'RESTORE_VERSION':
      return { msg: `Restore version`, scene: action.scene };
    case 'IMPORT_PATHS':
      return {
        msg: `Import ${action.waypoints.length} waypoints`,
        scene: action.scene,
      };
    case 'ADD_LAYER':
      return {
        msg: `Add ${action.layer.type} layer "${action.layer.name}"`,
        scene: action.scene,
      };
    case 'REMOVE_LAYER': {
      const layer = (state.layers[action.scene] || []).find(
        (l) => l.id === action.layerId,
      );
      return {
        msg: `Remove layer "${layer?.name ?? action.layerId}"`,
        scene: action.scene,
      };
    }
    case 'UPDATE_LAYER_DATA':
      return null; // Suppressed — logged once on drag end, not per-frame
    case 'TOGGLE_LAYER_VISIBILITY': {
      const layer = (state.layers[action.scene] || []).find(
        (l) => l.id === action.layerId,
      );
      return { msg: `Toggle "${layer?.name}" visibility`, scene: action.scene };
    }
    default:
      return null; // Skip noisy actions (SELECT_SCENE, SELECT_WAYPOINT, drag, etc.)
  }
}
