/**
 * DorianFullV1_01 — V1.01 of DorianFull.
 *
 * Diff vs V1.00 (DorianFull.tsx):
 *   - Uses DorianDemoV1_01 (scene 9 extended 90f → 180f)
 *   - DORIAN_CUT shifts 960 → 1050; downstream offsets +90
 *   - White-flash TransitionOverlay REMOVED
 *   - 9→10 transition: scene 9 slides off left (handled inside ProductDetailSceneV1_01),
 *     scene 10 mounts 20f early at frame 1030 so it's visible underneath as scene 9 leaves
 *   - JSX z-order: Stores Sequence rendered FIRST (lower z), Demo Sequence SECOND
 *     so DorianDemo sits on top during the 20f slide overlap
 *   - Total duration: 2430 → 2520 (+3s)
 *
 * See .claude/rules/version-safe-iteration.md for bump procedure.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {
  DorianDemoV1_01,
  SCENES_V1_01 as DORIAN_SCENES,
} from '../DorianDemo/DorianDemoV1.01';
import { OutroScene } from '../DorianDemo/scenes/OutroScene';
import { SCENES as STORES_SCENES } from '../DorianStores/constants';
import { StoreDashboardScene } from '../DorianStores/scenes/StoreDashboardScene';
import { MapSearchScene } from '../DorianStores/scenes/MapSearchScene';
import { AIProductsScene } from '../DorianStores/scenes/AIProductsScene';
import { getCodedAudio } from '../SceneDirector/layers';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';
import { AudioEntriesContext } from '../SceneDirector/AudioLayerRenderer';
import { computeVolumeAtFrame } from '../../lib/audioEnvelope';

// ── Timing ──
const DORIAN_CUT =
  DORIAN_SCENES.productDetail.start + DORIAN_SCENES.productDetail.duration; // 1050
const SLIDE_OVERLAP = 20; // frames where scene 9 is sliding out and scene 10 is visible underneath
const STORES_OFFSET = DORIAN_CUT; // 1050
const STORES_TOTAL =
  STORES_SCENES.dashboard.duration +
  STORES_SCENES.mapSearch.duration +
  STORES_SCENES.aiProducts.duration; // 1290
const CLOSING_OFFSET = STORES_OFFSET + STORES_TOTAL; // 2340
const CLOSING_DURATION = DORIAN_SCENES.outro.duration; // 180

export const FULL_VIDEO_V1_01 = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: CLOSING_OFFSET + CLOSING_DURATION, // 2340 + 180 = 2520
};

export const FULL_SCENE_INFO_V1_01 = [
  {
    name: '1-Intro',
    start: DORIAN_SCENES.intro.start,
    end: DORIAN_SCENES.intro.start + DORIAN_SCENES.intro.duration,
  },
  {
    name: '2-HomeScroll',
    start: DORIAN_SCENES.homeScroll.start,
    end: DORIAN_SCENES.homeScroll.start + DORIAN_SCENES.homeScroll.duration,
  },
  {
    name: '3-TapBubble',
    start: DORIAN_SCENES.tapBubble.start,
    end: DORIAN_SCENES.tapBubble.start + DORIAN_SCENES.tapBubble.duration,
  },
  {
    name: '4-ChatOpen',
    start: DORIAN_SCENES.chatOpen.start,
    end: DORIAN_SCENES.chatOpen.start + DORIAN_SCENES.chatOpen.duration,
  },
  {
    name: '5-UserTyping',
    start: DORIAN_SCENES.userTyping.start,
    end: DORIAN_SCENES.userTyping.start + DORIAN_SCENES.userTyping.duration,
  },
  {
    name: '6-AIThinking',
    start: DORIAN_SCENES.aiThinking.start,
    end: DORIAN_SCENES.aiThinking.start + DORIAN_SCENES.aiThinking.duration,
  },
  {
    name: '7-AIResponse',
    start: DORIAN_SCENES.aiResponse.start,
    end: DORIAN_SCENES.aiResponse.start + DORIAN_SCENES.aiResponse.duration,
  },
  {
    name: '8-ProductPage',
    start: DORIAN_SCENES.productPage.start,
    end: DORIAN_SCENES.productPage.start + DORIAN_SCENES.productPage.duration,
  },
  {
    name: '9-ProductDetail',
    start: DORIAN_SCENES.productDetail.start,
    end: DORIAN_CUT,
  },
  {
    name: '10-StoreDashboard',
    start: STORES_OFFSET,
    end: STORES_OFFSET + STORES_SCENES.dashboard.duration,
  },
  {
    name: '11-MapSearch',
    start: STORES_OFFSET + STORES_SCENES.dashboard.duration,
    end:
      STORES_OFFSET +
      STORES_SCENES.dashboard.duration +
      STORES_SCENES.mapSearch.duration,
  },
  {
    name: '12-AIProducts',
    start:
      STORES_OFFSET +
      STORES_SCENES.dashboard.duration +
      STORES_SCENES.mapSearch.duration,
    end: CLOSING_OFFSET,
  },
  {
    name: '13-Closing',
    start: CLOSING_OFFSET,
    end: FULL_VIDEO_V1_01.durationInFrames,
  },
];

// ── Audio (mirrors V1.00 pattern: DorianDemoV1_01 handles scenes 1-9, this handles 10-13) ──
const STORES_AUDIO_SCENES = [
  { name: '10-StoreDashboard', start: STORES_OFFSET },
  {
    name: '11-MapSearch',
    start: STORES_OFFSET + STORES_SCENES.dashboard.duration,
  },
  {
    name: '12-AIProducts',
    start:
      STORES_OFFSET +
      STORES_SCENES.dashboard.duration +
      STORES_SCENES.mapSearch.duration,
  },
  { name: '13-Closing', start: CLOSING_OFFSET },
];

const StoresAudioFromLayersV1_01: React.FC = () => {
  const entries = React.useContext(AudioEntriesContext);
  const storesEntries = entries.filter((e) => e.globalFrom >= DORIAN_CUT);
  return (
    <>
      {storesEntries.map((e) => (
        <Sequence
          key={e.id}
          from={e.globalFrom}
          durationInFrames={e.durationInFrames || 60}
        >
          <Audio
            src={staticFile(e.file)}
            volume={
              e.fadeInFrames || e.fadeOutFrames
                ? (f) =>
                    computeVolumeAtFrame(f, {
                      baseVolume: e.volume,
                      fadeInFrames: e.fadeInFrames,
                      fadeOutFrames: e.fadeOutFrames,
                      totalFrames: e.durationInFrames || 60,
                    })
                : e.volume
            }
          />
        </Sequence>
      ))}
    </>
  );
};

const DorianFullStoresAudioV1_01: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of STORES_AUDIO_SCENES) {
    // Read both V1.00 (shared assets, e.g. closing scene chime) and V1.01 keys
    const entries = [
      ...getCodedAudio('DorianFull', scene.name),
      ...getCodedAudio('DorianFullV1.01', scene.name),
    ];
    for (const entry of entries) {
      const globalFrom = scene.start + entry.startFrame;
      audioElements.push(
        <Sequence
          key={`${scene.name}-${entry.file}-${entry.startFrame}`}
          from={globalFrom}
          durationInFrames={entry.durationInFrames}
        >
          <Audio src={staticFile(entry.file)} volume={entry.volume} />
        </Sequence>,
      );
    }
  }
  return <>{audioElements}</>;
};

// Optional faint cue at the slide moment — uncomment when SFX picked.
// Keeping commented to avoid silent dependency on a file that doesn't exist yet.
// const SlideTransitionAudio: React.FC = () => (
//   <Sequence from={DORIAN_CUT - SLIDE_OVERLAP} durationInFrames={SLIDE_OVERLAP}>
//     <Audio src={staticFile('audio/sfx/whoosh.wav')} volume={0.4} />
//   </Sequence>
// );

// ── Main composition ──
export const DorianFullV1_01: React.FC = () => {
  // useCurrentFrame referenced indirectly to keep React subscription if needed later
  useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: '#FFFFFF' }}>
      <DorianFullStoresAudioV1_01 />
      <StoresAudioFromLayersV1_01 />

      {/* ── z-order: Stores rendered FIRST (lower z) so Demo (on top) can slide off and reveal it ── */}

      {/* Part 2 (rendered first for z-order): Stores scenes — scene 10 mounts SLIDE_OVERLAP frames early */}
      <Sequence
        from={STORES_OFFSET - SLIDE_OVERLAP}
        durationInFrames={STORES_SCENES.dashboard.duration + SLIDE_OVERLAP}
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
        from={
          STORES_OFFSET +
          STORES_SCENES.dashboard.duration +
          STORES_SCENES.mapSearch.duration
        }
        durationInFrames={STORES_SCENES.aiProducts.duration}
        name="12-AIProducts"
      >
        <AIProductsScene />
      </Sequence>
      <Sequence
        from={CLOSING_OFFSET}
        durationInFrames={CLOSING_DURATION}
        name="13-Closing"
      >
        <OutroScene />
      </Sequence>

      {/* Part 1 (rendered last = top z): DorianDemoV1.01 (scenes 1-9). Scene 9 internally
          slides off left during local frames 160-180 (= global 1030-1050), revealing scene 10. */}
      <Sequence
        from={0}
        durationInFrames={DORIAN_CUT}
        name="DorianDemo-Part-V1.01"
      >
        <DorianDemoV1_01 />
      </Sequence>
    </AbsoluteFill>
  );
};
