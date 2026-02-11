/**
 * SceneList v3 - Left panel with scenes, path thumbnails, gesture chips
 */

import React from 'react';
import { useDirector } from '../context';
import { GESTURE_PRESETS } from '../gestures';
import { getCodedPathPoints } from '../codedPaths';

// Mini SVG thumbnail showing path polyline + dots (40x70px)
const PathThumbnail: React.FC<{ waypoints: { x: number; y: number }[]; compW: number; compH: number }> = ({
  waypoints, compW, compH,
}) => {
  if (waypoints.length === 0) return null;

  // Map comp coords to thumbnail space
  const tw = 40;
  const th = 70;
  const pad = 4;
  const sx = (tw - pad * 2) / compW;
  const sy = (th - pad * 2) / compH;
  const s = Math.min(sx, sy);
  const ox = pad + (tw - pad * 2 - compW * s) / 2;
  const oy = pad + (th - pad * 2 - compH * s) / 2;

  const pts = waypoints.map(wp => ({
    x: ox + wp.x * s,
    y: oy + wp.y * s,
  }));

  return (
    <svg className="scene-list__thumb" width={tw} height={th} viewBox={`0 0 ${tw} ${th}`}>
      {/* Background */}
      <rect x={0} y={0} width={tw} height={th} rx={3} fill="rgba(30,34,48,0.6)" />
      {/* Path line */}
      {pts.length > 1 && (
        <polyline
          points={pts.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1}
          opacity={0.7}
        />
      )}
      {/* Dots */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === 0 ? 2.5 : 1.5}
          fill={i === 0 ? 'var(--green)' : 'var(--accent)'}
        />
      ))}
    </svg>
  );
};

export const SceneList: React.FC = () => {
  const { state, dispatch, frame, playerRef, composition } = useDirector();
  const compW = composition.video.width;
  const compH = composition.video.height;

  return (
    <div className="scene-list">
      <div className="scene-list__header">
        Scenes ({composition.scenes.length})
      </div>

      {composition.scenes.map((scene) => {
        const isActive = frame >= scene.start && frame < scene.end;
        const isSelected = scene.name === state.selectedScene;
        const manualWps = state.waypoints[scene.name] || [];
        const codedWps = getCodedPathPoints(state.compositionId, scene.name);
        const wps = manualWps.length > 0 ? manualWps : codedWps;
        const gesture = state.sceneGesture[scene.name];
        const partColor = scene.part === 'V2'
          ? 'var(--orange)'
          : scene.part === 'V4'
            ? 'var(--green)'
            : 'var(--accent)';

        return (
          <div
            key={scene.name}
            onClick={() => {
              dispatch({ type: 'SELECT_SCENE', name: scene.name });
              playerRef.current?.seekTo(scene.start);
            }}
            className={`scene-list__item ${isSelected ? 'scene-list__item--selected' : ''} ${isActive && !isSelected ? 'scene-list__item--active' : ''}`}
            style={{ borderLeftColor: isSelected ? partColor : 'transparent' }}
          >
            <div className="scene-list__item-row">
              <div className="scene-list__item-info">
                <div className={`scene-list__name ${isSelected ? 'scene-list__name--selected' : ''}`}>
                  {scene.name}
                </div>
                <div className="scene-list__meta">
                  {scene.start}-{scene.end} ({scene.end - scene.start}f)
                  {scene.part && (
                    <span className="scene-list__part" style={{ color: partColor }}>{scene.part}</span>
                  )}
                </div>
                {/* Gesture chip */}
                {gesture && (
                  <span className="scene-list__gesture-chip">
                    {GESTURE_PRESETS[gesture].label}
                  </span>
                )}
              </div>
              <div className="scene-list__item-right">
                {wps.length > 0 && (
                  <PathThumbnail waypoints={wps} compW={compW} compH={compH} />
                )}
                {wps.length > 0 && (
                  <div
                    className="scene-list__badge"
                    style={{
                      background: manualWps.length > 0 ? partColor : 'var(--text-dim)',
                    }}
                    title={manualWps.length > 0 ? 'Manual waypoints' : 'Coded path'}
                  >
                    {wps.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
