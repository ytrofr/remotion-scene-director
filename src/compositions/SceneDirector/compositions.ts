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
// V1.10–V1.16 archived from SD dropdown 2026-05-07. Components still imported
// for COMPOSITION_COMPONENTS map (V1.14–V1.20 wrappers transitively reference
// the V1.13 component tree). See dropdown-archive comment block below.
import { DorianFullV1_10 } from '../DorianFull/DorianFullV1.10';
import { DorianFullV1_11 } from '../DorianFull/DorianFullV1.11';
import { DorianFullV1_12 } from '../DorianFull/DorianFullV1.12';
import {
  DorianFullV1_13,
  FULL_SCENE_INFO_V1_13,
} from '../DorianFull/DorianFullV1.13';
import {
  DorianFullV1_140,
  FULL_VIDEO_V1_140,
} from '../DorianFull/DorianFullV1.140';
import { DorianFullV1_14 } from '../DorianFull/DorianFullV1.14';
import { DorianFullV1_15 } from '../DorianFull/DorianFullV1.15';
import { DorianFullV1_16 } from '../DorianFull/DorianFullV1.16';
import {
  DorianFullV1_17,
  FULL_VIDEO_V1_17,
} from '../DorianFull/DorianFullV1.17';
import {
  DorianFullV1_18,
  FULL_VIDEO_V1_18,
} from '../DorianFull/DorianFullV1.18';
import {
  DorianFullV1_19,
  FULL_VIDEO_V1_19,
} from '../DorianFull/DorianFullV1.19';
import {
  DorianFullV1_20,
  FULL_VIDEO_V1_20,
} from '../DorianFull/DorianFullV1.20';
import {
  DorianFullV1_21,
  FULL_VIDEO_V1_21,
  FULL_SCENE_INFO_V1_21,
} from '../DorianFull/DorianFullV1.21';
import {
  DorianFullV1_22,
  FULL_VIDEO_V1_22,
  FULL_SCENE_INFO_V1_22,
} from '../DorianFull/DorianFullV1.22';
import {
  ClickStyleDemo,
  CLICK_STYLE_DEMO_TOTAL,
} from '../ClickStyleDemo/ClickStyleDemo';
import {
  DorianImprovementsDemo,
  DORIAN_IMPROVEMENTS_TOTAL,
} from '../DorianImprovementsDemo/DorianImprovementsDemo';
import {
  DorianImprovementsDemoV2,
  DORIAN_IMPROVEMENTS_V2_TOTAL,
} from '../DorianImprovementsDemoV2/DorianImprovementsDemoV2';
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
  ScrollEffectDemo,
  SCROLL_EFFECT_VIDEO,
  SCROLL_EFFECT_SCENES,
} from '../ScrollEffectDemo/ScrollEffectDemo';
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
  // ── ARCHIVED 2026-05-07 ────────────────────────────────────────────────
  // V1.10–V1.16 entries removed from the SD dropdown to clean up after V1.21.
  // .tsx files, JSON entries, audio entries, npm scripts, and the
  // COMPOSITION_COMPONENTS map at the bottom of this file all REMAIN — V1.13
  // is imported transitively by V1.14–V1.20 wrappers, so the file MUST stay
  // on disk. To unarchive, re-add the matching dropdown entry block here.
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'DorianFullV1-17',
    label: 'Dorian Full V1.15 (V1.13 + Funkorama funk)',
    group: 'Dorian',
    video: {
      width: FULL_VIDEO_V1_17.width,
      height: FULL_VIDEO_V1_17.height,
      fps: FULL_VIDEO_V1_17.fps,
      frames: FULL_VIDEO_V1_17.durationInFrames,
    },
    scenes: FULL_SCENE_INFO_V1_13.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'DorianFullV1-18',
    label: 'Dorian Full V1.15 (V1.13 + Funkorama funk)',
    group: 'Dorian',
    video: {
      width: FULL_VIDEO_V1_18.width,
      height: FULL_VIDEO_V1_18.height,
      fps: FULL_VIDEO_V1_18.fps,
      frames: FULL_VIDEO_V1_18.durationInFrames,
    },
    scenes: FULL_SCENE_INFO_V1_13.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'DorianFullV1-19',
    label: 'Dorian Full V1.19 (V1.18 + soft-pulse-only clicks, no burst)',
    group: 'Dorian',
    video: {
      width: FULL_VIDEO_V1_19.width,
      height: FULL_VIDEO_V1_19.height,
      fps: FULL_VIDEO_V1_19.fps,
      frames: FULL_VIDEO_V1_19.durationInFrames,
    },
    scenes: FULL_SCENE_INFO_V1_13.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
    // Suppress the SD preview's click-burst Lottie + apply soft-pulse
    // shrink so the editor matches the rendered output (V1.13's
    // ClickStyleProvider value="soft-pulse" governs the render path).
    clickAnimationOverride: null,
    clickStyle: 'soft-pulse',
  },
  {
    id: 'DorianFullV1-20',
    label: 'Dorian Full V1.20 (V1.19 + scene-4 cursor-size normalized)',
    group: 'Dorian',
    video: {
      width: FULL_VIDEO_V1_20.width,
      height: FULL_VIDEO_V1_20.height,
      fps: FULL_VIDEO_V1_20.fps,
      frames: FULL_VIDEO_V1_20.durationInFrames,
    },
    scenes: FULL_SCENE_INFO_V1_13.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
    // Suppress the SD preview's click-burst Lottie + apply soft-pulse
    // shrink so the editor matches the rendered output (V1.13's
    // ClickStyleProvider value="soft-pulse" governs the render path).
    clickAnimationOverride: null,
    clickStyle: 'soft-pulse',
  },
  {
    id: 'DorianFullV1-21',
    label: 'Dorian Full V1.21 (extended scene 8 + click trail + flash)',
    group: 'Dorian',
    video: {
      width: FULL_VIDEO_V1_21.width,
      height: FULL_VIDEO_V1_21.height,
      fps: FULL_VIDEO_V1_21.fps,
      frames: FULL_VIDEO_V1_21.durationInFrames,
    },
    scenes: FULL_SCENE_INFO_V1_21.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
    // Suppress the SD preview's click-burst Lottie + apply soft-pulse
    // shrink so the editor matches the rendered output (V1.13's
    // ClickStyleProvider value="soft-pulse" governs the render path).
    clickAnimationOverride: null,
    clickStyle: 'soft-pulse',
  },
  {
    id: 'DorianFullV1-22',
    label: 'Dorian Full V1.22 (default 2x — visuals fast, music 1x)',
    group: 'Dorian',
    video: {
      width: FULL_VIDEO_V1_22.width,
      height: FULL_VIDEO_V1_22.height,
      fps: FULL_VIDEO_V1_22.fps,
      frames: FULL_VIDEO_V1_22.durationInFrames,
    },
    scenes: FULL_SCENE_INFO_V1_22.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
    clickAnimationOverride: null,
    clickStyle: 'soft-pulse',
  },
  {
    id: 'DorianFullV1-140',
    label: 'Dorian Full V1.140 (V1.13 + Cozy Coffee House jazz lounge)',
    group: 'Dorian',
    video: {
      width: FULL_VIDEO_V1_140.width,
      height: FULL_VIDEO_V1_140.height,
      fps: FULL_VIDEO_V1_140.fps,
      frames: FULL_VIDEO_V1_140.durationInFrames,
    },
    scenes: FULL_SCENE_INFO_V1_13.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
  },
  {
    id: 'ClickStyleDemo',
    label: 'Click Style Demo (5 variants — pick one for V1.13)',
    group: 'Dorian',
    video: {
      width: 1080,
      height: 1920,
      fps: 30,
      frames: CLICK_STYLE_DEMO_TOTAL,
    },
    scenes: [
      { name: 'A — Lottie + Ripple', start: 0, end: 90 },
      { name: 'B — Soft pulse only', start: 90, end: 180 },
      { name: 'C — Pulse + dot', start: 180, end: 270 },
      { name: 'D — Pulse + small ripple', start: 270, end: 360 },
      { name: 'E — Lottie only', start: 360, end: 450 },
    ],
  },
  {
    id: 'DorianImprovementsDemo',
    label: 'Dorian Improvements Demo (4 cursor/UX upgrades)',
    group: 'Dorian',
    video: {
      width: 1080,
      height: 1920,
      fps: 30,
      frames: DORIAN_IMPROVEMENTS_TOTAL,
    },
    scenes: [
      { name: '1-Baseline', start: 0, end: 90 },
      { name: '2-Decel', start: 90, end: 180 },
      { name: '3-SmallRipple', start: 180, end: 270 },
      { name: '4-Zoom', start: 270, end: 360 },
    ],
  },
  {
    id: 'DorianImprovementsDemoV2',
    label: 'Dorian Improvements Demo V2 (12 patterns)',
    group: 'Dorian',
    video: {
      width: 1080,
      height: 1920,
      fps: 30,
      frames: DORIAN_IMPROVEMENTS_V2_TOTAL,
    },
    scenes: [
      { name: '5-HoverPulse', start: 0, end: 90 },
      { name: '6-ClickBurst', start: 90, end: 180 },
      { name: '7-Swipe', start: 180, end: 270 },
      { name: '8-Pinch', start: 270, end: 360 },
      { name: '9-Wobble', start: 360, end: 450 },
      { name: '10-DoubleClick', start: 450, end: 540 },
      { name: '11-Annotation', start: 540, end: 630 },
      { name: '12-BuildReveal', start: 630, end: 720 },
      { name: '13-ColorSwatches', start: 720, end: 810 },
      { name: '14-ResultChip', start: 810, end: 900 },
      { name: '15-MotionBlur', start: 900, end: 990 },
      { name: '16-LightLeak', start: 990, end: 1080 },
    ],
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
    id: 'ScrollEffectDemo',
    label: 'Scroll Effect Lottie Picker (7 options)',
    group: 'Utilities',
    video: {
      width: SCROLL_EFFECT_VIDEO.width,
      height: SCROLL_EFFECT_VIDEO.height,
      fps: SCROLL_EFFECT_VIDEO.fps,
      frames: SCROLL_EFFECT_VIDEO.durationInFrames,
    },
    scenes: SCROLL_EFFECT_SCENES.map((s) => ({
      name: s.name,
      start: s.start,
      end: s.end,
    })),
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
  'DorianFullV1-10': DorianFullV1_10,
  'DorianFullV1-11': DorianFullV1_11,
  'DorianFullV1-12': DorianFullV1_12,
  'DorianFullV1-13': DorianFullV1_13,
  'DorianFullV1-14': DorianFullV1_14,
  'DorianFullV1-15': DorianFullV1_15,
  'DorianFullV1-16': DorianFullV1_16,
  'DorianFullV1-17': DorianFullV1_17,
  'DorianFullV1-18': DorianFullV1_18,
  'DorianFullV1-19': DorianFullV1_19,
  'DorianFullV1-20': DorianFullV1_20,
  'DorianFullV1-21': DorianFullV1_21,
  'DorianFullV1-22': DorianFullV1_22,
  'DorianFullV1-140': DorianFullV1_140,
  ClickStyleDemo: ClickStyleDemo,
  DorianImprovementsDemo,
  DorianImprovementsDemoV2,
  SigmaAppDemo,
  SigmaInvestorDemo,
  DemoCreative,
  DemoContext,
  DemoEditWebsite,
  DemoSEO,
  DemoCampaign,
  TransitionShowcase,
  ScrollStyleDemo,
  ScrollEffectDemo,
};
