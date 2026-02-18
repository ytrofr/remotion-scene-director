/**
 * Timeline v3.1 - Bottom bar with transport controls, scene bars, waypoint dots,
 * audio bars with drag-to-resize, and drag-to-scrub playhead.
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useDirector } from '../context';
import type { AudioLayer } from '../layers';

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2];

export const Timeline: React.FC = () => {
  const { state, dispatch, frame, playerRef, composition, playbackRate, setPlaybackRate } = useDirector();
  const { scenes } = composition;
  const totalFrames = composition.video.frames;
  const barRef = useRef<HTMLDivElement>(null);
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

  // Convert mouse clientX to frame number using the bar's rect
  const clientXToFrame = useCallback((clientX: number): number => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (totalFrames - 1));
  }, [totalFrames]);

  // Convert clientX to local frame within a scene
  const clientXToLocalFrame = useCallback((clientX: number, sceneStart: number): number => {
    const globalFrame = clientXToFrame(clientX);
    return Math.max(0, globalFrame - sceneStart);
  }, [clientXToFrame]);

  // Seek to a specific frame and auto-select the scene under it
  const seekAndSelect = useCallback((targetFrame: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(targetFrame);
    // Auto-select scene under playhead
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

    const handleMove = (e: MouseEvent) => {
      const targetFrame = clientXToFrame(e.clientX);
      seekAndSelect(targetFrame);
    };

    const handleUp = () => {
      setIsScrubbing(false);
      if (wasPlayingRef.current) {
        playerRef.current?.play();
      }
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
    setAudioDrag({
      layerId,
      scene: sceneName,
      edge,
      startX: e.clientX,
      originalStart: currentStart,
      originalDuration: currentDuration,
    });
  }, []);

  useEffect(() => {
    if (!audioDrag) return;

    const handleMove = (e: MouseEvent) => {
      const bar = barRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pxPerFrame = rect.width / totalFrames;
      const deltaPx = e.clientX - audioDrag.startX;
      const deltaFrames = Math.round(deltaPx / pxPerFrame);

      if (audioDrag.edge === 'left') {
        // Drag left edge: change startFrame, adjust duration to keep right edge fixed
        const newStart = Math.max(0, audioDrag.originalStart + deltaFrames);
        const endFrame = audioDrag.originalStart + audioDrag.originalDuration;
        const newDuration = Math.max(1, endFrame - newStart);
        dispatch({
          type: 'UPDATE_LAYER_DATA',
          scene: audioDrag.scene,
          layerId: audioDrag.layerId,
          data: { startFrame: newStart, durationInFrames: newDuration },
        });
      } else {
        // Drag right edge: change duration only
        const newDuration = Math.max(1, audioDrag.originalDuration + deltaFrames);
        dispatch({
          type: 'UPDATE_LAYER_DATA',
          scene: audioDrag.scene,
          layerId: audioDrag.layerId,
          data: { durationInFrames: newDuration },
        });
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

  // Collect all audio layers across all scenes for the audio row
  const audioLayers: { layer: AudioLayer; sceneStart: number; sceneName: string }[] = [];
  for (const [sceneName, layers] of Object.entries(state.layers)) {
    const scene = scenes.find(s => s.name === sceneName);
    if (!scene) continue;
    for (const l of layers) {
      if (l.type === 'audio' && l.visible) {
        audioLayers.push({ layer: l as AudioLayer, sceneStart: scene.start, sceneName });
      }
    }
  }

  return (
    <div className="timeline">
      {/* Transport controls + frame counter */}
      <div className="timeline__transport">
        <button
          onClick={() => playerRef.current?.seekTo(Math.max(0, frame - 10))}
          className="timeline__transport-btn"
          title="Step -10 frames (Shift+Left)"
        >&#x23EA;</button>
        <button
          onClick={() => playerRef.current?.seekTo(Math.max(0, frame - 1))}
          className="timeline__transport-btn"
          title="Step -1 frame (Left)"
        >&#x23F4;</button>
        <button
          onClick={() => {
            if (playerRef.current?.isPlaying()) {
              playerRef.current.pause();
            } else {
              playerRef.current?.play();
            }
          }}
          className="timeline__play-btn"
          title="Play/Pause (Space)"
        >{isPlaying ? '\u23F8' : '\u25B6'}</button>
        <button
          onClick={() => playerRef.current?.seekTo(Math.min(totalFrames - 1, frame + 1))}
          className="timeline__transport-btn"
          title="Step +1 frame (Right)"
        >&#x23F5;</button>
        <button
          onClick={() => playerRef.current?.seekTo(Math.min(totalFrames - 1, frame + 10))}
          className="timeline__transport-btn"
          title="Step +10 frames (Shift+Right)"
        >&#x23E9;</button>

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

      {/* Seekable timeline bar */}
      <div
        ref={barRef}
        onMouseDown={handleMouseDown}
        className={`timeline__bar ${isScrubbing ? 'timeline__bar--scrubbing' : ''}`}
      >
        {/* Scene bars */}
        {scenes.map((scene, sceneIndex) => {
          const left = (scene.start / totalFrames) * 100;
          const width = ((scene.end - scene.start) / totalFrames) * 100;
          const isSelected = scene.name === state.selectedScene;
          const partColor = scene.part === 'V2'
            ? 'var(--orange)'
            : scene.part === 'V4'
              ? 'var(--green)'
              : 'var(--accent)';
          const wpCount = (state.waypoints[scene.name] || []).length;

          return (
            <div
              key={scene.name}
              onMouseDown={() => dispatch({ type: 'SELECT_SCENE', name: scene.name })}
              className={`timeline__scene ${isSelected ? 'timeline__scene--selected' : ''}`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                borderColor: isSelected ? partColor : undefined,
              }}
              title={`${scene.name} (${scene.start}-${scene.end})`}
            >
              <span className="timeline__scene-label">
                <span style={{ color: '#fff', marginRight: 2, fontWeight: 700 }}>{sceneIndex + 1}</span>
                {width > 6 && (scene.name.split('-').slice(1).join('-') || scene.name)}
                {wpCount > 0 && <span className="timeline__scene-wp-count" style={{ color: partColor }}>{wpCount}</span>}
              </span>
            </div>
          );
        })}

        {/* Waypoint dots */}
        {Object.entries(state.waypoints).map(([sceneName, wps]) => {
          const scene = scenes.find(s => s.name === sceneName);
          if (!scene || wps.length === 0) return null;
          return wps.map((wp, i) => {
            const globalFrame = scene.start + (wp.frame ?? 0);
            const left = (globalFrame / totalFrames) * 100;
            return (
              <div
                key={`${sceneName}-${i}`}
                className="timeline__dot"
                style={{
                  left: `${left}%`,
                  background: wp.gesture === 'click' ? 'var(--green)' : 'var(--accent)',
                }}
                title={`${sceneName} wp${i + 1} f${wp.frame}`}
              />
            );
          });
        })}

        {/* Audio bars row (below scene bars) */}
        {audioLayers.map(({ layer, sceneStart, sceneName }) => {
          const { startFrame, durationInFrames: dur } = layer.data;
          const durationInFrames = dur || 60; // fallback for legacy layers without duration
          const globalStart = sceneStart + startFrame;
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
              {/* Left drag handle */}
              <div
                className="timeline__audio-handle timeline__audio-handle--left"
                onMouseDown={(e) => handleAudioEdgeDown(e, layer.id, sceneName, 'left', startFrame, durationInFrames)}
              />
              {/* Label */}
              <span className="timeline__audio-label">
                {layer.name.replace('Audio - ', '')}
              </span>
              {/* Right drag handle */}
              <div
                className="timeline__audio-handle timeline__audio-handle--right"
                onMouseDown={(e) => handleAudioEdgeDown(e, layer.id, sceneName, 'right', startFrame, durationInFrames)}
              />
            </div>
          );
        })}

        {/* Playhead */}
        <div className="timeline__playhead" style={{ left: `${playheadPct}%` }}>
          <div className="timeline__playhead-tri" />
        </div>
      </div>
    </div>
  );
};
