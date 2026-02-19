/**
 * Timeline v4 - Multi-row timeline with separate tracks for scenes, hand gestures, and audio.
 * Row 1: Scene bars (clickable, no waypoint dots)
 * Row 2: Hand gesture bars (spanning waypoint frame range, showing gesture name)
 * Row 3+: Audio bars (one row per overlapping audio, drag-to-resize)
 * Playhead spans all rows. Row labels on the left.
 */

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { useDirector } from '../context';
import type { AudioLayer, HandLayer } from '../layers';

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2];
const ROW_HEIGHT = 22;
const ROW_GAP = 2;
const LABEL_WIDTH = 48;

export const Timeline: React.FC = () => {
  const { state, dispatch, frame, playerRef, composition, playbackRate, setPlaybackRate } = useDirector();
  const { scenes } = composition;
  const totalFrames = composition.video.frames;
  const tracksRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const wasPlayingRef = useRef(false);

  // Audio bar drag state
  const [audioDrag, setAudioDrag] = useState<{
    layerId: string;
    scene: string;
    edge: 'left' | 'right';
    startX: number;
    originalStart: number;
    originalDuration: number;
  } | null>(null);

  const playheadPct = (frame / totalFrames) * 100;

  // Convert mouse clientX to frame number using the tracks area rect
  const clientXToFrame = useCallback((clientX: number): number => {
    const el = tracksRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (totalFrames - 1));
  }, [totalFrames]);

  // Seek to a specific frame and auto-select the scene under it
  const seekAndSelect = useCallback((targetFrame: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(targetFrame);
    const scene = scenes.find(s => targetFrame >= s.start && targetFrame < s.end);
    if (scene && scene.name !== state.selectedScene) {
      dispatch({ type: 'SELECT_SCENE', name: scene.name });
    }
  }, [playerRef, scenes, state.selectedScene, dispatch]);

  // Start scrubbing on mousedown (only if not dragging audio)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (audioDrag) return;
    e.preventDefault();
    setIsScrubbing(true);
    wasPlayingRef.current = playerRef.current?.isPlaying() ?? false;
    if (wasPlayingRef.current) {
      playerRef.current?.pause();
    }
    const targetFrame = clientXToFrame(e.clientX);
    seekAndSelect(targetFrame);
  }, [clientXToFrame, seekAndSelect, playerRef, audioDrag]);

  // Global mousemove/mouseup while scrubbing
  useEffect(() => {
    if (!isScrubbing) return;
    const handleMove = (e: MouseEvent) => seekAndSelect(clientXToFrame(e.clientX));
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

  // Audio bar edge drag
  const handleAudioEdgeDown = useCallback((
    e: React.MouseEvent,
    layerId: string,
    sceneName: string,
    edge: 'left' | 'right',
    currentStart: number,
    currentDuration: number,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setAudioDrag({ layerId, scene: sceneName, edge, startX: e.clientX, originalStart: currentStart, originalDuration: currentDuration });
  }, []);

  useEffect(() => {
    if (!audioDrag) return;
    const handleMove = (e: MouseEvent) => {
      const el = tracksRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pxPerFrame = rect.width / totalFrames;
      const deltaPx = e.clientX - audioDrag.startX;
      const deltaFrames = Math.round(deltaPx / pxPerFrame);
      if (audioDrag.edge === 'left') {
        const newStart = Math.max(0, audioDrag.originalStart + deltaFrames);
        const endFrame = audioDrag.originalStart + audioDrag.originalDuration;
        const newDuration = Math.max(1, endFrame - newStart);
        dispatch({ type: 'UPDATE_LAYER_DATA', scene: audioDrag.scene, layerId: audioDrag.layerId, data: { startFrame: newStart, durationInFrames: newDuration } });
      } else {
        const newDuration = Math.max(1, audioDrag.originalDuration + deltaFrames);
        dispatch({ type: 'UPDATE_LAYER_DATA', scene: audioDrag.scene, layerId: audioDrag.layerId, data: { durationInFrames: newDuration } });
      }
    };
    const handleUp = () => setAudioDrag(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [audioDrag, totalFrames, dispatch]);

  const isPlaying = playerRef.current?.isPlaying() ?? false;

  // Collect hand layers across all scenes
  const handLayers = useMemo(() => {
    const result: { layer: HandLayer; sceneStart: number; sceneEnd: number; sceneName: string }[] = [];
    for (const [sceneName, layers] of Object.entries(state.layers)) {
      const scene = scenes.find(s => s.name === sceneName);
      if (!scene) continue;
      for (const l of layers) {
        if (l.type === 'hand' && l.visible) {
          result.push({ layer: l as HandLayer, sceneStart: scene.start, sceneEnd: scene.end, sceneName });
        }
      }
    }
    return result;
  }, [state.layers, scenes]);

  // Collect audio layers across all scenes, assign sub-rows for overlaps
  const audioRows = useMemo(() => {
    const allAudio: { layer: AudioLayer; sceneStart: number; sceneName: string; globalStart: number; globalEnd: number }[] = [];
    for (const [sceneName, layers] of Object.entries(state.layers)) {
      const scene = scenes.find(s => s.name === sceneName);
      if (!scene) continue;
      for (const l of layers) {
        if (l.type === 'audio' && l.visible) {
          const a = l as AudioLayer;
          const gs = scene.start + a.data.startFrame;
          const ge = gs + (a.data.durationInFrames || 60);
          allAudio.push({ layer: a, sceneStart: scene.start, sceneName, globalStart: gs, globalEnd: ge });
        }
      }
    }
    // Assign rows greedily: each audio bar goes in the first row where it doesn't overlap
    const rows: typeof allAudio[] = [];
    for (const entry of allAudio.sort((a, b) => a.globalStart - b.globalStart)) {
      let placed = false;
      for (const row of rows) {
        const lastInRow = row[row.length - 1];
        if (entry.globalStart >= lastInRow.globalEnd) {
          row.push(entry);
          placed = true;
          break;
        }
      }
      if (!placed) rows.push([entry]);
    }
    return rows;
  }, [state.layers, scenes]);

  const hasHand = handLayers.length > 0;
  const audioRowCount = Math.max(1, audioRows.length);
  const totalHeight = ROW_HEIGHT + (hasHand ? ROW_HEIGHT + ROW_GAP : 0) + audioRowCount * (ROW_HEIGHT + ROW_GAP);

  return (
    <div className="timeline">
      {/* Transport controls + frame counter */}
      <div className="timeline__transport">
        <button onClick={() => playerRef.current?.seekTo(Math.max(0, frame - 10))} className="timeline__transport-btn" title="Step -10 frames (Shift+Left)">&#x23EA;</button>
        <button onClick={() => playerRef.current?.seekTo(Math.max(0, frame - 1))} className="timeline__transport-btn" title="Step -1 frame (Left)">&#x23F4;</button>
        <button
          onClick={() => {
            if (playerRef.current?.isPlaying()) playerRef.current.pause();
            else playerRef.current?.play();
          }}
          className="timeline__play-btn"
          title="Play/Pause (Space)"
        >{isPlaying ? '\u23F8' : '\u25B6'}</button>
        <button onClick={() => playerRef.current?.seekTo(Math.min(totalFrames - 1, frame + 1))} className="timeline__transport-btn" title="Step +1 frame (Right)">&#x23F5;</button>
        <button onClick={() => playerRef.current?.seekTo(Math.min(totalFrames - 1, frame + 10))} className="timeline__transport-btn" title="Step +10 frames (Shift+Right)">&#x23E9;</button>

        <div className="timeline__speed">
          {SPEED_OPTIONS.map(speed => (
            <button
              key={speed}
              onClick={() => setPlaybackRate(speed)}
              className={`timeline__speed-btn ${playbackRate === speed ? 'timeline__speed-btn--active' : ''}`}
              title={`${speed}x speed`}
            >{speed}x</button>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <span className="timeline__frame-counter">{frame} / {totalFrames}</span>
      </div>

      {/* Multi-row timeline */}
      <div
        className={`timeline__tracks ${isScrubbing ? 'timeline__tracks--scrubbing' : ''}`}
        style={{ height: totalHeight }}
        onMouseDown={handleMouseDown}
      >
        {/* Row labels (left gutter) */}
        <div className="timeline__labels" style={{ width: LABEL_WIDTH }}>
          <div className="timeline__row-label" style={{ height: ROW_HEIGHT }}>Scenes</div>
          {hasHand && <div className="timeline__row-label timeline__row-label--hand" style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }}>Hand</div>}
          {Array.from({ length: audioRowCount }, (_, i) => (
            <div key={i} className="timeline__row-label timeline__row-label--audio" style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }}>
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
              const partColor = scene.part === 'V2' ? 'var(--orange)' : scene.part === 'V4' ? 'var(--green)' : 'var(--accent)';
              return (
                <div
                  key={scene.name}
                  onMouseDown={() => dispatch({ type: 'SELECT_SCENE', name: scene.name })}
                  className={`timeline__scene ${isSelected ? 'timeline__scene--selected' : ''}`}
                  style={{ left: `${left}%`, width: `${width}%`, borderColor: isSelected ? partColor : undefined }}
                  title={`${scene.name} (${scene.start}-${scene.end})`}
                >
                  <span className="timeline__scene-label">
                    <span style={{ color: '#fff', marginRight: 2, fontWeight: 700 }}>{sceneIndex + 1}</span>
                    {width > 6 && (scene.name.split('-').slice(1).join('-') || scene.name)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Row 2: Hand gesture bars */}
          {hasHand && (
            <div className="timeline__row" style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }}>
              {handLayers.map(({ layer, sceneStart, sceneEnd, sceneName }) => {
                const wps = layer.data.waypoints;
                if (!wps || wps.length === 0) return null;
                const firstFrame = wps[0].frame ?? 0;
                const lastFrame = wps[wps.length - 1].frame ?? 0;
                const duration = wps[wps.length - 1].duration ?? 0;
                const globalStart = sceneStart + firstFrame;
                const globalEnd = Math.min(sceneEnd, sceneStart + lastFrame + duration);
                const left = (globalStart / totalFrames) * 100;
                const width = Math.max(0.3, ((globalEnd - globalStart) / totalFrames) * 100);
                const gesture = state.sceneGesture[sceneName] || layer.data.gesture || 'click';
                const isSelected = state.selectedLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    className={`timeline__hand-bar ${isSelected ? 'timeline__hand-bar--selected' : ''}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${gesture} (f${firstFrame}-${lastFrame + duration})`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'SELECT_LAYER', layerId: layer.id });
                      dispatch({ type: 'SELECT_SCENE', name: sceneName });
                    }}
                  >
                    <span className="timeline__hand-label">{gesture}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Row 3+: Audio bars (one row per overlap level) */}
          {audioRows.map((rowEntries, rowIdx) => (
            <div key={rowIdx} className="timeline__row" style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }}>
              {rowEntries.map(({ layer, sceneStart, sceneName, globalStart, globalEnd }) => {
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
                      dispatch({ type: 'SELECT_LAYER', layerId: layer.id });
                      dispatch({ type: 'SELECT_SCENE', name: sceneName });
                    }}
                  >
                    <div
                      className="timeline__audio-handle timeline__audio-handle--left"
                      onMouseDown={(e) => handleAudioEdgeDown(e, layer.id, sceneName, 'left', startFrame, durationInFrames)}
                    />
                    <span className="timeline__audio-label">{layer.name.replace('Audio - ', '')}</span>
                    <div
                      className="timeline__audio-handle timeline__audio-handle--right"
                      onMouseDown={(e) => handleAudioEdgeDown(e, layer.id, sceneName, 'right', startFrame, durationInFrames)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
          {/* Empty audio row when no audio exists */}
          {audioRows.length === 0 && (
            <div className="timeline__row" style={{ height: ROW_HEIGHT, marginTop: ROW_GAP }} />
          )}

          {/* Playhead (spans all rows) */}
          <div className="timeline__playhead" style={{ left: `${playheadPct}%` }}>
            <div className="timeline__playhead-tri" />
          </div>
        </div>
      </div>
    </div>
  );
};
