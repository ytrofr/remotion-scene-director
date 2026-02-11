/**
 * Coded Hand Paths Registry
 *
 * Maps compositionId + sceneName → HandPathPoint[] for scenes that have
 * hand animations defined in their source code. SceneDirector uses these
 * as default trail overlays when the user hasn't placed manual waypoints.
 */

import type { HandPathPoint } from '../../components/FloatingHand/types';
import type { GestureTool } from './gestures';
import savedData from './codedPaths.data.json';

export interface CodedPath {
  path: HandPathPoint[];
  gesture: GestureTool;
  animation: string;
}

// ── MobileChatDemoCombined paths (from COMBINED_HAND_PATH_MARKERS) ──

const V2_INPUT = { x: 671, y: 1703 };
const V2_SEND = { x: 127, y: 1730 };
const V4_INPUT = { x: 671, y: 1683 };
const V4_SEND = { x: 127, y: 1690 };

const COMBINED_PATHS: Record<string, CodedPath> = {
  '3-V2-Typing': {
    gesture: 'click',
    animation: 'hand-click',
    path: [
      { x: V2_INPUT.x + 250, y: V2_INPUT.y + 300, frame: 0, gesture: 'pointer', scale: 1 },
      { x: V2_INPUT.x, y: V2_INPUT.y, frame: 5, gesture: 'pointer', scale: 1 },
      { x: V2_INPUT.x, y: V2_INPUT.y, frame: 6, gesture: 'click', scale: 1, duration: 4 },
      { x: V2_INPUT.x - 150, y: V2_INPUT.y + 250, frame: 14, gesture: 'pointer', scale: 1 },
    ],
  },
  '4-V2-Send': {
    gesture: 'click',
    animation: 'hand-click',
    path: [
      { x: V2_SEND.x + 300, y: V2_SEND.y - 100, frame: 0, gesture: 'pointer', scale: 1 },
      { x: V2_SEND.x + 50, y: V2_SEND.y, frame: 10, gesture: 'pointer', scale: 1 },
      { x: V2_SEND.x, y: V2_SEND.y, frame: 12, gesture: 'pointer', scale: 1 },
      { x: V2_SEND.x, y: V2_SEND.y, frame: 18, gesture: 'pointer', scale: 1 },
      { x: V2_SEND.x - 200, y: V2_SEND.y + 200, frame: 26, gesture: 'pointer', scale: 1 },
    ],
  },
  '8-V4-Typing': {
    gesture: 'click',
    animation: 'hand-click',
    path: [
      { x: V4_INPUT.x + 250, y: V4_INPUT.y + 300, frame: 0, gesture: 'pointer', scale: 1 },
      { x: V4_INPUT.x, y: V4_INPUT.y, frame: 4, gesture: 'pointer', scale: 1 },
      { x: V4_INPUT.x, y: V4_INPUT.y, frame: 5, gesture: 'click', scale: 1, duration: 10 },
      { x: V4_INPUT.x - 150, y: V4_INPUT.y + 250, frame: 25, gesture: 'pointer', scale: 1 },
    ],
  },
  '9-V4-Send': {
    gesture: 'click',
    animation: 'hand-click',
    path: [
      { x: V4_SEND.x + 300, y: V4_SEND.y - 100, frame: 0, gesture: 'pointer', scale: 1 },
      { x: V4_SEND.x + 50, y: V4_SEND.y, frame: 10, gesture: 'pointer', scale: 1 },
      { x: V4_SEND.x, y: V4_SEND.y, frame: 12, gesture: 'pointer', scale: 1 },
      { x: V4_SEND.x, y: V4_SEND.y, frame: 13, gesture: 'click', scale: 1, duration: 6 },
      { x: V4_SEND.x + 100, y: V4_SEND.y + 250, frame: 24, gesture: 'pointer', scale: 1 },
    ],
  },
};

// ── DorianDemo paths (from DorianDemo.tsx literal coordinates) ──

const DORIAN_PATHS: Record<string, CodedPath> = {
  '2-HomeScroll': {
    gesture: 'scroll',
    animation: 'hand-scroll-clean',
    path: [
      { x: 1050, y: 960, frame: 0, gesture: 'pointer', scale: 1, rotation: 0 },
      { x: 780, y: 960, frame: 20, gesture: 'pointer', scale: 1, rotation: 0 },
      { x: 780, y: 960, frame: 28, gesture: 'drag', scale: 1, rotation: -30 },
      { x: 780, y: 960, frame: 60, gesture: 'drag', scale: 1, rotation: -30 },
      { x: 780, y: 960, frame: 90, gesture: 'drag', scale: 1, rotation: -30 },
      { x: 780, y: 960, frame: 118, gesture: 'drag', scale: 1, rotation: -30 },
      { x: 780, y: 960, frame: 125, gesture: 'pointer', scale: 1, rotation: 0 },
      { x: 780, y: 960, frame: 150, gesture: 'pointer', scale: 1, rotation: 0 },
    ],
  },
  '3-TapBubble': {
    gesture: 'click',
    animation: 'hand-click',
    path: [
      { x: 780, y: 1200, frame: 0, gesture: 'pointer', scale: 1 },
      { x: 800, y: 1400, frame: 30, gesture: 'pointer', scale: 1 },
      { x: 818, y: 1546, frame: 53, gesture: 'pointer', scale: 1 },
      { x: 518, y: 992, frame: 73, gesture: 'click', scale: 1, duration: 2 },
    ],
  },
  '5-UserTyping': {
    gesture: 'click',
    animation: 'hand-click',
    path: [
      { x: 518, y: 992, frame: 0, gesture: 'pointer', scale: 1 },
      { x: 500, y: 1200, frame: 20, gesture: 'pointer', scale: 1 },
      { x: 480, y: 1520, frame: 45, gesture: 'pointer', scale: 1 },
      { x: 480, y: 1550, frame: 48, gesture: 'click', scale: 1, duration: 5 },
      { x: 480, y: 1550, frame: 60, gesture: 'pointer', scale: 1 },
    ],
  },
};

// ── Registry ──

const saved = savedData as Record<string, Record<string, CodedPath>>;

const CODED_PATHS_REGISTRY: Record<string, Record<string, CodedPath>> = {
  MobileChatDemoCombined: { ...COMBINED_PATHS, ...saved.MobileChatDemoCombined },
  DorianDemo: { ...DORIAN_PATHS, ...saved.DorianDemo },
  DashmorDemo: { ...saved.DashmorDemo },
};

/**
 * Get the coded hand path for a composition scene.
 * Returns null if no coded path exists for this scene.
 */
export function getCodedPath(compositionId: string, sceneName: string): CodedPath | null {
  return CODED_PATHS_REGISTRY[compositionId]?.[sceneName] ?? null;
}

/**
 * Get just the HandPathPoint[] for a scene (convenience).
 */
export function getCodedPathPoints(compositionId: string, sceneName: string): HandPathPoint[] {
  return getCodedPath(compositionId, sceneName)?.path ?? [];
}
