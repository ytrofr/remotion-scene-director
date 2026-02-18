/**
 * SceneDirector State v3
 * Gesture-first state: activeTool + per-scene gesture type replace all manual config.
 */

import type { HandPathPoint, LottieAnimation } from '../../components/FloatingHand/types';
import { GESTURE_PRESETS, type GestureTool } from './gestures';
import { createHandLayer, createAudioLayer, getCodedAudio, AUDIO_FILES, type Layer, type ZoomKeyframe } from './layers';
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

// Activity log entry
export interface ActivityEntry {
  time: number;        // Date.now()
  action: string;      // human-readable description
  scene?: string;      // affected scene
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
  clearedSceneLayers: Record<string, boolean>;  // scenes where user explicitly removed layers
  // Activity log
  activityLog: ActivityEntry[];
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
  | { type: 'ENSURE_SCENE_LAYERS'; scene: string; compositionId: string; codedPath: CodedPath | null };

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
  clearedSceneLayers: {},
  activityLog: [],
};

const MAX_LOG = 50;
function log(state: DirectorState, action: string, scene?: string): DirectorState {
  const entry: ActivityEntry = { time: Date.now(), action, scene };
  return { ...state, activityLog: [entry, ...state.activityLog].slice(0, MAX_LOG) };
}

function describeAction(action: DirectorAction, state: DirectorState): { msg: string; scene?: string } | null {
  switch (action.type) {
    case 'SET_COMPOSITION': return { msg: `Switch composition → ${action.id}` };
    case 'SET_SCENE_GESTURE': return { msg: `Set gesture → ${action.gesture}`, scene: action.scene };
    case 'ADD_WAYPOINT': return { msg: `Add waypoint #${(state.waypoints[action.scene]?.length ?? 0) + 1}`, scene: action.scene };
    case 'UPDATE_WAYPOINT': return { msg: `Move waypoint #${action.index + 1}`, scene: action.scene };
    case 'DELETE_WAYPOINT': return { msg: `Delete waypoint #${action.index + 1}`, scene: action.scene };
    case 'SET_WAYPOINTS': return { msg: `Set ${action.waypoints.length} waypoints`, scene: action.scene };
    case 'SET_SCENE_ANIMATION': return { msg: `Set animation → ${action.animation}`, scene: action.scene };
    case 'SET_SCENE_DARK': return { msg: `Set hand ${action.dark ? 'light' : 'dark'}`, scene: action.scene };
    case 'CLEAR_SCENE': return { msg: `Clear scene`, scene: action.scene };
    case 'IMPORT_PATHS': return { msg: `Import ${action.waypoints.length} waypoints`, scene: action.scene };
    case 'ADD_LAYER': return { msg: `Add ${action.layer.type} layer "${action.layer.name}"`, scene: action.scene };
    case 'REMOVE_LAYER': {
      const layer = (state.layers[action.scene] || []).find(l => l.id === action.layerId);
      return { msg: `Remove layer "${layer?.name ?? action.layerId}"`, scene: action.scene };
    }
    case 'UPDATE_LAYER_DATA': return { msg: `Edit layer data`, scene: action.scene };
    case 'TOGGLE_LAYER_VISIBILITY': {
      const layer = (state.layers[action.scene] || []).find(l => l.id === action.layerId);
      return { msg: `Toggle "${layer?.name}" visibility`, scene: action.scene };
    }
    default: return null; // Skip noisy actions (SELECT_SCENE, SELECT_WAYPOINT, drag, etc.)
  }
}

export function directorReducer(state: DirectorState, action: DirectorAction): DirectorState {
  // Log meaningful actions
  const desc = describeAction(action, state);
  if (desc) {
    state = log(state, desc.msg, desc.scene);
  }

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
      const cleared = { ...state.clearedSceneLayers };
      delete cleared[action.scene];
      return { ...state, layers: { ...state.layers, [action.scene]: sceneLayers }, selectedLayerId: action.layer.id, clearedSceneLayers: cleared };
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
      // Mark scene as cleared so ENSURE_SCENE_LAYERS won't recreate on reload
      if (sceneLayers.length === 0) {
        newState.clearedSceneLayers = { ...state.clearedSceneLayers, [action.scene]: true };
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
    // Layer auto-migration: idempotently create hand + audio layers from existing data
    case 'ENSURE_SCENE_LAYERS': {
      if ((state.layers[action.scene] || []).length > 0) return state;
      // User explicitly cleared all layers for this scene — respect deletion
      if (state.clearedSceneLayers[action.scene]) return state;

      const layers: Layer[] = [];
      let order = 0;

      // ── Hand layer ──
      // If user explicitly cleared this scene (waypoints set to []), don't re-create.
      // undefined = never loaded (use coded path), [] = user cleared (respect deletion).
      const waypoints = state.waypoints[action.scene];
      const userCleared = waypoints !== undefined && waypoints.length === 0;

      if (!userCleared) {
        const coded = action.codedPath;
        const effectiveWaypoints = (waypoints && waypoints.length > 0) ? waypoints : (coded?.path ?? []);
        if (effectiveWaypoints.length > 0) {
          const gesture: GestureTool = state.sceneGesture[action.scene] ?? (coded?.gesture as GestureTool) ?? 'click';
          const animation = state.sceneAnimation[action.scene] ?? GESTURE_PRESETS[gesture].animation;
          const dark = state.sceneDark[action.scene] ?? GESTURE_PRESETS[gesture].dark;
          layers.push(createHandLayer(action.scene, effectiveWaypoints, gesture, animation, dark, order++));
        }
      }

      // ── Audio layers from coded audio ──
      const codedAudio = getCodedAudio(action.compositionId, action.scene);
      for (const entry of codedAudio) {
        const audioLayer = createAudioLayer(action.scene, order++);
        const label = AUDIO_FILES.find(f => f.id === entry.file)?.label ?? 'Audio';
        audioLayer.data = { file: entry.file, startFrame: entry.startFrame, durationInFrames: entry.durationInFrames, volume: entry.volume };
        audioLayer.name = `Audio - ${label}`;
        layers.push(audioLayer);
      }

      if (layers.length === 0) return state;

      const newState: DirectorState = {
        ...state,
        layers: { ...state.layers, [action.scene]: layers },
        selectedLayerId: layers[0].id,
      };
      // Also adopt waypoints into flat state if they came from coded path
      const coded = action.codedPath;
      if ((!waypoints || waypoints.length === 0) && coded?.path?.length) {
        newState.waypoints = { ...state.waypoints, [action.scene]: coded.path };
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

