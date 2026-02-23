/**
 * Undoable reducer wrapper for SceneDirector.
 * Wraps directorReducer with history stacks for Ctrl+Z undo / Ctrl+Y redo.
 *
 * Undoable actions (create undo points):
 *   SET_WAYPOINTS, ADD_WAYPOINT, DELETE_WAYPOINT, REVERT_SCENE, RESTORE_VERSION,
 *   IMPORT_PATHS, SET_SCENE_GESTURE, START_DRAG (entire drag = 1 undo step),
 *   UPDATE_WAYPOINT (only when not mid-drag), ADD_HAND_GESTURE
 *
 * Non-undoable (UI state, navigation):
 *   SET_COMPOSITION, SELECT_SCENE, SET_TOOL, SELECT_WAYPOINT,
 *   TOGGLE_*, END_DRAG, UPDATE_WAYPOINT during drag
 */

import {
  type DirectorState,
  type DirectorAction,
  directorReducer,
} from './state';

const MAX_HISTORY = 50;

const UNDOABLE_ACTIONS = new Set([
  'SET_WAYPOINTS',
  'ADD_WAYPOINT',
  'DELETE_WAYPOINT',
  'REVERT_SCENE',
  'RESTORE_VERSION',
  'IMPORT_PATHS',
  'SET_SCENE_GESTURE',
  'ADD_LAYER',
  'REMOVE_LAYER',
  'UPDATE_LAYER',
  'UPDATE_LAYER_DATA',
  'REORDER_LAYERS',
  'TOGGLE_LAYER_VISIBILITY',
  'TOGGLE_LAYER_LOCK',
  'ADD_HAND_GESTURE',
]);

export interface UndoableState {
  past: DirectorState[];
  present: DirectorState;
  future: DirectorState[];
}

export function undoableReducer(
  state: UndoableState,
  action: DirectorAction,
): UndoableState {
  // Handle UNDO
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    return {
      past: state.past.slice(0, -1),
      present: state.past[state.past.length - 1],
      future: [state.present, ...state.future].slice(0, MAX_HISTORY),
    };
  }

  // Handle REDO
  if (action.type === 'REDO') {
    if (state.future.length === 0) return state;
    return {
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
      present: state.future[0],
      future: state.future.slice(1),
    };
  }

  const newPresent = directorReducer(state.present, action);

  // No state change — skip
  if (newPresent === state.present) return state;

  // START_DRAG: save undo point so entire drag is one undo step
  if (action.type === 'START_DRAG') {
    return {
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
      present: newPresent,
      future: [], // Clear redo stack on new action
    };
  }

  // UPDATE_WAYPOINT during drag: no new undo point (drag coalesced)
  if (
    action.type === 'UPDATE_WAYPOINT' &&
    state.present.draggingIndex !== null
  ) {
    return { ...state, present: newPresent };
  }

  // Standard undoable actions: push previous state onto stack, clear redo
  if (
    UNDOABLE_ACTIONS.has(action.type) ||
    (action.type === 'UPDATE_WAYPOINT' && state.present.draggingIndex === null)
  ) {
    return {
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
      present: newPresent,
      future: [], // Clear redo stack on new action
    };
  }

  // Non-undoable: update present without saving history, preserve redo stack
  return { ...state, present: newPresent };
}
