// Reusable transition hooks for DorianDemo scenes
import { spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRING_CONFIG } from './constants';

const clampBoth = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

/** Zoom transition with spring physics */
export const useZoom = (
  frame: number,
  fps: number,
  config = SPRING_CONFIG.zoom,
) => {
  const progress = spring({ frame, fps, config });
  return {
    progress,
    scale: (from: number, to: number) =>
      interpolate(progress, [0, 1], [from, to]),
    offset: (from: number, to: number) =>
      interpolate(progress, [0, 1], [from, to]),
  };
};

/** Crossfade between two values over a frame range */
export const useCrossfade = (
  frame: number,
  startFrame: number,
  endFrame: number,
) => interpolate(frame, [startFrame, endFrame], [0, 1], clampBoth);

/** Slide panel animation with spring */
export const useSlide = (
  frame: number,
  fps: number,
  distance: number,
  config = SPRING_CONFIG.slide,
) => {
  const progress = spring({ frame, fps, config });
  return {
    progress,
    translateY: (1 - progress) * distance,
  };
};
