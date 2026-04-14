/**
 * SceneDirector Layer System
 * Each effect (hand gesture, zoom, text) is a controllable layer with precise controls.
 */

import type { HandPathPoint } from '../../components/FloatingHand/types';
import type { GestureTool } from './gestures';
import { applyNamedEasing, type EasingName } from '../../lib/easings';

// ── Coded Audio: scenes that already have inline <Audio> in source code ──

export interface CodedAudioEntry {
  file: string;
  startFrame: number;
  durationInFrames: number;
  volume: number;
}

const COMBINED_AUDIO: Record<string, CodedAudioEntry[]> = {
  '3-V2-Typing': [
    {
      file: 'audio/send-click.wav',
      startFrame: 0,
      durationInFrames: 15,
      volume: 0.5,
    },
    {
      file: 'audio/typing-soft.wav',
      startFrame: 5,
      durationInFrames: 60,
      volume: 0.5,
    },
  ],
  '9-V4-Send': [
    {
      file: 'audio/send-click.wav',
      startFrame: 13,
      durationInFrames: 15,
      volume: 0.6,
    },
  ],
};

const DORIAN_AUDIO: Record<string, CodedAudioEntry[]> = {
  '2-HomeScroll': [
    {
      file: 'audio/u_nharq4usid-swipe-255512.mp3',
      startFrame: 28,
      durationInFrames: 90,
      volume: 0.3,
    },
  ],
  '3-TapBubble': [
    {
      file: 'audio/send-click.wav',
      startFrame: 73,
      durationInFrames: 15,
      volume: 0.5,
    },
  ],
  '4-ChatOpen': [
    {
      file: 'audio/send-click.wav',
      startFrame: 48,
      durationInFrames: 15,
      volume: 0.4,
    },
  ],
  '5-UserTyping': [
    {
      file: 'audio/typing-soft.wav',
      startFrame: 5,
      durationInFrames: 65,
      volume: 0.3,
    },
    {
      file: 'audio/send-click.wav',
      startFrame: 105,
      durationInFrames: 15,
      volume: 0.5,
    },
  ],
  '7-AIResponse': [
    {
      file: 'audio/send-click.wav',
      startFrame: 95,
      durationInFrames: 15,
      volume: 0.5,
    },
  ],
  '8-ProductPage': [
    {
      file: 'audio/u_nharq4usid-swipe-255512.mp3',
      startFrame: 118,
      durationInFrames: 30,
      volume: 0.3,
    },
  ],
};

const AUDIO_TEST_AUDIO: Record<string, CodedAudioEntry[]> = {
  '1-Blue': [
    {
      file: 'audio/send-click.wav',
      startFrame: 30,
      durationInFrames: 15,
      volume: 0.8,
    },
  ],
  '2-Green': [
    {
      file: 'audio/send-click.wav',
      startFrame: 45,
      durationInFrames: 15,
      volume: 0.8,
    },
  ],
};

const CAPABILITIES_AUDIO: Record<string, CodedAudioEntry[]> = {
  '6-SFXClick': [
    {
      file: 'audio/sfx/mouse-click.wav',
      startFrame: 10,
      durationInFrames: 20,
      volume: 0.8,
    },
    {
      file: 'audio/sfx/whoosh.wav',
      startFrame: 30,
      durationInFrames: 30,
      volume: 0.6,
    },
    {
      file: 'audio/sfx/switch.wav',
      startFrame: 55,
      durationInFrames: 20,
      volume: 0.7,
    },
  ],
};

