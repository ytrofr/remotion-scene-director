/**
 * SceneDirector Layer System
 * Each effect (hand gesture, zoom, text) is a controllable layer with precise controls.
 */

import type { HandPathPoint } from '../../components/FloatingHand/types';
import type { GestureTool } from './gestures';

// ── Coded Audio: scenes that already have inline <Audio> in source code ──

export interface CodedAudioEntry {
  file: string;
  startFrame: number;
  durationInFrames: number;
  volume: number;
}

const COMBINED_AUDIO: Record<string, CodedAudioEntry[]> = {
  '3-V2-Typing': [
    { file: 'audio/send-click.wav', startFrame: 0, durationInFrames: 15, volume: 0.5 },
    { file: 'audio/typing-soft.wav', startFrame: 5, durationInFrames: 60, volume: 0.5 },
  ],
  '9-V4-Send': [
    { file: 'audio/send-click.wav', startFrame: 13, durationInFrames: 15, volume: 0.6 },
  ],
};

const DORIAN_AUDIO: Record<string, CodedAudioEntry[]> = {
  '2-HomeScroll': [
    { file: 'audio/u_nharq4usid-swipe-255512.mp3', startFrame: 28, durationInFrames: 90, volume: 0.3 },
  ],
  '3-TapBubble': [
    { file: 'audio/send-click.wav', startFrame: 73, durationInFrames: 15, volume: 0.5 },
  ],
  '4-ChatOpen': [
    { file: 'audio/send-click.wav', startFrame: 48, durationInFrames: 15, volume: 0.4 },
    { file: 'audio/typing-soft.wav', startFrame: 50, durationInFrames: 40, volume: 0.3 },
  ],
  '5-UserTyping': [
    { file: 'audio/typing-soft.wav', startFrame: 0, durationInFrames: 100, volume: 0.3 },
    { file: 'audio/send-click.wav', startFrame: 105, durationInFrames: 15, volume: 0.5 },
  ],
  '7-AIResponse': [
    { file: 'audio/send-click.wav', startFrame: 95, durationInFrames: 15, volume: 0.5 },
  ],
  '8-ProductPage': [
    { file: 'audio/u_nharq4usid-swipe-255512.mp3', startFrame: 118, durationInFrames: 30, volume: 0.3 },
  ],
};

const CODED_AUDIO_REGISTRY: Record<string, Record<string, CodedAudioEntry[]>> = {
  MobileChatDemoCombined: COMBINED_AUDIO,
  DorianDemo: DORIAN_AUDIO,
};

export function getCodedAudio(compositionId: string, sceneName: string): CodedAudioEntry[] {
  return CODED_AUDIO_REGISTRY[compositionId]?.[sceneName] ?? [];
}

// Layer types
export type LayerType = 'hand' | 'zoom' | 'audio';

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

// Hand layer data — waypoints + gesture only.
// animation and dark are stored in flat records (sceneAnimation, sceneDark) as single source of truth.
export interface HandLayerData {
  waypoints: HandPathPoint[];
  gesture: GestureTool;
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

// Audio layer
export interface AudioLayerData {
  file: string;          // e.g. 'audio/send-click.wav'
  startFrame: number;    // local frame within scene
  durationInFrames: number; // how many frames the audio plays
  volume: number;        // 0-1
}

export interface AudioLayer extends LayerBase {
  type: 'audio';
  data: AudioLayerData;
}

export const AUDIO_FILES = [
  { id: 'audio/send-click.wav', label: 'Click' },
  { id: 'audio/typing-soft.wav', label: 'Typing' },
  { id: 'audio/u_nharq4usid-swipe-255512.mp3', label: 'Swipe' },
];

export type Layer = HandLayer | ZoomLayer | AudioLayer;

// Discriminated union of all layer data types
export type LayerData = HandLayerData | ZoomLayerData | AudioLayerData;

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
    data: { waypoints, gesture },
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

// Create a default audio layer
export function createAudioLayer(scene: string, order: number = 2): AudioLayer {
  const defaultFile = AUDIO_FILES[0];
  return {
    id: generateLayerId('audio'),
    type: 'audio',
    scene,
    name: `Audio - ${defaultFile.label}`,
    visible: true,
    locked: false,
    order,
    data: { file: defaultFile.id, startFrame: 0, durationInFrames: 60, volume: 1 },
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
