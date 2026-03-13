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
import {
  AudioTest,
  AUDIO_TEST_VIDEO,
  AUDIO_TEST_SCENES,
} from '../AudioTest/AudioTest';
import {
  CapabilitiesDemo,
  CAPABILITIES_VIDEO,
  CAPABILITIES_SCENES,
} from '../CapabilitiesDemo';
import {
  SharedComponentsDemo,
  DEMO_VIDEO,
  DEMO_SCENES,
} from '../SharedComponentsDemo';
import {
  DorianDemoEnhanced,
  ENHANCED_VIDEO,
  ENHANCED_SCENE_INFO,
  CAPTIONS_SRT,
} from '../DorianDemoEnhanced';
import {
  DorianStores,
  VIDEO as STORES_VIDEO,
  STORES_SCENE_INFO,
} from '../DorianStores/DorianStores';

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
  {
    id: 'AudioTest',
    label: 'Audio Test (2 scenes)',
    video: {
      width: AUDIO_TEST_VIDEO.width,
      height: AUDIO_TEST_VIDEO.height,
      fps: AUDIO_TEST_VIDEO.fps,
      frames: AUDIO_TEST_VIDEO.durationInFrames,
    },
    scenes: AUDIO_TEST_SCENES.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'CapabilitiesDemo',
    label: 'Capabilities Demo (7 scenes)',
    video: {
      width: CAPABILITIES_VIDEO.width,
      height: CAPABILITIES_VIDEO.height,
      fps: CAPABILITIES_VIDEO.fps,
      frames: CAPABILITIES_VIDEO.durationInFrames,
    },
    scenes: CAPABILITIES_SCENES.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'SharedComponentsDemo',
    label: 'Shared Components Demo (6 scenes)',
    video: {
      width: DEMO_VIDEO.width,
      height: DEMO_VIDEO.height,
      fps: DEMO_VIDEO.fps,
      frames: DEMO_VIDEO.durationInFrames,
    },
    scenes: DEMO_SCENES.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'DorianDemoEnhanced',
    label: 'Dorian Enhanced (captions + audio envelopes)',
    video: {
      width: ENHANCED_VIDEO.width,
      height: ENHANCED_VIDEO.height,
      fps: ENHANCED_VIDEO.fps,
      frames: ENHANCED_VIDEO.durationInFrames,
    },
    scenes: ENHANCED_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
    captionsSrt: CAPTIONS_SRT,
  },
  {
    id: 'DorianStores',
    label: 'Dorian Stores (Dashboard + Map + AI)',
    video: {
      width: STORES_VIDEO.width,
      height: STORES_VIDEO.height,
      fps: STORES_VIDEO.fps,
      frames: STORES_VIDEO.durationInFrames,
    },
    scenes: STORES_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
];

// Component map for rendering
export const COMPOSITION_COMPONENTS: Record<string, React.FC> = {
  MobileChatDemoCombined,
  DorianDemo,
  DashmorDemo,
  AudioTest,
  CapabilitiesDemo,
  SharedComponentsDemo,
  DorianDemoEnhanced,
  DorianStores,
};
