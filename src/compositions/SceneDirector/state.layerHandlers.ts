/**
 * SceneDirector Layer Handlers
 * Extracted handler for all layer-related reducer actions.
 */

import type { HandPathPoint } from '../../components/FloatingHand/types';
import { GESTURE_PRESETS, type GestureTool } from './gestures';
import {
  createHandLayer,
  createAudioLayer,
  getCodedAudio,
  AUDIO_FILES,
  type Layer,
} from './layers';
import type { DirectorAction, DirectorState } from './state.types';
import { updateLayer } from './state.helpers';

// ── Layer action types ─────────────────────────────────────────────────────────

type LayerAction = Extract<
  DirectorAction,
  | { type: 'ADD_LAYER' }
  | { type: 'REMOVE_LAYER' }
  | { type: 'UPDATE_LAYER' }
  | { type: 'UPDATE_LAYER_DATA' }
  | { type: 'SELECT_LAYER' }
  | { type: 'REORDER_LAYERS' }
  | { type: 'TOGGLE_LAYER_VISIBILITY' }
  | { type: 'TOGGLE_LAYER_LOCK' }
  | { type: 'ENSURE_SCENE_LAYERS' }
>;

export function handleLayerAction(
  state: DirectorState,
  action: LayerAction,
): DirectorState {
  switch (action.type) {
    case 'ADD_LAYER': {
      const sceneLayers = [...(state.layers[action.scene] || []), action.layer];
      const cleared = { ...state.clearedSceneLayers };
      delete cleared[action.scene];
      return {
        ...state,
        layers: { ...state.layers, [action.scene]: sceneLayers },
        selectedLayerId: action.layer.id,
        clearedSceneLayers: cleared,
      };
    }
    case 'REMOVE_LAYER': {
      const removedLayer = (state.layers[action.scene] || []).find(
        (l) => l.id === action.layerId,
      );
      const sceneLayers = (state.layers[action.scene] || []).filter(
        (l) => l.id !== action.layerId,
      );
      const isSelectedLayer = state.selectedLayerId === action.layerId;
      const newState: DirectorState = {
        ...state,
        layers: { ...state.layers, [action.scene]: sceneLayers },
        selectedLayerId: isSelectedLayer ? null : state.selectedLayerId,
        // Clear interaction state when removing the active layer
        selectedWaypoint: isSelectedLayer ? null : state.selectedWaypoint,
        draggingIndex: isSelectedLayer ? null : state.draggingIndex,
      };
      // When removing the PRIMARY hand layer, also clear flat waypoints so the hand disappears
      // Secondary hand layers only store waypoints in layer.data (removed with the layer itself)
      if (removedLayer?.type === 'hand') {
        const allHandLayers = (state.layers[action.scene] || []).filter(
          (l) => l.type === 'hand',
        );
        const isPrimary =
          allHandLayers.length > 0 && allHandLayers[0].id === action.layerId;
        if (isPrimary) {
          newState.waypoints = { ...state.waypoints, [action.scene]: [] };
        }
      }
      // Mark scene as cleared so ENSURE_SCENE_LAYERS won't recreate on reload
      if (sceneLayers.length === 0) {
        newState.clearedSceneLayers = {
          ...state.clearedSceneLayers,
          [action.scene]: true,
        };
      }
      return newState;
    }
    case 'UPDATE_LAYER': {
      const sceneLayers = (state.layers[action.scene] || []).map((l) =>
        l.id === action.layerId ? updateLayer(l, action.changes) : l,
      );
      return {
        ...state,
        layers: { ...state.layers, [action.scene]: sceneLayers },
      };
    }
    case 'UPDATE_LAYER_DATA': {
      const sceneLayers = (state.layers[action.scene] || []).map((l) =>
        l.id === action.layerId
          ? ({ ...l, data: { ...l.data, ...action.data } } as Layer)
          : l,
      );
      return {
        ...state,
        layers: { ...state.layers, [action.scene]: sceneLayers },
      };
    }
    case 'SELECT_LAYER': {
      // Clamp selectedWaypoint to the new layer's waypoint count to prevent out-of-bounds
      let clampedWaypoint = state.selectedWaypoint;
      if (action.layerId && state.selectedScene) {
        const layers = state.layers[state.selectedScene] || [];
        const layer = layers.find((l) => l.id === action.layerId);
        if (layer?.type === 'hand') {
          const wps =
            (layer.data as { waypoints?: HandPathPoint[] }).waypoints || [];
          if (clampedWaypoint !== null && clampedWaypoint >= wps.length) {
            clampedWaypoint = wps.length > 0 ? wps.length - 1 : null;
          }
        }
      }
      return {
        ...state,
        selectedLayerId: action.layerId,
        selectedWaypoint: clampedWaypoint,
      };
    }
    case 'REORDER_LAYERS': {
      const existing = state.layers[action.scene] || [];
      const ordered = action.layerIds
        .map((id) => existing.find((l) => l.id === id))
        .filter((l): l is Layer => !!l);
      return { ...state, layers: { ...state.layers, [action.scene]: ordered } };
    }
    case 'TOGGLE_LAYER_VISIBILITY': {
      const sceneLayers = (state.layers[action.scene] || []).map((l) =>
        l.id === action.layerId ? updateLayer(l, { visible: !l.visible }) : l,
      );
      return {
        ...state,
        layers: { ...state.layers, [action.scene]: sceneLayers },
      };
    }
    case 'TOGGLE_LAYER_LOCK': {
      const sceneLayers = (state.layers[action.scene] || []).map((l) =>
        l.id === action.layerId ? updateLayer(l, { locked: !l.locked }) : l,
      );
      return {
        ...state,
        layers: { ...state.layers, [action.scene]: sceneLayers },
      };
    }
    case 'ENSURE_SCENE_LAYERS': {
      // User explicitly cleared all layers for this scene — respect deletion
      if (state.clearedSceneLayers[action.scene]) return state;

      const existing = state.layers[action.scene] || [];
      const hasHand = existing.some((l) => l.type === 'hand');
      const hasAudio = existing.some((l) => l.type === 'audio');

      const newLayers: Layer[] = [];
      let order = existing.length;

      // ── Hand layer (skip if one already exists) ──
      // undefined = never loaded (use coded path), [] = user cleared (respect deletion).
      const waypoints = state.waypoints[action.scene];
      const userCleared = waypoints !== undefined && waypoints.length === 0;

      if (!hasHand && !userCleared) {
        const coded = action.codedPath;
        const effectiveWaypoints =
          waypoints && waypoints.length > 0 ? waypoints : (coded?.path ?? []);
        if (effectiveWaypoints.length > 0) {
          const gesture: GestureTool =
            state.sceneGesture[action.scene] ??
            (coded?.gesture as GestureTool) ??
            'click';
          newLayers.push(
            createHandLayer(action.scene, effectiveWaypoints, gesture, order++),
          );
        }
      }

      // ── Audio layers from coded audio (skip if audio layers already exist) ──
      if (!hasAudio) {
        const codedAudio = getCodedAudio(action.compositionId, action.scene);
        for (const entry of codedAudio) {
          const audioLayer = createAudioLayer(action.scene, order++);
          const label =
            AUDIO_FILES.find((f) => f.id === entry.file)?.label ?? 'Audio';
          audioLayer.data = {
            file: entry.file,
            startFrame: entry.startFrame,
            durationInFrames: entry.durationInFrames,
            volume: entry.volume,
          };
          audioLayer.name = `Audio - ${label}`;
          newLayers.push(audioLayer);
        }
      }

      if (newLayers.length === 0) return state;

      const layers = [...existing, ...newLayers];
      const newState: DirectorState = {
        ...state,
        layers: { ...state.layers, [action.scene]: layers },
        selectedLayerId: newLayers[0].id,
      };
      // Also adopt waypoints into flat state if they came from coded path
      const coded = action.codedPath;
      if ((!waypoints || waypoints.length === 0) && coded?.path?.length) {
        newState.waypoints = { ...state.waypoints, [action.scene]: coded.path };
      }
      if (!state.sceneGesture[action.scene] && coded?.gesture) {
        newState.sceneGesture = {
          ...state.sceneGesture,
          [action.scene]: coded.gesture as GestureTool,
        };
      }
      // Snapshot initial state for Revert (only if no saved snapshot exists yet)
      if (!state.savedSnapshots[action.scene]) {
        const snapGesture: GestureTool =
          newState.sceneGesture[action.scene] ??
          (coded?.gesture as GestureTool) ??
          'click';
        const snapAnim =
          newState.sceneAnimation?.[action.scene] ??
          state.sceneAnimation[action.scene] ??
          GESTURE_PRESETS[snapGesture].animation;
        const snapDark =
          newState.sceneDark?.[action.scene] ??
          state.sceneDark[action.scene] ??
          coded?.dark ??
          GESTURE_PRESETS[snapGesture].dark;
        newState.savedSnapshots = {
          ...(newState.savedSnapshots || state.savedSnapshots),
          [action.scene]: {
            waypoints: [
              ...(newState.waypoints[action.scene] ||
                state.waypoints[action.scene] ||
                []),
            ],
            gesture: snapGesture,
            animation: snapAnim,
            dark: snapDark,
          },
        };
      }
      // Persist computed dark/animation fallbacks so they survive scene switches
      if (state.sceneDark[action.scene] === undefined) {
        const gesture2: GestureTool =
          newState.sceneGesture[action.scene] ??
          (coded?.gesture as GestureTool) ??
          'click';
        const darkValue = coded?.dark ?? GESTURE_PRESETS[gesture2].dark;
        newState.sceneDark = {
          ...(newState.sceneDark || state.sceneDark),
          [action.scene]: darkValue,
        };
      }
      if (state.sceneAnimation[action.scene] === undefined) {
        const gesture3: GestureTool =
          newState.sceneGesture[action.scene] ??
          (coded?.gesture as GestureTool) ??
          'click';
        newState.sceneAnimation = {
          ...(newState.sceneAnimation || state.sceneAnimation),
          [action.scene]: GESTURE_PRESETS[gesture3].animation,
        };
      }
      return newState;
    }
    default:
      return state;
  }
}
