/**
 * Coded Hand Paths Registry
 *
 * Maps compositionId + sceneName → HandPathPoint[] for scenes that have
 * hand animations defined in their source code. SceneDirector uses these
 * as default trail overlays when the user hasn't placed manual waypoints.
 */

import type {
  HandPathPoint,
  HandPhysicsConfig,
} from '../../components/FloatingHand/types';
import type { GestureTool } from './gestures';
import savedData from './codedPaths.data.json';

export interface CodedPath {
  path: HandPathPoint[];
  gesture: GestureTool;
  animation: string;
  dark?: boolean;
  secondaryLayers?: Array<{ gesture: GestureTool; path: HandPathPoint[] }>;
  /** When true, Reload skips this scene; Save prompts for confirmation. */
  _locked?: boolean;
  // ── Stage 2: SD-saved override fields (all optional, additive) ─────
  /** Per-layer hand cursor size (px). Overrides scene literal + zoom default. */
  size?: number;
  /** Toggle the click ripple effect. Overrides scene literal + gesture preset. */
  showRipple?: boolean;
  /** Named physics preset (key in PHYSICS_PRESET_REGISTRY). Resolves at render. */
  physicsPreset?: string;
  /** Free-form physics overrides (merged on top of preset). Rare — usually unset. */
  physics?: Partial<HandPhysicsConfig>;
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
      {
        x: V2_INPUT.x + 250,
        y: V2_INPUT.y + 300,
        frame: 0,
        gesture: 'pointer',
        scale: 1,
      },
      { x: V2_INPUT.x, y: V2_INPUT.y, frame: 5, gesture: 'pointer', scale: 1 },
      {
        x: V2_INPUT.x,
        y: V2_INPUT.y,
        frame: 6,
        gesture: 'click',
        scale: 1,
        duration: 4,
      },
      {
        x: V2_INPUT.x - 150,
        y: V2_INPUT.y + 250,
        frame: 14,
        gesture: 'pointer',
        scale: 1,
      },
    ],
  },
  '4-V2-Send': {
    gesture: 'click',
    animation: 'hand-click',
    path: [
      {
        x: V2_SEND.x + 300,
        y: V2_SEND.y - 100,
        frame: 0,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: V2_SEND.x + 50,
        y: V2_SEND.y,
        frame: 10,
        gesture: 'pointer',
        scale: 1,
      },
      { x: V2_SEND.x, y: V2_SEND.y, frame: 12, gesture: 'pointer', scale: 1 },
      { x: V2_SEND.x, y: V2_SEND.y, frame: 18, gesture: 'pointer', scale: 1 },
      {
        x: V2_SEND.x - 200,
        y: V2_SEND.y + 200,
        frame: 26,
        gesture: 'pointer',
        scale: 1,
      },
    ],
  },
  '8-V4-Typing': {
    gesture: 'click',
    animation: 'hand-click',
    path: [
      {
        x: V4_INPUT.x + 250,
        y: V4_INPUT.y + 300,
        frame: 0,
        gesture: 'pointer',
        scale: 1,
      },
      { x: V4_INPUT.x, y: V4_INPUT.y, frame: 4, gesture: 'pointer', scale: 1 },
      {
        x: V4_INPUT.x,
        y: V4_INPUT.y,
        frame: 5,
        gesture: 'click',
        scale: 1,
        duration: 10,
      },
      {
        x: V4_INPUT.x - 150,
        y: V4_INPUT.y + 250,
        frame: 25,
        gesture: 'pointer',
        scale: 1,
      },
    ],
  },
  '9-V4-Send': {
    gesture: 'click',
    animation: 'hand-click',
    path: [
      {
        x: V4_SEND.x + 300,
        y: V4_SEND.y - 100,
        frame: 0,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: V4_SEND.x + 50,
        y: V4_SEND.y,
        frame: 10,
        gesture: 'pointer',
        scale: 1,
      },
      { x: V4_SEND.x, y: V4_SEND.y, frame: 12, gesture: 'pointer', scale: 1 },
      {
        x: V4_SEND.x,
        y: V4_SEND.y,
        frame: 13,
        gesture: 'click',
        scale: 1,
        duration: 6,
      },
      {
        x: V4_SEND.x + 100,
        y: V4_SEND.y + 250,
        frame: 24,
        gesture: 'pointer',
        scale: 1,
      },
    ],
  },
};

