/**
 * PlayerArea - Remotion Player with zoom/pan controls, overlays, and info banner.
 * Extracted from App.tsx for modularity.
 */

import React from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { SceneDirectorModeProvider } from '../../../components/FloatingHand/SceneDirectorMode';
import type { CompositionEntry, SceneInfo } from '../state';
import type { HandPathPoint } from '../../../components/FloatingHand/types';
import type { Layer } from '../layers';
import { DrawingCanvas } from '../overlays/DrawingCanvas';
import { FloatingHandOverlay } from '../overlays/FloatingHandOverlay';
import { WaypointMarkers } from '../overlays/WaypointMarkers';
import type { DirectorState } from '../state';

interface PlayerAreaProps {
  /** Ref for the outer player area div (for pan gestures) */
  playerAreaRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for the aspect-ratio frame div (for coordinate mapping) */
  playerFrameRef: React.RefObject<HTMLDivElement | null>;
  /** Remotion Player ref */
  playerRef: React.RefObject<PlayerRef | null>;
  /** Pan event handlers */
  handlePanStart: React.MouseEventHandler;
  handlePanMove: React.MouseEventHandler;
  handlePanEnd: React.MouseEventHandler;
  /** Current composition config */
  composition: CompositionEntry;
  /** The video component to render */
  VideoComponent: React.FC;
  /** Current player zoom level */
  zoom: number;
  setZoom: (z: number) => void;
  /** Current player pan offset */
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number }) => void;
  /** Computed zoom transform from zoom layers */
  zoomTransform: { zoom: number; centerX: number; centerY: number } | null;
  /** Whether SceneDirector mode is active (has scene + waypoints) */
  sceneDirectorActive: boolean;
  /** Playback rate */
  playbackRate: number;
  /** Current state */
  state: DirectorState;
  /** Current frame */
  frame: number;
  /** Player scale factor */
  playerScale: number;
  /** Current scene info */
  currentScene: SceneInfo | null;
  /** Scene layers */
  sceneLayers: Layer[];
  /** Show trail flag */
  showTrail: boolean;
  /** Effective waypoints (manual or coded) */
  effectiveWaypoints: HandPathPoint[];
  /** Scene waypoints (manual only) */
  sceneWaypoints: HandPathPoint[];
}

/** Renders waypoint markers when playhead is within hand gesture frame range */
const ActiveWaypointMarkers: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
  state: DirectorState;
  currentScene: SceneInfo;
  frame: number;
  showTrail: boolean;
  effectiveWaypoints: HandPathPoint[];
  sceneWaypoints: HandPathPoint[];
}> = ({
  containerRef,
  state,
  currentScene,
  frame,
  showTrail,
  effectiveWaypoints,
  sceneWaypoints,
}) => {
  const wps = showTrail ? effectiveWaypoints : sceneWaypoints;
  if (wps.length === 0) return null;

  // Compute hand gesture frame range
  const first = wps[0];
  const last = wps[wps.length - 1];
  const handStart = currentScene.start + (first.frame ?? 0);
  const handEnd = currentScene.start + (last.frame ?? 0) + (last.duration ?? 0);

  // Only show when playhead is within range (or in trail mode always show)
  const inRange = showTrail || (frame >= handStart && frame <= handEnd);
  if (state.preview || !inRange) return null;

  return (
    <WaypointMarkers
      containerRef={containerRef}
      editable={!state.preview}
      waypoints={wps}
    />
  );
};

const PlayerArea: React.FC<PlayerAreaProps> = ({
  playerAreaRef,
  playerFrameRef,
  playerRef,
  handlePanStart,
  handlePanMove,
  handlePanEnd,
  composition,
  VideoComponent,
  zoom,
  setZoom,
  pan,
  setPan,
  zoomTransform,
  sceneDirectorActive,
  playbackRate,
  state,
  frame,
  playerScale,
  currentScene,
  sceneLayers,
  showTrail,
  effectiveWaypoints,
  sceneWaypoints,
}) => {
  return (
    <div
      ref={playerAreaRef as React.RefObject<HTMLDivElement>}
      className="player-area"
      onMouseDown={handlePanStart}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
    >
      {/* Aspect-ratio container - keeps 9:16 centered */}
      <div
        ref={playerFrameRef as React.RefObject<HTMLDivElement>}
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
          <SceneDirectorModeProvider value={sceneDirectorActive}>
            <Player
              ref={playerRef as React.RefObject<PlayerRef>}
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

        {/* FloatingHand: renders all visible hand layers */}
        {state.selectedScene &&
          currentScene &&
          sceneLayers.some((l) => l.type === 'hand' && l.visible) && (
            <FloatingHandOverlay
              state={state}
              sceneLayers={sceneLayers}
              composition={composition}
              frame={frame}
              playerScale={playerScale}
              currentScene={currentScene}
            />
          )}

        {/* Trail overlay: show markers only when playhead is within hand gesture frame range */}
        {state.selectedScene && currentScene && (
          <ActiveWaypointMarkers
            containerRef={playerFrameRef}
            state={state}
            currentScene={currentScene}
            frame={frame}
            showTrail={showTrail}
            effectiveWaypoints={effectiveWaypoints}
            sceneWaypoints={sceneWaypoints}
          />
        )}

        {/* Scene info banner with debug info */}
        {state.selectedScene && currentScene && (
          <div className="info-banner">
            {state.selectedScene} | f{currentScene.start}-{currentScene.end} |
            local: {Math.max(0, frame - currentScene.start)}
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
  );
};

export default PlayerArea;
