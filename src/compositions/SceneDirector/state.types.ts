/**
 * SceneDirector State Types
 * All interfaces, type definitions, and initial state for the SceneDirector.
 */

import type {
  HandPathPoint,
  LottieAnimation,
} from '../../components/FloatingHand/types';
import type { GestureTool } from './gestures';
import type { Layer, LayerBase, LayerData } from './layers';
import type { CodedPath } from './codedPaths';

// Scene info (unified format across compositions)
export interface SceneInfo {
  name: string;
  start: number;
  end: number;
  part?: string;
  hand?: string;
  zoom?: number; // scene's zoom level (default: 1.8 = base phone scale)
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
  time: number; // Date.now()
  action: string; // human-readable description
  scene?: string; // affected scene
  snapshot?: DirectorState; // full state snapshot for restore
}

// Saved snapshot per scene (for Revert)
export interface SceneSnapshot {
  waypoints: HandPathPoint[];
  gesture: GestureTool;
  animation: LottieAnimation;
  dark: boolean;
}

// Version history entry
export interface VersionEntry {
  version: number;
  timestamp: number;
  snapshot: SceneSnapshot;
}

// Main state
export interface DirectorState {
  compositionId: string;
  selectedScene: string | null;
  activeTool: GestureTool | 'select'; // replaces drawMode
  sceneGesture: Record<string, GestureTool>; // per-scene gesture type
  waypoints: Record<string, HandPathPoint[]>; // scene name -> waypoints
  selectedWaypoint: number | null; // index in current scene
  draggingIndex: number | null; // waypoint index being dragged (for hand snap)
  sceneAnimation: Record<string, LottieAnimation>; // per-scene animation override
  sceneDark: Record<string, boolean>; // per-scene dark mode override
  preview: boolean;
  showTrail: boolean;
  exportOpen: boolean;
  importOpen: boolean;
  // Layer system
  layers: Record<string, Layer[]>; // scene name -> ordered layers
  selectedLayerId: string | null;
  clearedSceneLayers: Record<string, boolean>; // scenes where user explicitly removed layers
  // Activity log
  activityLog: ActivityEntry[];
  // Saved snapshots for Revert (per scene, set on first load + after Save)
  savedSnapshots: Record<string, SceneSnapshot>;
  // Sidebar tab: editor or history
  sidebarTab: 'editor' | 'history';
  // Version history (per scene, appended on each Save)
  versionHistory: Record<string, VersionEntry[]>;
}

// Actions
export type DirectorAction =
  | { type: 'SET_COMPOSITION'; id: string }
  | { type: 'SELECT_SCENE'; name: string }
  | { type: 'SET_TOOL'; tool: GestureTool | 'select' }
  | { type: 'SET_SCENE_GESTURE'; scene: string; gesture: GestureTool }
  | { type: 'ADD_WAYPOINT'; scene: string; point: HandPathPoint }
  | {
      type: 'UPDATE_WAYPOINT';
      scene: string;
      index: number;
      point: Partial<HandPathPoint>;
    }
  | { type: 'DELETE_WAYPOINT'; scene: string; index: number }
  | { type: 'SET_WAYPOINTS'; scene: string; waypoints: HandPathPoint[] }
  | { type: 'SELECT_WAYPOINT'; index: number | null }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'TOGGLE_TRAIL' }
  | { type: 'TOGGLE_EXPORT' }
  | { type: 'TOGGLE_IMPORT' }
  | {
      type: 'IMPORT_PATHS';
      scene: string;
      waypoints: HandPathPoint[];
      gesture: GestureTool;
    }
  | { type: 'SET_SCENE_ANIMATION'; scene: string; animation: LottieAnimation }
  | { type: 'SET_SCENE_DARK'; scene: string; dark: boolean }
  | { type: 'REVERT_SCENE'; scene: string }
  | { type: 'MARK_SAVED'; scene: string }
  | { type: 'SET_SIDEBAR_TAB'; tab: 'editor' | 'history' }
  | { type: 'RESTORE_VERSION'; scene: string; snapshot: SceneSnapshot }
  | { type: 'START_DRAG'; index: number }
  | { type: 'END_DRAG' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | {
      type: 'ADOPT_CODED_PATH';
      scene: string;
      waypoints: HandPathPoint[];
      gesture?: GestureTool;
    }
  // Layer actions
  | { type: 'ADD_LAYER'; scene: string; layer: Layer }
  | { type: 'REMOVE_LAYER'; scene: string; layerId: string }
  | {
      type: 'UPDATE_LAYER';
      scene: string;
      layerId: string;
      changes: Partial<Layer>;
    }
  | {
      type: 'UPDATE_LAYER_DATA';
      scene: string;
      layerId: string;
      data: Partial<LayerData>;
    }
  | { type: 'SELECT_LAYER'; layerId: string | null }
  | { type: 'REORDER_LAYERS'; scene: string; layerIds: string[] }
  | { type: 'TOGGLE_LAYER_VISIBILITY'; scene: string; layerId: string }
  | { type: 'TOGGLE_LAYER_LOCK'; scene: string; layerId: string }
  // Activity log with snapshot
  | {
      type: 'LOG_ACTIVITY';
      action: string;
      scene?: string;
      snapshot: DirectorState;
    }
  | { type: 'RESTORE_ACTIVITY'; snapshot: DirectorState }
  // Add independent hand gesture (creates new hand layer)
  | {
      type: 'ADD_HAND_GESTURE';
      scene: string;
      points: HandPathPoint[];
      gesture: GestureTool;
      sceneZoom?: number; // scene's zoom level for default hand size
    }
  // Layer auto-migration
  | {
      type: 'ENSURE_SCENE_LAYERS';
      scene: string;
      compositionId: string;
      codedPath: CodedPath | null;
      sceneZoom?: number; // scene's zoom level for default hand size
    };

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
  savedSnapshots: {},
  sidebarTab: 'editor',
  versionHistory: {},
};
