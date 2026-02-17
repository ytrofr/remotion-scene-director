/**
 * SceneDirector State v3
 * Gesture-first state: activeTool + per-scene gesture type replace all manual config.
 */

import type { HandPathPoint, LottieAnimation } from '../../components/FloatingHand/types';
import { GESTURE_PRESETS, type GestureTool } from './gestures';
import { createHandLayer, type Layer, type ZoomKeyframe } from './layers';
import type { CodedPath } from './codedPaths';

// Scene info (unified format across compositions)
export interface SceneInfo {
  name: string;
  start: number;
  end: number;
  part?: string;
  hand?: string;
}

// Composition entry
export interface CompositionEntry {
  id: string;
  label: string;
  video: { width: number; height: number; fps: number; frames: number };
  scenes: SceneInfo[];
  /** Global Y offset applied by the composition (e.g. translateY(120px) in Combined) */
  globalOffsetY?: number;
}

// Main state
export interface DirectorState {
  compositionId: string;
  selectedScene: string | null;
  activeTool: GestureTool | 'select';                // replaces drawMode
  sceneGesture: Record<string, GestureTool>;          // per-scene gesture type
  waypoints: Record<string, HandPathPoint[]>;          // scene name -> waypoints
  selectedWaypoint: number | null;                     // index in current scene
  draggingIndex: number | null;                         // waypoint index being dragged (for hand snap)
  sceneAnimation: Record<string, LottieAnimation>;      // per-scene animation override
  sceneDark: Record<string, boolean>;                    // per-scene dark mode override
  preview: boolean;
  showTrail: boolean;
  exportOpen: boolean;
  importOpen: boolean;
  // Layer system
  layers: Record<string, Layer[]>;       // scene name -> ordered layers
  selectedLayerId: string | null;
}

// Actions
export type DirectorAction =
  | { type: 'SET_COMPOSITION'; id: string }
  | { type: 'SELECT_SCENE'; name: string }
  | { type: 'SET_TOOL'; tool: GestureTool | 'select' }
  | { type: 'SET_SCENE_GESTURE'; scene: string; gesture: GestureTool }
  | { type: 'ADD_WAYPOINT'; scene: string; point: HandPathPoint }
  | { type: 'UPDATE_WAYPOINT'; scene: string; index: number; point: Partial<HandPathPoint> }
  | { type: 'DELETE_WAYPOINT'; scene: string; index: number }
  | { type: 'SET_WAYPOINTS'; scene: string; waypoints: HandPathPoint[] }
  | { type: 'SELECT_WAYPOINT'; index: number | null }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'TOGGLE_TRAIL' }
  | { type: 'TOGGLE_EXPORT' }
  | { type: 'TOGGLE_IMPORT' }
  | { type: 'IMPORT_PATHS'; scene: string; waypoints: HandPathPoint[]; gesture: GestureTool }
  | { type: 'SET_SCENE_ANIMATION'; scene: string; animation: LottieAnimation }
  | { type: 'SET_SCENE_DARK'; scene: string; dark: boolean }
  | { type: 'CLEAR_SCENE'; scene: string }
  | { type: 'START_DRAG'; index: number }
  | { type: 'END_DRAG' }
  | { type: 'UNDO' }
  | { type: 'ADOPT_CODED_PATH'; scene: string; waypoints: HandPathPoint[]; gesture?: GestureTool }
  // Layer actions
  | { type: 'ADD_LAYER'; scene: string; layer: Layer }
  | { type: 'REMOVE_LAYER'; scene: string; layerId: string }
  | { type: 'UPDATE_LAYER'; scene: string; layerId: string; changes: Partial<Layer> }
  | { type: 'UPDATE_LAYER_DATA'; scene: string; layerId: string; data: any }
  | { type: 'SELECT_LAYER'; layerId: string | null }
  | { type: 'REORDER_LAYERS'; scene: string; layerIds: string[] }
  | { type: 'TOGGLE_LAYER_VISIBILITY'; scene: string; layerId: string }
  | { type: 'TOGGLE_LAYER_LOCK'; scene: string; layerId: string }
  // Layer auto-migration
  | { type: 'ENSURE_SCENE_LAYERS'; scene: string; codedPath: CodedPath | null };