// ── DorianDemo paths (from DorianDemo.tsx literal coordinates) ──

const DORIAN_PATHS: Record<string, CodedPath> = {
  '2-HomeScroll': {
    gesture: 'scroll',
    animation: 'cursor-real-black',
    dark: false,
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
    animation: 'cursor-real-black',
    dark: false,
    path: [
      { x: 780, y: 1200, frame: 0, gesture: 'pointer', scale: 1 },
      { x: 800, y: 1400, frame: 30, gesture: 'pointer', scale: 1 },
      { x: 818, y: 1546, frame: 53, gesture: 'pointer', scale: 1 },
      { x: 518, y: 992, frame: 73, gesture: 'click', scale: 1, duration: 2 },
    ],
  },
  '4-ChatOpen': {
    gesture: 'click',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      { x: 518, y: 992, frame: 0, gesture: 'pointer', scale: 2.2 },
      { x: 500, y: 1200, frame: 20, gesture: 'pointer', scale: 1.5 },
      { x: 480, y: 1520, frame: 45, gesture: 'pointer', scale: 1 },
      { x: 480, y: 1550, frame: 48, gesture: 'click', scale: 1, duration: 5 },
      { x: 480, y: 1550, frame: 60, gesture: 'pointer', scale: 1 },
    ],
  },
  '5-UserTyping': {
    gesture: 'click',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      { x: 750, y: 1520, frame: 70, gesture: 'pointer', scale: 1 },
      { x: 730, y: 1500, frame: 85, gesture: 'pointer', scale: 1 },
      { x: 720, y: 1490, frame: 100, gesture: 'pointer', scale: 1 },
      { x: 720, y: 1490, frame: 105, gesture: 'click', scale: 1, duration: 10 },
    ],
  },
  '7-AIResponse': {
    gesture: 'click',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      { x: 540, y: 1600, frame: 70, gesture: 'pointer', scale: 1 },
      { x: 540, y: 1480, frame: 85, gesture: 'pointer', scale: 1 },
      { x: 540, y: 1450, frame: 95, gesture: 'click', scale: 1, duration: 10 },
    ],
  },
  '8-ProductPage': {
    gesture: 'scroll',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      {
        x: 1050,
        y: 960,
        frame: 105,
        gesture: 'pointer',
        scale: 1,
        rotation: 0,
      },
      { x: 780, y: 960, frame: 115, gesture: 'pointer', scale: 1, rotation: 0 },
      { x: 780, y: 960, frame: 118, gesture: 'drag', scale: 1, rotation: -30 },
      { x: 780, y: 960, frame: 130, gesture: 'drag', scale: 1, rotation: -30 },
      { x: 780, y: 960, frame: 140, gesture: 'drag', scale: 1, rotation: -30 },
      { x: 780, y: 960, frame: 145, gesture: 'pointer', scale: 1, rotation: 0 },
      { x: 780, y: 960, frame: 150, gesture: 'pointer', scale: 1, rotation: 0 },
    ],
  },
};

// ── DorianStores paths ──

