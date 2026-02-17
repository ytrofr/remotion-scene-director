/**
 * Timeline v3 - Bottom bar with transport controls, scene bars, waypoint dots, drag-to-scrub playhead
 * Click or drag anywhere on the timeline to scrub the video. Drag speed = playback speed.
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useDirector } from '../context';

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2];

export const Timeline: React.FC = () => {
  const { state, dispatch, frame, playerRef, composition, playbackRate, setPlaybackRate } = useDirector();
  const { scenes } = composition;
  const totalFrames = composition.video.frames;
  const barRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const wasPlayingRef = useRef(false);

  const playheadPct = (frame / totalFrames) * 100;

  // Convert mouse clientX to frame number using the bar's rect
  const clientXToFrame = useCallback((clientX: number): number => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (totalFrames - 1));
  }, [totalFrames]);

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

  // Start scrubbing on mousedown
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsScrubbing(true);
    // Pause playback during scrub, remember if it was playing
    wasPlayingRef.current = playerRef.current?.isPlaying() ?? false;
    if (wasPlayingRef.current) {
      playerRef.current?.pause();
    }
    const targetFrame = clientXToFrame(e.clientX);
    seekAndSelect(targetFrame);
  }, [clientXToFrame, seekAndSelect, playerRef]);

  // Scene bar click: select scene + seek (mousedown already handles seek,
  // but we still need the select-scene dispatch for click without drag)
  const handleSceneClick = useCallback((e: React.MouseEvent, sceneName: string) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_SCENE', name: sceneName });
    const targetFrame = clientXToFrame(e.clientX);
    if (playerRef.current) {
      playerRef.current.seekTo(targetFrame);
    }
  }, [clientXToFrame, dispatch, playerRef]);

  // Global mousemove/mouseup while scrubbing (attached to window)
  useEffect(() => {
    if (!isScrubbing) return;

    const handleMove = (e: MouseEvent) => {
      const targetFrame = clientXToFrame(e.clientX);
      seekAndSelect(targetFrame);
    };

    const handleUp = () => {
      setIsScrubbing(false);
      // Resume playback if it was playing before scrub
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

  const isPlaying = playerRef.current?.isPlaying() ?? false;

  return (
    <div className="timeline">
      {/* Transport controls + frame counter */}
      <div className="timeline__transport">
        {/* Step back 10 */}
        <button
          onClick={() => playerRef.current?.seekTo(Math.max(0, frame - 10))}
          className="timeline__transport-btn"
          title="Step -10 frames (Shift+Left)"
        >
          &#x23EA;
        </button>

        {/* Step back 1 */}
        <button
          onClick={() => playerRef.current?.seekTo(Math.max(0, frame - 1))}
          className="timeline__transport-btn"
          title="Step -1 frame (Left)"
        >
          &#x23F4;
        </button>

        {/* Play/Pause */}
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
        >
          {isPlaying ? '\u23F8' : '\u25B6'}
        </button>

        {/* Step forward 1 */}
        <button
          onClick={() => playerRef.current?.seekTo(Math.min(totalFrames - 1, frame + 1))}
          className="timeline__transport-btn"
          title="Step +1 frame (Right)"
        >
          &#x23F5;
        </button>

        {/* Step forward 10 */}
        <button
          onClick={() => playerRef.current?.seekTo(Math.min(totalFrames - 1, frame + 10))}
          className="timeline__transport-btn"
          title="Step +10 frames (Shift+Right)"
        >
          &#x23E9;
        </button>

        {/* Playback speed */}
        <div className="timeline__speed">
          {SPEED_OPTIONS.map(speed => (
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

        {/* Frame counter */}
        <span className="timeline__frame-counter">
          {frame} / {totalFrames}
        </span>
      </div>

      {/* Seekable timeline bar - drag to scrub */}
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
              onMouseDown={(e) => {
                // Let parent mousedown handle scrub start, but also select scene
                dispatch({ type: 'SELECT_SCENE', name: scene.name });
              }}
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

        {/* Playhead */}
        <div className="timeline__playhead" style={{ left: `${playheadPct}%` }}>
          <div className="timeline__playhead-tri" />
        </div>
      </div>
    </div>
  );
};
