/**
 * DebugSceneTimeline - Horizontal bar at the bottom showing scene segments.
 *
 * Extracted from the identical timeline pattern found in DorianDemo,
 * MobileChatDemoV4, and MobileChatDemoCombined debug compositions.
 *
 * Features:
 * - Colored segment per scene (active highlighted, past dimmed)
 * - Progress fill within the active scene
 * - Playhead indicator at current frame position
 */
import React from 'react';
import type { DebugSceneInfo } from './types';

interface DebugSceneTimelineProps {
  scenes: DebugSceneInfo[];
  currentFrame: number;
  totalFrames: number;
}

const DebugSceneTimelineInner: React.FC<DebugSceneTimelineProps> = ({
  scenes,
  currentFrame,
  totalFrames,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 15,
        left: 15,
        right: 15,
        background: 'rgba(0,0,0,0.9)',
        border: '2px solid #444',
        borderRadius: 8,
        padding: '10px 12px',
        fontFamily: 'monospace',
        fontSize: 11,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {/* Scene segments */}
      <div style={{ display: 'flex', gap: 4, height: 30 }}>
        {scenes.map((scene, i) => {
          const width = ((scene.end - scene.start) / totalFrames) * 100;
          const isActive =
            currentFrame >= scene.start && currentFrame < scene.end;
          const isPast = currentFrame >= scene.end;
          const sceneProgress = isActive
            ? ((currentFrame - scene.start) / (scene.end - scene.start)) * 100
            : 0;

          // Color logic: support part-based coloring (V2/V4)
          let bgColor: string;
          if (scene.part) {
            const isV2 = scene.part === 'V2';
            if (isActive) bgColor = isV2 ? '#ff6b00' : '#00ff6b';
            else if (isPast) bgColor = isV2 ? '#663300' : '#006633';
            else bgColor = isV2 ? '#332200' : '#003322';
          } else {
            if (isActive) bgColor = '#00d9ff';
            else if (isPast) bgColor = '#2a5a6a';
            else bgColor = '#333';
          }

          return (
            <div
              key={i}
              style={{
                width: `${width}%`,
                height: '100%',
                background: bgColor,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#000' : '#888',
                fontWeight: isActive ? 'bold' : 'normal',
                fontSize: 10,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {scene.name.split('-')[0]}
              {/* Active scene progress fill */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${sceneProgress}%`,
                    background: 'rgba(0,255,0,0.3)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Playhead */}
      <div
        style={{
          position: 'absolute',
          left: `${(currentFrame / totalFrames) * 100}%`,
          top: 8,
          bottom: 8,
          width: 2,
          background: '#ff0',
          marginLeft: 12,
        }}
      />
    </div>
  );
};

export const DebugSceneTimeline = React.memo(DebugSceneTimelineInner);
