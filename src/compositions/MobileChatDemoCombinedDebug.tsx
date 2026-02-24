import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORS } from './MobileChatDemo/constants';
import {
  MobileChatDemoCombined,
  COMBINED_SCENE_INFO,
} from './MobileChatDemoCombined';

// Shared debug components
import type { DebugPathMarker } from '../components/debug';
import {
  useDebugCoordinates,
  DebugCrosshair,
  DebugClickMarkers,
  DebugSceneOverlay,
  DebugSceneTimeline,
  DebugPathVisualization,
} from '../components/debug';

// ============ HAND PATH MARKERS (from verified click positions) ============

// Verified anchor positions (user-clicked) + 120 translateY offset
const V2_INPUT = { x: 671, y: 1703 }; // Chat input (1603 + 120 - 20 raised)
const V2_SEND = { x: 127, y: 1730 }; // Send button (1610 + 120)
// V4 scenes have -40px Y offset vs V2
const V4_INPUT = { x: 671, y: 1683 }; // (1563 + 120)
const V4_SEND = { x: 127, y: 1690 }; // (1570 + 120)

const HAND_PATH_MARKERS = [
  // V2 Typing (scene starts at global frame 65) - click input, then type
  {
    x: V2_INPUT.x + 250,
    y: V2_INPUT.y + 300,
    globalFrame: 65,
    localFrame: 0,
    scene: '3-V2-Typing',
    gesture: 'pointer',
    label: 'V2-T1 enter',
  },
  {
    x: V2_INPUT.x,
    y: V2_INPUT.y,
    globalFrame: 70,
    localFrame: 5,
    scene: '3-V2-Typing',
    gesture: 'pointer',
    label: 'V2-T2 input',
  },
  {
    x: V2_INPUT.x,
    y: V2_INPUT.y,
    globalFrame: 71,
    localFrame: 6,
    scene: '3-V2-Typing',
    gesture: 'click',
    label: 'V2-T3 CLICK',
  },
  {
    x: V2_INPUT.x - 150,
    y: V2_INPUT.y + 250,
    globalFrame: 79,
    localFrame: 14,
    scene: '3-V2-Typing',
    gesture: 'pointer',
    label: 'V2-T4 exit',
  },

  // V2 Send (scene starts at global frame 135)
  {
    x: V2_SEND.x + 300,
    y: V2_SEND.y - 100,
    globalFrame: 135,
    localFrame: 0,
    scene: '4-V2-Send',
    gesture: 'pointer',
    label: 'V2-S1 enter',
  },
  {
    x: V2_SEND.x + 50,
    y: V2_SEND.y,
    globalFrame: 145,
    localFrame: 10,
    scene: '4-V2-Send',
    gesture: 'pointer',
    label: 'V2-S2 approach',
  },
  {
    x: V2_SEND.x,
    y: V2_SEND.y,
    globalFrame: 147,
    localFrame: 12,
    scene: '4-V2-Send',
    gesture: 'pointer',
    label: 'V2-S3 send',
  },
  {
    x: V2_SEND.x,
    y: V2_SEND.y,
    globalFrame: 153,
    localFrame: 18,
    scene: '4-V2-Send',
    gesture: 'pointer',
    label: 'V2-S4 hold',
  },
  {
    x: V2_SEND.x - 200,
    y: V2_SEND.y + 200,
    globalFrame: 161,
    localFrame: 26,
    scene: '4-V2-Send',
    gesture: 'pointer',
    label: 'V2-S5 exit',
  },

  // V4 Typing (scene starts at global frame 290)
  {
    x: V4_INPUT.x + 250,
    y: V4_INPUT.y + 300,
    globalFrame: 290,
    localFrame: 0,
    scene: '8-V4-Typing',
    gesture: 'pointer',
    label: 'V4-T1 enter',
  },
  {
    x: V4_INPUT.x,
    y: V4_INPUT.y,
    globalFrame: 294,
    localFrame: 4,
    scene: '8-V4-Typing',
    gesture: 'pointer',
    label: 'V4-T2 input',
  },
  {
    x: V4_INPUT.x,
    y: V4_INPUT.y,
    globalFrame: 295,
    localFrame: 5,
    scene: '8-V4-Typing',
    gesture: 'click',
    label: 'V4-T3 CLICK',
  },
  {
    x: V4_INPUT.x - 150,
    y: V4_INPUT.y + 250,
    globalFrame: 315,
    localFrame: 25,
    scene: '8-V4-Typing',
    gesture: 'pointer',
    label: 'V4-T4 exit',
  },

  // V4 Send (scene starts at global frame 375)
  {
    x: V4_SEND.x + 300,
    y: V4_SEND.y - 100,
    globalFrame: 375,
    localFrame: 0,
    scene: '9-V4-Send',
    gesture: 'pointer',
    label: 'V4-S1 enter',
  },
  {
    x: V4_SEND.x + 50,
    y: V4_SEND.y,
    globalFrame: 385,
    localFrame: 10,
    scene: '9-V4-Send',
    gesture: 'pointer',
    label: 'V4-S2 approach',
  },
  {
    x: V4_SEND.x,
    y: V4_SEND.y,
    globalFrame: 387,
    localFrame: 12,
    scene: '9-V4-Send',
    gesture: 'pointer',
    label: 'V4-S3 send',
  },
  {
    x: V4_SEND.x,
    y: V4_SEND.y,
    globalFrame: 388,
    localFrame: 13,
    scene: '9-V4-Send',
    gesture: 'click',
    label: 'V4-S4 CLICK',
  },
  {
    x: V4_SEND.x + 100,
    y: V4_SEND.y + 250,
    globalFrame: 399,
    localFrame: 24,
    scene: '9-V4-Send',
    gesture: 'pointer',
    label: 'V4-S5 exit',
  },
];

