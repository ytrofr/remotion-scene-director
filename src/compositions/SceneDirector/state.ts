/**
 * SceneDirector State v3
 * Gesture-first state: activeTool + per-scene gesture type replace all manual config.
 *
 * Types/interfaces: ./state.types.ts
 * Helper functions: ./state.helpers.ts
 * Handler groups:   ./state.handlers.ts, ./state.layerHandlers.ts
 */

import { GESTURE_PRESETS } from './gestures';
import type { DirectorAction, DirectorState } from './state.types';
import { syncHandLayer, describeAction, log } from './state.helpers';
import {
  handleWaypointAction,
  handleLayerAction,
  handleSceneManagementAction,
} from './state.handlers';

// Re-export all types so downstream imports from './state' keep working
export * from './state.types';
export {
  updateLayer,
  syncHandLayer,
  log,
  describeAction,
  MAX_LOG,
} from './state.helpers';

export function directorReducer(
  state: DirectorState,
  action: DirectorAction,
): DirectorState {
  // Log meaningful actions
  const desc = describeAction(action, state);
  if (desc) {
    state = log(state, desc.msg, desc.scene);
  }

  switch (action.type) {
    // ── Simple UI / navigation actions (inline — one-liners) ──────────────
    case 'SET_COMPOSITION':
      return {
        ...state,
        compositionId: action.id,
        selectedScene: null,
        selectedWaypoint: null,
      };
    case 'SELECT_SCENE':
      return {
        ...state,
        selectedScene: action.name,
        selectedWaypoint: null,
        draggingIndex: null,
      };
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool, selectedWaypoint: null };
    case 'SET_SCENE_GESTURE': {
      // Auto-update animation to match the new gesture's default
      const newAnim = GESTURE_PRESETS[action.gesture].animation;
      const withGesture = {
        ...state,
        sceneGesture: { ...state.sceneGesture, [action.scene]: action.gesture },
        sceneAnimation: { ...state.sceneAnimation, [action.scene]: newAnim },
      };
      return syncHandLayer(withGesture, action.scene);
    }
    case 'SELECT_WAYPOINT':
      return { ...state, selectedWaypoint: action.index };
    case 'TOGGLE_PREVIEW':
      return { ...state, preview: !state.preview };
    case 'TOGGLE_TRAIL':
      return { ...state, showTrail: !state.showTrail };
    case 'TOGGLE_EXPORT':
      return { ...state, exportOpen: !state.exportOpen, importOpen: false };
    case 'TOGGLE_IMPORT':
      return { ...state, importOpen: !state.importOpen };
    case 'START_DRAG':
      return {
        ...state,
        draggingIndex: action.index,
        selectedWaypoint: action.index,
      };
    case 'END_DRAG':
      return { ...state, draggingIndex: null };
    case 'SET_SCENE_ANIMATION':
      return {
        ...state,
        sceneAnimation: {
          ...state.sceneAnimation,
          [action.scene]: action.animation,
        },
      };
    case 'SET_SCENE_DARK':
      return {
        ...state,
        sceneDark: { ...state.sceneDark, [action.scene]: action.dark },
      };
    case 'SET_SIDEBAR_TAB':
      return { ...state, sidebarTab: action.tab };

    // ── Waypoint actions (delegated) ──────────────────────────────────────
    case 'ADD_WAYPOINT':
    case 'ADD_HAND_GESTURE':
    case 'UPDATE_WAYPOINT':
    case 'DELETE_WAYPOINT':
    case 'SET_WAYPOINTS':
    case 'ADOPT_CODED_PATH':
    case 'IMPORT_PATHS':
      return handleWaypointAction(state, action);

    // ── Layer actions (delegated) ─────────────────────────────────────────
    case 'ADD_LAYER':
    case 'REMOVE_LAYER':
    case 'UPDATE_LAYER':
    case 'UPDATE_LAYER_DATA':
    case 'SELECT_LAYER':
    case 'REORDER_LAYERS':
    case 'TOGGLE_LAYER_VISIBILITY':
    case 'TOGGLE_LAYER_LOCK':
    case 'ENSURE_SCENE_LAYERS':
      return handleLayerAction(state, action);

    // ── Scene management actions (delegated) ──────────────────────────────
    case 'REVERT_SCENE':
    case 'MARK_SAVED':
    case 'RESTORE_VERSION':
    case 'LOG_ACTIVITY':
    case 'RESTORE_ACTIVITY':
      return handleSceneManagementAction(state, action);

    default:
      return state;
  }
}