const DORIAN_STORES_AUDIO: Record<string, CodedAudioEntry[]> = {
  '1-StoreDashboard': [
    // AI bubble tap
    {
      file: 'audio/sfx/mouse-click.wav',
      startFrame: 55,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Chat panel slide up
    {
      file: 'audio/sfx/slide.wav',
      startFrame: 65,
      durationInFrames: 30,
      volume: 0.4,
    },
    // Input tap
    {
      file: 'audio/sfx/soft-click.wav',
      startFrame: 100,
      durationInFrames: 10,
      volume: 0.5,
    },
    // Typing sound (longer message now)
    {
      file: 'audio/typing-soft.wav',
      startFrame: 105,
      durationInFrames: 95,
      volume: 0.3,
    },
    // Send tap
    {
      file: 'audio/send-click.wav',
      startFrame: 205,
      durationInFrames: 15,
      volume: 0.6,
    },
    // AI response swoosh
    {
      file: 'audio/sfx/whoosh.wav',
      startFrame: 240,
      durationInFrames: 25,
      volume: 0.5,
    },
    // Dashboard morph / transition
    {
      file: 'audio/sfx/swoosh-transition.wav',
      startFrame: 280,
      durationInFrames: 45,
      volume: 0.4,
    },
    // Chat dismiss slide
    {
      file: 'audio/sfx/slide.wav',
      startFrame: 310,
      durationInFrames: 30,
      volume: 0.3,
    },
    // Best sellers appear
    {
      file: 'audio/sfx/chime.wav',
      startFrame: 360,
      durationInFrames: 30,
      volume: 0.3,
    },
    // Confirmation panel slide up
    {
      file: 'audio/sfx/slide.wav',
      startFrame: 440,
      durationInFrames: 25,
      volume: 0.4,
    },
    // Confirm button click
    {
      file: 'audio/sfx/mouse-click.wav',
      startFrame: 500,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Price update whoosh
    {
      file: 'audio/sfx/whoosh.wav',
      startFrame: 516,
      durationInFrames: 30,
      volume: 0.4,
    },
    // Price change success chime
    {
      file: 'audio/sfx/chime.wav',
      startFrame: 545,
      durationInFrames: 25,
      volume: 0.35,
    },
  ],
  '2-MapSearch': [
    // Search bar tap
    {
      file: 'audio/sfx/mouse-click.wav',
      startFrame: 18,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Typing
    {
      file: 'audio/typing-soft.wav',
      startFrame: 22,
      durationInFrames: 50,
      volume: 0.3,
    },
    // Map pins appear (staggered pops)
    {
      file: 'audio/sfx/pop-up.wav',
      startFrame: 80,
      durationInFrames: 15,
      volume: 0.5,
    },
    {
      file: 'audio/sfx/pop-up.wav',
      startFrame: 88,
      durationInFrames: 15,
      volume: 0.4,
    },
    {
      file: 'audio/sfx/pop-up.wav',
      startFrame: 96,
      durationInFrames: 15,
      volume: 0.35,
    },
    {
      file: 'audio/sfx/pop-up.wav',
      startFrame: 104,
      durationInFrames: 15,
      volume: 0.3,
    },
    {
      file: 'audio/sfx/pop-up.wav',
      startFrame: 112,
      durationInFrames: 15,
      volume: 0.3,
    },
    // Pin click
    {
      file: 'audio/sfx/mouse-click.wav',
      startFrame: 150,
      durationInFrames: 15,
      volume: 0.6,
    },
  ],
  '3-AIProducts': [
    // Input tap
    {
      file: 'audio/sfx/soft-click.wav',
      startFrame: 12,
      durationInFrames: 10,
      volume: 0.5,
    },
    // Typing
    {
      file: 'audio/typing-soft.wav',
      startFrame: 16,
      durationInFrames: 45,
      volume: 0.3,
    },
    // Send tap
    {
      file: 'audio/send-click.wav',
      startFrame: 68,
      durationInFrames: 15,
      volume: 0.6,
    },
    // AI thinking
    {
      file: 'audio/sfx/notification.wav',
      startFrame: 110,
      durationInFrames: 20,
      volume: 0.3,
    },
    // Product cards appear (staggered)
    {
      file: 'audio/sfx/pop-up.wav',
      startFrame: 145,
      durationInFrames: 15,
      volume: 0.5,
    },
    {
      file: 'audio/sfx/pop-up.wav',
      startFrame: 160,
      durationInFrames: 15,
      volume: 0.45,
    },
    {
      file: 'audio/sfx/pop-up.wav',
      startFrame: 175,
      durationInFrames: 15,
      volume: 0.4,
    },
    {
      file: 'audio/sfx/pop-up.wav',
      startFrame: 190,
      durationInFrames: 15,
      volume: 0.35,
    },
    // "Add Products to Store" button click
    {
      file: 'audio/sfx/mouse-click.wav',
      startFrame: 225,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Store page transition
    {
      file: 'audio/sfx/swoosh-transition.wav',
      startFrame: 235,
      durationInFrames: 30,
      volume: 0.4,
    },
    // New products added chime
    {
      file: 'audio/sfx/chime.wav',
      startFrame: 250,
      durationInFrames: 25,
      volume: 0.35,
    },
  ],
};

// ── SIGMA App Demo Audio ──────────────────────────────────────
// Scene timings reference constants.ts CHAT_SCENES
const SIGMA_APP_AUDIO: Record<string, CodedAudioEntry[]> = {
  HubChatOpen: [
    // Chat panel slides in at frame 70
    { file: 'audio/sfx/slide.wav', startFrame: 68, durationInFrames: 30, volume: 0.4 },
    // Subtle chime when chat fully opens
    { file: 'audio/sfx/chime.wav', startFrame: 90, durationInFrames: 25, volume: 0.25 },
  ],
  WebsiteRequest: [
    // Click into input field (frame 30)
    { file: 'audio/sfx/soft-click.wav', startFrame: 28, durationInFrames: 10, volume: 0.5 },
    // Typing sound (frames 35-115)
    { file: 'audio/typing-soft.wav', startFrame: 35, durationInFrames: 80, volume: 0.3 },
    // Send button click (frame 125)
    { file: 'audio/send-click.wav', startFrame: 123, durationInFrames: 15, volume: 0.6 },
    // Routing whoosh (frame 138)
    { file: 'audio/sfx/whoosh.wav', startFrame: 136, durationInFrames: 25, volume: 0.45 },
    // Cost badge appear
    { file: 'audio/sfx/notification.wav', startFrame: 228, durationInFrames: 20, volume: 0.3 },
    // Result link appears — chime
    { file: 'audio/sfx/chime.wav', startFrame: 278, durationInFrames: 30, volume: 0.35 },
  ],
  PageReveal: [
    // Crossfade transition swoosh
    { file: 'audio/sfx/swoosh-transition.wav', startFrame: 0, durationInFrames: 40, volume: 0.4 },
    // Grade A badge appear
    { file: 'audio/sfx/sparkle.wav', startFrame: 38, durationInFrames: 25, volume: 0.3 },
  ],
  CreativeRequest: [
    // Click into input
    { file: 'audio/sfx/soft-click.wav', startFrame: 3, durationInFrames: 10, volume: 0.5 },
    // Typing (frames 5-55)
    { file: 'audio/typing-soft.wav', startFrame: 5, durationInFrames: 50, volume: 0.3 },
    // Send click (frame 65)
    { file: 'audio/send-click.wav', startFrame: 63, durationInFrames: 15, volume: 0.6 },
    // Routing whoosh to nano_banana
    { file: 'audio/sfx/whoosh.wav', startFrame: 76, durationInFrames: 25, volume: 0.45 },
    // Cost badge
    { file: 'audio/sfx/notification.wav', startFrame: 168, durationInFrames: 20, volume: 0.3 },
    // Banner image reveal
    { file: 'audio/sfx/sparkle.wav', startFrame: 193, durationInFrames: 30, volume: 0.35 },
  ],
  CreativeReveal: [
    // Crossfade transition
    { file: 'audio/sfx/swoosh-transition.wav', startFrame: 0, durationInFrames: 40, volume: 0.4 },
    // Agent badge appear
    { file: 'audio/sfx/sparkle.wav', startFrame: 28, durationInFrames: 25, volume: 0.3 },
    // Callout text appear
    { file: 'audio/sfx/notification.wav', startFrame: 78, durationInFrames: 20, volume: 0.25 },
  ],
  Closing: [
    // Fade to dark
    { file: 'audio/sfx/swoosh-transition.wav', startFrame: 178, durationInFrames: 45, volume: 0.4 },
    // Logo reveal
    { file: 'audio/sfx/bass-impact.wav', startFrame: 240, durationInFrames: 40, volume: 0.35 },
    // Tagline chime
    { file: 'audio/sfx/chime.wav', startFrame: 360, durationInFrames: 30, volume: 0.3 },
  ],
};

// Demo clip audio — empty for now, will be assigned per-demo later
const DEMO_EMPTY_AUDIO: Record<string, CodedAudioEntry[]> = {};

// ── DemoCreative audio ──────────────────────────────────────
const DEMO_CREATIVE_AUDIO: Record<string, CodedAudioEntry[]> = {
  Chat: [
    // Click into input (frame 30)
    { file: 'audio/sfx/soft-click.wav', startFrame: 30, durationInFrames: 10, volume: 0.5 },
    // Typing (frames 35-100)
    { file: 'audio/typing-soft.wav', startFrame: 35, durationInFrames: 65, volume: 0.3 },
    // Send click (frame 123)
    { file: 'audio/send-click.wav', startFrame: 123, durationInFrames: 15, volume: 0.6 },
    // Routing whoosh to nano_banana
    { file: 'audio/sfx/whoosh.wav', startFrame: 136, durationInFrames: 25, volume: 0.45 },
    // Cost badge notification
    { file: 'audio/sfx/notification.wav', startFrame: 178, durationInFrames: 20, volume: 0.3 },
    // Image result card reveal
    { file: 'audio/sfx/sparkle.wav', startFrame: 200, durationInFrames: 30, volume: 0.35 },
  ],
  PageReveal: [
    // Crossfade transition into page reveal
    { file: 'audio/sfx/swoosh-transition.wav', startFrame: 0, durationInFrames: 40, volume: 0.4 },
    // Scroll starts — subtle slide (local frame 125)
    { file: 'audio/sfx/slide.wav', startFrame: 125, durationInFrames: 95, volume: 0.2 },
    // Click on gallery image (local frame 330)
    { file: 'audio/sfx/mouse-click.wav', startFrame: 330, durationInFrames: 10, volume: 0.55 },
    // Lightbox opens — pop up sound
    { file: 'audio/sfx/pop-up.wav', startFrame: 338, durationInFrames: 20, volume: 0.4 },
  ],
};

const CODED_AUDIO_REGISTRY: Record<
  string,
  Record<string, CodedAudioEntry[]>
> = {
  MobileChatDemoCombined: COMBINED_AUDIO,
  DorianDemo: DORIAN_AUDIO,
  AudioTest: AUDIO_TEST_AUDIO,
  CapabilitiesDemo: CAPABILITIES_AUDIO,
  DorianStores: DORIAN_STORES_AUDIO,
  SigmaAppDemo: SIGMA_APP_AUDIO,
  DemoCreative: DEMO_CREATIVE_AUDIO,
  DemoContext: DEMO_EMPTY_AUDIO,
  DemoEditWebsite: DEMO_EMPTY_AUDIO,
  DemoSEO: DEMO_EMPTY_AUDIO,
  DemoCampaign: DEMO_EMPTY_AUDIO,
};

export function getCodedAudio(
  compositionId: string,
  sceneName: string,
): CodedAudioEntry[] {
  return CODED_AUDIO_REGISTRY[compositionId]?.[sceneName] ?? [];
}

// Layer types
export type LayerType = 'hand' | 'zoom' | 'audio' | 'caption';

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

// Hand layer data — waypoints + gesture + per-layer size.
// animation and dark are stored in flat records (sceneAnimation, sceneDark) as single source of truth.
export interface HandLayerData {
  waypoints: HandPathPoint[];
  gesture: GestureTool;
  size?: number; // per-layer hand size (effective, zoom-adjusted)
}

export interface HandLayer extends LayerBase {
  type: 'hand';
  data: HandLayerData;
}

// Zoom keyframe — a single zoom state at a specific frame
export interface ZoomKeyframe {
  frame: number;
  zoom: number; // 1.0 = normal, 2.0 = 2x
  centerX: number; // 0-1 normalized
  centerY: number; // 0-1 normalized
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
  file: string; // e.g. 'audio/send-click.wav'
  startFrame: number; // local frame within scene
  durationInFrames: number; // how many frames the audio plays
  volume: number; // 0-1
  fadeInFrames?: number; // optional fade-in duration
  fadeOutFrames?: number; // optional fade-out duration
}

export interface AudioLayer extends LayerBase {
  type: 'audio';
  data: AudioLayerData;
}

// Caption layer
export interface CaptionLayerData {
  text: string;
  startFrame: number; // global frame
  durationInFrames: number;
}

export interface CaptionLayer extends LayerBase {
  type: 'caption';
  data: CaptionLayerData;
}

export const AUDIO_FILES = [
  { id: 'audio/send-click.wav', label: 'Click' },
  { id: 'audio/typing-soft.wav', label: 'Typing' },
  { id: 'audio/u_nharq4usid-swipe-255512.mp3', label: 'Swipe' },
  { id: 'audio/sfx/whoosh.wav', label: 'Whoosh' },
  { id: 'audio/sfx/whip.wav', label: 'Whip' },
  { id: 'audio/sfx/page-turn.wav', label: 'Page Turn' },
  { id: 'audio/sfx/switch.wav', label: 'Switch' },
  { id: 'audio/sfx/mouse-click.wav', label: 'Mouse Click' },
  { id: 'audio/sfx/shutter-modern.wav', label: 'Shutter Modern' },
  { id: 'audio/sfx/shutter-old.wav', label: 'Shutter Old' },
  { id: 'audio/sfx/pop-up.wav', label: 'Pop Up' },
  { id: 'audio/sfx/notification.wav', label: 'Notification' },
  { id: 'audio/sfx/soft-click.wav', label: 'Soft Click' },
  { id: 'audio/sfx/success-ding.mp3', label: 'Success Ding' },
  { id: 'audio/sfx/swoosh-transition.wav', label: 'Swoosh Transition' },
  { id: 'audio/sfx/chime.wav', label: 'Chime' },
  { id: 'audio/sfx/slide.wav', label: 'Slide' },
  { id: 'audio/sfx/bass-impact.wav', label: 'Bass Impact' },
  { id: 'audio/sfx/sparkle.wav', label: 'Sparkle' },
  { id: 'audio/sfx/riser.wav', label: 'Riser' },
];

export type Layer = HandLayer | ZoomLayer | AudioLayer | CaptionLayer;

// Discriminated union of all layer data types
export type LayerData =
  | HandLayerData
  | ZoomLayerData
  | AudioLayerData
  | CaptionLayerData;

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
  size?: number,
): HandLayer {
  return {
    id: generateLayerId('hand'),
    type: 'hand',
    scene,
    name: `Hand - ${gesture.charAt(0).toUpperCase() + gesture.slice(1)}`,
    visible: true,
    locked: false,
    order,
    data: { waypoints, gesture, size },
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
    data: {
      file: defaultFile.id,
      startFrame: 0,
      durationInFrames: 60,
      volume: 1,
    },
  };
}

// Create a caption layer from parsed SRT cue
export function createCaptionLayer(
  scene: string,
  text: string,
  startFrame: number,
  durationInFrames: number,
  order: number = 3,
): CaptionLayer {
  return {
    id: generateLayerId('caption'),
    type: 'caption',
    scene,
    name: text.length > 20 ? text.slice(0, 20) + '...' : text,
    visible: true,
    locked: false,
    order,
    data: { text, startFrame, durationInFrames },
  };
}

// Compute zoom transform at a given local frame from zoom layers
export function computeZoomAtFrame(
  zoomLayers: ZoomLayer[],
  localFrame: number,
): { zoom: number; centerX: number; centerY: number } | null {
  // Combine keyframes from all visible zoom layers, sorted by frame
  const allKeyframes = zoomLayers
    .flatMap((l) => l.data.keyframes)
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
  return applyNamedEasing(t, easing as EasingName);
}
