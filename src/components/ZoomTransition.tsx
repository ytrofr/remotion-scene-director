/**
 * ZoomTransition — Animated zoom-in → hold → zoom-out wrapper
 * Wrap any scene content to add a cinematic zoom effect.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Easing } from 'remotion';

export interface ZoomTransitionProps {
  children: React.ReactNode;
  /** Target zoom level (default 2.0) */
  zoomTo?: number;
  /** Normalized center X (0-1, default 0.5) */
  centerX?: number;
  /** Normalized center Y (0-1, default 0.5) */
  centerY?: number;
  /** Frames for zoom-in phase (default 20) */
  zoomInDuration?: number;
  /** Frames for zoom-out phase (default 20) */
  zoomOutDuration?: number;
  /** Total duration (must be set — determines hold duration) */
  durationInFrames: number;
  /** Easing for zoom (default ease-in-out) */
  easing?: (t: number) => number;
}

export const ZoomTransition: React.FC<ZoomTransitionProps> = ({
  children,
  zoomTo = 2.0,
  centerX = 0.5,
  centerY = 0.5,
  zoomInDuration = 20,
  zoomOutDuration = 20,
  durationInFrames,
  easing = Easing.inOut(Easing.cubic),
}) => {
  const frame = useCurrentFrame();

  // Calculate current zoom level based on phase
  const zoomOutStart = durationInFrames - zoomOutDuration;

  let zoom: number;
  if (frame < zoomInDuration) {
    // Zoom in phase
    const progress = frame / zoomInDuration;
    zoom = interpolate(easing(progress), [0, 1], [1, zoomTo]);
  } else if (frame >= zoomOutStart) {
    // Zoom out phase
    const progress = (frame - zoomOutStart) / zoomOutDuration;
    zoom = interpolate(easing(Math.min(1, progress)), [0, 1], [zoomTo, 1]);
  } else {
    // Hold phase
    zoom = zoomTo;
  }

  // Transform origin based on center
  const originX = centerX * 100;
  const originY = centerY * 100;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: `${originX}% ${originY}%`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
