/**
 * Toolbar v3.1 - Gesture tool buttons with variant dropdown
 * Click gesture button → activates tool
 * Click active gesture button again → opens variant picker (animation + dark/light)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDirector } from '../context';
import { COMPOSITIONS } from '../compositions';
import { GESTURE_PRESETS, GESTURE_ANIMATIONS, type GestureTool } from '../gestures';

const GESTURE_TOOLS: { id: GestureTool; key: string }[] = [
  { id: 'click', key: '1' },
  { id: 'scroll', key: '2' },
  { id: 'drag', key: '3' },
  { id: 'swipe', key: '4' },
  { id: 'point', key: '5' },
];

export const Toolbar: React.FC = () => {
  const { state, dispatch, canUndo, cursorScale, setCursorScale } = useDirector();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [openDropdown, setOpenDropdown] = useState<GestureTool | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

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
          animation: state.sceneAnimation[state.selectedScene] ?? preset.animation,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }, [state.selectedScene, state.waypoints, state.sceneGesture, state.sceneAnimation, state.compositionId]);

  // Listen for Ctrl+S custom event from App.tsx
  useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener('scene-director-save', handler);
    return () => window.removeEventListener('scene-director-save', handler);
  }, [handleSave]);

  // Current effective animation and dark for the selected scene
  const scene = state.selectedScene;
  const currentAnimation = scene ? (state.sceneAnimation[scene] ?? GESTURE_PRESETS[state.sceneGesture[scene] ?? 'click']?.animation) : null;
  const currentDark = scene ? (state.sceneDark[scene] ?? false) : false;

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

      {/* Gesture tool buttons with variant dropdown */}
      <div className="toolbar__gesture-group" ref={dropdownRef}>
        {GESTURE_TOOLS.map(t => {
          const preset = GESTURE_PRESETS[t.id];
          const active = state.activeTool === t.id;
          const dropdownOpen = openDropdown === t.id;
          const animations = GESTURE_ANIMATIONS[t.id];

          return (
            <div key={t.id} className="toolbar__gesture-wrapper">
              <button
                onClick={() => {
                  if (active) {
                    // Already active → toggle variant dropdown
                    setOpenDropdown(dropdownOpen ? null : t.id);
                  } else {
                    // Activate tool
                    dispatch({ type: 'SET_TOOL', tool: t.id });
                    setOpenDropdown(null);
                  }
                }}
                className={`toolbar__btn ${active ? 'toolbar__btn--active' : ''} ${dropdownOpen ? 'toolbar__btn--dropdown-open' : ''}`}
                title={`${preset.label} gesture (${t.key}) — click again for variants`}
              >
                {preset.label}
                <kbd className="toolbar__kbd">{t.key}</kbd>
                {active && <span className="toolbar__btn-arrow">{dropdownOpen ? '\u25B2' : '\u25BC'}</span>}
              </button>

              {/* Variant dropdown */}
              {dropdownOpen && (
                <div className="toolbar__dropdown">
                  <div className="toolbar__dropdown-title">Hand Style</div>
                  <div className="toolbar__dropdown-anims">
                    {animations.map(anim => {
                      const isActive = currentAnimation === anim.id;
                      return (
                        <button
                          key={anim.id}
                          onClick={() => {
                            if (scene) {
                              dispatch({ type: 'SET_SCENE_ANIMATION', scene, animation: anim.id });
                              if (!state.sceneGesture[scene]) {
                                dispatch({ type: 'SET_SCENE_GESTURE', scene, gesture: t.id });
                              }
                            }
                          }}
                          className={`toolbar__dropdown-btn ${isActive ? 'toolbar__dropdown-btn--active' : ''}`}
                        >
                          {anim.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="toolbar__dropdown-dark">
                    <button
                      onClick={() => { if (scene) dispatch({ type: 'SET_SCENE_DARK', scene, dark: false }); }}
                      className={`toolbar__dropdown-btn ${!currentDark ? 'toolbar__dropdown-btn--active' : ''}`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => { if (scene) dispatch({ type: 'SET_SCENE_DARK', scene, dark: true }); }}
                      className={`toolbar__dropdown-btn ${currentDark ? 'toolbar__dropdown-btn--active' : ''}`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="toolbar__divider" />

      {/* Select tool */}
      <button
        onClick={() => { dispatch({ type: 'SET_TOOL', tool: 'select' }); setOpenDropdown(null); }}
        className={`toolbar__btn ${state.activeTool === 'select' ? 'toolbar__btn--active' : ''}`}
        title="Select mode (S)"
      >
        Select
        <kbd className="toolbar__kbd">S</kbd>
      </button>

      {/* Undo */}
      <button
        onClick={() => dispatch({ type: 'UNDO' })}
        disabled={!canUndo}
        className="toolbar__btn toolbar__btn--undo"
        title="Undo (Ctrl+Z)"
      >
        Undo
        <kbd className="toolbar__kbd">Z</kbd>
      </button>

      {/* Cursor size slider */}
      {state.activeTool !== 'select' && (
        <>
          <div className="toolbar__divider" />
          <div className="toolbar__cursor-size" title="Cursor preview size">
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.1"
              value={cursorScale}
              onChange={(e) => setCursorScale(parseFloat(e.target.value))}
              className="toolbar__slider"
            />
            <span className="toolbar__slider-label">{cursorScale.toFixed(1)}x</span>
          </div>
        </>
      )}

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
