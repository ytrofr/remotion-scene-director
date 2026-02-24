/**
 * DorianDemoWithDebug — Debug overlay wrapper for the main DorianDemo composition.
 *
 * Wraps DorianDemo with a DebugOverlay that shows:
 * - Current scene name, time, and frame counter (DebugSceneOverlay)
 * - Hand animation and gesture info
 * - Scene timeline with playhead (DebugSceneTimeline)
 * - Quick scene reference panel (top right)
 *
 * Uses shared debug components from components/debug/.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { DebugSceneOverlay, DebugSceneTimeline } from '../../components/debug';
import { COLORS } from './constants';
import { DorianDemo, DORIAN_SCENE_INFO } from './DorianDemo';

// ============ DEBUG OVERLAY COMPONENT ============

const DebugOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Find current scene
  const currentScene =
    DORIAN_SCENE_INFO.find((s) => frame >= s.start && frame < s.end) ||
    DORIAN_SCENE_INFO[0];

  // Total progress
  const totalProgress = ((frame / durationInFrames) * 100).toFixed(0);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Main Debug Panel - Top Left */}
      <DebugSceneOverlay
        scenes={DORIAN_SCENE_INFO}
        currentFrame={frame}
        fps={fps}
        showHandInfo={true}
      >
        {/* Total Progress (extra content via children slot) */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ color: '#888', fontSize: 11 }}>Total Progress</span>
            <span style={{ color: '#888', fontSize: 11 }}>
              {totalProgress}%
            </span>
          </div>
          <div style={{ height: 4, background: '#333', borderRadius: 2 }}>
            <div
              style={{
                height: '100%',
                width: `${totalProgress}%`,
                background: '#00ff00',
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      </DebugSceneOverlay>

      {/* Scene Timeline - Bottom */}
      <DebugSceneTimeline
        scenes={DORIAN_SCENE_INFO}
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
          fontSize: 10,
          color: '#888',
        }}
      >
        {DORIAN_SCENE_INFO.map((scene, i) => {
          const isActive = frame >= scene.start && frame < scene.end;
          return (
            <div
              key={i}
              style={{
                color: isActive ? '#00ff00' : '#666',
                fontWeight: isActive ? 'bold' : 'normal',
                marginBottom: 2,
              }}
            >
              {isActive ? '>' : 'o'} {scene.name}: {scene.start}-{scene.end}{' '}
              {scene.hand !== 'none' ? `[${scene.hand}]` : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ DEBUG VERSION OF MAIN COMPOSITION ============

export const DorianDemoWithDebug: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Main Demo */}
      <DorianDemo />

      {/* Debug Overlay on top */}
      <DebugOverlay />
    </AbsoluteFill>
  );
};
