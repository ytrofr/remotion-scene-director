/**
 * Toolbar v3.1 - Gesture tool buttons with variant dropdown
 * Click gesture button → activates tool
 * Click active gesture button again → opens variant picker (animation + dark/light)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDirector } from '../context';
import { COMPOSITIONS } from '../compositions';
import {
  GESTURE_PRESETS,
  buildClickAnimationFile,
  type GestureTool,
} from '../gestures';
import { useGalleryActive } from '../hooks/galleryActive';
import { LottieThumbnail } from '../overlays/LottieThumbnail';
import { getCodedPath } from '../codedPaths';
import {
  createReloadBackup,
  getReloadBackup,
  restoreReloadBackup,
  clearReloadBackup,
} from '../hooks/useSessionPersistence';

const GESTURE_TOOLS: { id: GestureTool; key: string }[] = [
  { id: 'click', key: '1' },
  { id: 'scroll', key: '2' },
  { id: 'drag', key: '3' },
  { id: 'swipe', key: '4' },
  { id: 'point', key: '5' },
];

export const Toolbar: React.FC = () => {
  const { state, dispatch, canUndo, cursorScale, setCursorScale, saveSession } =
    useDirector();
  const gallery = useGalleryActive();
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [openDropdown, setOpenDropdown] = useState<GestureTool | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track whether a reload backup is available (for Undo Reload button).
  // Poll every 5s to handle TTL expiry and cross-tab changes.
  const [hasBackup, setHasBackup] = useState<boolean>(
    () => !!getReloadBackup(),
  );

  // Render mode state (Pure Remotion / Hybrid / Pure HF). Only meaningful for
  // DorianFull — the only composition with an HF counterpart.
  const [renderMode, setRenderMode] = useState<'remotion' | 'hybrid' | 'hf'>(
    'remotion',
  );
  const [renderState, setRenderState] = useState<
    'idle' | 'starting' | 'running' | 'error'
  >('idle');
  const [renderLogPath, setRenderLogPath] = useState<string | null>(null);
  const [renderTail, setRenderTail] = useState<string>('');
  const supportsDualStack = state.compositionId === 'DorianFull';

  const handleRender = useCallback(async () => {
    setRenderState('starting');
    setRenderTail('');
    try {
      const res = await fetch('/api/render-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: renderMode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      setRenderLogPath(data.logPath);
      setRenderState('running');
    } catch (err) {
      console.error('render failed:', err);
      setRenderState('error');
      setTimeout(() => setRenderState('idle'), 3000);
    }
  }, [renderMode]);

  // Poll the render log while running
  useEffect(() => {
    if (renderState !== 'running' || !renderLogPath) return;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/render-status?logPath=${encodeURIComponent(renderLogPath)}`,
        );
        const data = await res.json();
        if (data.tail) setRenderTail(data.tail);
      } catch {
        // ignore transient poll failures
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [renderState, renderLogPath]);
  useEffect(() => {
    const id = setInterval(() => setHasBackup(!!getReloadBackup()), 5000);
    return () => clearInterval(id);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

  const handleSave = useCallback(async () => {
    setSaveState('saving');
    try {
      // Save path to disk if a scene is selected
      if (state.selectedScene) {
        const waypoints = state.waypoints[state.selectedScene] || [];
        const gesture = state.sceneGesture[state.selectedScene] || 'click';
        const preset = GESTURE_PRESETS[gesture];
        const safeName = state.selectedScene.replace(/[^a-zA-Z0-9_-]/g, '');
        const res = await fetch('/api/save-path', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            compositionId: state.compositionId,
            sceneName: safeName,
            path: waypoints,
            gesture,
            animation:
              state.sceneAnimation[state.selectedScene] ?? preset.animation,
            dark: state.sceneDark[state.selectedScene],
            secondaryLayers: (() => {
              const sceneLayers = state.layers[state.selectedScene] || [];
              const handLayers = sceneLayers.filter((l) => l.type === 'hand');
              const secondary = handLayers.slice(1).map((l) => ({
                gesture: l.data.gesture,
                path: (l.data as { waypoints?: unknown[] }).waypoints || [],
              }));
              return secondary.length > 0 ? secondary : undefined;
            })(),
          }),
        });
        if (!res.ok) throw new Error('Save failed');
      }
      // Mark scene as saved (creates version snapshot)
      if (state.selectedScene) {
        dispatch({ type: 'MARK_SAVED', scene: state.selectedScene });
      }
      // Always persist full state to localStorage
      saveSession();
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }, [
    state.selectedScene,
    state.waypoints,
    state.sceneGesture,
    state.sceneAnimation,
    state.sceneDark,
    state.layers,
    state.compositionId,
    saveSession,
  ]);

  // Listen for Ctrl+S custom event from App.tsx
  useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener('scene-director-save', handler);
    return () => window.removeEventListener('scene-director-save', handler);
  }, [handleSave]);

  // Current effective animation and dark for the selected scene
  const scene = state.selectedScene;
  const currentAnimation = scene
    ? (state.sceneAnimation[scene] ??
      GESTURE_PRESETS[state.sceneGesture[scene] ?? 'click']?.animation)
    : null;
  const currentDark = scene ? (state.sceneDark[scene] ?? false) : false;

  return (
    <div className="toolbar">
      {/* Title */}
      <span className="toolbar__logo">SD</span>

      {/* Composition dropdown — grouped by optgroup */}
      <select
        className="toolbar__select"
        value={state.compositionId}
        onChange={(e) =>
          dispatch({ type: 'SET_COMPOSITION', id: e.target.value })
        }
      >
        {(() => {
          const groups: Record<string, typeof COMPOSITIONS> = {};
          for (const c of COMPOSITIONS) {
            const g = c.group ?? 'Other';
            (groups[g] ??= []).push(c);
          }
          const order = [
            'Sigma Demos',
            'Sigma Full',
            'Dorian',
            'Mobile Chat',
            'Dashmor',
            'Utilities',
            'Other',
          ];
          return order
            .filter((g) => groups[g]?.length)
            .map((g) => (
              <optgroup key={g} label={g}>
                {groups[g].map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            ));
        })()}
      </select>

      <div className="toolbar__divider" />

      {/* Gesture tool buttons with variant dropdown */}
      <div className="toolbar__gesture-group" ref={dropdownRef}>
        {GESTURE_TOOLS.map((t) => {
          const preset = GESTURE_PRESETS[t.id];
          const active = state.activeTool === t.id;
          const dropdownOpen = openDropdown === t.id;
          const animations = gallery.filterHandAnims(t.id);

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
                {active && (
                  <span className="toolbar__btn-arrow">
                    {dropdownOpen ? '\u25B2' : '\u25BC'}
                  </span>
                )}
              </button>

              {/* Variant dropdown */}
              {dropdownOpen && (
                <div className="toolbar__dropdown">
                  <div className="toolbar__dropdown-title">Hand Style</div>
                  <div className="toolbar__dropdown-anims">
                    {animations.map((anim) => {
                      const isActive = currentAnimation === anim.id;
                      return (
                        <button
                          key={anim.id}
                          onClick={() => {
                            if (scene) {
                              dispatch({
                                type: 'SET_SCENE_ANIMATION',
                                scene,
                                animation: anim.id,
                              });
                              if (!state.sceneGesture[scene]) {
                                dispatch({
                                  type: 'SET_SCENE_GESTURE',
                                  scene,
                                  gesture: t.id,
                                });
                              }
                            }
                          }}
                          className={`toolbar__dropdown-btn toolbar__dropdown-btn--with-thumb ${isActive ? 'toolbar__dropdown-btn--active' : ''}`}
                        >
                          <LottieThumbnail
                            animationFile={anim.id}
                            size={22}
                            dark={currentDark}
                          />
                          {anim.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="toolbar__dropdown-title toolbar__dropdown-separator">
                    Pointer
                  </div>
                  <div className="toolbar__dropdown-anims">
                    {gallery.filterPointers().map((ptr) => {
                      const isActive = currentAnimation === ptr.id;
                      return (
                        <button
                          key={ptr.id}
                          onClick={() => {
                            if (scene) {
                              dispatch({
                                type: 'SET_SCENE_ANIMATION',
                                scene,
                                animation: ptr.id,
                              });
                              if (!state.sceneGesture[scene]) {
                                dispatch({
                                  type: 'SET_SCENE_GESTURE',
                                  scene,
                                  gesture: t.id,
                                });
                              }
                            }
                          }}
                          className={`toolbar__dropdown-btn toolbar__dropdown-btn--with-thumb ${isActive ? 'toolbar__dropdown-btn--active' : ''}`}
                        >
                          <LottieThumbnail
                            animationFile={ptr.id}
                            size={22}
                            dark={currentDark}
                          />
                          {ptr.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="toolbar__dropdown-dark">
                    <button
                      onClick={() => {
                        if (scene)
                          dispatch({
                            type: 'SET_SCENE_DARK',
                            scene,
                            dark: true,
                          });
                      }}
                      className={`toolbar__dropdown-btn ${currentDark ? 'toolbar__dropdown-btn--active' : ''}`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => {
                        if (scene)
                          dispatch({
                            type: 'SET_SCENE_DARK',
                            scene,
                            dark: false,
                          });
                      }}
                      className={`toolbar__dropdown-btn ${!currentDark ? 'toolbar__dropdown-btn--active' : ''}`}
                    >
                      Dark
                    </button>
                  </div>
                  <div className="toolbar__dropdown-title toolbar__dropdown-separator">
                    Click Effect
                  </div>
                  <div className="toolbar__dropdown-anims">
                    {gallery.filterClickAnims().map((anim) => {
                      const thumbFile = currentAnimation
                        ? buildClickAnimationFile(currentAnimation, anim.id)
                        : undefined;
                      return (
                        <button
                          key={anim.id}
                          onClick={() =>
                            dispatch({
                              type: 'SET_CLICK_ANIMATION',
                              animation: anim.id,
                            })
                          }
                          className={`toolbar__dropdown-btn toolbar__dropdown-btn--with-thumb ${state.clickAnimation === anim.id ? 'toolbar__dropdown-btn--active' : ''}`}
                        >
                          {thumbFile && (
                            <LottieThumbnail
                              animationFile={thumbFile}
                              size={32}
                              dark={currentDark}
                              playOnHover
                            />
                          )}
                          {anim.label}
                        </button>
                      );
                    })}
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
        onClick={() => {
          dispatch({ type: 'SET_TOOL', tool: 'select' });
          setOpenDropdown(null);
        }}
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
            <span className="toolbar__slider-label">
              {cursorScale.toFixed(1)}x
            </span>
          </div>
        </>
      )}

      <div className="toolbar__spacer" />

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
        disabled={saveState === 'saving'}
        className={`toolbar__btn ${
          saveState === 'saved'
            ? 'toolbar__btn--save-ok'
            : saveState === 'error'
              ? 'toolbar__btn--clear'
              : 'toolbar__btn--save'
        }`}
        title="Save path to file (Ctrl+S)"
      >
        {saveState === 'saving'
          ? 'Saving...'
          : saveState === 'saved'
            ? 'Saved!'
            : saveState === 'error'
              ? 'Error!'
              : 'Save'}
      </button>

      {/* Revert */}
      {state.selectedScene && state.savedSnapshots[state.selectedScene] && (
        <button
          onClick={() =>
            dispatch({ type: 'REVERT_SCENE', scene: state.selectedScene! })
          }
          className="toolbar__btn toolbar__btn--clear"
          title="Revert to last saved state"
        >
          Revert
        </button>
      )}

      {/* Reload — wipes localStorage session for ALL scenes in current composition and re-seeds from codedPaths.data.json. Snapshots current state first so Undo Reload can restore it within 10 minutes. */}
      <button
        onClick={() => {
          const comp = COMPOSITIONS.find((c) => c.id === state.compositionId);
          if (!comp) return;
          if (
            !confirm(
              `Reload all ${comp.scenes.length} scenes in "${comp.label}" from codedPaths.data.json?\n\nThis discards unsaved edits — but we'll keep a 10-minute rollback. Click "Undo Reload" to get your work back.`,
            )
          ) {
            return;
          }
          // Stash current session BEFORE dispatching any destructive action
          createReloadBackup();
          for (const s of comp.scenes) {
            const coded = getCodedPath(state.compositionId, s.name);
            dispatch({ type: 'RELOAD_SCENE_FROM_DISK', scene: s.name });
            dispatch({
              type: 'ENSURE_SCENE_LAYERS',
              scene: s.name,
              compositionId: state.compositionId,
              codedPath: coded,
              sceneZoom: s.zoom,
            });
          }
          saveSession();
          setHasBackup(true);
        }}
        className="toolbar__btn toolbar__btn--clear"
        title="Reload all scenes in this composition from codedPaths.data.json (rollback available via Undo Reload)"
      >
        Reload
      </button>

      {/* Undo Reload — restores the pre-Reload snapshot (available for 10 min after Reload) */}
      {hasBackup && (
        <button
          onClick={() => {
            const backup = getReloadBackup();
            if (!backup) {
              setHasBackup(false);
              return;
            }
            const ageMin = Math.round((Date.now() - backup.timestamp) / 60000);
            if (
              !confirm(
                `Restore session from ${ageMin}m ago? The page will reload to apply the restore.`,
              )
            ) {
              return;
            }
            if (restoreReloadBackup()) {
              window.location.reload();
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            if (confirm('Discard the reload backup?')) {
              clearReloadBackup();
              setHasBackup(false);
            }
          }}
          className="toolbar__btn toolbar__btn--clear"
          style={{ background: '#7c3aed', color: '#fff' }}
          title="Restore pre-Reload session (right-click to discard the backup)"
        >
          Undo Reload
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

      {/* Gallery */}
      <button
        onClick={() => dispatch({ type: 'SET_VIEW', view: 'gallery' })}
        className="toolbar__btn toolbar__btn--gallery"
        title="Hand gesture gallery (G)"
      >
        Gallery
      </button>

      {/* Render Mode — only for DorianFull (dual-stack composition) */}
      {supportsDualStack && (
        <>
          <div className="toolbar__divider" />
          <select
            value={renderMode}
            onChange={(e) =>
              setRenderMode(e.target.value as 'remotion' | 'hybrid' | 'hf')
            }
            className="toolbar__select"
            disabled={renderState === 'running' || renderState === 'starting'}
            title="Render mode"
          >
            <option value="remotion">Pure Remotion</option>
            <option value="hybrid">Hybrid (Both)</option>
            <option value="hf">Pure HF</option>
          </select>
          <button
            onClick={handleRender}
            disabled={renderState === 'running' || renderState === 'starting'}
            className={`toolbar__btn ${
              renderState === 'error'
                ? 'toolbar__btn--clear'
                : renderState === 'running'
                  ? 'toolbar__btn--save-ok'
                  : 'toolbar__btn--export'
            }`}
            title={
              renderState === 'running'
                ? `Rendering... log: ${renderLogPath}`
                : `Trigger ${renderMode} render via npm script`
            }
          >
            {renderState === 'starting'
              ? 'Starting…'
              : renderState === 'running'
                ? 'Rendering…'
                : renderState === 'error'
                  ? 'Error'
                  : 'Render'}
          </button>
          {renderState === 'running' && renderTail && (
            <span
              className="toolbar__render-tail"
              title={renderTail}
              style={{
                fontSize: '10px',
                color: '#888',
                maxWidth: '240px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'monospace',
              }}
            >
              {renderTail.split('\n').filter(Boolean).slice(-1)[0] || ''}
            </span>
          )}
        </>
      )}
    </div>
  );
};