const DORIAN_STORES_PATHS: Record<string, CodedPath> = {
  '1-StoreDashboard': {
    gesture: 'click',
    animation: 'cursor-real-black',
    dark: false,
    // Mirror StoreDashboardSceneV1_12's primary FloatingHand literals so SD's
    // overlay matches what production renders. Without this, SD falls back
    // to gesture-preset physics (snappy) while the scene uses tapGentle —
    // parity test flags physics divergence on layer 0.
    physicsPreset: 'tapGentle',
    showRipple: true,
    path: [
      // Bubble click (pre-zoom S=1.8): bubble at phone (359,758) → comp (814,1543)
      { x: 900, y: 1600, frame: 10, gesture: 'pointer', scale: 1 },
      { x: 830, y: 1560, frame: 40, gesture: 'pointer', scale: 1 },
      { x: 814, y: 1543, frame: 48, gesture: 'pointer', scale: 1 },
      { x: 814, y: 1543, frame: 50, gesture: 'click', scale: 1, duration: 8 },
      // Input click (zoomed S=2.75, O=-374): input at phone (207,826) → comp (540,1664)
      { x: 700, y: 1700, frame: 85, gesture: 'pointer', scale: 1 },
      { x: 540, y: 1664, frame: 95, gesture: 'pointer', scale: 1 },
      { x: 540, y: 1664, frame: 100, gesture: 'click', scale: 1, duration: 5 },
    ],
    secondaryLayers: [
      {
        // Send click: hand re-enters after typing idle, clicks send btn at comp (975,1664)
        gesture: 'click',
        path: [
          { x: 540, y: 1664, frame: 190, gesture: 'pointer', scale: 1 },
          { x: 800, y: 1664, frame: 198, gesture: 'pointer', scale: 1 },
          { x: 975, y: 1664, frame: 205, gesture: 'pointer', scale: 1 },
          {
            x: 975,
            y: 1664,
            frame: 208,
            gesture: 'click',
            scale: 1,
            duration: 10,
          },
          { x: 850, y: 1700, frame: 225, gesture: 'pointer', scale: 1 },
        ],
      },
      {
        // Confirm button click (zoom S=2.4, O=-200): btn at phone (207,805) → comp (540,1650)
        gesture: 'click',
        path: [
          { x: 540, y: 1300, frame: 480, gesture: 'pointer', scale: 1 },
          { x: 540, y: 1500, frame: 495, gesture: 'pointer', scale: 1 },
          {
            x: 540,
            y: 1650,
            frame: 500,
            gesture: 'click',
            scale: 1,
            duration: 10,
          },
          { x: 600, y: 1500, frame: 520, gesture: 'pointer', scale: 1 },
        ],
      },
    ],
  },
  '2-MapSearch': {
    gesture: 'click',
    animation: 'cursor-real-black',
    dark: false,
    // Mirror MapSearchScene's FloatingHand literals — see 1-StoreDashboard
    // note above. Production uses HAND_PHYSICS.tapGentle + showRipple={true}.
    physicsPreset: 'tapGentle',
    showRipple: true,
    path: [
      // Search bar click (pre-zoom S=1.8): search at phone (207,190) → comp (540,521)
      { x: 540, y: 700, frame: 5, gesture: 'pointer', scale: 1 },
      { x: 540, y: 550, frame: 14, gesture: 'pointer', scale: 1 },
      { x: 540, y: 550, frame: 18, gesture: 'click', scale: 1, duration: 8 },
      { x: 540, y: 550, frame: 70, gesture: 'pointer', scale: 1 },
      // Pin click (post-zoom S=1.8): pin at phone (208,328) → comp (542,769)
      { x: 540, y: 750, frame: 120, gesture: 'pointer', scale: 1 },
      { x: 542, y: 769, frame: 140, gesture: 'pointer', scale: 1 },
      { x: 542, y: 769, frame: 150, gesture: 'click', scale: 1, duration: 15 },
    ],
  },
  '3-AIProducts': {
    gesture: 'click',
    animation: 'cursor-real-black',
    dark: false,
    // Mirror AIProductsScene's FloatingHand literals — see 1-StoreDashboard
    // note above. Production uses HAND_PHYSICS.tapGentle + showRipple={true}.
    physicsPreset: 'tapGentle',
    showRipple: true,
    path: [
      // Input click (zoomed S=2.6, O=-350): input at phone (207,826) → comp (540,1630)
      { x: 540, y: 1700, frame: 5, gesture: 'pointer', scale: 1 },
      { x: 540, y: 1630, frame: 10, gesture: 'pointer', scale: 1 },
      { x: 540, y: 1630, frame: 12, gesture: 'click', scale: 1, duration: 8 },
      { x: 540, y: 1630, frame: 55, gesture: 'pointer', scale: 1 },
      // Send click: send btn at phone (365,826) → comp (951,1630)
      { x: 750, y: 1630, frame: 62, gesture: 'pointer', scale: 1 },
      { x: 951, y: 1630, frame: 68, gesture: 'pointer', scale: 1 },
      { x: 951, y: 1630, frame: 70, gesture: 'click', scale: 1, duration: 10 },
      { x: 850, y: 1700, frame: 85, gesture: 'pointer', scale: 1 },
    ],
    secondaryLayers: [
      {
        // "Add Products to Store" button (post-zoom S=1.8): btn at phone (207,760) → comp (540,1547)
        gesture: 'click',
        path: [
          { x: 540, y: 1400, frame: 210, gesture: 'pointer', scale: 1 },
          { x: 540, y: 1500, frame: 218, gesture: 'pointer', scale: 1 },
          { x: 540, y: 1547, frame: 225, gesture: 'pointer', scale: 1 },
          {
            x: 540,
            y: 1547,
            frame: 228,
            gesture: 'click',
            scale: 1,
            duration: 10,
          },
        ],
      },
    ],
  },
};

