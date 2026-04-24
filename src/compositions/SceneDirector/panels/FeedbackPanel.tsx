/**
 * FeedbackPanel — right-sidebar list of all pins grouped by scene.
 *
 * Replaces Inspector when feedbackMode is on. Each row shows severity dot,
 * note preview, scene/frame, and offers: jump to frame, resolve toggle,
 * delete, export JSON for Claude.
 */

import React, { useCallback, useMemo } from 'react';
import { useDirector } from '../context';
import type { FeedbackPin } from '../state';

const SEVERITY_COLORS: Record<FeedbackPin['severity'], string> = {
  issue: '#ef4444',
  idea: '#3b82f6',
  question: '#a855f7',
};

export const FeedbackPanel: React.FC = () => {
  const { state, dispatch, composition, playerRef } = useDirector();
  const pins = state.feedbackPins[state.compositionId] ?? [];

  const grouped = useMemo(() => {
    const map = new Map<string, FeedbackPin[]>();
    for (const pin of pins) {
      const list = map.get(pin.scene) ?? [];
      list.push(pin);
      map.set(pin.scene, list);
    }
    // Sort each scene's pins by frame
    for (const list of map.values()) list.sort((a, b) => a.frame - b.frame);
    // Return entries in scene-definition order
    return composition.scenes
      .map((s) => ({ scene: s, pins: map.get(s.name) ?? [] }))
      .filter((g) => g.pins.length > 0);
  }, [pins, composition.scenes]);

  const handleJump = useCallback(
    (pin: FeedbackPin) => {
      dispatch({ type: 'SELECT_SCENE', name: pin.scene });
      playerRef.current?.seekTo(pin.frame);
      dispatch({ type: 'SET_EDITING_PIN', id: pin.id });
    },
    [dispatch, playerRef],
  );

  const handleExport = useCallback(async () => {
    const payload = JSON.stringify(
      { compositionId: state.compositionId, pins },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(payload);
      alert(`Copied ${pins.length} pins to clipboard. Paste into chat.`);
    } catch {
      // Fallback — open in a new window
      const w = window.open('', '_blank');
      if (w) {
        w.document.body.textContent = payload;
      }
    }
  }, [pins, state.compositionId]);

  const handleClearResolved = useCallback(() => {
    const resolved = pins.filter((p) => p.resolved);
    if (resolved.length === 0) return;
    if (!confirm(`Delete ${resolved.length} resolved pin(s)?`)) return;
    for (const p of resolved) {
      dispatch({ type: 'DELETE_FEEDBACK_PIN', id: p.id });
    }
  }, [pins, dispatch]);

  const handleClearAll = useCallback(() => {
    if (pins.length === 0) return;
    if (!confirm(`Delete all ${pins.length} pins for this composition?`))
      return;
    for (const p of pins) {
      dispatch({ type: 'DELETE_FEEDBACK_PIN', id: p.id });
    }
  }, [pins, dispatch]);

  return (
    <div className="feedback-panel">
      <h3>Feedback — {composition.label}</h3>
      <div className="feedback-panel__hint">
        Click anywhere on the video to drop a pin at the current frame. Pins
        persist locally and sync to disk on Save.
      </div>

      {pins.length === 0 ? (
        <div className="feedback-panel__empty">
          No pins yet. Click on the video canvas to drop your first note.
        </div>
      ) : (
        <>
          {grouped.map(({ scene, pins: scenePins }) => (
            <div key={scene.name} className="feedback-panel__scene">
              <div className="feedback-panel__scene-title">
                {scene.name} ({scenePins.length})
              </div>
              {scenePins.map((pin) => (
                <div
                  key={pin.id}
                  className={`feedback-panel__row${pin.resolved ? ' feedback-panel__row--resolved' : ''}`}
                  onClick={() => handleJump(pin)}
                >
                  <div
                    className="feedback-panel__row-dot"
                    style={{ background: SEVERITY_COLORS[pin.severity] }}
                  />
                  <div className="feedback-panel__row-body">
                    <div className="feedback-panel__row-note">
                      {pin.note || (
                        <em style={{ color: '#6b7280' }}>(no note)</em>
                      )}
                    </div>
                    <div className="feedback-panel__row-meta">
                      f{pin.frame} @ ({Math.round(pin.x)}, {Math.round(pin.y)})
                      {' · '}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({
                            type: 'UPDATE_FEEDBACK_PIN',
                            id: pin.id,
                            changes: { resolved: !pin.resolved },
                          });
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {pin.resolved ? 'unresolve' : 'resolve'}
                      </button>
                      {' · '}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({
                            type: 'DELETE_FEEDBACK_PIN',
                            id: pin.id,
                          });
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fca5a5',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      <div className="feedback-panel__actions">
        <button onClick={handleExport} disabled={pins.length === 0}>
          Copy JSON
        </button>
        <button onClick={handleClearResolved}>Clear resolved</button>
        <button onClick={handleClearAll} disabled={pins.length === 0}>
          Clear all
        </button>
      </div>
    </div>
  );
};
