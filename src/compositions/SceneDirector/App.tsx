/**
 * SceneDirector v3.1 - Gesture-First App
 * CSS Grid layout + Remotion Player + Context Provider
 */

import React, {
  useReducer,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { PlayerRef } from '@remotion/player';
import { initialState } from './state';
import { COMPOSITIONS, COMPOSITION_COMPONENTS } from './compositions';
import { undoableReducer, type UndoableState } from './undoReducer';
import { DirectorProvider } from './context';
import { GESTURE_PRESETS } from './gestures';
import { getCodedPath } from './codedPaths';
import type { HandPathPoint } from '../../components/FloatingHand/types';
import { computeZoomAtFrame, type ZoomLayer } from './layers';
import { withAudioLayers } from './AudioLayerRenderer';
import { useSessionPersistence } from './hooks/useSessionPersistence';
import { useRestoredInitialState } from './hooks/useRestoredInitialState';
import { useAudioEntries } from './hooks/useAudioEntries';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePlayerControls } from './hooks/usePlayerControls';
import './styles/index.css';

// Panels
import { Toolbar } from './panels/Toolbar';
import { SceneList } from './panels/SceneList';
import { Inspector } from './panels/Inspector';
import { Timeline } from './panels/Timeline';
import { ExportModal } from './panels/ExportModal';
import PlayerArea from './panels/PlayerArea';

const CURSOR_SCALE_KEY = 'scene-director-cursor-scale';
const PLAYBACK_RATE_KEY = 'scene-director-playback-rate';

