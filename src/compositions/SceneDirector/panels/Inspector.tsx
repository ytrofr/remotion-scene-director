/**
 * Inspector v3 - Simplified: X, Y, Frame fields + scene gesture display + Delete
 * Duration, Scale, and gesture picker removed (handled by presets).
 */

import React, { useCallback } from 'react';
import type { HandPathPoint } from '../../../components/FloatingHand/types';
import { useDirector } from '../context';
import { GESTURE_PRESETS, type GestureTool } from '../gestures';

const NumField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}> = ({ label, value, onChange, step = 1, min }) => {
  const adjust = useCallback((delta: number) => {
    const next = value + delta;
    onChange(min !== undefined ? Math.max(min, next) : next);
  }, [value, onChange, min]);

  return (
    <div className="inspector__field">
      <span className="inspector__field-label">{label}</span>
      <button className="inspector__field-btn" onClick={() => adjust(-step * 10)}>-{step * 10}</button>
      <button className="inspector__field-btn" onClick={() => adjust(-step)}>-{step}</button>
      <span className="inspector__field-value">{value}</span>
      <button className="inspector__field-btn" onClick={() => adjust(step)}>+{step}</button>
      <button className="inspector__field-btn" onClick={() => adjust(step * 10)}>+{step * 10}</button>
    </div>
  );
};

const GESTURE_OPTIONS: GestureTool[] = ['click', 'scroll', 'drag', 'swipe', 'point'];

export const Inspector: React.FC = () => {
  const { state, dispatch, sceneWaypoints } = useDirector();
  const scene = state.selectedScene;
  const idx = state.selectedWaypoint;
  const waypoint: HandPathPoint | null =
    idx !== null && sceneWaypoints[idx] ? sceneWaypoints[idx] : null;

  if (!scene) return null;

  const currentGesture = state.sceneGesture[scene];

  // Scene gesture header (always visible)
  const gestureHeader = (
    <div className="inspector__scene-gesture">
      <div className="inspector__section-title">Scene Gesture</div>
      <div className="inspector__gesture-row">
        {GESTURE_OPTIONS.map(g => {
          const preset = GESTURE_PRESETS[g];
          const active = currentGesture === g;
          return (
            <button
              key={g}
              onClick={() => dispatch({ type: 'SET_SCENE_GESTURE', scene, gesture: g })}
              className={`inspector__gesture ${active ? 'inspector__gesture--active' : ''}`}
              title={`${preset.label}: ${preset.animation}`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      {currentGesture && (
        <div className="inspector__gesture-info">
          {GESTURE_PRESETS[currentGesture].animation} | {GESTURE_PRESETS[currentGesture].size}px
        </div>
      )}
    </div>
  );

  if (idx === null || !waypoint) {
    return (
      <div className="inspector">
        {gestureHeader}
        <div className="inspector__empty-text">
          {sceneWaypoints.length === 0
            ? 'Pick a gesture tool and click on the video'
            : `${sceneWaypoints.length} waypoints. Click one to edit (S mode)`}
        </div>
      </div>
    );
  }

  const update = (partial: Partial<HandPathPoint>) => {
    dispatch({ type: 'UPDATE_WAYPOINT', scene, index: idx, point: partial });
  };

  return (
    <div className="inspector">
      {gestureHeader}

      <div className="inspector__header">
        <span className="inspector__header-title">Waypoint #{idx + 1}</span>
        <span className="inspector__header-meta">of {sceneWaypoints.length}</span>
      </div>

      <NumField label="X" value={waypoint.x} onChange={(v) => update({ x: v })} step={5} />
      <NumField label="Y" value={waypoint.y} onChange={(v) => update({ y: v })} step={5} />
      <NumField label="Frame" value={waypoint.frame ?? 0} onChange={(v) => update({ frame: v })} min={0} />

      {/* Delete button */}
      <button
        onClick={() => dispatch({ type: 'DELETE_WAYPOINT', scene, index: idx })}
        className="inspector__delete-btn"
        title="Delete waypoint (Delete key)"
      >
        Delete Waypoint
      </button>
    </div>
  );
};
