/**
 * SceneDirector v3 - Gesture-First App
 * CSS Grid layout + Remotion Player + Context Provider + Keyboard shortcuts
 */

import React, { useReducer, useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { FloatingHand } from '../../components/FloatingHand';
import { DEFAULT_PHYSICS } from '../../components/FloatingHand/types';
import {
  directorReducer,
  initialState,
  COMPOSITIONS,
  COMPOSITION_COMPONENTS,
} from './state';
import { DirectorProvider } from './context';
import { GESTURE_PRESETS, GESTURE_KEYS, type GestureTool } from './gestures';
import { getCodedPath } from './codedPaths';
import './styles.css';

// Panels
import { Toolbar } from './panels/Toolbar';
import { SceneList } from './panels/SceneList';
import { Inspector } from './panels/Inspector';
import { Timeline } from './panels/Timeline';
import { ExportModal } from './panels/ExportModal';

// Overlays
import { DrawingCanvas } from './overlays/DrawingCanvas';
import { WaypointMarkers } from './overlays/WaypointMarkers';

export const App: React.FC = () => {
  const [state, dispatch] = useReducer(directorReducer, initialState);
  const playerRef = useRef<PlayerRef | null>(null);
  const playerFrameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);

  // Track player frame dimensions for coordinate mapping (composition → screen space)
  const [playerScale, setPlayerScale] = useState(1);
  useEffect(() => {
    const el = playerFrameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (width > 0) setPlayerScale(width / (COMPOSITIONS.find(c => c.id === state.compositionId) || COMPOSITIONS[0]).video.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [state.compositionId]);

  // Current composition
  const composition = useMemo(
    () => COMPOSITIONS.find(c => c.id === state.compositionId) || COMPOSITIONS[0],
    [state.compositionId],
  );

  // Underlying video component
  const VideoComponent = COMPOSITION_COMPONENTS[composition.id];

  // Current scene
  const currentScene = useMemo(
    () => composition.scenes.find(s => s.name === state.selectedScene) || null,
    [composition.scenes, state.selectedScene],
  );

  // Waypoints for selected scene (manual)
  const sceneWaypoints = state.selectedScene
    ? (state.waypoints[state.selectedScene] || [])
    : [];

  // Coded path for current scene (from composition source code)
  const codedPath = useMemo(
    () => state.selectedScene ? getCodedPath(state.compositionId, state.selectedScene) : null,
    [state.compositionId, state.selectedScene],
  );

  // Effective waypoints: manual if placed, else coded path
  const effectiveWaypoints = sceneWaypoints.length > 0
    ? sceneWaypoints
    : (codedPath?.path ?? []);

  // Auto-adopt coded paths into editable state when Trail is ON
  // This copies coded path points into state.waypoints so they become draggable/editable
  useEffect(() => {
    if (state.showTrail && state.selectedScene && codedPath && sceneWaypoints.length === 0) {
      dispatch({ type: 'SET_WAYPOINTS', scene: state.selectedScene, waypoints: [...codedPath.path] });
      if (codedPath.gesture) {
        dispatch({ type: 'SET_SCENE_GESTURE', scene: state.selectedScene, gesture: codedPath.gesture });
      }
    }
  }, [state.showTrail, state.selectedScene, codedPath, sceneWaypoints.length, dispatch]);

  // Active gesture preset (null when tool is 'select')
  const activePreset = useMemo(
    () => state.activeTool !== 'select' ? GESTURE_PRESETS[state.activeTool] : null,
    [state.activeTool],
  );

  // Preset for current scene's gesture (for preview rendering)
  // Falls back to coded path gesture when no manual gesture set
  const scenePreset = useMemo(() => {
    const sceneName = state.selectedScene || '';
    const gesture = state.sceneGesture[sceneName];
    if (gesture) return GESTURE_PRESETS[gesture];
    // Fall back to coded path gesture
    const coded = sceneName ? getCodedPath(state.compositionId, sceneName) : null;
    if (coded) return GESTURE_PRESETS[coded.gesture];
    return null;
  }, [state.selectedScene, state.sceneGesture, state.compositionId]);

  // Context value
  const ctxValue = useMemo(() => ({
    state,
    dispatch,
    frame,
    playerRef,
    composition,
    currentScene,
    sceneWaypoints,
    effectiveWaypoints,
    activePreset,
  }), [state, frame, composition, currentScene, sceneWaypoints, effectiveWaypoints, activePreset]);

  // Track frame from Player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const handler = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    player.addEventListener('frameupdate', handler as any);
    return () => player.removeEventListener('frameupdate', handler as any);
  }, [state.compositionId]); // Re-attach when composition changes

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't capture when typing in inputs
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // Gesture tool shortcuts: 1-5
    const gestureTool = GESTURE_KEYS[e.key];
    if (gestureTool) {
      e.preventDefault();
      dispatch({ type: 'SET_TOOL', tool: gestureTool });
      return;
    }

    switch (e.key) {
      case 's': case 'S':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('scene-director-save'));
        } else {
          e.preventDefault();
          dispatch({ type: 'SET_TOOL', tool: 'select' });
        }
        break;
      case ' ':
        e.preventDefault();
        if (playerRef.current) {
          if (playerRef.current.isPlaying()) {
            playerRef.current.pause();
          } else {
            playerRef.current.play();
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (playerRef.current) {
          const step = e.shiftKey ? 10 : 1;
          const next = Math.max(0, frame - step);
          playerRef.current.seekTo(next);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (playerRef.current) {
          const step = e.shiftKey ? 10 : 1;
          const next = Math.min(composition.video.frames - 1, frame + step);
          playerRef.current.seekTo(next);
        }
        break;
      case 'Delete': case 'Backspace':
        if (state.selectedWaypoint !== null && state.selectedScene) {
          e.preventDefault();
          dispatch({ type: 'DELETE_WAYPOINT', scene: state.selectedScene, index: state.selectedWaypoint });
        }
        break;
      case 't': case 'T':
        e.preventDefault();
        dispatch({ type: 'TOGGLE_TRAIL' });
        break;
      case 'e': case 'E':
        e.preventDefault();
        dispatch({ type: 'TOGGLE_EXPORT' });
        break;
      case 'Escape':
        e.preventDefault();
        if (state.exportOpen) {
          dispatch({ type: 'TOGGLE_EXPORT' });
        } else if (state.selectedWaypoint !== null) {
          dispatch({ type: 'SELECT_WAYPOINT', index: null });
        }
        break;
    }
  }, [frame, composition.video.frames, state.selectedWaypoint, state.selectedScene, state.exportOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
        <div className="player-area">
          {/* Aspect-ratio container - keeps 9:16 centered */}
          <div
            ref={playerFrameRef}
            className="player-frame"
            style={{ aspectRatio: `${composition.video.width} / ${composition.video.height}` }}
          >
            <Player
              ref={playerRef}
              component={VideoComponent}
              compositionWidth={composition.video.width}
              compositionHeight={composition.video.height}
              fps={composition.video.fps}
              durationInFrames={composition.video.frames}
              controls={false}
              style={{
                width: '100%',
                height: '100%',
              }}
            />

            {/* Drawing canvas overlays the player */}
            {state.selectedScene && !state.preview && !state.exportOpen && (
              <DrawingCanvas />
            )}

            {/* FloatingHand: visible in preview mode AND when Trail is ON (live editing) */}
            {/* When dragging a waypoint, hand snaps to the dragged position for live WYSIWYG */}
            {(state.preview || state.showTrail) && state.selectedScene && effectiveWaypoints.length > 0 && currentScene && scenePreset && (() => {
              const isDragging = state.draggingIndex !== null && effectiveWaypoints[state.draggingIndex];
              const dragWp = isDragging ? effectiveWaypoints[state.draggingIndex!] : null;
              // When dragging: single-point path at dragged position, frame=0
              const handPath = dragWp
                ? [{ ...dragWp, frame: 0 }]
                : effectiveWaypoints;
              const handFrame = dragWp ? 0 : frame;
              const handStartFrame = dragWp ? 0 : currentScene.start;
              return (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  overflow: 'hidden',
                  pointerEvents: 'none',
                  zIndex: 11,
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: composition.video.width,
                    height: composition.video.height,
                    transformOrigin: 'top left',
                    transform: `scale(${playerScale}) translateY(${composition.globalOffsetY ?? 0}px)`,
                    pointerEvents: 'none',
                  }}>
                    <FloatingHand
                      frame={handFrame}
                      path={handPath}
                      startFrame={handStartFrame}
                      animation={scenePreset.animation}
                      size={scenePreset.size}
                      showRipple={scenePreset.showRipple}
                      dark={scenePreset.dark}
                      physics={{ ...DEFAULT_PHYSICS, ...scenePreset.physics }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Trail overlay: manual waypoints in edit mode, or any waypoints when Trail toggled on */}
            {state.selectedScene && (
              (!state.preview && sceneWaypoints.length > 0) ||
              (state.showTrail && effectiveWaypoints.length > 0)
            ) && (
              <WaypointMarkers
                containerRef={playerFrameRef}
                editable={!state.preview}
                waypoints={state.showTrail ? effectiveWaypoints : sceneWaypoints}
              />
            )}

            {/* Scene info banner with debug info */}
            {state.selectedScene && currentScene && (
              <div className="info-banner">
                {state.selectedScene} | f{currentScene.start}-{currentScene.end} | local: {Math.max(0, frame - currentScene.start)}
                {' | '}{sceneWaypoints.length > 0 ? `EDIT(${sceneWaypoints.length}pts)` : 'CREATE'}
                {state.selectedWaypoint !== null && ` | sel:#${state.selectedWaypoint + 1}`}
                {state.showTrail && ' | TRAIL'}
                {state.preview && ' | PREVIEW'}
              </div>
            )}
          </div>
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
