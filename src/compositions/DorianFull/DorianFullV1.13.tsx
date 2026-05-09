/**
 * DorianFullV1_13 — V1.13 of DorianFull.
 *
 * Diff vs V1.09:
 *   - Uses DorianDemoV1_12 (scene 9 ProductDetail prepended with big
 *     scrollbar-drag before existing click sequence).
 *   - Replaces StoreDashboardScene with StoreDashboardSceneV1_12 — adds
 *     big scrollbar-drag during best-sellers scroll window (scene-local
 *     frames 360-460).
 *   - Scenes 2 (HomeScroll) + 8 (ProductPage) inherit V1.09's big scrollbar.
 *   - All timing identical to V1.09: DORIAN_CUT=1120, total=2620.
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
  interpolate,
} from 'remotion';
import {
  DorianDemoV1_12,
  SCENES_V1_12 as DORIAN_SCENES,
} from '../DorianDemo/DorianDemoV1.12';
import { OutroScene } from '../DorianDemo/scenes/OutroScene';
import { SCENES as STORES_SCENES, COLORS } from '../DorianStores/constants';
import { StoreDashboardSceneV1_12 } from '../DorianStores/scenes/StoreDashboardSceneV1.12';
import { ClickStyleProvider } from '../../components/FloatingHand/ClickStyleContext';
import { MapSearchScene } from '../DorianStores/scenes/MapSearchScene';
import { AIProductsScene } from '../DorianStores/scenes/AIProductsScene';
import { getCodedAudio } from '../SceneDirector/layers';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';
import { AudioEntriesContext } from '../SceneDirector/AudioLayerRenderer';
import { computeVolumeAtFrame } from '../../lib/audioEnvelope';
import { fontFamily } from '../../lib/fonts';

const DORIAN_CUT =
  DORIAN_SCENES.productDetail.start + DORIAN_SCENES.productDetail.duration;
const STORES_OFFSET = DORIAN_CUT;
const STORES_TOTAL =
  STORES_SCENES.dashboard.duration +
  STORES_SCENES.mapSearch.duration +
  STORES_SCENES.aiProducts.duration;
const CLOSING_OFFSET = STORES_OFFSET + STORES_TOTAL;
const CLOSING_DURATION = DORIAN_SCENES.outro.duration;

const LOADER_END = STORES_OFFSET + 25;

export const FULL_VIDEO_V1_13 = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: CLOSING_OFFSET + CLOSING_DURATION,
};

export const FULL_SCENE_INFO_V1_13 = [
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
    end: FULL_VIDEO_V1_13.durationInFrames,
  },
];

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

const StoresAudioFromLayersV1_13: React.FC = () => {
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

const DorianFullStoresAudioV1_13: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of STORES_AUDIO_SCENES) {
    const entries = [
      ...getCodedAudio('DorianFull', scene.name),
      ...getCodedAudio('DorianFullV1-13', scene.name),
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

const PageLoadOverlayV1_13: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < STORES_OFFSET || frame >= LOADER_END) return null;

  const fadeOut = interpolate(frame, [LOADER_END - 12, LOADER_END], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const spinDegrees = (frame - (STORES_OFFSET - 12)) * 8;

  return (
    <AbsoluteFill
      style={{
        zIndex: 9999,
        pointerEvents: 'none',
        background: `rgba(255, 255, 255, ${fadeOut})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(1.8)',
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            width: 390 + 24,
            height: 844 + 24,
            background: '#1a1a1a',
            borderRadius: 55,
            padding: 12,
          }}
        >
          <div
            style={{
              width: 390,
              height: 844,
              borderRadius: 45,
              overflow: 'hidden',
              position: 'relative',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '4px solid #E2E8F0',
                borderTopColor: COLORS.primary,
                transform: `rotate(${spinDegrees}deg)`,
                marginBottom: 16,
              }}
            />
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.text,
                fontFamily,
              }}
            >
              Opening My Store...
            </div>
            <div
              style={{
                fontSize: 11,
                color: COLORS.textLight,
                fontFamily,
                marginTop: 4,
              }}
            >
              Powered by Dorian AI
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DorianFullV1_13: React.FC = () => {
  // V1.13: wrap the full tree in ClickStyleProvider value="soft-pulse" so
  // every nested FloatingHand renders with soft-pulse + no ripple. Children
  // (DorianDemoV1.12, scenes) are reused unchanged — only the click visual
  // changes via context.
  return (
    <ClickStyleProvider value="soft-pulse">
      <AbsoluteFill style={{ background: '#FFFFFF' }}>
        <DorianFullStoresAudioV1_13 />
        <StoresAudioFromLayersV1_13 />

        <Sequence
          from={STORES_OFFSET}
          durationInFrames={STORES_SCENES.dashboard.duration}
          name="10-StoreDashboard"
        >
          <StoreDashboardSceneV1_12 />
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

        <Sequence
          from={0}
          durationInFrames={DORIAN_CUT}
          name="DorianDemo-Part-V1.13"
        >
          <DorianDemoV1_12 />
        </Sequence>

        <PageLoadOverlayV1_13 />
      </AbsoluteFill>
    </ClickStyleProvider>
  );
};