// ── Registry ──

const saved = savedData as Record<string, Record<string, CodedPath>>;

/** Merge saved paths over hardcoded, preserving hardcoded fields (like dark) that saved data may lack */
function mergePaths(
  hardcoded: Record<string, CodedPath>,
  savedPaths: Record<string, CodedPath> | undefined,
): Record<string, CodedPath> {
  if (!savedPaths) return { ...hardcoded };
  const result = { ...hardcoded };
  for (const [key, sp] of Object.entries(savedPaths)) {
    result[key] = { ...(hardcoded[key] || ({} as CodedPath)), ...sp };
  }
  return result;
}

// ── SIGMA App Demo paths ──────────────────────────────────────
// Canvas: 1920x1080. Chat panel: right:40, width:640 → x range 1240-1880
// Input bar bottom: ~y:1010. Send button: ~x:1820, y:1010
// Chat area center: x:1560, y:540
const SIGMA_INPUT = { x: 1500, y: 1010 };
const SIGMA_SEND = { x: 1820, y: 1010 };
const SIGMA_CHAT_CENTER = { x: 1560, y: 500 };
const SIGMA_LINK_AREA = { x: 1450, y: 780 };

const SIGMA_APP_PATHS: Record<string, CodedPath> = {
  HubChatOpen: {
    gesture: 'point',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      // Cursor enters from bottom right, moves toward chat
      { x: 1920, y: 900, frame: 50, gesture: 'pointer', scale: 1 },
      { x: 1700, y: 700, frame: 80, gesture: 'pointer', scale: 1 },
      // Hover over chat welcome area
      {
        x: SIGMA_CHAT_CENTER.x,
        y: SIGMA_CHAT_CENTER.y,
        frame: 120,
        gesture: 'pointer',
        scale: 1,
      },
      // Move down toward input
      {
        x: SIGMA_INPUT.x,
        y: SIGMA_INPUT.y,
        frame: 160,
        gesture: 'pointer',
        scale: 1,
      },
    ],
  },
  WebsiteRequest: {
    gesture: 'click',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      // Click into input field
      {
        x: SIGMA_INPUT.x,
        y: SIGMA_INPUT.y,
        frame: 25,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: SIGMA_INPUT.x,
        y: SIGMA_INPUT.y,
        frame: 30,
        gesture: 'click',
        scale: 1,
        duration: 8,
      },
      // Stay near input during typing
      {
        x: SIGMA_INPUT.x + 50,
        y: SIGMA_INPUT.y - 20,
        frame: 60,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: SIGMA_INPUT.x + 100,
        y: SIGMA_INPUT.y - 10,
        frame: 100,
        gesture: 'pointer',
        scale: 1,
      },
      // Move to send button and click
      {
        x: SIGMA_SEND.x - 20,
        y: SIGMA_SEND.y,
        frame: 118,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: SIGMA_SEND.x,
        y: SIGMA_SEND.y,
        frame: 123,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: SIGMA_SEND.x,
        y: SIGMA_SEND.y,
        frame: 125,
        gesture: 'click',
        scale: 1,
        duration: 10,
      },
      // Move up to watch response
      {
        x: SIGMA_CHAT_CENTER.x,
        y: 600,
        frame: 160,
        gesture: 'pointer',
        scale: 1,
      },
      // Hover over result link when it appears
      {
        x: SIGMA_LINK_AREA.x,
        y: SIGMA_LINK_AREA.y,
        frame: 290,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: SIGMA_LINK_AREA.x,
        y: SIGMA_LINK_AREA.y,
        frame: 300,
        gesture: 'click',
        scale: 1,
        duration: 10,
      },
      // Move cursor off to side
      { x: 1100, y: 600, frame: 340, gesture: 'pointer', scale: 1 },
    ],
  },
  PageReveal: {
    gesture: 'point',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      // Cursor observes the page scroll
      { x: 700, y: 400, frame: 10, gesture: 'pointer', scale: 1 },
      { x: 600, y: 500, frame: 80, gesture: 'pointer', scale: 1 },
      { x: 500, y: 600, frame: 160, gesture: 'pointer', scale: 1 },
      { x: 600, y: 400, frame: 240, gesture: 'pointer', scale: 1 },
    ],
  },
  CreativeRequest: {
    gesture: 'click',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      // Click into input
      {
        x: SIGMA_INPUT.x,
        y: SIGMA_INPUT.y,
        frame: 1,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: SIGMA_INPUT.x,
        y: SIGMA_INPUT.y,
        frame: 3,
        gesture: 'click',
        scale: 1,
        duration: 5,
      },
      // Typing hover
      {
        x: SIGMA_INPUT.x + 30,
        y: SIGMA_INPUT.y - 15,
        frame: 30,
        gesture: 'pointer',
        scale: 1,
      },
      // Move to send
      {
        x: SIGMA_SEND.x,
        y: SIGMA_SEND.y,
        frame: 58,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: SIGMA_SEND.x,
        y: SIGMA_SEND.y,
        frame: 63,
        gesture: 'click',
        scale: 1,
        duration: 10,
      },
      // Watch response
      {
        x: SIGMA_CHAT_CENTER.x,
        y: 600,
        frame: 100,
        gesture: 'pointer',
        scale: 1,
      },
      // Hover over banner image
      { x: 1400, y: 850, frame: 210, gesture: 'pointer', scale: 1 },
      { x: 1400, y: 850, frame: 250, gesture: 'pointer', scale: 1 },
    ],
  },
  CreativeReveal: {
    gesture: 'point',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      // Cursor explores the creative studio page
      { x: 960, y: 400, frame: 10, gesture: 'pointer', scale: 1 },
      { x: 800, y: 500, frame: 60, gesture: 'pointer', scale: 1 },
      { x: 700, y: 600, frame: 120, gesture: 'pointer', scale: 1 },
      { x: 960, y: 500, frame: 180, gesture: 'pointer', scale: 1 },
    ],
  },
  Closing: {
    gesture: 'point',
    animation: 'cursor-real-black',
    dark: true,
    path: [
      // Cursor rests center during closing
      { x: 960, y: 540, frame: 200, gesture: 'pointer', scale: 1 },
      { x: 960, y: 540, frame: 400, gesture: 'pointer', scale: 1 },
    ],
  },
};

