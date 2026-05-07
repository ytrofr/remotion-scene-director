/**
 * ClickFlash — visual click indication overlay.
 *
 * Draws an expanding ring + brief opacity flash at composition-space (x, y)
 * starting at the given global frame. Designed to fire alongside a click
 * waypoint on a hand layer — paired with audio (send-click.wav) and the
 * cursor's soft-pulse, the flash reads as a deliberate UI tap.
 *
 * Reusable across ALL compositions (Dorian, SigmaApp, future). Render
 * underneath FloatingHand cursors but above the website / phone content via
 * z-index: 5 (cursor overlay sits at z 11+).
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface ClickFlashProps {
  /** composition-space x (0 .. video.width) */
  x: number;
  /** composition-space y (0 .. video.height) */
  y: number;
  /** GLOBAL frame the flash starts. Caller is responsible for converting from
   *  scene-local to global if needed. */
  startFrame: number;
  /** ring + flash color. Default '#2DD4BF' (Dorian primary teal). */
  color?: string;
  /** maximum ring radius in px. Default 120. */
  peakRadius?: number;
  /** total animation duration in frames. Default 24 (~0.8s at 30fps). */
  durationInFrames?: number;
}

export const ClickFlash: React.FC<ClickFlashProps> = ({
  x,
  y,
  startFrame,
  color = '#2DD4BF',
  peakRadius = 120,
  durationInFrames = 24,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  // Outside the animation window: render nothing
  if (localFrame < 0 || localFrame >= durationInFrames) return null;

  const t = localFrame / durationInFrames; // 0 -> 1

  // Ring: starts at 0px, grows to peakRadius, fades from 0.85 -> 0
  const ringRadius = peakRadius * t;
  const ringOpacity = interpolate(t, [0, 0.4, 1], [0.85, 0.55, 0]);
  const ringStrokeWidth = interpolate(t, [0, 0.6, 1], [4, 3, 1.5]);
  const ringSize = ringRadius * 2 + ringStrokeWidth * 2;

  // Brief filled flash dot — visible for first ~30% of the animation
  const dotOpacity = interpolate(t, [0, 0.15, 0.35], [0.6, 0.4, 0], {
    extrapolateRight: 'clamp',
  });
  const dotRadius = peakRadius * 0.35;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: x - ringSize / 2,
        top: y - ringSize / 2,
        width: ringSize,
        height: ringSize,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {/* Filled flash dot */}
      <div
        style={{
          position: 'absolute',
          left: ringSize / 2 - dotRadius,
          top: ringSize / 2 - dotRadius,
          width: dotRadius * 2,
          height: dotRadius * 2,
          borderRadius: '50%',
          background: color,
          opacity: dotOpacity,
        }}
      />
      {/* Expanding ring */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: ringSize,
          height: ringSize,
          borderRadius: '50%',
          border: `${ringStrokeWidth}px solid ${color}`,
          opacity: ringOpacity,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};
