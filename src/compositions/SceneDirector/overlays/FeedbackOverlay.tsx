/**
 * FeedbackOverlay — click-to-pin annotation layer.
 *
 * When feedback mode is active, overlays the player-frame:
 *   - Click empty canvas → drop a pin at comp-space (x, y) + current frame
 *   - Click existing pin → jump to its frame + open inline note editor
 *   - Pins are frame-agnostic (always visible while feedback mode is on)
 *
 * Pin placement uses the SAME coord conversion as DrawingCanvas/WaypointMarkers,
 * so pins land exactly where the user clicked regardless of player zoom/pan.
 */

import React, { useCallback, useRef } from 'react';
import type { PlayerRef } from '@remotion/player';
import { useDirector } from '../context';
import { useToComp } from '../hooks/useToComp';
import type { FeedbackPin } from '../state';

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function newPinId() {
  return `pin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Pins are time-anchored: visible only when the playhead is within
 * ±PIN_VISIBILITY_WINDOW frames of the pin's anchor frame. Outside that
 * window the pin disappears so playback isn't cluttered. The currently-
 * editing pin is always visible (otherwise typing the note is impossible).
 *
 * 30fps × 0.5s = 15 frames either side.
 */
const PIN_VISIBILITY_WINDOW = 15;

export const FeedbackOverlay: React.FC<Props> = ({ containerRef }) => {
  const { state, dispatch, composition, frame, playerRef, currentScene } =
    useDirector();
  const toComp = useToComp(
    containerRef,
    composition.video.width,
    composition.video.height,
  );

  const allPins = state.feedbackPins[state.compositionId] ?? [];

  // Time-anchored visibility: only show pins near the current frame, plus
  // whichever one is being edited (so its textarea doesn't disappear mid-type).
  const pins = allPins.filter(
    (p) =>
      p.id === state.editingPinId ||
      Math.abs(p.frame - frame) <= PIN_VISIBILITY_WINDOW,
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Ignore clicks that bubble from inside a pin (dot, note, buttons)
      if ((e.target as HTMLElement).closest('.feedback-pin')) return;
      const pt = toComp(e.clientX, e.clientY);
      if (!pt) return;
      // Scene fallback: if no scene is selected, find the one under playhead
      const sceneName =
        currentScene?.name ??
        composition.scenes.find((s) => frame >= s.start && frame < s.end)
          ?.name ??
        composition.scenes[0]?.name ??
        '';
      const pin: FeedbackPin = {
        id: newPinId(),
        scene: sceneName,
        frame,
        x: pt.x,
        y: pt.y,
        note: '',
        severity: 'issue',
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_FEEDBACK_PIN', pin });
    },
    [toComp, frame, currentScene, composition.scenes, dispatch],
  );

  return (
    <div className="feedback-overlay" onClick={handleClick}>
      {pins.map((pin) => (
        <PinMarker
          key={pin.id}
          pin={pin}
          containerRef={containerRef}
          compWidth={composition.video.width}
          compHeight={composition.video.height}
          isEditing={state.editingPinId === pin.id}
          playerRef={playerRef}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
};

interface PinMarkerProps {
  pin: FeedbackPin;
  containerRef: React.RefObject<HTMLDivElement | null>;
  compWidth: number;
  compHeight: number;
  isEditing: boolean;
  playerRef: React.RefObject<PlayerRef | null>;
  dispatch: ReturnType<typeof useDirector>['dispatch'];
}

const PinMarker: React.FC<PinMarkerProps> = ({
  pin,
  compWidth,
  compHeight,
  isEditing,
  playerRef,
  dispatch,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Comp-space → percentage (works regardless of container size)
  const leftPct = (pin.x / compWidth) * 100;
  const topPct = (pin.y / compHeight) * 100;

  const handleDotClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      playerRef.current?.seekTo(pin.frame);
      dispatch({ type: 'SET_EDITING_PIN', id: isEditing ? null : pin.id });
    },
    [pin.frame, pin.id, isEditing, playerRef, dispatch],
  );

  const commitNote = useCallback(() => {
    const value = textareaRef.current?.value ?? pin.note;
    if (value !== pin.note) {
      dispatch({
        type: 'UPDATE_FEEDBACK_PIN',
        id: pin.id,
        changes: { note: value },
      });
    }
    dispatch({ type: 'SET_EDITING_PIN', id: null });
  }, [pin.id, pin.note, dispatch]);

  return (
    <div
      className={`feedback-pin feedback-pin--${pin.severity}${pin.resolved ? ' feedback-pin--resolved' : ''}`}
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
    >
      <div
        className="feedback-pin__dot"
        onClick={handleDotClick}
        title={`Scene: ${pin.scene} • Frame ${pin.frame} (click to jump)`}
      >
        <span>
          {pin.severity === 'idea'
            ? '!'
            : pin.severity === 'question'
              ? '?'
              : '•'}
        </span>
      </div>
      <div className="feedback-pin__frame-tag">f{pin.frame}</div>
      {(isEditing || pin.note) && (
        <div
          className="feedback-pin__note"
          onClick={(e) => e.stopPropagation()}
        >
          {isEditing ? (
            <>
              <textarea
                ref={textareaRef}
                defaultValue={pin.note}
                autoFocus
                placeholder="What's the issue? (Enter=save, Esc=cancel)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    commitNote();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    dispatch({ type: 'SET_EDITING_PIN', id: null });
                  }
                }}
                onBlur={commitNote}
              />
              <div className="feedback-pin__meta">
                <select
                  value={pin.severity}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_FEEDBACK_PIN',
                      id: pin.id,
                      changes: {
                        severity: e.target.value as FeedbackPin['severity'],
                      },
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <option value="issue">Issue</option>
                  <option value="idea">Idea</option>
                  <option value="question">Question</option>
                </select>
                <button
                  className="danger"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    dispatch({ type: 'DELETE_FEEDBACK_PIN', id: pin.id })
                  }
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div onClick={handleDotClick}>{pin.note}</div>
          )}
        </div>
      )}
    </div>
  );
};