// Demo clip paths — empty for now, will be assigned per-demo later
const DEMO_EMPTY_PATHS: Record<string, CodedPath> = {};

// ── DemoCreative paths ───────────────────────────────────────
// Canvas: 1920x1080. Chat panel right side during Chat scene.
// PageReveal: video of Creative Studio (sidebar ~224px, content centered)
// Content center x: ~960. Gallery image col2: ~926. Lightbox next: ~1892.
const DEMO_CREATIVE_INPUT = { x: 1500, y: 1010 };
const DEMO_CREATIVE_SEND = { x: 1820, y: 1010 };

const DEMO_CREATIVE_PATHS: Record<string, CodedPath> = {
  Chat: {
    gesture: 'click',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      // Enter from bottom-right toward chat input
      { x: 1920, y: 1080, frame: 10, gesture: 'pointer', scale: 1 },
      {
        x: DEMO_CREATIVE_INPUT.x,
        y: DEMO_CREATIVE_INPUT.y,
        frame: 25,
        gesture: 'pointer',
        scale: 1,
      },
      // Click input field
      {
        x: DEMO_CREATIVE_INPUT.x,
        y: DEMO_CREATIVE_INPUT.y,
        frame: 30,
        gesture: 'click',
        scale: 1,
        duration: 8,
      },
      // Hover near input during typing
      {
        x: DEMO_CREATIVE_INPUT.x + 40,
        y: DEMO_CREATIVE_INPUT.y - 15,
        frame: 60,
        gesture: 'pointer',
        scale: 1,
      },
      {
        x: DEMO_CREATIVE_INPUT.x + 80,
        y: DEMO_CREATIVE_INPUT.y - 10,
        frame: 100,
        gesture: 'pointer',
        scale: 1,
      },
      // Move to send button
      {
        x: DEMO_CREATIVE_SEND.x,
        y: DEMO_CREATIVE_SEND.y,
        frame: 118,
        gesture: 'pointer',
        scale: 1,
      },
      // Click send
      {
        x: DEMO_CREATIVE_SEND.x,
        y: DEMO_CREATIVE_SEND.y,
        frame: 123,
        gesture: 'click',
        scale: 1,
        duration: 10,
      },
      // Watch response appear
      { x: 1560, y: 600, frame: 165, gesture: 'pointer', scale: 1 },
      // Hover over result card
      { x: 1450, y: 750, frame: 210, gesture: 'pointer', scale: 1 },
    ],
  },
  PageReveal: {
    gesture: 'scroll',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      // Video starts from 20s (pageRevealVideoStartSec=20).
      // 0-4s (local 0-120): Static page visible while DemoFlow chat slides away.
      // Cursor enters from right edge during transition
      { x: 1920, y: 540, frame: 80, gesture: 'pointer', scale: 1 },
      { x: 960, y: 540, frame: 110, gesture: 'pointer', scale: 1 },
      // 4-8s (local 120-240): Scroll down through gallery
      { x: 960, y: 540, frame: 125, gesture: 'scroll', scale: 1 },
      { x: 950, y: 520, frame: 175, gesture: 'scroll', scale: 1 },
      { x: 940, y: 500, frame: 220, gesture: 'scroll', scale: 1 },
      // 8-9s (local 240-270): Pause on gallery
      { x: 940, y: 480, frame: 250, gesture: 'pointer', scale: 1 },
      // 9-10.5s (local 270-315): Scroll back up
      { x: 940, y: 500, frame: 270, gesture: 'scroll', scale: 1 },
      { x: 950, y: 520, frame: 305, gesture: 'pointer', scale: 1 },
      // 10.5-11s (local 315-330): Move toward gallery image
      { x: 926, y: 500, frame: 315, gesture: 'pointer', scale: 1 },
      // 11s (local 330): Click gallery image
      { x: 926, y: 500, frame: 330, gesture: 'click', scale: 1, duration: 8 },
      // 11.3-11.8s (local 338-355): Lightbox opens — cursor rests
      { x: 960, y: 500, frame: 345, gesture: 'pointer', scale: 1 },
    ],
  },
};

