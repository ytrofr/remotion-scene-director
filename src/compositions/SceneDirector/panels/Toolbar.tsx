/**
 * Toolbar v3 - Gesture tool buttons replace mode buttons
 * Layout: [SD] [Composition] | [Click 1] [Scroll 2] [Drag 3] [Swipe 4] [Point 5] | [Select S] --- [Preview] [Clear] [Export]
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useDirector } from '../context';
import { COMPOSITIONS } from '../state';
import { GESTURE_PRESETS, type GestureTool } from '../gestures';

const GESTURE_TOOLS: { id: GestureTool; key: string }[] = [
  { id: 'click', key: '1' },
  { id: 'scroll', key: '2' },
  { id: 'drag', key: '3' },
  { id: 'swipe', key: '4' },
  { id: 'point', key: '5' },
];

export const Toolbar: React.FC = () => {
  const { state, dispatch } = useDirector();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = useCallback(async () => {
    if (!state.selectedScene) return;
    const waypoints = state.waypoints[state.selectedScene] || [];
    if (waypoints.length === 0) return;

    const gesture = state.sceneGesture[state.selectedScene] || 'click';
    const preset = GESTURE_PRESETS[gesture];

    setSaveState('saving');
    try {
      const res = await fetch('/api/save-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compositionId: state.compositionId,
          sceneName: state.selectedScene,
          path: waypoints,
          gesture,
          animation: preset.animation,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }, [state.selectedScene, state.waypoints, state.sceneGesture, state.compositionId]);

  // Listen for Ctrl+S custom event from App.tsx
  useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener('scene-director-save', handler);
    return () => window.removeEventListener('scene-director-save', handler);
  }, [handleSave]);

  return (
    <div className="toolbar">
      {/* Title */}
      <span className="toolbar__logo">SD</span>

      {/* Composition dropdown */}
      <select
        className="toolbar__select"
        value={state.compositionId}
        onChange={(e) => dispatch({ type: 'SET_COMPOSITION', id: e.target.value })}
      >
        {COMPOSITIONS.map(c => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>

      <div className="toolbar__divider" />

      {/* Gesture tool buttons */}
      <div className="toolbar__gesture-group">
        {GESTURE_TOOLS.map(t => {
          const preset = GESTURE_PRESETS[t.id];
          const active = state.activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => dispatch({ type: 'SET_TOOL', tool: t.id })}
              className={`toolbar__btn ${active ? 'toolbar__btn--active' : ''}`}
              title={`${preset.label} gesture (${t.key})`}
            >
              {preset.label}
              <kbd className="toolbar__kbd">{t.key}</kbd>
            </button>
          );
        })}
      </div>

      <div className="toolbar__divider" />

      {/* Select tool */}
      <button
        onClick={() => dispatch({ type: 'SET_TOOL', tool: 'select' })}
        className={`toolbar__btn ${state.activeTool === 'select' ? 'toolbar__btn--active' : ''}`}
        title="Select mode (S)"
      >
        Select
        <kbd className="toolbar__kbd">S</kbd>
      </button>

      <div className="toolbar__spacer" />

      {/* Preview toggle */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_PREVIEW' })}
        className={`toolbar__btn ${state.preview ? 'toolbar__btn--preview-on' : 'toolbar__btn--preview'}`}
      >
        Preview
      </button>

      {/* Trail toggle */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_TRAIL' })}
        className={`toolbar__btn ${state.showTrail ? 'toolbar__btn--trail-on' : ''}`}
        title="Show trail overlay (T)"
      >
        Trail
        <kbd className="toolbar__kbd">T</kbd>
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!state.selectedScene || saveState === 'saving' || (state.waypoints[state.selectedScene || ''] || []).length === 0}
        className={`toolbar__btn ${
          saveState === 'saved' ? 'toolbar__btn--save-ok' :
          saveState === 'error' ? 'toolbar__btn--clear' :
          'toolbar__btn--save'
        }`}
        title="Save path to file (Ctrl+S)"
      >
        {saveState === 'saving' ? 'Saving...' :
         saveState === 'saved' ? 'Saved!' :
         saveState === 'error' ? 'Error!' : 'Save'}
      </button>

      {/* Clear */}
      {state.selectedScene && (
        <button
          onClick={() => dispatch({ type: 'CLEAR_SCENE', scene: state.selectedScene! })}
          className="toolbar__btn toolbar__btn--clear"
        >
          Clear
        </button>
      )}

      {/* Export */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_EXPORT' })}
        className="toolbar__btn toolbar__btn--export"
        title="Export code (E)"
      >
        Export
      </button>
    </div>
  );
};