// Convert hand path markers to DebugPathMarker format for shared visualization
const HAND_PATH_DEBUG_MARKERS: DebugPathMarker[] = HAND_PATH_MARKERS.filter(
  (hp) => hp.x >= 0 && hp.x <= 1080 && hp.y >= 0 && hp.y <= 1920,
).map((hp) => {
  const isV4 = hp.scene.startsWith('8') || hp.scene.startsWith('9');
  const isClick = hp.gesture === 'click';
  return {
    x: hp.x,
    y: hp.y,
    frame: hp.globalFrame,
    label: hp.label,
    scene: hp.scene,
    desc: `${hp.gesture} @${hp.globalFrame}`,
    color: isClick ? '#ff0' : isV4 ? '#00ff6b' : '#ff6b00',
  };
});

// ============ INTERACTIVE DEBUG ============

export const MobileChatDemoCombinedDebugInteractive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { mousePos, handleMouseMove, handleClick, markers, clearMarkers } =
    useDebugCoordinates(1080, 1920);

  const handleExportCopy = () => {
    const output = markers
      .map((m) => `{ x: ${m.x}, y: ${m.y}, frame: ${m.frame} }, // ${m.label}`)
      .join('\n');
    navigator.clipboard.writeText(output);
  };

  return (
    <AbsoluteFill style={{ background: COLORS.background }}>
      {/* Main Demo */}
      <MobileChatDemoCombined />

      {/* Transparent click-capture overlay - sits above demo, below UI panels */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          zIndex: 9980,
        }}
        onClick={(e) => handleClick(e, frame)}
        onMouseMove={handleMouseMove}
      />

      {/* Crosshairs with center dot */}
      <DebugCrosshair
        x={mousePos.x}
        y={mousePos.y}
        width={1080}
        height={1920}
        color="rgba(255,0,0,0.7)"
        thickness={2}
        showCenterDot
      />

      {/* Hand Path Markers with connecting lines */}
      <DebugPathVisualization
        markers={HAND_PATH_DEBUG_MARKERS}
        currentFrame={frame}
        showConnectingLines
        groupByScene
      />

      {/* User Click Markers (crosshair variant) */}
      <DebugClickMarkers
        markers={markers}
        currentFrame={frame}
        variant="crosshair"
        onClear={clearMarkers}
        onCopy={handleExportCopy}
      />

      {/* Debug Panel - Top Left */}
      <DebugSceneOverlay
        scenes={COMBINED_SCENE_INFO}
        currentFrame={frame}
        fps={fps}
        mousePos={mousePos}
        markerCount={markers.length}
      >
        {/* Nearest Hand Marker (composition-specific) */}
        {(() => {
          const nearby = HAND_PATH_MARKERS.find(
            (m) => Math.abs(m.globalFrame - frame) <= 3,
          );
          return nearby ? (
            <div
              style={{
                marginBottom: 8,
                padding: 8,
                background: nearby.gesture === 'click' ? '#332200' : '#112211',
                borderRadius: 6,
                border:
                  nearby.gesture === 'click'
                    ? '2px solid #ff0'
                    : '1px solid #333',
              }}
            >
              <div
                style={{
                  color: nearby.gesture === 'click' ? '#ff0' : '#0f0',
                  marginBottom: 4,
                  fontWeight: 'bold',
                }}
              >
                {nearby.label}
              </div>
              <div style={{ fontSize: 11 }}>
                <div>
                  ({Math.round(nearby.x)}, {Math.round(nearby.y)}) @
                  {nearby.globalFrame}
                </div>
              </div>
            </div>
          ) : null;
        })()}
      </DebugSceneOverlay>

      {/* Scene Timeline - Bottom */}
      <DebugSceneTimeline
        scenes={COMBINED_SCENE_INFO}
        currentFrame={frame}
        totalFrames={durationInFrames}
      />

      {/* Quick Scene Reference - Top Right */}
      <div
        style={{
          position: 'absolute',
          top: 15,
          right: 15,
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid #444',
          borderRadius: 8,
          padding: '8px 12px',
          fontFamily: 'monospace',
          fontSize: 9,
          color: '#888',
          zIndex: 9999,
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        {COMBINED_SCENE_INFO.map((scene, i) => {
          const isActive = frame >= scene.start && frame < scene.end;
          const partColor = scene.part === 'V2' ? '#ff6b00' : '#00ff6b';
          return (
            <div
              key={i}
              style={{
                color: isActive ? partColor : '#555',
                fontWeight: isActive ? 'bold' : 'normal',
                marginBottom: 2,
              }}
            >
              {isActive ? '>' : 'o'} {scene.name}: {scene.start}-{scene.end}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