// ── DorianFull V1.10 baseline (also used as V1.11 baseline) ──
// Big scrollbar drag in scenes 2/8/9/10. Saved-data overlay per version
// applied via mergePaths(...) in the registry below.
const DORIAN_FULL_V1_10_BASELINE: Record<string, CodedPath> = {
  ...DORIAN_PATHS,
  '2-HomeScroll': {
    gesture: 'scroll',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      { x: 1050, y: 860, frame: 0, gesture: 'pointer', rotation: 0, scale: 1 },
      { x: 880, y: 860, frame: 20, gesture: 'pointer', rotation: 0, scale: 1 },
      { x: 880, y: 860, frame: 30, gesture: 'drag', rotation: 0, scale: 1 },
      { x: 880, y: 1060, frame: 120, gesture: 'drag', rotation: 0, scale: 1 },
      {
        x: 880,
        y: 1060,
        frame: 125,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: 880,
        y: 1060,
        frame: 150,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
    ],
  },
  '8-ProductPage': {
    gesture: 'scroll',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      {
        x: 1050,
        y: 860,
        frame: 105,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: 880,
        y: 860,
        frame: 110,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      { x: 880, y: 860, frame: 112, gesture: 'drag', rotation: 0, scale: 1 },
      { x: 880, y: 1060, frame: 140, gesture: 'drag', rotation: 0, scale: 1 },
      {
        x: 880,
        y: 1060,
        frame: 145,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: 880,
        y: 1060,
        frame: 150,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
    ],
  },
  '9-ProductDetail': {
    gesture: 'scroll',
    animation: 'cursor-real-black',
    dark: false,
    path: [
      { x: 880, y: 860, frame: 0, gesture: 'pointer', rotation: 0, scale: 0 },
      { x: 880, y: 860, frame: 20, gesture: 'pointer', rotation: 0, scale: 0 },
      { x: 880, y: 860, frame: 25, gesture: 'pointer', rotation: 0, scale: 1 },
      { x: 880, y: 860, frame: 32, gesture: 'drag', rotation: 0, scale: 1 },
      { x: 880, y: 1060, frame: 115, gesture: 'drag', rotation: 0, scale: 1 },
      {
        x: 880,
        y: 1060,
        frame: 120,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: 880,
        y: 1060,
        frame: 122,
        gesture: 'pointer',
        rotation: 0,
        scale: 0,
      },
      {
        x: 650,
        y: 1700,
        frame: 124,
        gesture: 'pointer',
        rotation: 0,
        scale: 0,
      },
      {
        x: 650,
        y: 1700,
        frame: 126,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: 518,
        y: 1635,
        frame: 142,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: 518,
        y: 1635,
        frame: 145,
        gesture: 'click',
        rotation: 0,
        scale: 1,
        duration: 8,
      },
      {
        x: 518,
        y: 1635,
        frame: 158,
        gesture: 'pointer',
        rotation: 0,
        scale: 0,
      },
      {
        x: 400,
        y: 1000,
        frame: 173,
        gesture: 'pointer',
        rotation: 0,
        scale: 0,
      },
      {
        x: 400,
        y: 1000,
        frame: 175,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      { x: 225, y: 337, frame: 187, gesture: 'pointer', rotation: 0, scale: 1 },
      {
        x: 225,
        y: 337,
        frame: 190,
        gesture: 'click',
        rotation: 0,
        scale: 1,
        duration: 6,
      },
      { x: 225, y: 337, frame: 202, gesture: 'pointer', rotation: 0, scale: 0 },
      { x: 350, y: 600, frame: 213, gesture: 'pointer', rotation: 0, scale: 0 },
      { x: 350, y: 600, frame: 215, gesture: 'pointer', rotation: 0, scale: 1 },
      { x: 419, y: 827, frame: 229, gesture: 'pointer', rotation: 0, scale: 1 },
      {
        x: 419,
        y: 827,
        frame: 232,
        gesture: 'click',
        rotation: 0,
        scale: 1,
        duration: 6,
      },
    ],
  },
  '10-StoreDashboard': {
    ...DORIAN_STORES_PATHS['1-StoreDashboard'],
    secondaryLayers: [
      ...(DORIAN_STORES_PATHS['1-StoreDashboard'].secondaryLayers ?? []),
      {
        gesture: 'scroll',
        path: [
          { x: 880, y: 860, frame: 360, gesture: 'pointer', scale: 1 },
          { x: 880, y: 860, frame: 370, gesture: 'drag', scale: 1 },
          { x: 880, y: 1060, frame: 440, gesture: 'drag', scale: 1 },
          { x: 880, y: 1060, frame: 450, gesture: 'pointer', scale: 1 },
        ],
      },
    ],
  },
  '11-MapSearch': DORIAN_STORES_PATHS['2-MapSearch'],
  '12-AIProducts': DORIAN_STORES_PATHS['3-AIProducts'],
};

const CODED_PATHS_REGISTRY: Record<string, Record<string, CodedPath>> = {
  MobileChatDemoCombined: mergePaths(
    COMBINED_PATHS,
    saved.MobileChatDemoCombined,
  ),
  DorianDemo: mergePaths(DORIAN_PATHS, saved.DorianDemo),
  DashmorDemo: { ...saved.DashmorDemo },
  DorianStores: mergePaths(DORIAN_STORES_PATHS, saved.DorianStores),
  DorianStoresDebug: mergePaths(DORIAN_STORES_PATHS, saved.DorianStoresDebug),
  DorianFull: mergePaths(
    {
      ...DORIAN_PATHS,
      '10-StoreDashboard': DORIAN_STORES_PATHS['1-StoreDashboard'],
      '11-MapSearch': DORIAN_STORES_PATHS['2-MapSearch'],
      '12-AIProducts': DORIAN_STORES_PATHS['3-AIProducts'],
    },
    saved.DorianFull,
  ),
  // DorianFullV1-10: scenes 2/8/9/10 use big-scrollbar drag (see baseline above).
  'DorianFullV1-10': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-10'],
  ),
  // DorianFullV1-11: STABLE — promoted from V1.10. Same hardcoded baseline.
  // User-saved overlay carries the V1.11-specific waypoint edits.
  'DorianFullV1-11': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-11'],
  ),
  // DorianFullV1-12: scene 8 click added in ProductPageSceneV1.12 (.tsx).
  // Registry mirrors V1.10 baseline; user-saved overlay carries V1.12 edits.
  'DorianFullV1-12': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-12'],
  ),
  // DorianFullV1-13: soft-pulse click style applied via ClickStyleProvider
  // (no waypoint changes — visual only). Registry mirrors V1.12 baseline.
  'DorianFullV1-13': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-13'],
  ),
  // DorianFullV1-131/132/133: V1.13 + soundtrack (Energy / Creative Minds /
  // Memories). Hand paths identical to V1.13 — diff is audio-only.
  'DorianFullV1-14': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-14'],
  ),
  'DorianFullV1-15': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-15'],
  ),
  'DorianFullV1-16': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-16'],
  ),
  'DorianFullV1-17': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-17'],
  ),
  'DorianFullV1-18': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-18'],
  ),
  'DorianFullV1-19': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-19'],
  ),
  'DorianFullV1-20': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-20'],
  ),
  'DorianFullV1-21': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-21'],
  ),
  'DorianFullV1-22': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-22'] || saved['DorianFullV1-21'],
  ),
  'DorianFullV1-140': mergePaths(
    DORIAN_FULL_V1_10_BASELINE,
    saved['DorianFullV1-140'],
  ),
  SigmaAppDemo: mergePaths(SIGMA_APP_PATHS, saved.SigmaAppDemo),
  SigmaInvestorDemo: { ...saved.SigmaInvestorDemo },
  DemoCreative: mergePaths(DEMO_CREATIVE_PATHS, saved.DemoCreative),
  DemoContext: DEMO_EMPTY_PATHS,
  DemoEditWebsite: DEMO_EMPTY_PATHS,
  DemoSEO: DEMO_EMPTY_PATHS,
  DemoCampaign: DEMO_EMPTY_PATHS,
};

