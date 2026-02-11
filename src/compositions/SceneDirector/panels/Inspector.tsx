/**
 * Inspector v3.1 - X, Y, Frame fields + scene gesture display + Delete + Waypoint List
 * Waypoint list shows all scene waypoints with click-to-select-and-seek.
 */

import React, { useCallback } from 'react';
import type { HandPathPoint, HandGesture } from '../../../components/FloatingHand/types';
import { useDirector } from '../context';
import { GESTURE_PRESETS, type GestureTool } from '../gestures';

// Gesture abbreviations for compact display
const GESTURE_ABBR: Record<string, string> = {
  pointer: 'PTR',
  click: 'CLK',
  drag: 'DRG',
  scroll: 'SCR',
  open: 'OPN',
};

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
  const { state, dispatch, sceneWaypoints, effectiveWaypoints, playerRef, currentScene } = useDirector();
  const scene = state.selectedScene;
  const idx = state.selectedWaypoint;
  const waypoint: HandPathPoint | null =
    idx !== null && sceneWaypoints[idx] ? sceneWaypoints[idx] : null;

  if (!scene) return null;

  const currentGesture = state.sceneGesture[scene];

  const handleWaypointClick = useCallback((i: number, wp: HandPathPoint) => {
    dispatch({ type: 'SELECT_WAYPOINT', index: i });
    if (playerRef.current && currentScene) {
      playerRef.current.seekTo(currentScene.start + (wp.frame ?? 0));
    }
  }, [dispatch, playerRef, currentScene]);

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

  // Waypoint list (always visible when there are waypoints)
  const waypointList = effectiveWaypoints.length > 0 ? (
    <div className="inspector__waypoint-list">
      <div className="inspector__section-title">Waypoints ({effectiveWaypoints.length})</div>
      <div className="inspector__wp-table">
        {effectiveWaypoints.map((wp, i) => {
          const isSelected = i === idx;
          const gesture = (wp.gesture || 'pointer') as string;
          return (
            <button
              key={i}
              onClick={() => handleWaypointClick(i, wp)}
              className={`inspector__wp-row ${isSelected ? 'inspector__wp-row--active' : ''}`}
            >
              <span className="inspector__wp-num">{i + 1}</span>
              <span className="inspector__wp-coords">{wp.x},{wp.y}</span>
              <span className="inspector__wp-frame">f{wp.frame ?? 0}</span>
              <span className="inspector__wp-gesture">{GESTURE_ABBR[gesture] || gesture}</span>
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  if (idx === null || !waypoint) {
    return (
      <div className="inspector">
        {gestureHeader}
        {waypointList}
        {!waypointList && (
          <div className="inspector__empty-text">
            Pick a gesture tool and click on the video
          </div>
        )}
      </div>
    );
  }

  const update = (partial: Partial<HandPathPoint>) => {
    dispatch({ type: 'UPDATE_WAYPOINT', scene, index: idx, point: partial });
  };

  return (
    <div className="inspector">
      {gestureHeader}
      {waypointList}

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
