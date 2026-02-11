/**
 * SceneDirector Gestures
 * Gesture presets with auto-generated paths, physics, and animation settings.
 * Central source of truth - replaces per-scene animation/physics/size/ripple/dark config.
 */

import type { HandPathPoint, HandPhysicsConfig, HandGesture, LottieAnimation } from '../../components/FloatingHand/types';

// Available gesture tools
export type GestureTool = 'click' | 'scroll' | 'drag' | 'swipe' | 'point';

// Input method for each gesture
export type InputMode = 'click' | 'draw';

// Parameters passed to generatePath
export interface PathGenParams {
  /** Target coordinate (for click-mode gestures) */
  target?: { x: number; y: number };
  /** Drawn path points (for draw-mode gestures) */
  drawnPoints?: { x: number; y: number }[];
  /** Starting local frame number */
  startFrame: number;
  /** Composition width for clamping */
  compWidth: number;
  /** Composition height for clamping */
  compHeight: number;
}

// Full gesture preset
export interface GesturePreset {
  label: string;
  animation: LottieAnimation;
  physics: Partial<HandPhysicsConfig>;
  size: number;
  showRipple: boolean;
  dark: boolean;
  inputMode: InputMode;
  generatePath: (params: PathGenParams) => HandPathPoint[];
}

