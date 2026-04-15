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
import {
  DorianStoresDebug,
  STORES_DEBUG_DURATION,
} from '../DorianStores/DorianStoresDebug';
import {
  DorianFull,
  FULL_VIDEO,
  FULL_SCENE_INFO,
} from '../DorianFull/DorianFull';
import {
  SigmaAppDemo,
  SIGMA_APP_VIDEO,
  SCENE_INFO as SIGMA_APP_SCENE_INFO,
} from '../SigmaAppDemo';
import {
  SigmaInvestorDemo,
  SIGMA_VIDEO as SIGMA_INV_VIDEO,
  SCENE_INFO as SIGMA_INV_SCENE_INFO,
} from '../SigmaInvestorDemo';
import {
  DemoCreative,
  DEMO_CREATIVE_SCENE_INFO,
} from '../SigmaAppDemo/demos/DemoCreative';
import {
  DemoContext,
  DEMO_CONTEXT_SCENE_INFO,
} from '../SigmaAppDemo/demos/DemoContext';
import {
  DemoEditWebsite,
  DEMO_EDIT_SCENE_INFO,
} from '../SigmaAppDemo/demos/DemoEditWebsite';
import { DemoSEO, DEMO_SEO_SCENE_INFO } from '../SigmaAppDemo/demos/DemoSEO';
import {
  DemoCampaign,
  DEMO_CAMPAIGN_SCENE_INFO,
} from '../SigmaAppDemo/demos/DemoCampaign';
import { TransitionShowcase } from '../SigmaAppDemo/TransitionShowcase';
import { ScrollStyleDemo, SCROLL_DEMO_VIDEO } from '../ScrollStyleDemo';
import {
  DEMO_CREATIVE_VIDEO,
  DEMO_CONTEXT_VIDEO,
  DEMO_EDIT_VIDEO,
  DEMO_SEO_VIDEO,
  DEMO_CAMPAIGN_VIDEO,
} from '../SigmaAppDemo/constants';

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
    group: 'Mobile Chat',
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
    group: 'Dorian',
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
    group: 'Dashmor',
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
    group: 'Utilities',
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
    group: 'Utilities',
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
    group: 'Utilities',
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
    group: 'Dorian',
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
    group: 'Dorian',
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
  {
    id: 'DorianFull',
    label: 'Dorian Full (Demo + Stores)',
    group: 'Dorian',
    video: {
      width: FULL_VIDEO.width,
      height: FULL_VIDEO.height,
      fps: FULL_VIDEO.fps,
      frames: FULL_VIDEO.durationInFrames,
    },
    scenes: FULL_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'DorianStoresDebug',
    label: 'Stores Debug (Scene 1 only)',
    group: 'Dorian',
    video: {
      width: STORES_VIDEO.width,
      height: STORES_VIDEO.height,
      fps: STORES_VIDEO.fps,
      frames: STORES_DEBUG_DURATION,
    },
    scenes: [
      {
        name: '1-StoreDashboard',
        start: 0,
        end: STORES_DEBUG_DURATION,
      },
    ],
  },
  {
    id: 'SigmaAppDemo',
    label: 'SIGMA App Demo (Product Walkthrough)',
    group: 'Sigma Full',
    video: {
      width: SIGMA_APP_VIDEO.width,
      height: SIGMA_APP_VIDEO.height,
      fps: SIGMA_APP_VIDEO.fps,
      frames: SIGMA_APP_VIDEO.durationInFrames,
    },
    scenes: SIGMA_APP_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'SigmaInvestorDemo',
    label: 'SIGMA Investor Demo (Pitch Deck)',
    group: 'Sigma Full',
    video: {
      width: SIGMA_INV_VIDEO.width,
      height: SIGMA_INV_VIDEO.height,
      fps: SIGMA_INV_VIDEO.fps,
      frames: SIGMA_INV_VIDEO.durationInFrames,
    },
    scenes: SIGMA_INV_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  // ── Agent Demo Clips (Investor Pitch) ──
  {
    id: 'DemoCreative',
    label: 'Creative (nano_banana)',
    group: 'Sigma Demos',
    video: {
      width: 1920,
      height: 1080,
      fps: 30,
      frames: DEMO_CREATIVE_VIDEO.durationInFrames,
    },
    scenes: DEMO_CREATIVE_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'DemoContext',
    label: 'Context Save (orchestrator)',
    group: 'Sigma Demos',
    video: {
      width: 1920,
      height: 1080,
      fps: 30,
      frames: DEMO_CONTEXT_VIDEO.durationInFrames,
    },
    scenes: DEMO_CONTEXT_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'DemoEditWebsite',
    label: 'Edit Website (websites)',
    group: 'Sigma Demos',
    video: {
      width: 1920,
      height: 1080,
      fps: 30,
      frames: DEMO_EDIT_VIDEO.durationInFrames,
    },
    scenes: DEMO_EDIT_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'DemoSEO',
    label: 'SEO Analysis (reach)',
    group: 'Sigma Demos',
    video: {
      width: 1920,
      height: 1080,
      fps: 30,
      frames: DEMO_SEO_VIDEO.durationInFrames,
    },
    scenes: DEMO_SEO_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'DemoCampaign',
    label: 'Campaign (google_ads)',
    group: 'Sigma Demos',
    video: {
      width: 1920,
      height: 1080,
      fps: 30,
      frames: DEMO_CAMPAIGN_VIDEO.durationInFrames,
    },
    scenes: DEMO_CAMPAIGN_SCENE_INFO.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'ScrollStyleDemo',
    label: 'Scroll Style Comparison (6 variants)',
    group: 'Utilities',
    video: {
      width: SCROLL_DEMO_VIDEO.width,
      height: SCROLL_DEMO_VIDEO.height,
      fps: SCROLL_DEMO_VIDEO.fps,
      frames: SCROLL_DEMO_VIDEO.durationInFrames,
    },
    scenes: [
      {
        name: 'ScrollComparison',
        start: 0,
        end: SCROLL_DEMO_VIDEO.durationInFrames,
      },
    ],
  },
  {
    id: 'TransitionShowcase',
    label: 'Transition Showcase (5 effects)',
    group: 'Sigma Demos',
    video: { width: 1920, height: 1080, fps: 30, frames: 750 },
    scenes: [
      { name: 'SlideUpPush', start: 0, end: 150 },
      { name: 'ScaleBlurReveal', start: 150, end: 300 },
      { name: 'WipeReveal', start: 300, end: 450 },
      { name: 'MorphZoom', start: 450, end: 600 },
      { name: 'SplitSlide', start: 600, end: 750 },
    ],
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
  DorianStoresDebug,
  DorianFull,
  SigmaAppDemo,
  SigmaInvestorDemo,
  DemoCreative,
  DemoContext,
  DemoEditWebsite,
  DemoSEO,
  DemoCampaign,
  TransitionShowcase,
  ScrollStyleDemo,
};
