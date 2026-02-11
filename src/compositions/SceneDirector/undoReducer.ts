/**
 * Undoable reducer wrapper for SceneDirector.
 * Wraps directorReducer with a history stack for Ctrl+Z undo.
 *
 * Undoable actions (create undo points):
 *   SET_WAYPOINTS, ADD_WAYPOINT, DELETE_WAYPOINT, CLEAR_SCENE,
 *   IMPORT_PATHS, SET_SCENE_GESTURE, START_DRAG (entire drag = 1 undo step),
 *   UPDATE_WAYPOINT (only when not mid-drag)
 *
 * Non-undoable (UI state, navigation):
 *   SET_COMPOSITION, SELECT_SCENE, SET_TOOL, SELECT_WAYPOINT,
 *   TOGGLE_*, END_DRAG, UPDATE_WAYPOINT during drag
 */

import { type DirectorState, type DirectorAction, directorReducer } from './state';

const MAX_HISTORY = 50;

const UNDOABLE_ACTIONS = new Set([
  'SET_WAYPOINTS',
  'ADD_WAYPOINT',
  'DELETE_WAYPOINT',
  'CLEAR_SCENE',
  'IMPORT_PATHS',
  'SET_SCENE_GESTURE',
]);

export interface UndoableState {
  past: DirectorState[];
  present: DirectorState;
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
    };
  }

  // UPDATE_WAYPOINT during drag: no new undo point (drag coalesced)
  if (action.type === 'UPDATE_WAYPOINT' && state.present.draggingIndex !== null) {
    return { ...state, present: newPresent };
  }

  // Standard undoable actions: push previous state onto stack
  if (
    UNDOABLE_ACTIONS.has(action.type) ||
    (action.type === 'UPDATE_WAYPOINT' && state.present.draggingIndex === null)
  ) {
    return {
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
      present: newPresent,
    };
  }

  // Non-undoable: update present without saving history
  return { ...state, present: newPresent };
}
