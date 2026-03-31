/**
 * DorianFull — Combined Dorian Demo (scenes 1-9) + Dorian Stores (3 scenes)
 * Uses the full DorianDemo component (cut at scene 9) + DorianStores scenes.
 * White flash transition between the two parts.
 */
import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { SCENES as DORIAN_SCENES } from '../DorianDemo/constants';
import { DorianDemo } from '../DorianDemo';
import { SCENES as STORES_SCENES } from '../DorianStores/constants';
import { StoreDashboardScene } from '../DorianStores/scenes/StoreDashboardScene';
import { MapSearchScene } from '../DorianStores/scenes/MapSearchScene';
import { AIProductsScene } from '../DorianStores/scenes/AIProductsScene';

// ── Timing ──
// DorianDemo scenes 1-9: frames 0-960 (scene 9 ends at 870+90=960)
// DorianStores starts at frame 960
const DORIAN_CUT = DORIAN_SCENES.productDetail.start + DORIAN_SCENES.productDetail.duration; // 960
const STORES_OFFSET = DORIAN_CUT;

export const FULL_VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames:
    STORES_OFFSET +
    STORES_SCENES.dashboard.duration +
    STORES_SCENES.mapSearch.duration +
    STORES_SCENES.aiProducts.duration, // 960 + 660 + 240 + 390 = 2250
};

// Scene info for SceneDirector
export const FULL_SCENE_INFO = [
  { name: '1-Intro', start: DORIAN_SCENES.intro.start, end: DORIAN_SCENES.intro.start + DORIAN_SCENES.intro.duration },
  { name: '2-HomeScroll', start: DORIAN_SCENES.homeScroll.start, end: DORIAN_SCENES.homeScroll.start + DORIAN_SCENES.homeScroll.duration },
  { name: '3-TapBubble', start: DORIAN_SCENES.tapBubble.start, end: DORIAN_SCENES.tapBubble.start + DORIAN_SCENES.tapBubble.duration },
  { name: '4-ChatOpen', start: DORIAN_SCENES.chatOpen.start, end: DORIAN_SCENES.chatOpen.start + DORIAN_SCENES.chatOpen.duration },
  { name: '5-UserTyping', start: DORIAN_SCENES.userTyping.start, end: DORIAN_SCENES.userTyping.start + DORIAN_SCENES.userTyping.duration },
  { name: '6-AIThinking', start: DORIAN_SCENES.aiThinking.start, end: DORIAN_SCENES.aiThinking.start + DORIAN_SCENES.aiThinking.duration },
  { name: '7-AIResponse', start: DORIAN_SCENES.aiResponse.start, end: DORIAN_SCENES.aiResponse.start + DORIAN_SCENES.aiResponse.duration },
  { name: '8-ProductPage', start: DORIAN_SCENES.productPage.start, end: DORIAN_SCENES.productPage.start + DORIAN_SCENES.productPage.duration },
  { name: '9-ProductDetail', start: DORIAN_SCENES.productDetail.start, end: DORIAN_CUT },
  { name: '10-StoreDashboard', start: STORES_OFFSET, end: STORES_OFFSET + STORES_SCENES.dashboard.duration },
  { name: '11-MapSearch', start: STORES_OFFSET + STORES_SCENES.dashboard.duration, end: STORES_OFFSET + STORES_SCENES.dashboard.duration + STORES_SCENES.mapSearch.duration },
  { name: '12-AIProducts', start: STORES_OFFSET + STORES_SCENES.dashboard.duration + STORES_SCENES.mapSearch.duration, end: FULL_VIDEO.durationInFrames },
];

// ── White flash transition at the cut point ──
const TransitionOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [DORIAN_CUT - 15, DORIAN_CUT], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeIn = interpolate(frame, [DORIAN_CUT, DORIAN_CUT + 15], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.max(fadeOut, fadeIn);
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: 'white',
        opacity,
        zIndex: 50,
      }}
    />
  );
};

// ── Main composition ──
export const DorianFull: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#FFFFFF' }}>
      {/* Part 1: DorianDemo (scenes 1-9, cut at frame 960) */}
      <Sequence from={0} durationInFrames={DORIAN_CUT} name="DorianDemo-Part">
        <DorianDemo />
      </Sequence>

      {/* White flash transition */}
      <TransitionOverlay />

      {/* Part 2: DorianStores scenes (starting at frame 960) */}
      <Sequence
        from={STORES_OFFSET}
        durationInFrames={STORES_SCENES.dashboard.duration}
        name="10-StoreDashboard"
      >
        <StoreDashboardScene />
      </Sequence>
      <Sequence
        from={STORES_OFFSET + STORES_SCENES.dashboard.duration}
        durationInFrames={STORES_SCENES.mapSearch.duration}
        name="11-MapSearch"
      >
        <MapSearchScene />
      </Sequence>
      <Sequence
        from={STORES_OFFSET + STORES_SCENES.dashboard.duration + STORES_SCENES.mapSearch.duration}
        durationInFrames={STORES_SCENES.aiProducts.duration}
        name="12-AIProducts"
      >
        <AIProductsScene />
      </Sequence>
    </AbsoluteFill>
  );
};
