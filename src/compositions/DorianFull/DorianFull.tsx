/**
 * DorianFull — Combined Dorian Demo (scenes 1-9) + Dorian Stores (3 scenes)
 * Uses the full DorianDemo component (cut at scene 9) + DorianStores scenes.
 * White flash transition between the two parts.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { SCENES as DORIAN_SCENES } from '../DorianDemo/constants';
import { DorianDemo } from '../DorianDemo';
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
// DorianDemo scenes 1-9: frames 0-960 (scene 9 ends at 870+90=960)
// DorianStores starts at frame 960
const DORIAN_CUT =
  DORIAN_SCENES.productDetail.start + DORIAN_SCENES.productDetail.duration; // 960
const STORES_OFFSET = DORIAN_CUT;
const STORES_TOTAL =
  STORES_SCENES.dashboard.duration +
  STORES_SCENES.mapSearch.duration +
  STORES_SCENES.aiProducts.duration; // 660 + 240 + 390 = 1290
const CLOSING_OFFSET = STORES_OFFSET + STORES_TOTAL; // 2250
const CLOSING_DURATION = DORIAN_SCENES.outro.duration; // 180 frames / 6s

export const FULL_VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: CLOSING_OFFSET + CLOSING_DURATION, // 2250 + 180 = 2430
};

// Scene info for SceneDirector
export const FULL_SCENE_INFO = [
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
    end: FULL_VIDEO.durationInFrames,
  },
];

// ── Stores audio (scenes 10-12). DorianDemo renders its own audio for scenes 1-9. ──
// Skipped in SceneDirector — audio layers + AudioFromLayers handle playback there.
const STORES_AUDIO_SCENES = [
  {
    name: '10-StoreDashboard',
    start: STORES_OFFSET,
  },
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
  {
    name: '13-Closing',
    start: CLOSING_OFFSET,
  },
];

// Plays only user-added audio layers whose globalFrom >= DORIAN_CUT (stores half).
// Avoids double-playback: DorianDemo's inner <AudioFromLayers /> (inside its
// 0..DORIAN_CUT Sequence) already handles entries for frames 0..DORIAN_CUT;
// parent Sequence bounds prevent those entries from playing past DORIAN_CUT.
const StoresAudioFromLayers: React.FC = () => {
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

const DorianFullStoresAudio: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of STORES_AUDIO_SCENES) {
    const entries = getCodedAudio('DorianFull', scene.name);
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

// ── White flash transition at the cut point ──
const TransitionOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [DORIAN_CUT - 15, DORIAN_CUT, DORIAN_CUT + 15],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
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
      {/* Audio: DorianDemo renders scenes 1-9 audio inside its own Sequence.
          DorianFullStoresAudio renders scenes 10-12 audio at top level.
          AudioFromLayers renders SceneDirector user-added audio across full duration. */}
      <DorianFullStoresAudio />
      <StoresAudioFromLayers />

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

      {/* Closing scene — mirrors the opening Intro (logo + tagline + CTA) */}
      <Sequence
        from={CLOSING_OFFSET}
        durationInFrames={CLOSING_DURATION}
        name="13-Closing"
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
