/**
 * DorianFullV1_22 — V1.22 of DorianFull.
 *
 * Diff vs V1.20 (4 changes):
 *   1. Scene 8 (ProductPage) extended: 150 → 220 frames (+70). Same scrollbar
 *      drag at f110-140, then SLOW travel to TV card (f142 → f175), HOLD at
 *      card (f175 → f200), click at f200, fade-out at f210.
 *   2. New SD-editable click trail layer in scene 8 (codedPaths.data.json
 *      DorianFullV1-22/8-ProductPage.secondaryLayers) — pointer trail from
 *      end-of-scroll (812, 1068) → TV card (518, 1150) → click. Visualized in
 *      SceneDirector overlay; render uses ProductPageSceneV1.12's path.
 *   3. ClickFlash overlay at TV card (518, 1150) at scene-local f200 — teal
 *      expanding ring + brief opacity flash so the click reads as deliberate
 *      navigation. Wired via CODED_CLICK_FLASH_REGISTRY[DorianFullV1-22] in
 *      layers.ts. Reusable across all compositions.
 *   4. Click SFX (send-click.wav) re-anchored from f147 → f200 (scene-local)
 *      to match the new click frame. Volume + duration unchanged.
 *
 * Extension cascade: outro.start 1120 → 1190, STORES_OFFSET 1120 → 1190,
 * CLOSING_OFFSET +70, total durationInFrames +70 vs V1.13.
 *
 * Architecture: V1.22 STOPS wrapping V1.20 (which wrapped V1.13). It builds
 * the composition directly using DorianDemoV1_12's `sceneOverrides` prop —
 * the C lever from this session's velocity work. Future versions extending
 * any scene will follow this pattern: pass overrides instead of forking.
 *
 * Soundtrack: Kevin MacLeod "Funkorama" (CC-BY 4.0). Attribution: credit
 * "Kevin MacLeod (incompetech.com)" in the video description.
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
  resolveScenesV1_12,
  resolveDurationV1_12,
  type SceneOverridesV1_12,
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
import { BackgroundMusic } from '../../components/BackgroundMusic';
import { ClickFlashFromRegistry } from '../../components/ClickFlash';

// ── V1.22 scene-8 extension config ─────────────────────────────────────────
// Extending productPage.duration by 70 frames cascades into productDetail and
// outro starts. resolveScenesV1_12 handles the cascade automatically.
const SCENE_OVERRIDES_V1_22: SceneOverridesV1_12 = {
  productPage: {
    duration: 220,
    sceneConfig: {
      tvCardX: 518,
      tvCardY: 1150,
      preClickFrame: 175, // cursor arrives at TV card (slow ~33f from scrollbar release)
      clickFrame: 200, // click 25f after arrival (HOLD reads as "user is reading")
      clickDuration: 6,
      fadeOutFrame: 210,
    },
  },
};

const DORIAN_SCENES_V1_22 = resolveScenesV1_12(SCENE_OVERRIDES_V1_22);
// Sanity: build-time confirmation the cascade resolves to the expected total.
void resolveDurationV1_12(SCENE_OVERRIDES_V1_22);

const DORIAN_CUT =
  DORIAN_SCENES_V1_22.productDetail.start +
  DORIAN_SCENES_V1_22.productDetail.duration;
const STORES_OFFSET = DORIAN_CUT;
const STORES_TOTAL =
  STORES_SCENES.dashboard.duration +
  STORES_SCENES.mapSearch.duration +
  STORES_SCENES.aiProducts.duration;
const CLOSING_OFFSET = STORES_OFFSET + STORES_TOTAL;
const CLOSING_DURATION = DORIAN_SCENES_V1_22.outro.duration;

const LOADER_END = STORES_OFFSET + 25;

export const FULL_VIDEO_V1_22 = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: CLOSING_OFFSET + CLOSING_DURATION,
};

// Per-scene zoom levels — must match what the scene file applies via
// `transform: scale(zoom)`. SceneDirector reads these so its preview hand
// size formula `120 * (zoom / 1.8)` matches the rendered video's
// `handSizeForZoom(zoomScale)`. Without this, SD always defaults to 1.8 and
// shows a 120px cursor on chat scenes (4-7) that render at ~183px.
//   - Scenes 1, 2, 8, 9: phone at base scale 1.8
//   - Scenes 3-7: chat-zoomed to 2.75
//   - 3-TapBubble + 8-ProductPage: scenes interpolate the zoom; we pin to
//     the END value (where the cursor click lands).
export const FULL_SCENE_INFO_V1_22 = [
  {
    name: '1-Intro',
    start: DORIAN_SCENES_V1_22.intro.start,
    end: DORIAN_SCENES_V1_22.intro.start + DORIAN_SCENES_V1_22.intro.duration,
    zoom: 1.8,
  },
  {
    name: '2-HomeScroll',
    start: DORIAN_SCENES_V1_22.homeScroll.start,
    end:
      DORIAN_SCENES_V1_22.homeScroll.start +
      DORIAN_SCENES_V1_22.homeScroll.duration,
    zoom: 1.8,
  },
  {
    name: '3-TapBubble',
    start: DORIAN_SCENES_V1_22.tapBubble.start,
    end:
      DORIAN_SCENES_V1_22.tapBubble.start +
      DORIAN_SCENES_V1_22.tapBubble.duration,
    zoom: 2.75,
  },
  {
    name: '4-ChatOpen',
    start: DORIAN_SCENES_V1_22.chatOpen.start,
    end:
      DORIAN_SCENES_V1_22.chatOpen.start +
      DORIAN_SCENES_V1_22.chatOpen.duration,
    zoom: 2.75,
  },
  {
    name: '5-UserTyping',
    start: DORIAN_SCENES_V1_22.userTyping.start,
    end:
      DORIAN_SCENES_V1_22.userTyping.start +
      DORIAN_SCENES_V1_22.userTyping.duration,
    zoom: 2.75,
  },
  {
    name: '6-AIThinking',
    start: DORIAN_SCENES_V1_22.aiThinking.start,
    end:
      DORIAN_SCENES_V1_22.aiThinking.start +
      DORIAN_SCENES_V1_22.aiThinking.duration,
    zoom: 2.75,
  },
  {
    name: '7-AIResponse',
    start: DORIAN_SCENES_V1_22.aiResponse.start,
    end:
      DORIAN_SCENES_V1_22.aiResponse.start +
      DORIAN_SCENES_V1_22.aiResponse.duration,
    zoom: 2.75,
  },
  {
    name: '8-ProductPage',
    start: DORIAN_SCENES_V1_22.productPage.start,
    end:
      DORIAN_SCENES_V1_22.productPage.start +
      DORIAN_SCENES_V1_22.productPage.duration,
    zoom: 1.8, // zooms OUT from 2.75 → 1.8; cursor lands at 1.8
  },
  {
    name: '9-ProductDetail',
    start: DORIAN_SCENES_V1_22.productDetail.start,
    end: DORIAN_CUT,
    zoom: 1.8,
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
    end: FULL_VIDEO_V1_22.durationInFrames,
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

const StoresAudioFromLayersV1_22: React.FC = () => {
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

const DorianFullStoresAudioV1_22: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of STORES_AUDIO_SCENES) {
    const entries = [
      ...getCodedAudio('DorianFull', scene.name),
      ...getCodedAudio('DorianFullV1-22', scene.name),
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

const PageLoadOverlayV1_22: React.FC = () => {
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

/**
 * Soundtrack for V1.22.
 *
 * `noMusic` prop suppresses the embedded music track entirely. Used by the
 * 2x post-process pipeline (`scripts/render-fast2x.mjs`): we render a
 * music-less master, speed up video + SFX 2x, then overlay the music at
 * native 1x tempo as a separate ffmpeg pass. That way the visuals/SFX feel
 * fast but the music keeps its groove instead of getting chipmunked by
 * `atempo=2.0`.
 */
