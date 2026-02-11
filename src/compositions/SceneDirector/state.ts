/**
 * SceneDirector State v3
 * Gesture-first state: activeTool + per-scene gesture type replace all manual config.
 */

import React from 'react';
import type { HandPathPoint } from '../../components/FloatingHand/types';
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
}

// Main state
export interface DirectorState {
  compositionId: string;
  selectedScene: string | null;
  activeTool: GestureTool | 'select';                // replaces drawMode
  sceneGesture: Record<string, GestureTool>;          // per-scene gesture type
  waypoints: Record<string, HandPathPoint[]>;          // scene name -> waypoints
  selectedWaypoint: number | null;                     // index in current scene
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
  | { type: 'CLEAR_SCENE'; scene: string };

export const initialState: DirectorState = {
  compositionId: 'MobileChatDemoCombined',
  selectedScene: null,
  activeTool: 'click',
  sceneGesture: {},
  waypoints: {},
  selectedWaypoint: null,
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
      return { ...state, selectedScene: action.name, selectedWaypoint: null };
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
    case 'CLEAR_SCENE': {
      const newGestures = { ...state.sceneGesture };
      delete newGestures[action.scene];
      return {
        ...state,
        waypoints: { ...state.waypoints, [action.scene]: [] },
        sceneGesture: newGestures,
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
