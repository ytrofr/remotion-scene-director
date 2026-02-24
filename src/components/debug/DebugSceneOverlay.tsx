/**
 * DebugSceneOverlay - Top-left info panel showing current scene, time, and frame data.
 *
 * Extracted from the repeated debug panel pattern found in DorianDemo,
 * MobileChatDemoV4, and MobileChatDemoCombined debug compositions.
 *
 * Displays: time (MM:SS:FF), current scene name, frame number,
 * scene progress %, and optional hand/mouse info.
 */
import React from 'react';
import type { DebugSceneInfo } from './types';

interface DebugSceneOverlayProps {
  scenes: DebugSceneInfo[];
  currentFrame: number;
  fps: number;
  mousePos?: { x: number; y: number };
  markerCount?: number;
  showHandInfo?: boolean;
  children?: React.ReactNode;
}

const DebugSceneOverlayInner: React.FC<DebugSceneOverlayProps> = ({
  scenes,
  currentFrame,
  fps,
  mousePos,
  markerCount,
  showHandInfo = false,
  children,
}) => {
  // Find current scene
  const currentScene =
    scenes.find((s) => currentFrame >= s.start && currentFrame < s.end) ??
    scenes[0];
  const frameInScene = currentFrame - currentScene.start;
  const sceneDuration = currentScene.end - currentScene.start;
  const sceneProgress = ((frameInScene / sceneDuration) * 100).toFixed(0);

  // Time formatting: MM:SS:FF
  const totalSeconds = currentFrame / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const frames = currentFrame % fps;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;

  return (
    <div
      style={{
        position: 'absolute',
        top: 15,
        left: 15,
        background: 'rgba(0,0,0,0.95)',
        border: '2px solid #00ff00',
        borderRadius: 12,
        padding: '12px 16px',
        fontFamily: 'monospace',
        fontSize: 13,
        color: '#fff',
        minWidth: 280,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header: Time + Frame */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 10,
          borderBottom: '1px solid #333',
          paddingBottom: 8,
        }}
      >
        <span style={{ color: '#00ff00', fontSize: 20, fontWeight: 'bold' }}>
          {timeStr}
        </span>
        <span style={{ color: '#ff0' }}>Frame {currentFrame}</span>
      </div>

      {/* Current Scene */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: '#888' }}>Scene: </span>
        <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>
          {currentScene.name}
        </span>
        {currentScene.part && (
          <span
            style={{
              marginLeft: 8,
              padding: '2px 6px',
              background: currentScene.part === 'V2' ? '#ff6b00' : '#00ff6b',
              color: '#000',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 'bold',
            }}
          >
            {currentScene.part}
          </span>
        )}
        <span style={{ color: '#666' }}> (frame {frameInScene})</span>
      </div>

      {/* Scene Progress Bar */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <span style={{ color: '#888', fontSize: 11 }}>
            Scene: {frameInScene}/{sceneDuration}
          </span>
          <span style={{ color: '#888', fontSize: 11 }}>{sceneProgress}%</span>
        </div>
        <div style={{ height: 6, background: '#333', borderRadius: 3 }}>
          <div
            style={{
              height: '100%',
              width: `${sceneProgress}%`,
              background: '#00d9ff',
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {/* Mouse Position */}
      {mousePos && (
        <div
          style={{
            marginBottom: 8,
            padding: 8,
            background: '#111',
            borderRadius: 6,
          }}
        >
          <div style={{ color: '#f00', marginBottom: 4 }}>MOUSE POSITION</div>
          <div style={{ fontSize: 16, color: '#ff0' }}>
            x: {mousePos.x}, y: {mousePos.y}
          </div>
        </div>
      )}

      {/* Hand Info */}
      {showHandInfo && (currentScene.hand || currentScene.gesture) && (
        <div
          style={{
            marginBottom: 8,
            padding: 8,
            background: '#111',
            borderRadius: 6,
          }}
        >
          <div style={{ color: '#f80', marginBottom: 4, fontWeight: 'bold' }}>
            HAND
          </div>
          {currentScene.hand && (
            <div>
              <span style={{ color: '#888' }}>Animation: </span>
              <span style={{ color: '#fff' }}>{currentScene.hand}</span>
            </div>
          )}
          {currentScene.gesture && (
            <div>
              <span style={{ color: '#888' }}>Gesture: </span>
              <span style={{ color: '#0f0' }}>{currentScene.gesture}</span>
            </div>
          )}
        </div>
      )}

      {/* Marker count */}
      {markerCount !== undefined && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: '#f0f', marginBottom: 4 }}>
            MARKERS ({markerCount})
          </div>
        </div>
      )}

      {/* Additional content slot */}
      {children}
    </div>
  );
};

export const DebugSceneOverlay = React.memo(DebugSceneOverlayInner);