export const App: React.FC = () => {
  // Restore session from localStorage
  const { restoredInitial, savedSession } =
    useRestoredInitialState(initialState);

  const [undoState, dispatch] = useReducer(undoableReducer, {
    past: [],
    present: restoredInitial,
    future: [],
  } as UndoableState);
  const state = undoState.present;
  const canUndo = undoState.past.length > 0;
  const canRedo = undoState.future.length > 0;
  const playerRef = useRef<PlayerRef | null>(null);
  const playerFrameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(savedSession.frame ?? 0);
  const [playbackRate, setPlaybackRateRaw] = useState(() => {
    try {
      return parseFloat(localStorage.getItem(PLAYBACK_RATE_KEY) || '1') || 1;
    } catch {
      return 1;
    }
  });
  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateRaw(rate);
    try {
      localStorage.setItem(PLAYBACK_RATE_KEY, String(rate));
    } catch {}
  }, []);

  // Cursor preview scale multiplier (persisted to localStorage)
  const [cursorScale, setCursorScaleRaw] = useState(() => {
    try {
      return parseFloat(localStorage.getItem(CURSOR_SCALE_KEY) || '1') || 1;
    } catch {
      return 1;
    }
  });
  const setCursorScale = useCallback((scale: number) => {
    setCursorScaleRaw(scale);
    try {
      localStorage.setItem(CURSOR_SCALE_KEY, String(scale));
    } catch {}
  }, []);

  // Player zoom & pan
  const {
    zoom,
    setZoom,
    pan,
    setPan,
    playerAreaRef,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  } = usePlayerControls(state.compositionId);

  // Seek to saved frame on mount
  const didRestore = useRef(false);
  useEffect(() => {
    if (!didRestore.current && savedSession.frame && playerRef.current) {
      playerRef.current.seekTo(savedSession.frame);
      didRestore.current = true;
    }
  });

  // Session persistence (manual save only)
  const { saveSession } = useSessionPersistence(state, frame);

  // Track player frame dimensions for coordinate mapping (composition -> screen space)
  const [playerScale, setPlayerScale] = useState(1);
  useEffect(() => {
    const el = playerFrameRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      if (width > 0)
        setPlayerScale(
          width /
            (
              COMPOSITIONS.find((c) => c.id === state.compositionId) ||
              COMPOSITIONS[0]
            ).video.width,
        );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [state.compositionId]);

  // Current composition
  const composition = useMemo(
    () =>
      COMPOSITIONS.find((c) => c.id === state.compositionId) || COMPOSITIONS[0],
    [state.compositionId],
  );

  const BaseVideoComponent = COMPOSITION_COMPONENTS[composition.id];

  // Collect audio entries from user-edited audio layers
  const audioEntries = useAudioEntries(state.layers, composition.scenes);

  // Wrap composition with audio layers
  const VideoComponent = useMemo(
    () =>
      audioEntries.length > 0
        ? withAudioLayers(BaseVideoComponent, audioEntries)
        : BaseVideoComponent,
    [BaseVideoComponent, audioEntries],
  );

  // Current scene
  const currentScene = useMemo(
    () =>
      composition.scenes.find((s) => s.name === state.selectedScene) || null,
    [composition.scenes, state.selectedScene],
  );

  // Waypoints for selected hand layer (or primary scene waypoints)
  const sceneWaypoints = useMemo(() => {
    if (!state.selectedScene) return [];
    // If a hand layer is selected, use its data.waypoints
    if (state.selectedLayerId) {
      const layers = state.layers[state.selectedScene] || [];
      const sel = layers.find((l) => l.id === state.selectedLayerId);
      if (sel?.type === 'hand') {
        return (sel.data as { waypoints?: HandPathPoint[] }).waypoints || [];
      }
    }
    // Default: primary scene waypoints
    return state.waypoints[state.selectedScene] || [];
  }, [
    state.selectedScene,
    state.selectedLayerId,
    state.layers,
    state.waypoints,
  ]);

  // Coded path for current scene (from composition source code)
  const codedPath = useMemo(
    () =>
      state.selectedScene
        ? getCodedPath(state.compositionId, state.selectedScene)
        : null,
    [state.compositionId, state.selectedScene],
  );

  // Effective waypoints: manual if placed, else coded path
  const effectiveWaypoints =
    sceneWaypoints.length > 0 ? sceneWaypoints : (codedPath?.path ?? []);

  // Auto-adopt coded paths into editable state when Trail is ON
  useEffect(() => {
    if (
      state.showTrail &&
      state.selectedScene &&
      codedPath &&
      sceneWaypoints.length === 0
    ) {
      dispatch({
        type: 'ADOPT_CODED_PATH',
        scene: state.selectedScene,
        waypoints: [...codedPath.path],
        gesture: codedPath.gesture,
      });
    }
  }, [
    state.showTrail,
    state.selectedScene,
    codedPath,
    sceneWaypoints.length,
    dispatch,
  ]);

  // Auto-migrate layers on scene select
  useEffect(() => {
    if (!state.selectedScene) return;
    const coded = getCodedPath(state.compositionId, state.selectedScene);
    const sceneZoom = composition.scenes.find(
      (s) => s.name === state.selectedScene,
    )?.zoom;
    dispatch({
      type: 'ENSURE_SCENE_LAYERS',
      scene: state.selectedScene,
      compositionId: state.compositionId,
      codedPath: coded,
      sceneZoom,
    });
  }, [state.selectedScene, state.compositionId, composition.scenes, dispatch]);

  // Hydrate layers for ALL scenes on mount and composition change (so timeline markers appear immediately)
  const hydratedCompositionRef = useRef<string | null>(null);
  useEffect(() => {
    if (hydratedCompositionRef.current === state.compositionId) return;
    hydratedCompositionRef.current = state.compositionId;
    for (const scene of composition.scenes) {
      const coded = getCodedPath(state.compositionId, scene.name);
      dispatch({
        type: 'ENSURE_SCENE_LAYERS',
        scene: scene.name,
        compositionId: state.compositionId,
        codedPath: coded,
        sceneZoom: scene.zoom,
      });
    }
  }, [composition.scenes, state.compositionId, dispatch]);

  // Active gesture preset (null when tool is 'select')
  const activePreset = useMemo(
    () =>
      state.activeTool !== 'select' ? GESTURE_PRESETS[state.activeTool] : null,
    [state.activeTool],
  );

  // Preset for current scene's gesture (for preview rendering)
  const scenePreset = useMemo(() => {
    const sceneName = state.selectedScene || '';
    const gesture = state.sceneGesture[sceneName];
    if (gesture) return GESTURE_PRESETS[gesture];
    const coded = sceneName
      ? getCodedPath(state.compositionId, sceneName)
      : null;
    if (coded) return GESTURE_PRESETS[coded.gesture];
    if (state.activeTool !== 'select') return GESTURE_PRESETS[state.activeTool];
    return GESTURE_PRESETS.click;
  }, [
    state.selectedScene,
    state.sceneGesture,
    state.compositionId,
    state.activeTool,
  ]);

  // Layers for the selected scene
  const sceneLayers = useMemo(
    () => (state.selectedScene ? state.layers[state.selectedScene] || [] : []),
    [state.selectedScene, state.layers],
  );
  const selectedLayer = useMemo(
    () =>
      state.selectedLayerId
        ? (sceneLayers.find((l) => l.id === state.selectedLayerId) ?? null)
        : null,
    [state.selectedLayerId, sceneLayers],
  );

  // Compute zoom transform from visible zoom layers (clamped to scene bounds)
  const zoomTransform = useMemo(() => {
    if (!currentScene) return null;
    // Only apply zoom when playhead is within the selected scene
    if (frame < currentScene.start || frame >= currentScene.end) return null;
    const zoomLayers = sceneLayers.filter(
      (l): l is ZoomLayer => l.type === 'zoom' && l.visible,
    );
    if (zoomLayers.length === 0) return null;
    const localFrame = Math.max(0, frame - currentScene.start);
    return computeZoomAtFrame(zoomLayers, localFrame);
  }, [sceneLayers, currentScene, frame]);

  // Context value
  const ctxValue = useMemo(
    () => ({
      state,
      dispatch,
      frame,
      playerRef,
      composition,
      currentScene,
      sceneWaypoints,
      effectiveWaypoints,
      activePreset,
      scenePreset,
      canUndo,
      canRedo,
      playbackRate,
      setPlaybackRate,
      playerScale,
      cursorScale,
      setCursorScale,
      sceneLayers,
      selectedLayer,
      saveSession,
    }),
    [
      state,
      frame,
      composition,
      currentScene,
      sceneWaypoints,
      effectiveWaypoints,
      activePreset,
      scenePreset,
      canUndo,
      canRedo,
      playbackRate,
      playerScale,
      cursorScale,
      setCursorScale,
      sceneLayers,
      selectedLayer,
      saveSession,
    ],
  );

  // Track frame from Player + auto-select scene under playhead during playback
  const selectedSceneRef = useRef(state.selectedScene);
  selectedSceneRef.current = state.selectedScene;
  const scenesRef = useRef(composition.scenes);
  scenesRef.current = composition.scenes;

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const handler = (e: { detail: { frame: number } }) => {
      const f = e.detail.frame;
      setFrame(f);
      // Auto-select scene under playhead during playback
      if (player.isPlaying()) {
        const scene = scenesRef.current.find((s) => f >= s.start && f < s.end);
        if (scene && scene.name !== selectedSceneRef.current) {
          dispatch({ type: 'SELECT_SCENE', name: scene.name });
        }
      }
    };
    player.addEventListener('frameupdate', handler as any);
    return () => player.removeEventListener('frameupdate', handler as any);
  }, [state.compositionId, dispatch]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    frame,
    composition,
    state,
    dispatch,
    playerRef,
    setZoom,
    setPan,
  });

  return (
    <DirectorProvider value={ctxValue}>
      <div className="app">
        {/* Toolbar */}
        <div style={{ gridArea: 'toolbar' }}>
          <Toolbar />
        </div>

        {/* Scene List */}
        <div className="panel scenes-panel">
          <SceneList />
        </div>

        {/* Player Area */}
        <PlayerArea
          playerAreaRef={playerAreaRef}
          playerFrameRef={playerFrameRef}
          playerRef={playerRef}
          handlePanStart={handlePanStart}
          handlePanMove={handlePanMove}
          handlePanEnd={handlePanEnd}
          composition={composition}
          VideoComponent={VideoComponent}
          zoom={zoom}
          setZoom={setZoom}
          pan={pan}
          setPan={setPan}
          zoomTransform={zoomTransform}
          sceneDirectorActive={
            !!(state.selectedScene && effectiveWaypoints.length > 0)
          }
          playbackRate={playbackRate}
          state={state}
          frame={frame}
          playerScale={playerScale}
          currentScene={currentScene}
          sceneLayers={sceneLayers}
          showTrail={state.showTrail}
          effectiveWaypoints={effectiveWaypoints}
          sceneWaypoints={sceneWaypoints}
        />

        {/* Inspector (right panel) */}
        <div className="panel inspector-panel">
          {state.selectedScene ? (
            <Inspector />
          ) : (
            <div className="inspector-empty">
              Select a scene to edit hand animations
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="panel timeline-panel">
          <Timeline />
        </div>
      </div>

      {/* Export modal overlay */}
      {state.exportOpen && <ExportModal />}
    </DirectorProvider>
  );
};
