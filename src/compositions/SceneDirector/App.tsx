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
import { Player, type PlayerRef } from '@remotion/player';
import { SceneDirectorModeProvider } from '../../components/FloatingHand/SceneDirectorMode';
import { initialState } from './state';
import { COMPOSITIONS, COMPOSITION_COMPONENTS } from './compositions';
import { undoableReducer, type UndoableState } from './undoReducer';
import { DirectorProvider } from './context';
import { GESTURE_PRESETS } from './gestures';
import { getCodedPath } from './codedPaths';
import { computeZoomAtFrame, type ZoomLayer, type AudioLayer } from './layers';
import { withAudioLayers, type AudioEntry } from './AudioLayerRenderer';
import {
  loadSession,
  useSessionPersistence,
} from './hooks/useSessionPersistence';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePlayerControls } from './hooks/usePlayerControls';
import './styles/index.css';

// Panels
import { Toolbar } from './panels/Toolbar';
import { SceneList } from './panels/SceneList';
import { Inspector } from './panels/Inspector';
import { Timeline } from './panels/Timeline';
import { ExportModal } from './panels/ExportModal';

// Overlays
import { DrawingCanvas } from './overlays/DrawingCanvas';
import { FloatingHandOverlay } from './overlays/FloatingHandOverlay';
import { WaypointMarkers } from './overlays/WaypointMarkers';

const CURSOR_SCALE_KEY = 'scene-director-cursor-scale';

