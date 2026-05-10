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
      file: 'audio/send-click.wav',
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
    // Bubble click (WP @ f42)
    {
      file: 'audio/send-click.wav',
      startFrame: 42,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Input click (WP @ f92)
    {
      file: 'audio/send-click.wav',
      startFrame: 92,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Typing
    {
      file: 'audio/typing-soft.wav',
      startFrame: 105,
      durationInFrames: 95,
      volume: 0.3,
    },
    // Send click (WP @ f200)
    {
      file: 'audio/send-click.wav',
      startFrame: 200,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Confirm click (WP @ f500)
    {
      file: 'audio/send-click.wav',
      startFrame: 500,
      durationInFrames: 15,
      volume: 0.6,
    },
  ],
  '2-MapSearch': [
    // Search bar click (WP @ f18)
    {
      file: 'audio/send-click.wav',
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
    // Pin click (WP @ f150)
    {
      file: 'audio/send-click.wav',
      startFrame: 150,
      durationInFrames: 15,
      volume: 0.6,
    },
  ],
  '3-AIProducts': [
    // Input click (WP @ f12)
    {
      file: 'audio/send-click.wav',
      startFrame: 12,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Typing
    {
      file: 'audio/typing-soft.wav',
      startFrame: 16,
      durationInFrames: 45,
      volume: 0.3,
    },
    // Send click (WP @ f70)
    {
      file: 'audio/send-click.wav',
      startFrame: 68,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Add Products button click (WP @ f228)
    {
      file: 'audio/send-click.wav',
      startFrame: 225,
      durationInFrames: 15,
      volume: 0.6,
    },
  ],
};

// ── SIGMA App Demo Audio ──────────────────────────────────────
// Scene timings reference constants.ts CHAT_SCENES
const SIGMA_APP_AUDIO: Record<string, CodedAudioEntry[]> = {
  HubChatOpen: [],
  WebsiteRequest: [
    // Typing sound (frames 35-115)
    {
      file: 'audio/typing-soft.wav',
      startFrame: 35,
      durationInFrames: 80,
      volume: 0.3,
    },
    // Send button click (frame 125)
    {
      file: 'audio/send-click.wav',
      startFrame: 123,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Routing whoosh (frame 138)
    {
      file: 'audio/sfx/whoosh.wav',
      startFrame: 136,
      durationInFrames: 25,
      volume: 0.45,
    },
  ],
  PageReveal: [],
  CreativeRequest: [
    // Typing (frames 5-55)
    {
      file: 'audio/typing-soft.wav',
      startFrame: 5,
      durationInFrames: 50,
      volume: 0.3,
    },
    // Send click (frame 65)
    {
      file: 'audio/send-click.wav',
      startFrame: 63,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Routing whoosh to nano_banana
    {
      file: 'audio/sfx/whoosh.wav',
      startFrame: 76,
      durationInFrames: 25,
      volume: 0.45,
    },
  ],
  CreativeReveal: [],
  Closing: [],
};

// Demo clip audio — empty for now, will be assigned per-demo later
const DEMO_EMPTY_AUDIO: Record<string, CodedAudioEntry[]> = {};

// ── DemoCreative audio ──────────────────────────────────────
const DEMO_CREATIVE_AUDIO: Record<string, CodedAudioEntry[]> = {
  Chat: [
    // Typing (frames 35-100)
    {
      file: 'audio/typing-soft.wav',
      startFrame: 35,
      durationInFrames: 65,
      volume: 0.3,
    },
    // Send click (frame 123)
    {
      file: 'audio/send-click.wav',
      startFrame: 123,
      durationInFrames: 15,
      volume: 0.6,
    },
    // Routing whoosh to nano_banana
    {
      file: 'audio/sfx/whoosh.wav',
      startFrame: 136,
      durationInFrames: 25,
      volume: 0.45,
    },
  ],
  PageReveal: [
    // Click on gallery image (local frame 330)
    {
      file: 'audio/send-click.wav',
      startFrame: 330,
      durationInFrames: 10,
      volume: 0.55,
    },
  ],
};

// ── DorianFull V1.01 scene 9 (extended ProductDetail) ──
// Frames are LOCAL to scene 9 (180f). Clicks land on:
//   - frame 70: Add to Cart (teal floating button)
//   - frame 118: hamburger menu (drawer slides in 120→140)
//   - frame 160: "My Store" drawer item → triggers slide-off to scene 10 (160→180)
const DORIAN_FULL_V1_01_SCENE_9_AUDIO: CodedAudioEntry[] = [
  // Click: Add to Cart
  {
    file: 'audio/send-click.wav',
    startFrame: 70,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Click: hamburger + drawer pop
  {
    file: 'audio/sfx/pop-up.wav',
    startFrame: 118,
    durationInFrames: 25,
    volume: 0.55,
  },
  // Click: "My Store" menu item
  {
    file: 'audio/send-click.wav',
    startFrame: 160,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Slide-off transition to scene 10 (160→180)
  {
    file: 'audio/sfx/whoosh.wav',
    startFrame: 162,
    durationInFrames: 22,
    volume: 0.4,
  },
];

// V1.03: simpler scene 9 — intro click + Add to Cart click + slide-off only.
// No hamburger / My Store clicks. Total scene 9 = 220f.
const DORIAN_FULL_V1_03_SCENE_9_AUDIO: CodedAudioEntry[] = [
  // Intro: click on product card on the listing
  {
    file: 'audio/send-click.wav',
    startFrame: 22,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Click: Add to Cart (mainFrame 125 + PHASE_OFFSET 45 = local 170)
  {
    file: 'audio/send-click.wav',
    startFrame: 170,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Slide-off transition to scene 10 (mainFrame 157 + 45 = 202)
  {
    file: 'audio/sfx/whoosh.wav',
    startFrame: 202,
    durationInFrames: 22,
    volume: 0.4,
  },
];

// V1.07: slower drag-scroll + 4 separate click layers. Same 3 click sounds
// as V1.06 but shifted: Add to Cart 100→145, hamburger 152→190, My Store
// 190→232. Total scene 9 = 250f.
const DORIAN_FULL_V1_07_SCENE_9_AUDIO: CodedAudioEntry[] = [
  {
    file: 'audio/send-click.wav',
    startFrame: 145,
    durationInFrames: 15,
    volume: 0.6,
  },
  {
    file: 'audio/send-click.wav',
    startFrame: 190,
    durationInFrames: 15,
    volume: 0.6,
  },
  {
    file: 'audio/send-click.wav',
    startFrame: 232,
    durationInFrames: 15,
    volume: 0.6,
  },
];

// V1.06: scene 9 starts directly on product detail page. Removed intro click
// sound (was at 22). All other clicks shifted -70f. Total scene 9 = 210f.
const DORIAN_FULL_V1_06_SCENE_9_AUDIO: CodedAudioEntry[] = [
  // Add to Cart click
  {
    file: 'audio/send-click.wav',
    startFrame: 100,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Hamburger click (synced with drawer slide-in)
  {
    file: 'audio/send-click.wav',
    startFrame: 152,
    durationInFrames: 15,
    volume: 0.6,
  },
  // My Store click
  {
    file: 'audio/send-click.wav',
    startFrame: 190,
    durationInFrames: 15,
    volume: 0.6,
  },
];

// V1.05: V1.04 with hamburger click sound moved 217 → 222 (= global 1092),
// syncing with cursor click animation + drawer slide-in.
const DORIAN_FULL_V1_05_SCENE_9_AUDIO: CodedAudioEntry[] = [
  {
    file: 'audio/send-click.wav',
    startFrame: 22,
    durationInFrames: 15,
    volume: 0.6,
  },
  {
    file: 'audio/send-click.wav',
    startFrame: 170,
    durationInFrames: 15,
    volume: 0.6,
  },
  {
    file: 'audio/send-click.wav',
    startFrame: 222,
    durationInFrames: 15,
    volume: 0.6,
  },
  {
    file: 'audio/send-click.wav',
    startFrame: 260,
    durationInFrames: 15,
    volume: 0.6,
  },
];

// V1.04: V1.03 + hamburger + My Store at the end (no slide-off, page-load
// loader transitions to scene 10). Total scene 9 = 280f.
const DORIAN_FULL_V1_04_SCENE_9_AUDIO: CodedAudioEntry[] = [
  // Intro: click on product card on the listing
  {
    file: 'audio/send-click.wav',
    startFrame: 22,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Click: Add to Cart (mainFrame 125 + PHASE_OFFSET 45 = local 170)
  {
    file: 'audio/send-click.wav',
    startFrame: 170,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Click: hamburger (frame 217)
  {
    file: 'audio/send-click.wav',
    startFrame: 217,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Click: My Store menu item (frame 260)
  {
    file: 'audio/send-click.wav',
    startFrame: 260,
    durationInFrames: 15,
    volume: 0.6,
  },
];

// V1.02: V1.01 entries shifted by +115 frames (intro click+loader 50f + 1.5s
// hold + slow scroll). Plus new intro click at frame 22.
const DORIAN_FULL_V1_02_SCENE_9_AUDIO: CodedAudioEntry[] = [
  // Intro: click on product card on the listing
  {
    file: 'audio/send-click.wav',
    startFrame: 22,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Click: Add to Cart (V1.01 was 70)
  {
    file: 'audio/send-click.wav',
    startFrame: 185,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Click: hamburger + drawer pop (V1.01 was 118)
  {
    file: 'audio/sfx/pop-up.wav',
    startFrame: 233,
    durationInFrames: 25,
    volume: 0.55,
  },
  // Click: "My Store" menu item (V1.01 was 160)
  {
    file: 'audio/send-click.wav',
    startFrame: 275,
    durationInFrames: 15,
    volume: 0.6,
  },
  // Slide-off transition to scene 10 (V1.01 was 162)
  {
    file: 'audio/sfx/whoosh.wav',
    startFrame: 277,
    durationInFrames: 22,
    volume: 0.4,
  },
];

const CODED_AUDIO_REGISTRY: Record<
  string,
  Record<string, CodedAudioEntry[]>
> = {
  MobileChatDemoCombined: COMBINED_AUDIO,
  DorianDemo: DORIAN_AUDIO,
  AudioTest: AUDIO_TEST_AUDIO,
  CapabilitiesDemo: CAPABILITIES_AUDIO,
  DorianStores: DORIAN_STORES_AUDIO,
  DorianFull: {
    ...DORIAN_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  // Read by DorianAudioV1_01 inside DorianDemoV1_01 — picks up scene 9 V1.01
  // SFX in the actual render pipeline.
  // Read by SceneDirector's ENSURE_SCENE_LAYERS when the user picks
  // DorianFullV1-01 → scene 9. This makes the SFX appear as editable audio
  // layers in the timeline (not just inline render).
  // V1.02 scene 9 audio: V1.01 entries shifted +45 frames + new intro click at f22.
  // V1.08: same audio cues as V1.07 (cursor-flicker fix is visual-only).
  // V1.09: same audio cues as V1.08 (HomeScroll/ProductPage cursor change is visual-only).
  // V1.10: same audio cues as V1.09. Big scrollbar drag is visual-only —
  // no new SFX (cursor on scrollbar is silent in V1.09 too).
  'DorianDemoV1.10': {
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
  },
  'DorianFullV1-10': {
    ...DORIAN_AUDIO,
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  // V1.11: STABLE — same audio cues as V1.10.
  'DorianDemoV1.11': {
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
  },
  'DorianFullV1-11': {
    ...DORIAN_AUDIO,
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  // V1.12: scene 8 adds a TV-card click — keep the swipe sfx, append send-click at f147.
  'DorianDemoV1.12': {
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
  },
  'DorianFullV1-12': {
    ...DORIAN_AUDIO,
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  // V1.13: same as V1.12 audio + scene 4 ChatOpen send-click added at f74
  // (the actual click waypoint frame; the existing f48 cue is the chat-open
  // transition sound, kept for the slide-in effect).
  'DorianFullV1-13': {
    ...DORIAN_AUDIO,
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  // V1.131/132/133: same SFX cues as V1.13, plus a full-video music cue
  // anchored to scene 1-Intro (startFrame 0, duration covers entire video).
  // SD reads these to spawn audio layers — the music shows as a single bar
  // spanning all scenes. Render path uses BackgroundMusic (gated, see
  // DorianFullV1.13X.tsx) for proper fade in/out — this layer is for SD only.
  'DorianFullV1-14': {
    ...DORIAN_AUDIO,
    '1-Intro': [
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 5400,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  'DorianFullV1-15': {
    ...DORIAN_AUDIO,
    '1-Intro': [
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 5400,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  'DorianFullV1-16': {
    ...DORIAN_AUDIO,
    '1-Intro': [
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 5400,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  'DorianFullV1-17': {
    ...DORIAN_AUDIO,
    '1-Intro': [
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 5400,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  'DorianFullV1-18': {
    ...DORIAN_AUDIO,
    // Music split into two layers: scene 1 covers Dorian half (frames 0-1120),
    // scene 10 covers Stores+Closing half (frames 1120-2590). The split is
    // necessary because in SceneDirector preview, AudioFromLayers inside
    // DorianDemoV1_12 is wrapped in <Sequence from=0 dur=DORIAN_CUT> which
    // clamps any scene-1-registered audio at frame 1120. Stores audio renders
    // via StoresAudioFromLayersV1_13 which only picks up entries with
    // globalFrom >= DORIAN_CUT — hence the second registration at scene 10.
    // Render mode is unaffected (top-level <BackgroundMusic> handles both).
    '1-Intro': [
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1120,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': [
      ...DORIAN_STORES_AUDIO['1-StoreDashboard'],
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1470,
        volume: 0.15,
      },
    ],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  'DorianFullV1-19': {
    ...DORIAN_AUDIO,
    // Music split into two layers: scene 1 covers Dorian half (frames 0-1120),
    // scene 10 covers Stores+Closing half (frames 1120-2590). The split is
    // necessary because in SceneDirector preview, AudioFromLayers inside
    // DorianDemoV1_12 is wrapped in <Sequence from=0 dur=DORIAN_CUT> which
    // clamps any scene-1-registered audio at frame 1120. Stores audio renders
    // via StoresAudioFromLayersV1_13 which only picks up entries with
    // globalFrom >= DORIAN_CUT — hence the second registration at scene 10.
    // Render mode is unaffected (top-level <BackgroundMusic> handles both).
    '1-Intro': [
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1120,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': [
      ...DORIAN_STORES_AUDIO['1-StoreDashboard'],
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1470,
        volume: 0.15,
      },
    ],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  'DorianFullV1-20': {
    ...DORIAN_AUDIO,
    // Music split into two layers: scene 1 covers Dorian half (frames 0-1120),
    // scene 10 covers Stores+Closing half (frames 1120-2590). The split is
    // necessary because in SceneDirector preview, AudioFromLayers inside
    // DorianDemoV1_12 is wrapped in <Sequence from=0 dur=DORIAN_CUT> which
    // clamps any scene-1-registered audio at frame 1120. Stores audio renders
    // via StoresAudioFromLayersV1_13 which only picks up entries with
    // globalFrom >= DORIAN_CUT — hence the second registration at scene 10.
    // Render mode is unaffected (top-level <BackgroundMusic> handles both).
    '1-Intro': [
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1120,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': [
      ...DORIAN_STORES_AUDIO['1-StoreDashboard'],
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1470,
        volume: 0.15,
      },
    ],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  'DorianFullV1-21': {
    ...DORIAN_AUDIO,
    // Music split into two layers: scene 1 covers Dorian half (frames 0-1120),
    // scene 10 covers Stores+Closing half (frames 1120-2590). The split is
    // necessary because in SceneDirector preview, AudioFromLayers inside
    // DorianDemoV1_12 is wrapped in <Sequence from=0 dur=DORIAN_CUT> which
    // clamps any scene-1-registered audio at frame 1120. Stores audio renders
    // via StoresAudioFromLayersV1_13 which only picks up entries with
    // globalFrom >= DORIAN_CUT — hence the second registration at scene 10.
    // Render mode is unaffected (top-level <BackgroundMusic> handles both).
    '1-Intro': [
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1120,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    // V1.21 scene 8: click moved from scene-local f147 → f200 (extended scene
    // 8 from 150 → 220 frames so the click feels deliberate after a slow
    // travel + HOLD on the TV card). See DorianFullV1.21.tsx.
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 200,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': [
      ...DORIAN_STORES_AUDIO['1-StoreDashboard'],
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1470,
        volume: 0.15,
      },
    ],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  // V1.22 — same scene structure + audio cues as V1.21. Music registrations
  // here are for SceneDirector preview at 1x. The default render path
  // (`scripts/render-fast2x.mjs`) renders V1-22 with `noMusic=true` and
  // overlays music post-render at 1x tempo. The 1x debug render
  // (`render:dorian-full:v1.22:1x`) plays this embedded music inline.
  'DorianFullV1-22': {
    ...DORIAN_AUDIO,
    '1-Intro': [
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1120,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 200,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': [
      ...DORIAN_STORES_AUDIO['1-StoreDashboard'],
      {
        file: 'audio/music/kml-funkorama.mp3',
        startFrame: 0,
        durationInFrames: 1470,
        volume: 0.15,
      },
    ],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
  'DorianFullV1-140': {
    ...DORIAN_AUDIO,
    '1-Intro': [
      {
        file: 'audio/music/kml-backbay-lounge.mp3',
        startFrame: 0,
        durationInFrames: 5400,
        volume: 0.15,
      },
    ],
    '4-ChatOpen': [
      ...DORIAN_AUDIO['4-ChatOpen'],
      {
        file: 'audio/send-click.wav',
        startFrame: 74,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '8-ProductPage': [
      ...DORIAN_AUDIO['8-ProductPage'],
      {
        file: 'audio/send-click.wav',
        startFrame: 147,
        durationInFrames: 15,
        volume: 0.5,
      },
    ],
    '9-ProductDetail': DORIAN_FULL_V1_07_SCENE_9_AUDIO,
    '10-StoreDashboard': DORIAN_STORES_AUDIO['1-StoreDashboard'],
    '11-MapSearch': DORIAN_STORES_AUDIO['2-MapSearch'],
    '12-AIProducts': DORIAN_STORES_AUDIO['3-AIProducts'],
  },
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
export type LayerType = 'hand' | 'zoom' | 'audio' | 'caption' | 'clickFlash';

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
  // Optional manual lane pin in the Timeline. When undefined, the layer is
  // greedy-packed onto the first row where it doesn't time-overlap. When set,
  // useHandLayerRows places the layer in this lane (extending the row count if
  // needed) UNLESS another override already occupies the same lane at an
  // overlapping time — in that case it falls back to greedy.
  laneOverride?: number;
  // ── Stage 2: physics + showRipple per-layer overrides ─────────────────
  /** Named physics preset key (PHYSICS_PRESET_REGISTRY). Inspector writes this. */
  physicsPreset?: string;
  /** Toggle ripple effect. Inspector writes this. */
  showRipple?: boolean;
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

// Click-flash layer — visual click indication on the website (expanding ring +
// brief opacity flash at composition-space (x, y) at scene-local frame).
// Reusable across ALL compositions, not just Dorian. Designed to be paired with
// a click waypoint at the same frame so the cursor's soft-pulse + the flash
// fire simultaneously.
export interface ClickFlashLayerData {
  /** composition-space x (0 .. video.width). Same coord space as hand waypoints. */
  x: number;
  /** composition-space y (0 .. video.height). */
  y: number;
  /** scene-local frame number where the flash starts. */
  frame: number;
  /** ring + flash color (any CSS color). Default: COLORS.primary if undefined. */
  color?: string;
  /** maximum ring radius in px (composition-space). Default 120. */
  peakRadius?: number;
  /** total animation duration in frames. Default 24 (~0.8s at 30fps). */
  durationInFrames?: number;
}

export interface ClickFlashLayer extends LayerBase {
  type: 'clickFlash';
  data: ClickFlashLayerData;
}

export const AUDIO_FILES = [
  { id: 'audio/send-click.wav', label: 'Click' },
  { id: 'audio/typing-soft.wav', label: 'Typing' },
  { id: 'audio/u_nharq4usid-swipe-255512.mp3', label: 'Swipe' },
  { id: 'audio/sfx/whoosh.wav', label: 'Whoosh' },
  { id: 'audio/sfx/whip.wav', label: 'Whip' },
  { id: 'audio/sfx/switch.wav', label: 'Switch' },
  { id: 'audio/sfx/pop-up.wav', label: 'Pop Up' },
];

export type Layer =
  | HandLayer
  | ZoomLayer
  | AudioLayer
  | CaptionLayer
  | ClickFlashLayer;

// Discriminated union of all layer data types
export type LayerData =
  | HandLayerData
  | ZoomLayerData
  | AudioLayerData
  | CaptionLayerData
  | ClickFlashLayerData;

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
  /** Stage 2 — initial physics preset key (Inspector dropdown). */
  physicsPreset?: string,
  /** Stage 2 — initial showRipple toggle. */
  showRipple?: boolean,
): HandLayer {
  return {
    id: generateLayerId('hand'),
    type: 'hand',
    scene,
    name: `Hand - ${gesture.charAt(0).toUpperCase() + gesture.slice(1)}`,
    visible: true,
    locked: false,
    order,
    data: { waypoints, gesture, size, physicsPreset, showRipple },
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

// Create a default click-flash layer
export function createClickFlashLayer(
  scene: string,
  data: ClickFlashLayerData,
  order: number = 4,
): ClickFlashLayer {
  return {
    id: generateLayerId('clickFlash'),
    type: 'clickFlash',
    scene,
    name: `Flash @(${data.x}, ${data.y})`,
    visible: true,
    locked: false,
    order,
    data,
  };
}

// Per-composition + per-scene click-flash entries. Mirrors the audio registry
// pattern (CODED_AUDIO_REGISTRY). DorianFull-family wrappers read this via
// getCodedClickFlashes() to know which flashes to render. ENSURE_SCENE_LAYERS
// auto-creates ClickFlashLayer instances from this registry on scene seed —
// flashes appear as editable entries in SceneDirector slice (long-term: via
// drag-handle UI on the phone preview).
const CODED_CLICK_FLASH_REGISTRY: Record<
  string,
  Record<string, ClickFlashLayerData[]>
> = {
  // V1.21: TV-card click in scene 8 (composition-space 518, 1150 at scene-local
  // frame 200 — see DorianFullV1.21 sceneOverrides). Teal expanding ring +
  // brief opacity flash so the click reads as a deliberate navigation.
  'DorianFullV1-21': {
    '8-ProductPage': [
      {
        x: 518,
        y: 1150,
        frame: 200,
        color: '#2DD4BF',
        peakRadius: 140,
        durationInFrames: 24,
      },
    ],
  },
  // V1.22 inherits V1.21's click flash. Same TV-card click in scene 8.
  'DorianFullV1-22': {
    '8-ProductPage': [
      {
        x: 518,
        y: 1150,
        frame: 200,
        color: '#2DD4BF',
        peakRadius: 140,
        durationInFrames: 24,
      },
    ],
  },
};

export function getCodedClickFlashes(
  compositionId: string,
  sceneName: string,
): ClickFlashLayerData[] {
  return CODED_CLICK_FLASH_REGISTRY[compositionId]?.[sceneName] ?? [];
}
