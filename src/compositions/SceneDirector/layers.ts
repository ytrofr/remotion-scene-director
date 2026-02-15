/**
 * SceneDirector Layer System
 * Each effect (hand gesture, zoom, text) is a controllable layer with precise controls.
 */

import type { HandPathPoint, LottieAnimation } from '../../components/FloatingHand/types';
import type { GestureTool } from './gestures';

// Layer types
export type LayerType = 'hand' | 'zoom';

// Base layer properties shared by all layer types
export interface LayerBase {
  id: string;
  type: LayerType;
  scene: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
}

// Hand layer data (mirrors existing flat state per scene)
export interface HandLayerData {
  waypoints: HandPathPoint[];
  gesture: GestureTool;
  animation: LottieAnimation;
  dark: boolean;
}

export interface HandLayer extends LayerBase {
  type: 'hand';
  data: HandLayerData;
}

// Zoom keyframe — a single zoom state at a specific frame
export interface ZoomKeyframe {
  frame: number;
  zoom: number;        // 1.0 = normal, 2.0 = 2x
  centerX: number;     // 0-1 normalized
  centerY: number;     // 0-1 normalized
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface ZoomLayerData {
  keyframes: ZoomKeyframe[];
}

export interface ZoomLayer extends LayerBase {
  type: 'zoom';
  data: ZoomLayerData;
}

export type Layer = HandLayer | ZoomLayer;

// Generate unique layer ID
let layerCounter = 0;
export function generateLayerId(type: LayerType): string {
  return `${type}-${Date.now()}-${++layerCounter}`;
}

// Create a default hand layer from existing flat state
export function createHandLayer(
  scene: string,
  waypoints: HandPathPoint[],
  gesture: GestureTool,
  animation: LottieAnimation,
  dark: boolean,
  order: number = 0,
): HandLayer {
  return {
    id: generateLayerId('hand'),
    type: 'hand',
    scene,
    name: `Hand - ${gesture.charAt(0).toUpperCase() + gesture.slice(1)}`,
    visible: true,
    locked: false,
    order,
    data: { waypoints, gesture, animation, dark },
  };
}

// Create a default zoom layer
export function createZoomLayer(scene: string, order: number = 1): ZoomLayer {
  return {
    id: generateLayerId('zoom'),
    type: 'zoom',
    scene,
    name: 'Zoom',
    visible: true,
    locked: false,
    order,
    data: { keyframes: [] },
  };
}

// Compute zoom transform at a given local frame from zoom layers
export function computeZoomAtFrame(
  zoomLayers: ZoomLayer[],
  localFrame: number,
): { zoom: number; centerX: number; centerY: number } | null {
  // Combine keyframes from all visible zoom layers, sorted by frame
  const allKeyframes = zoomLayers
    .flatMap(l => l.data.keyframes)
    .sort((a, b) => a.frame - b.frame);

  if (allKeyframes.length === 0) return null;

  // Before first keyframe
  if (localFrame <= allKeyframes[0].frame) {
    const kf = allKeyframes[0];
    return { zoom: kf.zoom, centerX: kf.centerX, centerY: kf.centerY };
  }

  // After last keyframe
  if (localFrame >= allKeyframes[allKeyframes.length - 1].frame) {
    const kf = allKeyframes[allKeyframes.length - 1];
    return { zoom: kf.zoom, centerX: kf.centerX, centerY: kf.centerY };
  }

  // Find surrounding keyframes and interpolate
  for (let i = 0; i < allKeyframes.length - 1; i++) {
    const a = allKeyframes[i];
    const b = allKeyframes[i + 1];
    if (localFrame >= a.frame && localFrame <= b.frame) {
      const range = b.frame - a.frame;
      const t = range === 0 ? 0 : (localFrame - a.frame) / range;
      const eased = applyEasing(t, b.easing);
      return {
        zoom: a.zoom + (b.zoom - a.zoom) * eased,
        centerX: a.centerX + (b.centerX - a.centerX) * eased,
        centerY: a.centerY + (b.centerY - a.centerY) * eased,
      };
    }
  }

  return null;
}

function applyEasing(t: number, easing: ZoomKeyframe['easing']): number {
  switch (easing) {
    case 'ease-in': return t * t;
    case 'ease-out': return 1 - (1 - t) * (1 - t);
    case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
    default: return t; // linear
  }
}