export const App: React.FC = () => {
  // Restore session from localStorage
  const savedSession = useMemo(() => loadSession(), []);
  const restoredInitial = useMemo(() => {
    // Sync stale localStorage waypoints with current coded paths.
    // If stored waypoints match a coded path's frame structure (auto-derived),
    // refresh them so coded path updates (e.g. scale changes) propagate.
    const waypoints = savedSession.waypoints
      ? { ...savedSession.waypoints }
      : undefined;
    if (waypoints && savedSession.compositionId) {
      for (const [scene, wp] of Object.entries(waypoints)) {
        if (!wp?.length) continue;
        const coded = getCodedPath(savedSession.compositionId, scene);
        if (!coded || coded.path.length !== wp.length) continue;
        if (wp.every((w, i) => w.frame === coded.path[i].frame)) {
          waypoints[scene] = coded.path.map((p) => ({ ...p }));
        }
      }
    }
    return {
      ...initialState,
      ...(savedSession.compositionId
        ? { compositionId: savedSession.compositionId }
        : {}),
      ...(savedSession.selectedScene
        ? { selectedScene: savedSession.selectedScene }
        : {}),
      ...(savedSession.sceneGesture
        ? { sceneGesture: savedSession.sceneGesture }
        : {}),
      ...(savedSession.sceneAnimation
        ? { sceneAnimation: savedSession.sceneAnimation }
        : {}),
      ...(savedSession.sceneDark ? { sceneDark: savedSession.sceneDark } : {}),
      ...(savedSession.clearedSceneLayers
        ? { clearedSceneLayers: savedSession.clearedSceneLayers }
        : {}),
      ...(savedSession.layers ? { layers: savedSession.layers } : {}),
      ...(waypoints ? { waypoints } : {}),
      ...(savedSession.savedSnapshots
        ? { savedSnapshots: savedSession.savedSnapshots }
        : {}),
      ...(savedSession.sidebarTab
        ? { sidebarTab: savedSession.sidebarTab }
        : {}),
      ...(savedSession.versionHistory
        ? { versionHistory: savedSession.versionHistory }
        : {}),
    };
  }, []);

  const [undoState, dispatch] = useReducer(undoableReducer, {
    past: [],
    present: restoredInitial,
  } as UndoableState);
  const state = undoState.present;
  const canUndo = undoState.past.length > 0;
  const playerRef = useRef<PlayerRef | null>(null);
  const playerFrameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(savedSession.frame ?? 0);
  const [playbackRate, setPlaybackRate] = useState(1);

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

  // Collect audio entries ONLY from user-edited audio layers (not coded fallbacks).
  // Compositions already play their own inline <Audio> tags — we only inject extras
  // when the user has explicitly added/edited audio layers in SceneDirector.
  const audioEntries: AudioEntry[] = useMemo(() => {
    const entries: AudioEntry[] = [];
    for (const [sceneName, layers] of Object.entries(state.layers)) {
      const scene = composition.scenes.find((s) => s.name === sceneName);
      if (!scene) continue;
      for (const layer of layers) {
        if (layer.type !== 'audio' || !layer.visible) continue;
        const audioData = (layer as AudioLayer).data;
        entries.push({
          id: layer.id,
          file: audioData.file,
          globalFrom: scene.start + audioData.startFrame,
          durationInFrames: audioData.durationInFrames || 60,
          volume: audioData.volume,
        });
      }
    }
    return entries;
  }, [state.layers, composition.scenes]);

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

  // Waypoints for selected scene (manual)
  const sceneWaypoints = state.selectedScene
    ? state.waypoints[state.selectedScene] || []
    : [];

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
    dispatch({
      type: 'ENSURE_SCENE_LAYERS',
      scene: state.selectedScene,
      compositionId: state.compositionId,
      codedPath: coded,
    });
  }, [state.selectedScene, state.compositionId, dispatch]);

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
        <div
          ref={playerAreaRef}
          className="player-area"
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
        >
          {/* Aspect-ratio container - keeps 9:16 centered */}
          <div
            ref={playerFrameRef}
            className="player-frame"
            style={{
              aspectRatio: `${composition.video.width} / ${composition.video.height}`,
              transform:
                zoom > 1
                  ? `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`
                  : undefined,
            }}
          >
            <div
              style={
                zoomTransform
                  ? {
                      transform: `scale(${zoomTransform.zoom}) translate(${(-(zoomTransform.centerX - 0.5) * 100) / zoomTransform.zoom}%, ${(-(zoomTransform.centerY - 0.5) * 100) / zoomTransform.zoom}%)`,
                      transformOrigin: 'center center',
                      width: '100%',
                      height: '100%',
                    }
                  : { width: '100%', height: '100%' }
              }
            >
              <SceneDirectorModeProvider
                value={!!(state.selectedScene && effectiveWaypoints.length > 0)}
              >
                <Player
                  ref={playerRef}
                  component={VideoComponent}
                  compositionWidth={composition.video.width}
                  compositionHeight={composition.video.height}
                  fps={composition.video.fps}
                  durationInFrames={composition.video.frames}
                  playbackRate={playbackRate}
                  numberOfSharedAudioTags={15}
                  controls={false}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </SceneDirectorModeProvider>
            </div>

            {/* Drawing canvas overlays the player */}
            {state.selectedScene && !state.preview && !state.exportOpen && (
              <DrawingCanvas />
            )}

            {/* FloatingHand: only renders when a visible hand layer exists */}
            {state.selectedScene &&
              effectiveWaypoints.length > 0 &&
              currentScene &&
              scenePreset && (
                <FloatingHandOverlay
                  state={state}
                  effectiveWaypoints={effectiveWaypoints}
                  sceneLayers={sceneLayers}
                  scenePreset={scenePreset}
                  composition={composition}
                  frame={frame}
                  playerScale={playerScale}
                  currentScene={currentScene}
                />
              )}

            {/* Trail overlay: show markers only when playhead is within hand gesture frame range */}
            {state.selectedScene &&
              currentScene &&
              (() => {
                const wps = state.showTrail
                  ? effectiveWaypoints
                  : sceneWaypoints;
                if (wps.length === 0) return null;
                // Compute hand gesture frame range
                const first = wps[0];
                const last = wps[wps.length - 1];
                const handStart = currentScene.start + (first.frame ?? 0);
                const handEnd =
                  currentScene.start + (last.frame ?? 0) + (last.duration ?? 0);
                // Only show when playhead is within range (or in trail mode always show)
                const inRange =
                  state.showTrail || (frame >= handStart && frame <= handEnd);
                if (state.preview || !inRange) return null;
                return (
                  <WaypointMarkers
                    containerRef={playerFrameRef}
                    editable={!state.preview}
                    waypoints={wps}
                  />
                );
              })()}

            {/* Scene info banner with debug info */}
            {state.selectedScene && currentScene && (
              <div className="info-banner">
                {state.selectedScene} | f{currentScene.start}-{currentScene.end}{' '}
                | local: {Math.max(0, frame - currentScene.start)}
                {' | '}
                {sceneWaypoints.length > 0
                  ? `EDIT(${sceneWaypoints.length}pts)`
                  : 'CREATE'}
                {state.selectedWaypoint !== null &&
                  ` | sel:#${state.selectedWaypoint + 1}`}
                {state.showTrail && ' | TRAIL'}
                {state.preview && ' | PREVIEW'}
              </div>
            )}
          </div>

          {/* Zoom indicator */}
          {zoom > 1 && (
            <div
              className="zoom-indicator"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              {Math.round(zoom * 100)}% — Alt+drag to pan, 0 to reset
            </div>
          )}
        </div>

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
