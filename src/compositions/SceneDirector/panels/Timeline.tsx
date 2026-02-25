/**
 * Timeline v4 - Multi-row timeline with separate tracks for scenes, hand gestures, and audio.
 * Row 1: Scene bars (clickable, no waypoint dots)
 * Row 2: Hand gesture bars (spanning waypoint frame range, showing gesture name)
 * Row 3+: Audio bars (one row per overlapping audio, drag-to-resize)
 * Playhead spans all rows. Row labels on the left.
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useDirector } from '../context';
import { useAudioDrag, useHandDrag } from './useTimelineDrag';
import { useHandLayers, useAudioRows } from './useTimelineData';

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2];
const ROW_HEIGHT = 22;
const ROW_GAP = 2;
const LABEL_WIDTH = 48;

export const Timeline: React.FC = () => {
  const {
    state,
    dispatch,
    frame,
    playerRef,
    composition,
    playbackRate,
    setPlaybackRate,
  } = useDirector();
  const { scenes } = composition;
  const totalFrames = composition.video.frames;
  const tracksRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const wasPlayingRef = useRef(false);

  // Audio & hand bar drag hooks (extracted to useTimelineDrag.ts)
  const { audioDrag, handleAudioEdgeDown } = useAudioDrag({
    state,
    dispatch,
    tracksRef,
    totalFrames,
  });
  const { handDrag, handleHandEdgeDown } = useHandDrag({
    state,
    dispatch,
    tracksRef,
    totalFrames,
  });

  const playheadPct = (frame / totalFrames) * 100;

  // Convert mouse clientX to frame number using the tracks area rect
  const clientXToFrame = useCallback(
    (clientX: number): number => {
      const el = tracksRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(pct * (totalFrames - 1));
    },
    [totalFrames],
  );

  // Seek to a specific frame and auto-select the scene under it
  const seekAndSelect = useCallback(
    (targetFrame: number) => {
      if (!playerRef.current) return;
      playerRef.current.seekTo(targetFrame);
      const scene = scenes.find(
        (s) => targetFrame >= s.start && targetFrame < s.end,
      );
      if (scene && scene.name !== state.selectedScene) {
        dispatch({ type: 'SELECT_SCENE', name: scene.name });
      }
    },
    [playerRef, scenes, state.selectedScene, dispatch],
  );

  // Start scrubbing on mousedown (only if not dragging audio/hand)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (audioDrag || handDrag) return;
      e.preventDefault();
      setIsScrubbing(true);
      wasPlayingRef.current = playerRef.current?.isPlaying() ?? false;
      if (wasPlayingRef.current) {
        playerRef.current?.pause();
      }
      const targetFrame = clientXToFrame(e.clientX);
      seekAndSelect(targetFrame);
    },
    [clientXToFrame, seekAndSelect, playerRef, audioDrag, handDrag],
  );

  // Global mousemove/mouseup while scrubbing
  useEffect(() => {
    if (!isScrubbing) return;
    const handleMove = (e: MouseEvent) =>
      seekAndSelect(clientXToFrame(e.clientX));
    const handleUp = () => {
      setIsScrubbing(false);
      if (wasPlayingRef.current) playerRef.current?.play();
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isScrubbing, clientXToFrame, seekAndSelect, playerRef]);

  const isPlaying = playerRef.current?.isPlaying() ?? false;

  // Collect hand/audio layers across all scenes (extracted to useTimelineData.ts)
  const handLayers = useHandLayers(state.layers, scenes);
  const audioRows = useAudioRows(state.layers, scenes);

  const hasHand = handLayers.length > 0;
  const audioRowCount = Math.max(1, audioRows.length);
  const totalHeight =
    ROW_HEIGHT +
    (hasHand ? ROW_HEIGHT + ROW_GAP : 0) +
    audioRowCount * (ROW_HEIGHT + ROW_GAP);

  return (
    <div className="timeline">
      {/* Transport controls + frame counter */}
      <div className="timeline__transport">
        <button
          onClick={() => playerRef.current?.seekTo(Math.max(0, frame - 10))}
          className="timeline__transport-btn"
          title="Step -10 frames (Shift+Left)"
        >
          &#x23EA;
        </button>
        <button
          onClick={() => playerRef.current?.seekTo(Math.max(0, frame - 1))}
          className="timeline__transport-btn"
          title="Step -1 frame (Left)"
        >
          &#x23F4;
        </button>
        <button
          onClick={() => {
            if (playerRef.current?.isPlaying()) playerRef.current.pause();
            else playerRef.current?.play();
          }}
          className="timeline__play-btn"
          title="Play/Pause (Space)"
        >
          {isPlaying ? '\u23F8' : '\u25B6'}
        </button>
        <button
          onClick={() =>
            playerRef.current?.seekTo(Math.min(totalFrames - 1, frame + 1))
          }
          className="timeline__transport-btn"
          title="Step +1 frame (Right)"
        >
          &#x23F5;
        </button>
        <button
          onClick={() =>
            playerRef.current?.seekTo(Math.min(totalFrames - 1, frame + 10))
          }
          className="timeline__transport-btn"
          title="Step +10 frames (Shift+Right)"
        >
          &#x23E9;
        </button>

        <div className="timeline__speed">
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackRate(speed)}
              className={`timeline__speed-btn ${playbackRate === speed ? 'timeline__speed-btn--active' : ''}`}
              title={`${speed}x speed`}
            >
              {speed}x
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <span className="timeline__frame-counter">
          {frame} / {totalFrames}
        </span>
      </div>

      {/* Multi-row timeline */}
      <div
        className={`timeline__tracks ${isScrubbing ? 'timeline__tracks--scrubbing' : ''}`}
        style={{ height: totalHeight }}
        onMouseDown={handleMouseDown}
      >
        {/* Row labels (left gutter) */}
        <div className="timeline__labels" style={{ width: LABEL_WIDTH }}>
          <div className="timeline__row-label" style={{ height: ROW_HEIGHT }}>
            Scenes
          </div>
          {hasHand && (
            <div
              className="timeline__row-label timeline__row-label--hand"
              style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }}
            >
              Hand
            </div>
          )}
          {Array.from({ length: audioRowCount }, (_, i) => (
            <div
              key={i}
              className="timeline__row-label timeline__row-label--audio"
              style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }}
            >
              {i === 0 ? 'Audio' : ''}
            </div>
          ))}
        </div>

        {/* Track area (right side, holds all bars + playhead) */}
        <div ref={tracksRef} className="timeline__track-area">
          {/* Row 1: Scene bars */}
          <div className="timeline__row" style={{ height: ROW_HEIGHT }}>
            {scenes.map((scene, sceneIndex) => {
              const left = (scene.start / totalFrames) * 100;
              const width = ((scene.end - scene.start) / totalFrames) * 100;
              const isSelected = scene.name === state.selectedScene;
              const partColor =
                scene.part === 'V2'
                  ? 'var(--orange)'
                  : scene.part === 'V4'
                    ? 'var(--green)'
                    : 'var(--accent)';
              return (
                <div
                  key={scene.name}
                  onMouseDown={() =>
                    dispatch({ type: 'SELECT_SCENE', name: scene.name })
                  }
                  className={`timeline__scene ${isSelected ? 'timeline__scene--selected' : ''}`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    borderColor: isSelected ? partColor : undefined,
                  }}
                  title={`${scene.name} (${scene.start}-${scene.end})`}
                >
                  <span className="timeline__scene-label">
                    <span
                      style={{ color: '#fff', marginRight: 2, fontWeight: 700 }}
                    >
                      {sceneIndex + 1}
                    </span>
                    {width > 6 &&
                      (scene.name.split('-').slice(1).join('-') || scene.name)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Row 2: Hand gesture bars */}
          {hasHand && (
            <div
              className="timeline__row"
              style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }}
            >
              {handLayers.map(({ layer, sceneStart, sceneEnd, sceneName }) => {
                const wps = layer.data.waypoints;
                const isSingle = wps && wps.length === 1;
                let globalStart: number;
                let globalEnd: number;
                let wpFrame = 0;
                let wpDuration = 0;
                if (wps && wps.length > 0) {
                  const firstFrame = wps[0].frame ?? 0;
                  const lastFrame = wps[wps.length - 1].frame ?? 0;
                  const duration = wps[wps.length - 1].duration ?? 0;
                  wpFrame = firstFrame;
                  wpDuration = duration;
                  globalStart = sceneStart + firstFrame;
                  // No scene clamp — bar can extend past scene boundary
                  globalEnd = sceneStart + lastFrame + Math.max(duration, 1);
                } else {
                  globalStart = sceneStart;
                  globalEnd = sceneEnd;
                }
                const left = (globalStart / totalFrames) * 100;
                const width = Math.max(
                  0.3,
                  ((globalEnd - globalStart) / totalFrames) * 100,
                );
                const gesture =
                  state.sceneGesture[sceneName] ||
                  layer.data.gesture ||
                  'click';
                const isSelected = state.selectedLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    className={`timeline__hand-bar ${isSelected ? 'timeline__hand-bar--selected' : ''}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${gesture} (f${globalStart - sceneStart}-${globalEnd - sceneStart})`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      if (isSelected) {
                        // Determine if this is a secondary layer
                        const sceneLayers = state.layers[sceneName] || [];
                        const primaryIdx = sceneLayers.findIndex(
                          (l) => l.type === 'hand',
                        );
                        const selIdx = sceneLayers.findIndex(
                          (l) => l.id === layer.id,
                        );
                        const isSecondary =
                          selIdx >= 0 && selIdx !== primaryIdx;
                        handleHandEdgeDown(
                          e,
                          sceneName,
                          'move',
                          wpFrame,
                          wpDuration,
                          wps || [],
                          isSecondary ? layer.id : null,
                        );
                        return;
                      }
                      dispatch({ type: 'SELECT_LAYER', layerId: layer.id });
                      dispatch({ type: 'SELECT_SCENE', name: sceneName });
                      dispatch({ type: 'SET_SIDEBAR_TAB', tab: 'editor' });
                    }}
                  >
                    {isSelected && (
                      <div
                        className="timeline__audio-handle timeline__audio-handle--left"
                        onMouseDown={(e) => {
                          const sceneLayers = state.layers[sceneName] || [];
                          const primaryIdx = sceneLayers.findIndex(
                            (l) => l.type === 'hand',
                          );
                          const selIdx = sceneLayers.findIndex(
                            (l) => l.id === layer.id,
                          );
                          const isSecondary =
                            selIdx >= 0 && selIdx !== primaryIdx;
                          handleHandEdgeDown(
                            e,
                            sceneName,
                            'left',
                            wpFrame,
                            wpDuration,
                            wps || [],
                            isSecondary ? layer.id : null,
                          );
                        }}
                      />
                    )}
                    <span className="timeline__hand-label">{gesture}</span>
                    {isSelected && (
                      <div
                        className="timeline__audio-handle timeline__audio-handle--right"
                        onMouseDown={(e) => {
                          const sceneLayers = state.layers[sceneName] || [];
                          const primaryIdx = sceneLayers.findIndex(
                            (l) => l.type === 'hand',
                          );
                          const selIdx = sceneLayers.findIndex(
                            (l) => l.id === layer.id,
                          );
                          const isSecondary =
                            selIdx >= 0 && selIdx !== primaryIdx;
                          handleHandEdgeDown(
                            e,
                            sceneName,
                            'right',
                            wpFrame,
                            wpDuration,
                            wps || [],
                            isSecondary ? layer.id : null,
                          );
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Row 3+: Audio bars (one row per overlap level) */}
          {audioRows.map((rowEntries, rowIdx) => (
            <div
              key={rowIdx}
              className="timeline__row"
              style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }}
            >
              {rowEntries.map(
                ({ layer, sceneStart, sceneName, globalStart, globalEnd }) => {
                  const { startFrame, durationInFrames: dur } = layer.data;
                  const durationInFrames = dur || 60;
                  const left = (globalStart / totalFrames) * 100;
                  const width = (durationInFrames / totalFrames) * 100;
                  const isSelected = state.selectedLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      className={`timeline__audio-bar ${isSelected ? 'timeline__audio-bar--selected' : ''}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${layer.name} f${startFrame} (${durationInFrames}f)`}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        if (isSelected) {
                          handleAudioEdgeDown(
                            e,
                            layer.id,
                            sceneName,
                            'move',
                            startFrame,
                            durationInFrames,
                          );
                          return;
                        }
                        dispatch({ type: 'SELECT_LAYER', layerId: layer.id });
                        dispatch({ type: 'SELECT_SCENE', name: sceneName });
                        dispatch({ type: 'SET_SIDEBAR_TAB', tab: 'editor' });
                      }}
                    >
                      <div
                        className="timeline__audio-handle timeline__audio-handle--left"
                        onMouseDown={(e) =>
                          handleAudioEdgeDown(
                            e,
                            layer.id,
                            sceneName,
                            'left',
                            startFrame,
                            durationInFrames,
                          )
                        }
                      />
                      <span className="timeline__audio-label">
                        {layer.name.replace('Audio - ', '')}
                      </span>
                      <div
                        className="timeline__audio-handle timeline__audio-handle--right"
                        onMouseDown={(e) =>
                          handleAudioEdgeDown(
                            e,
                            layer.id,
                            sceneName,
                            'right',
                            startFrame,
                            durationInFrames,
                          )
                        }
                      />
                    </div>
                  );
                },
              )}
            </div>
          ))}
          {/* Empty audio row when no audio exists */}
          {audioRows.length === 0 && (
            <div
              className="timeline__row"
              style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }}
            />
          )}

          {/* Playhead (spans all rows) */}
          <div
            className="timeline__playhead"
            style={{ left: `${playheadPct}%` }}
          >
            <div className="timeline__playhead-tri" />
          </div>
        </div>
      </div>
    </div>
  );
};
