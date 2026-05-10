/**
 * SceneDirector Layer Handlers
 * Extracted handler for all layer-related reducer actions.
 */

import type { HandPathPoint } from '../../components/FloatingHand/types';
import { GESTURE_PRESETS, type GestureTool } from './gestures';
import {
  createHandLayer,
  createAudioLayer,
  createCaptionLayer,
  getCodedAudio,
  AUDIO_FILES,
  type Layer,
  type HandLayer,
  type HandLayerData,
} from './layers';
import { parseSrt } from '@remotion/captions';
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
  | { type: 'LOAD_CAPTIONS_FROM_SRT' }
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
          // Default size: base 120 scaled by scene zoom ratio.
          // Saved `coded.size` (Stage 2) wins over the zoom-default.
          const baseZoom = 1.8;
          const defaultSize = Math.round(
            120 * ((action.sceneZoom ?? baseZoom) / baseZoom),
          );
          const effectiveSize = coded?.size ?? defaultSize;
          newLayers.push(
            createHandLayer(
              action.scene,
              effectiveWaypoints,
              gesture,
              order++,
              effectiveSize,
              coded?.physicsPreset,
              coded?.showRipple,
            ),
          );

          // ── Secondary hand layers from codedPaths ──
          if (coded?.secondaryLayers) {
            for (const sec of coded.secondaryLayers) {
              if (sec.path.length > 0) {
                const secLayer = createHandLayer(
                  action.scene,
                  sec.path,
                  sec.gesture as GestureTool,
                  order++,
                  effectiveSize,
                );
                newLayers.push(secLayer);
              }
            }
          }
        }
      }

      // ── Hydrate existing primary hand layer's Stage 2 fields ──
      // One-shot fill from saved JSON (`coded` is already saved-merged-
      // with-coded per getCodedPath()). Only fills fields that are
      // currently undefined on the layer — never overwrites a value the
      // user (or a prior hydration) already set. Without this, a
      // localStorage hand layer created before Stage 2 shipped has
      // physicsPreset/showRipple/size = undefined; Inspector then shows
      // empty even though saved JSON has effective values, and
      // buildProposalForScene reads undefined → server-side merge keeps
      // the JSON value (after the savePathEntryMerge fix), but the UI is
      // stale. This closes that loop.
      let hydratedExisting: Layer[] | null = null;
      if (hasHand && action.codedPath) {
        const layers = state.layers[action.scene]!;
        const primaryIdx = layers.findIndex((l) => l.type === 'hand');
        const primary = primaryIdx >= 0 ? layers[primaryIdx] : null;
        if (primary && primary.type === 'hand') {
          const data = primary.data;
          const updates: Partial<HandLayerData> = {};
          if (
            data.physicsPreset === undefined &&
            action.codedPath.physicsPreset !== undefined
          ) {
            updates.physicsPreset = action.codedPath.physicsPreset;
          }
          if (
            data.showRipple === undefined &&
            action.codedPath.showRipple !== undefined
          ) {
            updates.showRipple = action.codedPath.showRipple;
          }
          if (data.size === undefined && action.codedPath.size !== undefined) {
            updates.size = action.codedPath.size;
          }
          if (Object.keys(updates).length > 0) {
            const updatedLayer: HandLayer = {
              ...primary,
              data: { ...data, ...updates },
            };
            hydratedExisting = [
              ...layers.slice(0, primaryIdx),
              updatedLayer,
              ...layers.slice(primaryIdx + 1),
            ];
          }
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

      // ── Initialize gesture/animation/dark from codedPaths (always, even if layers exist) ──
      const coded = action.codedPath;
      let newState: DirectorState = state;
      let changed = false;

      if (newLayers.length > 0) {
        const layers = [...existing, ...newLayers];
        newState = {
          ...state,
          layers: { ...state.layers, [action.scene]: layers },
          selectedLayerId: newLayers[0].id,
        };
        changed = true;
        // Also adopt waypoints into flat state if they came from coded path
        if ((!waypoints || waypoints.length === 0) && coded?.path?.length) {
          newState.waypoints = {
            ...state.waypoints,
            [action.scene]: coded.path,
          };
        }
      } else if (hydratedExisting) {
        // No new layers added, but existing primary hand layer needed
        // hydration of Stage 2 fields from saved JSON.
        newState = {
          ...state,
          layers: { ...state.layers, [action.scene]: hydratedExisting },
        };
        changed = true;
      }

      if (!newState.sceneGesture[action.scene] && coded?.gesture) {
        newState = changed ? newState : { ...state };
        changed = true;
        newState.sceneGesture = {
          ...newState.sceneGesture,
          [action.scene]: coded.gesture as GestureTool,
        };
      }
      if (newState.sceneDark[action.scene] === undefined && coded) {
        newState = changed ? newState : { ...state };
        changed = true;
        const gesture2: GestureTool =
          newState.sceneGesture[action.scene] ??
          (coded.gesture as GestureTool) ??
          'click';
        const darkValue = coded.dark ?? GESTURE_PRESETS[gesture2].dark;
        newState.sceneDark = {
          ...newState.sceneDark,
          [action.scene]: darkValue,
        };
      }
      if (newState.sceneAnimation[action.scene] === undefined) {
        newState = changed ? newState : { ...state };
        changed = true;
        const gesture3: GestureTool =
          newState.sceneGesture[action.scene] ??
          (coded?.gesture as GestureTool) ??
          'click';
        newState.sceneAnimation = {
          ...newState.sceneAnimation,
          [action.scene]:
            coded?.animation ?? GESTURE_PRESETS[gesture3].animation,
        };
      }
      // Seed lock state from codedPaths (only if not already set by user/session)
      if (
        newState.sceneLocked[action.scene] === undefined &&
        coded?._locked !== undefined
      ) {
        newState = changed ? newState : { ...state };
        changed = true;
        newState.sceneLocked = {
          ...newState.sceneLocked,
          [action.scene]: coded._locked,
        };
      }

      if (!changed) return state;

      // Snapshot initial state for Revert (only if no saved snapshot exists yet)
      if (!state.savedSnapshots[action.scene]) {
        const snapGesture: GestureTool =
          newState.sceneGesture[action.scene] ??
          (coded?.gesture as GestureTool) ??
          'click';
        const snapAnim =
          newState.sceneAnimation[action.scene] ??
          coded?.animation ??
          GESTURE_PRESETS[snapGesture].animation;
        const snapDark =
          newState.sceneDark[action.scene] ??
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
      return newState;
    }
    case 'LOAD_CAPTIONS_FROM_SRT': {
      // Skip if caption layers already exist anywhere
      const hasCaptions = Object.values(state.layers).some((sceneLayers) =>
        sceneLayers.some((l) => l.type === 'caption'),
      );
      if (hasCaptions) return state;

      const { captions } = parseSrt({ input: action.srt });
      const captionLayers: Layer[] = captions.map((cap, i) => {
        const startFrame = Math.round((cap.startMs / 1000) * action.fps);
        const durationInFrames = Math.round(
          ((cap.endMs - cap.startMs) / 1000) * action.fps,
        );
        return createCaptionLayer(
          '__captions__',
          cap.text,
          startFrame,
          durationInFrames,
          i,
        );
      });

      return {
        ...state,
        layers: {
          ...state.layers,
          __captions__: [
            ...(state.layers['__captions__'] || []),
            ...captionLayers,
          ],
        },
      };
    }
    default:
      return state;
  }
}
