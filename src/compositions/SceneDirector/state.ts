/**
 * SceneDirector State v3
 * Gesture-first state: activeTool + per-scene gesture type replace all manual config.
 */

import React from 'react';
import type { HandPathPoint, LottieAnimation } from '../../components/FloatingHand/types';
import type { GestureTool } from './gestures';

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
  | { type: 'UNDO' };

export const initialState: DirectorState = {
  compositionId: 'MobileChatDemoCombined',
  selectedScene: null,
  activeTool: 'click',
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
    default:
      return state;
  }
}

// Build composition registry
import { MobileChatDemoCombined, COMBINED_SCENE_INFO, COMBINED_VIDEO } from '../MobileChatDemoCombined';
import { DorianDemo, DORIAN_SCENE_INFO, VIDEO as DORIAN_VIDEO } from '../DorianDemo';
import { DashmorDemo, DASHMOR_SCENE_TIMINGS, VIDEO as DASHMOR_VIDEO } from '../DashmorDemo';

function dashmorSceneInfo(): SceneInfo[] {
  return DASHMOR_SCENE_TIMINGS.map((t, i) => ({
    name: `${i + 1}-${t.name.replace(/\s+/g, '')}`,
    start: t.from,
    end: t.from + t.durationInFrames,
  }));
}

export const COMPOSITIONS: CompositionEntry[] = [
  {
    id: 'MobileChatDemoCombined',
    label: 'Combined (V2+V4)',
    video: { width: 1080, height: 1920, fps: 30, frames: COMBINED_VIDEO.durationInFrames },
    scenes: COMBINED_SCENE_INFO.map(s => ({ name: s.name, start: s.start, end: s.end, part: s.part, hand: s.hand })),
    globalOffsetY: 120,
  },
  {
    id: 'DorianDemo',
    label: 'Dorian (Marketplace)',
    video: { width: 1080, height: 1920, fps: 30, frames: DORIAN_VIDEO.durationInFrames },
    scenes: DORIAN_SCENE_INFO.map(s => ({ name: s.name, start: s.start, end: s.end, hand: s.hand })),
  },
  {
    id: 'DashmorDemo',
    label: 'Dashmor (Dashboard)',
    video: { width: 1080, height: 1920, fps: 30, frames: DASHMOR_VIDEO.durationInFrames },
    scenes: dashmorSceneInfo(),
  },
];

// Component map for rendering
export const COMPOSITION_COMPONENTS: Record<string, React.FC> = {
  MobileChatDemoCombined,
  DorianDemo,
  DashmorDemo,
};
