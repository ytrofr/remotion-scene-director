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
import { GalleryView } from './panels/GalleryView';
import PlayerArea from './panels/PlayerArea';

const CURSOR_SCALE_KEY = 'scene-director-cursor-scale';
const PLAYBACK_RATE_KEY = 'scene-director-playback-rate';
const PLAYHEAD_KEY = 'scene-director-playhead';

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

  // Read playhead position: playhead localStorage > savedSession > 0
  const [frame, setFrame] = useState(() => {
    try {
      const playhead = JSON.parse(localStorage.getItem(PLAYHEAD_KEY) || '{}');
      if (typeof playhead.frame === 'number') return playhead.frame;
    } catch {
      /* ignore */
    }
    return savedSession.frame ?? 0;
  });
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

  // Sync URL query params (?comp=, ?scene=, ?frame=, ?view=gallery)
  // 1. On mount: read URL and apply overrides (URL takes priority over localStorage)
  const urlFrameRef = useRef<number | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // ?view=gallery
    if (params.get('view') === 'gallery' && state.currentView !== 'gallery') {
      dispatch({ type: 'SET_VIEW', view: 'gallery' });
    }

    // ?comp= — select composition if it exists
    const compParam = params.get('comp');
    if (compParam && COMPOSITIONS.some((c) => c.id === compParam)) {
      if (compParam !== state.compositionId) {
        dispatch({ type: 'SET_COMPOSITION', id: compParam });
      }

      // ?scene= — select scene if it exists in the matched composition
      const sceneParam = params.get('scene');
      if (sceneParam) {
        const comp =
          COMPOSITIONS.find((c) => c.id === compParam) || COMPOSITIONS[0];
        if (comp.scenes.some((s) => s.name === sceneParam)) {
          dispatch({ type: 'SELECT_SCENE', name: sceneParam });
        }
      }
    }

    // ?frame= — remember URL frame for restore (takes priority over savedSession)
    const frameParam = params.get('frame');
    if (frameParam) {
      urlFrameRef.current = parseInt(frameParam, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  // 2. When currentView / composition / scene changes, update URL immediately
  useEffect(() => {
    const url = new URL(window.location.href);

    if (state.currentView === 'gallery') {
      url.searchParams.set('view', 'gallery');
    } else {
      url.searchParams.delete('view');
    }

    url.searchParams.set('comp', state.compositionId);

    if (state.selectedScene) {
      url.searchParams.set('scene', state.selectedScene);
    } else {
      url.searchParams.delete('scene');
    }

    // Don't touch ?frame= here — the debounced frame effect handles it
    // Writing frame=0 on mount would overwrite the correct value from before refresh

    if (url.href !== window.location.href) {
      window.history.replaceState(null, '', url.toString());
    }
  }, [state.currentView, state.compositionId, state.selectedScene]);

  // Seek to correct frame on mount: URL ?frame= > playhead localStorage > savedSession
  const didRestore = useRef(false);
  useEffect(() => {
    if (!didRestore.current && playerRef.current) {
      const targetFrame = urlFrameRef.current ?? frame; // frame already initialized from playhead localStorage
      playerRef.current.seekTo(targetFrame);
      didRestore.current = true;
    }
  });

  // 2b. Persist playhead position to localStorage (debounced, survives refresh)
  // Only write AFTER the initial seek restore to avoid overwriting with stale data
  useEffect(() => {
    if (!didRestore.current) return; // don't write until seek is done
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          PLAYHEAD_KEY,
          JSON.stringify({
            frame,
            scene: state.selectedScene,
            comp: state.compositionId,
          }),
        );
      } catch {
        /* ignore */
      }
      // Also update URL frame param
      const url = new URL(window.location.href);
      url.searchParams.set('frame', String(frame));
      if (url.href !== window.location.href) {
        window.history.replaceState(null, '', url.toString());
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [frame, state.selectedScene, state.compositionId]);

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

  // Collect audio entries: coded audio (baseline SFX) + user-edited audio layers.
  // Provided via AudioEntriesContext above the Player (no HOC wrapper = stable component ref).
  const audioEntries = useAudioEntries(
    composition.id,
    state.layers,
    composition.scenes,
  );

  // Stable component ref — never changes, so Player never re-mounts.
  // Audio is injected via context, not HOC wrapping.
  const VideoComponent = BaseVideoComponent;

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

  // Load caption layers from SRT on composition change
  useEffect(() => {
    const entry = COMPOSITIONS.find((c) => c.id === state.compositionId);
    if (entry?.captionsSrt) {
      dispatch({
        type: 'LOAD_CAPTIONS_FROM_SRT',
        srt: entry.captionsSrt,
        fps: composition.video.fps,
      });
    }
  }, [state.compositionId, composition.video.fps, dispatch]);

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
  const selectedLayer = useMemo(() => {
    if (!state.selectedLayerId) return null;
    // Search current scene layers first, then caption layers
    const found = sceneLayers.find((l) => l.id === state.selectedLayerId);
    if (found) return found;
    const captionLayers = state.layers['__captions__'] || [];
    return captionLayers.find((l) => l.id === state.selectedLayerId) ?? null;
  }, [state.selectedLayerId, sceneLayers, state.layers]);

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

  const isGallery = state.currentView === 'gallery';

  return (
    <DirectorProvider value={ctxValue}>
      {/* Gallery overlays the editor — editor stays mounted to preserve refs & listeners */}
      {isGallery && (
        <GalleryView
          onClose={() => dispatch({ type: 'SET_VIEW', view: 'editor' })}
        />
      )}

      <div className="app" style={isGallery ? { display: 'none' } : undefined}>
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
          sceneDirectorActive={true}
          audioEntries={audioEntries}
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
