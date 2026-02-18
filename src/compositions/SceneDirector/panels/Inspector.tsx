/**
 * Inspector v3.3 - X, Y, Frame fields + scene gesture display + Hand Style picker + Delete + Waypoint List
 * Waypoint list shows all scene waypoints with click-to-select-and-seek.
 * Hand Style section: animation variant picker + dark/light toggle per scene.
 */

import React, { useCallback } from 'react';
import type { HandPathPoint, LottieAnimation } from '../../../components/FloatingHand/types';
import { useDirector } from '../context';
import { GESTURE_PRESETS, GESTURE_ANIMATIONS, type GestureTool } from '../gestures';
import type { AudioLayer, ZoomLayer } from '../layers';
import { AudioInspector } from './AudioInspector';
import { ActivityLog } from './ActivityLog';
import { LayerPanel } from './LayerPanel';
import { NumField } from './NumField';
import { ZoomInspector } from './ZoomInspector';

// Gesture abbreviations for compact display
const GESTURE_ABBR: Record<string, string> = {
  pointer: 'PTR',
  click: 'CLK',
  drag: 'DRG',
  scroll: 'SCR',
  open: 'OPN',
};

const GESTURE_OPTIONS: GestureTool[] = ['click', 'scroll', 'drag', 'swipe', 'point'];

export const Inspector: React.FC = () => {
  const { state, dispatch, sceneWaypoints, effectiveWaypoints, playerRef, currentScene, scenePreset, selectedLayer, sceneLayers } = useDirector();
  const scene = state.selectedScene;
  const idx = state.selectedWaypoint;
  const waypoint: HandPathPoint | null =
    idx !== null && sceneWaypoints[idx] ? sceneWaypoints[idx] : null;

  if (!scene) return null;

  const currentGesture = state.sceneGesture[scene];
  // Resolve effective gesture for animation picker
  // Priority: manual sceneGesture > reverse-lookup from scenePreset > active tool > 'click' fallback
  const effectiveGesture: GestureTool = currentGesture
    ?? (scenePreset
      ? (Object.keys(GESTURE_PRESETS) as GestureTool[]).find(k => GESTURE_PRESETS[k] === scenePreset)
      : undefined)
    ?? (state.activeTool !== 'select' ? state.activeTool : 'click');

  const handleWaypointClick = useCallback((i: number, wp: HandPathPoint) => {
    dispatch({ type: 'SELECT_WAYPOINT', index: i });
    if (playerRef.current && currentScene) {
      playerRef.current.seekTo(currentScene.start + (wp.frame ?? 0));
    }
  }, [dispatch, playerRef, currentScene]);

  // Current effective animation and dark mode
  const currentAnimation: LottieAnimation | null = state.sceneAnimation[scene] ?? scenePreset?.animation ?? null;
  const currentDark: boolean = state.sceneDark[scene] ?? scenePreset?.dark ?? false;

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
          {currentAnimation ?? GESTURE_PRESETS[currentGesture].animation} | {GESTURE_PRESETS[currentGesture].size}px
        </div>
      )}
    </div>
  );

  // Hand Style section (animation picker + dark/light toggle) - always visible
  const animations = GESTURE_ANIMATIONS[effectiveGesture];
  const handStyleSection = (
    <div className="inspector__hand-style">
      <div className="inspector__section-title">Hand Style</div>
      <div className="inspector__anim-row">
        {animations.map(anim => {
          const active = currentAnimation === anim.id;
          return (
            <button
              key={anim.id}
              onClick={() => dispatch({ type: 'SET_SCENE_ANIMATION', scene, animation: anim.id })}
              className={`inspector__anim-btn ${active ? 'inspector__anim-btn--active' : ''}`}
              title={anim.id}
            >
              {anim.label}
            </button>
          );
        })}
      </div>
      <div className="inspector__dark-row">
        <button
          onClick={() => dispatch({ type: 'SET_SCENE_DARK', scene, dark: false })}
          className={`inspector__dark-btn ${!currentDark ? 'inspector__dark-btn--active' : ''}`}
        >
          Light
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_SCENE_DARK', scene, dark: true })}
          className={`inspector__dark-btn ${currentDark ? 'inspector__dark-btn--active' : ''}`}
        >
          Dark
        </button>
      </div>
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

  // Zoom layer inspector (when a zoom layer is selected)
  const zoomInspectorSection = selectedLayer?.type === 'zoom' ? (
    <ZoomInspector layer={selectedLayer as ZoomLayer} scene={scene} />
  ) : null;

  // Audio layer inspector (when an audio layer is selected)
  const audioInspectorSection = selectedLayer?.type === 'audio' ? (
    <AudioInspector layer={selectedLayer as AudioLayer} scene={scene} />
  ) : null;

  if (idx === null || !waypoint) {
    return (
      <div className="inspector">
        <LayerPanel />
        {gestureHeader}
        {handStyleSection}
        {zoomInspectorSection}
        {audioInspectorSection}
        {waypointList}
        {!waypointList && !zoomInspectorSection && !audioInspectorSection && (
          <div className="inspector__empty-text">
            Pick a gesture tool and click on the video
          </div>
        )}
        <ActivityLog />
      </div>
    );
  }

  const update = (partial: Partial<HandPathPoint>) => {
    dispatch({ type: 'UPDATE_WAYPOINT', scene, index: idx, point: partial });
  };

  return (
    <div className="inspector">
      <LayerPanel />
      {gestureHeader}
      {handStyleSection}
      {zoomInspectorSection}
      {audioInspectorSection}
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
      <ActivityLog />
    </div>
  );
};