const SoundtrackV1_22: React.FC<{ noMusic?: boolean }> = ({
  noMusic = false,
}) => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;
  if (noMusic) return null;
  return (
    <BackgroundMusic
      src={staticFile('audio/music/kml-funkorama.mp3')}
      volume={0.15}
      fadeInFrames={30}
      fadeOutFrames={60}
    />
  );
};

// Scene-name → global-frame offset table for ClickFlashFromRegistry.
const CLICK_FLASH_SCENE_OFFSETS: Record<string, number> = {
  '1-Intro': DORIAN_SCENES_V1_22.intro.start,
  '2-HomeScroll': DORIAN_SCENES_V1_22.homeScroll.start,
  '3-TapBubble': DORIAN_SCENES_V1_22.tapBubble.start,
  '4-ChatOpen': DORIAN_SCENES_V1_22.chatOpen.start,
  '5-UserTyping': DORIAN_SCENES_V1_22.userTyping.start,
  '6-AIThinking': DORIAN_SCENES_V1_22.aiThinking.start,
  '7-AIResponse': DORIAN_SCENES_V1_22.aiResponse.start,
  '8-ProductPage': DORIAN_SCENES_V1_22.productPage.start,
  '9-ProductDetail': DORIAN_SCENES_V1_22.productDetail.start,
  '10-StoreDashboard': STORES_OFFSET,
  '11-MapSearch': STORES_OFFSET + STORES_SCENES.dashboard.duration,
  '12-AIProducts':
    STORES_OFFSET +
    STORES_SCENES.dashboard.duration +
    STORES_SCENES.mapSearch.duration,
  '13-Closing': CLOSING_OFFSET,
};

/**
 * Top-level prop: `noMusic` flips the embedded BackgroundMusic off so the
 * 2x render pipeline can overlay native-tempo music after speed-up.
 *
 * Pass at render time via `--props='{"noMusic":true}'`. Default false so
 * Studio + plain `npm run render:dorian-full:v1.22:1x` keep music inline.
 */
export type DorianFullV1_22Props = {
  noMusic?: boolean;
};

export const DorianFullV1_22: React.FC<DorianFullV1_22Props> = ({
  noMusic = false,
}) => {
  return (
    <ClickStyleProvider value="soft-pulse">
      <AbsoluteFill style={{ background: '#FFFFFF' }}>
        <DorianFullStoresAudioV1_22 />
        <StoresAudioFromLayersV1_22 />
        <SoundtrackV1_22 noMusic={noMusic} />

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
          name="DorianDemo-Part-V1.22"
        >
          <DorianDemoV1_12
            sceneOverrides={SCENE_OVERRIDES_V1_22}
            compositionId="DorianFullV1-22"
          />
        </Sequence>

        {/* Click flash overlays — read from CODED_CLICK_FLASH_REGISTRY in
            layers.ts. Currently: scene 8 TV-card click at f200 (composition
            global f920). */}
        <ClickFlashFromRegistry
          compositionId="DorianFullV1-22"
          sceneOffsets={CLICK_FLASH_SCENE_OFFSETS}
        />

        <PageLoadOverlayV1_22 />
      </AbsoluteFill>
    </ClickStyleProvider>
  );
};