export const initialState: DirectorState = {
  compositionId: 'MobileChatDemoCombined',
  selectedScene: null,
  activeTool: 'select',
  sceneGesture: {},
  waypoints: {},
  selectedWaypoint: null,
  draggingIndex: null,
  sceneAnimation: {},
  sceneDark: {},
  preview: false,
  showTrail: false,
  exportOpen: false,
  importOpen: false,
  layers: {},
  selectedLayerId: null,
};

export function directorReducer(state: DirectorState, action: DirectorAction): DirectorState {
  switch (action.type) {
    case 'SET_COMPOSITION':
      return { ...state, compositionId: action.id, selectedScene: null, selectedWaypoint: null };
    case 'SELECT_SCENE':
      return { ...state, selectedScene: action.name, selectedWaypoint: null, draggingIndex: null };
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool, selectedWaypoint: null };
    case 'SET_SCENE_GESTURE':
      return { ...state, sceneGesture: { ...state.sceneGesture, [action.scene]: action.gesture } };
    case 'ADD_WAYPOINT': {
      const prev = state.waypoints[action.scene] || [];
      return {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: [...prev, action.point] },
        selectedWaypoint: prev.length,
      };
    }
    case 'UPDATE_WAYPOINT': {
      const wps = [...(state.waypoints[action.scene] || [])];
      if (wps[action.index]) {
        wps[action.index] = { ...wps[action.index], ...action.point };
      }
      return { ...state, waypoints: { ...state.waypoints, [action.scene]: wps } };
    }
    case 'DELETE_WAYPOINT': {
      const wps = [...(state.waypoints[action.scene] || [])];
      wps.splice(action.index, 1);
      return {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: wps },
        selectedWaypoint: null,
      };
    }
    case 'SET_WAYPOINTS':
      return { ...state, waypoints: { ...state.waypoints, [action.scene]: action.waypoints } };
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
    case 'IMPORT_PATHS':
      return {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: action.waypoints },
        sceneGesture: { ...state.sceneGesture, [action.scene]: action.gesture },
        importOpen: false,
      };
    case 'START_DRAG':
      return { ...state, draggingIndex: action.index, selectedWaypoint: action.index };
    case 'END_DRAG':
      return { ...state, draggingIndex: null };
    case 'SET_SCENE_ANIMATION':
      return { ...state, sceneAnimation: { ...state.sceneAnimation, [action.scene]: action.animation } };
    case 'SET_SCENE_DARK':
      return { ...state, sceneDark: { ...state.sceneDark, [action.scene]: action.dark } };
    case 'CLEAR_SCENE': {
      const newGestures = { ...state.sceneGesture };
      delete newGestures[action.scene];
      const newAnims = { ...state.sceneAnimation };
      delete newAnims[action.scene];
      const newDark = { ...state.sceneDark };
      delete newDark[action.scene];
      return {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: [] },
        sceneGesture: newGestures,
        sceneAnimation: newAnims,
        sceneDark: newDark,
        selectedWaypoint: null,
      };
    }
    case 'ADOPT_CODED_PATH': {
      const updated: DirectorState = {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: action.waypoints },
      };
      if (action.gesture) {
        updated.sceneGesture = { ...state.sceneGesture, [action.scene]: action.gesture };
      }
      return updated;
    }
    // Layer actions
    case 'ADD_LAYER': {
      const sceneLayers = [...(state.layers[action.scene] || []), action.layer];
      return { ...state, layers: { ...state.layers, [action.scene]: sceneLayers }, selectedLayerId: action.layer.id };
    }
    case 'REMOVE_LAYER': {
      const removedLayer = (state.layers[action.scene] || []).find(l => l.id === action.layerId);
      const sceneLayers = (state.layers[action.scene] || []).filter(l => l.id !== action.layerId);
      const newState: DirectorState = {
        ...state,
        layers: { ...state.layers, [action.scene]: sceneLayers },
        selectedLayerId: state.selectedLayerId === action.layerId ? null : state.selectedLayerId,
      };
      // When removing a hand layer, also clear flat waypoints so the hand disappears
      if (removedLayer?.type === 'hand') {
        newState.waypoints = { ...state.waypoints, [action.scene]: [] };
      }
      return newState;
    }
    case 'UPDATE_LAYER': {
      const sceneLayers = (state.layers[action.scene] || []).map(l =>
        l.id === action.layerId ? { ...l, ...action.changes, id: l.id, type: l.type } as Layer : l
      );
      return { ...state, layers: { ...state.layers, [action.scene]: sceneLayers } };
    }
    case 'UPDATE_LAYER_DATA': {
      const sceneLayers = (state.layers[action.scene] || []).map(l =>
        l.id === action.layerId ? { ...l, data: { ...l.data, ...action.data } } as Layer : l
      );
      return { ...state, layers: { ...state.layers, [action.scene]: sceneLayers } };
    }
    case 'SELECT_LAYER':
      return { ...state, selectedLayerId: action.layerId };
    case 'REORDER_LAYERS': {
      const existing = state.layers[action.scene] || [];
      const ordered = action.layerIds
        .map(id => existing.find(l => l.id === id))
        .filter((l): l is Layer => !!l);
      return { ...state, layers: { ...state.layers, [action.scene]: ordered } };
    }
    case 'TOGGLE_LAYER_VISIBILITY': {
      const sceneLayers = (state.layers[action.scene] || []).map(l =>
        l.id === action.layerId ? { ...l, visible: !l.visible } as Layer : l
      );
      return { ...state, layers: { ...state.layers, [action.scene]: sceneLayers } };
    }
    case 'TOGGLE_LAYER_LOCK': {
      const sceneLayers = (state.layers[action.scene] || []).map(l =>
        l.id === action.layerId ? { ...l, locked: !l.locked } as Layer : l
      );
      return { ...state, layers: { ...state.layers, [action.scene]: sceneLayers } };
    }
    // Layer auto-migration: idempotently create hand layer from existing data
    case 'ENSURE_SCENE_LAYERS': {
      if ((state.layers[action.scene] || []).length > 0) return state;

      const waypoints = state.waypoints[action.scene] || [];
      const coded = action.codedPath;
      const effectiveWaypoints = waypoints.length > 0 ? waypoints : (coded?.path ?? []);
      if (effectiveWaypoints.length === 0) return state;

      const gesture: GestureTool = state.sceneGesture[action.scene] ?? (coded?.gesture as GestureTool) ?? 'click';
      const animation = state.sceneAnimation[action.scene] ?? GESTURE_PRESETS[gesture].animation;
      const dark = state.sceneDark[action.scene] ?? GESTURE_PRESETS[gesture].dark;

      const handLayer = createHandLayer(action.scene, effectiveWaypoints, gesture, animation, dark, 0);

      const newState: DirectorState = {
        ...state,
        layers: { ...state.layers, [action.scene]: [handLayer] },
        selectedLayerId: handLayer.id,
      };
      // Also adopt waypoints into flat state if they came from coded path
      if (waypoints.length === 0) {
        newState.waypoints = { ...state.waypoints, [action.scene]: effectiveWaypoints };
      }
      if (!state.sceneGesture[action.scene] && coded?.gesture) {
        newState.sceneGesture = { ...state.sceneGesture, [action.scene]: coded.gesture as GestureTool };
      }
      return newState;
    }
    default:
      return state;
  }
}