/**
 * Get the coded hand path for a composition scene.
 * Returns null if no coded path exists for this scene.
 */
export function getCodedPath(
  compositionId: string,
  sceneName: string,
): CodedPath | null {
  return CODED_PATHS_REGISTRY[compositionId]?.[sceneName] ?? null;
}

/**
 * Get just the HandPathPoint[] for a scene (convenience).
 */
export function getCodedPathPoints(
  compositionId: string,
  sceneName: string,
): HandPathPoint[] {
  return getCodedPath(compositionId, sceneName)?.path ?? [];
}

/**
 * Get ONLY the user-saved path override (from codedPaths.data.json).
 * Returns null if the user hasn't saved this scene from SceneDirector.
 * Compositions use this to check for overrides before falling back to inline defaults.
 */
export function getSavedPath(
  compositionId: string,
  sceneName: string,
): CodedPath | null {
  return (saved[compositionId]?.[sceneName] as CodedPath) ?? null;
}

/**
 * Get secondary hand layers for a scene (user-added gestures beyond the primary).
 * Returns empty array if none exist.
 */
export function getSavedSecondaryLayers(
  compositionId: string,
  sceneName: string,
): Array<{ gesture: GestureTool; path: HandPathPoint[] }> {
  const coded = getCodedPath(compositionId, sceneName);
  return coded?.secondaryLayers ?? [];
}
