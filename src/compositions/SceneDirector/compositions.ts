/**
 * Composition Registry
 * Maps composition IDs to their config and React components.
 * Separated from state.ts to avoid importing heavy UI components into core state.
 */

import React from 'react';
import type { CompositionEntry, SceneInfo } from './state';

import {
  MobileChatDemoCombined,
  COMBINED_SCENE_INFO,
  COMBINED_VIDEO,
} from '../MobileChatDemoCombined';
import {
  DorianDemo,
  DORIAN_SCENE_INFO,
  VIDEO as DORIAN_VIDEO,
} from '../DorianDemo';
import {
  DashmorDemo,
  DASHMOR_SCENE_TIMINGS,
  VIDEO as DASHMOR_VIDEO,
} from '../DashmorDemo';

function dashmorSceneInfo(): SceneInfo[] {
  return DASHMOR_SCENE_TIMINGS.map((t, i) => ({
    name: `${i + 1}-${t.name.replace(/\s+/g, '')}`,
    start: t.from,
    end: t.from + t.durationInFrames,
  }));
}

export const COMPOSITIONS: CompositionEntry[] = [
  {
    id: 'MobileChatDemoCombined',
    label: 'Combined (V2+V4)',
    video: {
      width: 1080,
      height: 1920,
      fps: 30,
      frames: COMBINED_VIDEO.durationInFrames,
    },
    scenes: COMBINED_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
      part: s.part,
      hand: s.hand,
    })),
    globalOffsetY: 120,
  },
  {
    id: 'DorianDemo',
    label: 'Dorian (Marketplace)',
    video: {
      width: 1080,
      height: 1920,
      fps: 30,
      frames: DORIAN_VIDEO.durationInFrames,
    },
    scenes: DORIAN_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
      hand: s.hand,
      zoom: s.zoom,
    })),
  },
  {
    id: 'DashmorDemo',
    label: 'Dashmor (Dashboard)',
    video: {
      width: 1080,
      height: 1920,
      fps: 30,
      frames: DASHMOR_VIDEO.durationInFrames,
    },
    scenes: dashmorSceneInfo(),
  },
];

// Component map for rendering
export const COMPOSITION_COMPONENTS: Record<string, React.FC> = {
  MobileChatDemoCombined,
  DorianDemo,
  DashmorDemo,
};
