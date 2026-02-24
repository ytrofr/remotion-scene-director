/**
 * DorianDebugInteractive — Interactive debug composition with click-to-mark.
 *
 * Wraps DorianDemo with interactive tools for placing markers,
 * visualizing predefined hand paths, and copying coordinates.
 *
 * Uses shared debug components from components/debug/.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  useDebugCoordinates,
  DebugCrosshair,
  DebugClickMarkers,
  DebugPathVisualization,
  DebugSceneOverlay,
  DebugSceneTimeline,
} from '../../components/debug';
import { COLORS } from './constants';
import { DorianDemo, DORIAN_SCENE_INFO } from './DorianDemo';
import { ALL_DEBUG_PATHS } from './debugPaths';

// ============ INTERACTIVE DEBUG WITH CLICK-TO-MARK ============

export const DorianDebugInteractive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { mousePos, handleMouseMove, handleClick, markers, clearMarkers } =
    useDebugCoordinates(1080, 1920);

  // Find current scene
  const currentScene =
    DORIAN_SCENE_INFO.find((s) => frame >= s.start && frame < s.end) ||
    DORIAN_SCENE_INFO[0];
  const frameInScene = frame - currentScene.start;

  // Time formatting
  const seconds = Math.floor(frame / fps);
  const frames = frame % fps;
  const timeStr = `${seconds}:${frames.toString().padStart(2, '0')}`;

  const exportMarkers = () => {
    const output = markers
      .map(
        (m) =>
          `{ x: ${m.x}, y: ${m.y}, frame: ${m.frame} }, // ${m.label ?? ''}`,
      )
      .join('\n');
    navigator.clipboard.writeText(output);
    alert('Markers copied to clipboard!\n\n' + output);
  };

  return (
    <AbsoluteFill
      style={{ background: COLORS.white, cursor: 'crosshair' }}
      onClick={(e) => handleClick(e, frame)}
      onMouseMove={handleMouseMove}
    >
      {/* Main Demo */}
      <DorianDemo />

      {/* PREDEFINED Hand Path Markers (always visible) */}
      <DebugPathVisualization
        markers={ALL_DEBUG_PATHS}
        currentFrame={frame}
        showConnectingLines={true}
        groupByScene={true}
      />

      {/* Crosshairs */}
      <DebugCrosshair
        x={mousePos.x}
        y={mousePos.y}
        width={1080}
        height={1920}
      />

      {/* User-placed markers */}
      <DebugClickMarkers
        markers={markers}
        currentFrame={frame}
        variant="numbered"
        onClear={clearMarkers}
        onCopy={exportMarkers}
      />

      {/* Debug Panel - Top Left */}
      <DebugSceneOverlay
        scenes={DORIAN_SCENE_INFO}
        currentFrame={frame}
        fps={fps}
        mousePos={mousePos}
        markerCount={markers.length}
        showHandInfo={true}
      >
        {/* Marker list */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ maxHeight: 100, overflowY: 'auto', fontSize: 11 }}>
            {markers.length === 0 && (
              <div style={{ color: '#666' }}>
                Click on video to add markers...
              </div>
            )}
            {markers.slice(-5).map((m, i) => (
              <div
                key={i}
                style={{ color: frame === m.frame ? '#ff0' : '#888' }}
              >
                {m.label}: ({m.x}, {m.y}) @{m.frame}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportMarkers}
            style={{
              flex: 1,
              padding: '8px',
              background: '#0a0',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            COPY ALL
          </button>
          <button
            onClick={() => clearMarkers()}
            style={{
              flex: 1,
              padding: '8px',
              background: '#a00',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            CLEAR
          </button>
        </div>

        {/* Instructions */}
        <div
          style={{
            marginTop: 10,
            fontSize: 10,
            color: '#666',
            borderTop: '1px solid #333',
            paddingTop: 8,
          }}
        >
          Click anywhere to mark - Markers persist across frames
          <br />
          Tell me: "Move hand from M1 to M2 at frame X"
        </div>
      </DebugSceneOverlay>

      {/* Scene Timeline - Bottom */}
      <DebugSceneTimeline
        scenes={DORIAN_SCENE_INFO}
        currentFrame={frame}
        totalFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
};