// Physics presets (moved from constants.ts)
export const PHYSICS_PRESETS: Record<string, Partial<HandPhysicsConfig>> = {
  snappy: {
    floatAmplitude: 2,
    floatSpeed: 0.08,
    velocityScale: 0.6,
    maxRotation: 20,
    smoothing: 0.1,
  },
  professional: {
    floatAmplitude: 4,
    floatSpeed: 0.04,
    velocityScale: 0.4,
    maxRotation: 15,
    smoothing: 0.2,
  },
  floaty: {
    floatAmplitude: 8,
    floatSpeed: 0.03,
    velocityScale: 0.2,
    maxRotation: 10,
    smoothing: 0.3,
  },
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Click gesture preset
 * Pattern: enter from bottom-right -> approach target -> click (hold) -> exit bottom-left
 * Based on MobileChatDemoCombined.tsx click patterns
 */
const clickPreset: GesturePreset = {
  label: 'Click',
  animation: 'hand-click',
  physics: PHYSICS_PRESETS.snappy,
  size: 120,
  showRipple: true,
  dark: false,
  inputMode: 'click',
  generatePath({ target, startFrame, compWidth, compHeight }) {
    if (!target) return [];
    const { x, y } = target;
    const f = startFrame;
    return [
      { x: clamp(x + 250, 0, compWidth), y: clamp(y + 300, 0, compHeight), frame: f, gesture: 'pointer' as HandGesture, scale: 1 },
      { x, y, frame: f + 8, gesture: 'pointer' as HandGesture, scale: 1 },
      { x, y, frame: f + 9, gesture: 'click' as HandGesture, scale: 1, duration: 8 },
      { x: clamp(x - 150, 0, compWidth), y: clamp(y + 250, 0, compHeight), frame: f + 22, gesture: 'pointer' as HandGesture, scale: 1 },
    ];
  },
};

/**
 * Scroll gesture preset
 * Pattern: enter from right -> position -> tilt hand -> hold (scroll) -> release -> stay
 * Based on DorianDemo.tsx scroll patterns. Hand stays static, only rotation changes.
 */
const scrollPreset: GesturePreset = {
  label: 'Scroll',
  animation: 'hand-scroll-clean',
  physics: PHYSICS_PRESETS.professional,
  size: 140,
  showRipple: false,
  dark: false,
  inputMode: 'click',
  generatePath({ target, startFrame, compWidth }) {
    if (!target) return [];
    const { x, y } = target;
    const f = startFrame;
    return [
      { x: clamp(compWidth - 30, 0, compWidth), y, frame: f, gesture: 'pointer' as HandGesture, scale: 1, rotation: 0 },
      { x, y, frame: f + 20, gesture: 'pointer' as HandGesture, scale: 1, rotation: 0 },
      { x, y, frame: f + 28, gesture: 'drag' as HandGesture, scale: 1, rotation: -30 },
      { x, y, frame: f + 60, gesture: 'drag' as HandGesture, scale: 1, rotation: -30 },
      { x, y, frame: f + 90, gesture: 'drag' as HandGesture, scale: 1, rotation: -30 },
      { x, y, frame: f + 118, gesture: 'drag' as HandGesture, scale: 1, rotation: -30 },
      { x, y, frame: f + 125, gesture: 'pointer' as HandGesture, scale: 1, rotation: 0 },
      { x, y, frame: f + 150, gesture: 'pointer' as HandGesture, scale: 1, rotation: 0 },
    ];
  },
};

/**
 * Drag gesture preset
 * Pattern: enter -> approach first point -> drag along drawn path -> release -> exit
 * Uses draw inputMode - user draws the drag path.
 */
const dragPreset: GesturePreset = {
  label: 'Drag',
  animation: 'hand-drag',
  physics: PHYSICS_PRESETS.professional,
  size: 120,
  showRipple: false,
  dark: false,
  inputMode: 'draw',
  generatePath({ drawnPoints, startFrame, compWidth, compHeight }) {
    if (!drawnPoints || drawnPoints.length < 2) return [];
    const first = drawnPoints[0];
    const last = drawnPoints[drawnPoints.length - 1];
    const f = startFrame;

    const path: HandPathPoint[] = [];

    // Enter from offset
    path.push({
      x: clamp(first.x + 200, 0, compWidth),
      y: clamp(first.y + 200, 0, compHeight),
      frame: f,
      gesture: 'pointer' as HandGesture,
      scale: 1,
    });

    // Approach first point
    path.push({
      x: first.x,
      y: first.y,
      frame: f + 10,
      gesture: 'pointer' as HandGesture,
      scale: 1,
    });

    // Drawn points as drag
    const dragFrames = Math.max(30, drawnPoints.length * 5);
    drawnPoints.forEach((pt, i) => {
      path.push({
        x: pt.x,
        y: pt.y,
        frame: f + 12 + Math.round((i / Math.max(1, drawnPoints.length - 1)) * dragFrames),
        gesture: 'drag' as HandGesture,
        scale: 1,
      });
    });

    // Release at last point
    const releaseFrame = f + 12 + dragFrames + 5;
    path.push({
      x: last.x,
      y: last.y,
      frame: releaseFrame,
      gesture: 'pointer' as HandGesture,
      scale: 1,
    });

    // Exit
    path.push({
      x: clamp(last.x + 200, 0, compWidth),
      y: clamp(last.y + 200, 0, compHeight),
      frame: releaseFrame + 12,
      gesture: 'pointer' as HandGesture,
      scale: 1,
    });

    return path;
  },
};

/**
 * Swipe gesture preset
 * Pattern: enter -> start position -> fast drag to end -> release
 * Uses draw inputMode - user draws the swipe direction.
 */
const swipePreset: GesturePreset = {
  label: 'Swipe',
  animation: 'hand-swipe-right',
  physics: PHYSICS_PRESETS.snappy,
  size: 120,
  showRipple: false,
  dark: false,
  inputMode: 'draw',
  generatePath({ drawnPoints, startFrame, compWidth, compHeight }) {
    if (!drawnPoints || drawnPoints.length < 2) return [];
    const first = drawnPoints[0];
    const last = drawnPoints[drawnPoints.length - 1];
    const f = startFrame;

    return [
      { x: clamp(first.x + 200, 0, compWidth), y: clamp(first.y + 200, 0, compHeight), frame: f, gesture: 'pointer' as HandGesture, scale: 1 },
      { x: first.x, y: first.y, frame: f + 8, gesture: 'pointer' as HandGesture, scale: 1 },
      { x: first.x, y: first.y, frame: f + 10, gesture: 'drag' as HandGesture, scale: 1 },
      { x: last.x, y: last.y, frame: f + 25, gesture: 'drag' as HandGesture, scale: 1 },
      { x: last.x, y: last.y, frame: f + 28, gesture: 'pointer' as HandGesture, scale: 1 },
    ];
  },
};

/**
 * Point gesture preset
 * Pattern: enter -> position -> hold (pointing) for 30 frames
 * Uses click inputMode - single click positions the point target.
 */
const pointPreset: GesturePreset = {
  label: 'Point',
  animation: 'hand-point',
  physics: PHYSICS_PRESETS.floaty,
  size: 100,
  showRipple: false,
  dark: false,
  inputMode: 'click',
  generatePath({ target, startFrame, compWidth, compHeight }) {
    if (!target) return [];
    const { x, y } = target;
    const f = startFrame;
    return [
      { x: clamp(x + 200, 0, compWidth), y: clamp(y + 200, 0, compHeight), frame: f, gesture: 'pointer' as HandGesture, scale: 1 },
      { x, y, frame: f + 12, gesture: 'pointer' as HandGesture, scale: 1 },
      { x, y, frame: f + 42, gesture: 'pointer' as HandGesture, scale: 1 },
    ];
  },
};

// All gesture presets
export const GESTURE_PRESETS: Record<GestureTool, GesturePreset> = {
  click: clickPreset,
  scroll: scrollPreset,
  drag: dragPreset,
  swipe: swipePreset,
  point: pointPreset,
};

// Keyboard shortcut mapping
export const GESTURE_KEYS: Record<string, GestureTool> = {
  '1': 'click',
  '2': 'scroll',
  '3': 'drag',
  '4': 'swipe',
  '5': 'point',
};
