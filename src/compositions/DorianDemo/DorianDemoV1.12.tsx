/**
 * DorianDemoV1_12 — V1.12 of DorianDemo.
 *
 * Diff vs V1.09:
 *   - Scene 9 (ProductDetail) replaced with ProductDetailSceneV1_12: cursor
 *     does the BIG scrollbar drag (X=880, Y 860→1060) at scene start, then
 *     teleports invisibly to the V1.08 click sequence (Add to Cart →
 *     hamburger → My Store), unchanged.
 *   - Scenes 2 (HomeScroll) + 8 (ProductPage) already use the big scrollbar
 *     from V1.09 — reused unchanged.
 *   - Timing identical to V1.09.
 *
 * Companion: DorianFullV1.12.tsx uses this. See .claude/rules/version-safe-iteration.md.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { SCENES } from './constants';
import {
  IntroScene,
  TapAIBubbleScene,
  ChatOpenScene,
  UserTypingScene,
  AIThinkingScene,
  AIResponseScene,
  OutroScene,
} from './scenes';
import { HomeScrollSceneV1_09 } from './scenes/HomeScrollSceneV1.09';
import {
  ProductPageSceneV1_12,
  type ProductPageSceneV1_12_SceneConfig,
} from './scenes/ProductPageSceneV1.12';
import { ProductDetailSceneV1_12 } from './scenes/ProductDetailSceneV1.12';
import { getCodedAudio } from '../SceneDirector/layers';
import {
  getSavedSecondaryLayers,
  getCodedPath,
} from '../SceneDirector/codedPaths';
import { GESTURE_PRESETS } from '../SceneDirector/gestures';
import { FloatingHand } from '../../components/FloatingHand';
import { DEFAULT_PHYSICS } from '../../components/FloatingHand/types';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';
import { SDOverrideProvider } from '../../components/FloatingHand/SDOverrideContext';
import { AudioFromLayers } from '../SceneDirector/AudioLayerRenderer';

export const SCENES_V1_12 = {
  intro: SCENES.intro,
  homeScroll: SCENES.homeScroll,
  tapBubble: SCENES.tapBubble,
  chatOpen: SCENES.chatOpen,
  userTyping: SCENES.userTyping,
  aiThinking: SCENES.aiThinking,
  aiResponse: SCENES.aiResponse,
  productPage: SCENES.productPage,
  productDetail: { start: 870, duration: 250 },
  outro: { start: 1120, duration: 180 },
};

export const VIDEO_V1_12 = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1300,
};

// ── C lever (sceneOverrides + cascade) ──────────────────────────────────────
// Future versions of DorianFull (V1.21+) extend specific scene durations
// without forking this file. They pass `sceneOverrides` to <DorianDemoV1_12 />
// and the component cascades the deltas — extending productPage by 70f shifts
// productDetail.start +70 and outro.start +70 automatically. Total duration
// from `resolveDurationV1_12(overrides)`.
//
// Only durations are configurable. Starts cascade automatically. The first
// 7 scenes (intro → aiResponse) are anchored to V1.00 timing — never
// overridable, because they're shared across all DorianFull variants and
// any adjustment would ripple through every version's audio cues.

export interface SceneOverridesV1_12 {
  productPage?: {
    duration?: number;
    /** Pass-through to ProductPageSceneV1_12 for click-target / click-frame tweaks. */
    sceneConfig?: ProductPageSceneV1_12_SceneConfig;
  };
  productDetail?: { duration?: number };
  outro?: { duration?: number };
}

export type ResolvedScenesV1_12 = typeof SCENES_V1_12;

/**
 * Cascade scene-duration overrides over the V1.12 base. productPage extends →
 * productDetail.start shifts → outro.start shifts. Returns a fully-resolved
 * scenes object with the same shape as SCENES_V1_12.
 */
export function resolveScenesV1_12(
  overrides: SceneOverridesV1_12 = {},
): ResolvedScenesV1_12 {
  const ppDur =
    overrides.productPage?.duration ?? SCENES_V1_12.productPage.duration;
  const pdDur =
    overrides.productDetail?.duration ?? SCENES_V1_12.productDetail.duration;
  const outDur = overrides.outro?.duration ?? SCENES_V1_12.outro.duration;
  const ppShift = ppDur - SCENES_V1_12.productPage.duration;
  const pdShift = ppShift + (pdDur - SCENES_V1_12.productDetail.duration);
  return {
    intro: SCENES_V1_12.intro,
    homeScroll: SCENES_V1_12.homeScroll,
    tapBubble: SCENES_V1_12.tapBubble,
    chatOpen: SCENES_V1_12.chatOpen,
    userTyping: SCENES_V1_12.userTyping,
    aiThinking: SCENES_V1_12.aiThinking,
    aiResponse: SCENES_V1_12.aiResponse,
    productPage: {
      start: SCENES_V1_12.productPage.start,
      duration: ppDur,
    },
    productDetail: {
      start: SCENES_V1_12.productDetail.start + ppShift,
      duration: pdDur,
    },
    outro: {
      start: SCENES_V1_12.outro.start + pdShift,
      duration: outDur,
    },
  };
}

export function resolveDurationV1_12(
  overrides: SceneOverridesV1_12 = {},
): number {
  const r = resolveScenesV1_12(overrides);
  return r.outro.start + r.outro.duration;
}

interface SceneEntry {
  name: string;
  start: number;
  duration: number;
}

function buildSceneEntries(scenes: ResolvedScenesV1_12): SceneEntry[] {
  return [
    { name: '1-Intro', ...scenes.intro },
    { name: '2-HomeScroll', ...scenes.homeScroll },
    { name: '3-TapBubble', ...scenes.tapBubble },
    { name: '4-ChatOpen', ...scenes.chatOpen },
    { name: '5-UserTyping', ...scenes.userTyping },
    { name: '6-AIThinking', ...scenes.aiThinking },
    { name: '7-AIResponse', ...scenes.aiResponse },
    { name: '8-ProductPage', ...scenes.productPage },
    { name: '9-ProductDetail', ...scenes.productDetail },
    { name: '10-Outro', ...scenes.outro },
  ];
}

const DorianAudioV1_12: React.FC<{ sceneEntries: SceneEntry[] }> = ({
  sceneEntries,
}) => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of sceneEntries) {
    const entries = [
      ...getCodedAudio('DorianDemo', scene.name),
      ...getCodedAudio('DorianDemoV1.12', scene.name),
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

const DorianSecondaryHandsV1_12: React.FC<{ sceneEntries: SceneEntry[] }> = ({
  sceneEntries,
}) => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const elements: React.ReactElement[] = [];
  for (const scene of sceneEntries) {
    // Scenes 2 (HomeScroll) and 8 (ProductPage) are owned entirely by
    // V1.09 hardcoded paths — skip secondary-hand replay from saved data.
    if (scene.name === '2-HomeScroll' || scene.name === '8-ProductPage')
      continue;
    const layers = getSavedSecondaryLayers('DorianDemo', scene.name);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const preset = GESTURE_PRESETS[layer.gesture] || GESTURE_PRESETS.click;
      const codedPath = getCodedPath('DorianDemo', scene.name);
      const dark = codedPath?.dark ?? true;
      elements.push(
        <Sequence
          key={`${scene.name}-hand-${i}`}
          from={scene.start}
          durationInFrames={scene.duration}
        >
          <FloatingHand
            path={layer.path}
            startFrame={0}
            animation={codedPath?.animation ?? preset.animation}
            size={preset.size}
            showRipple={preset.showRipple}
            dark={dark}
            physics={{ ...DEFAULT_PHYSICS, ...preset.physics }}
          />
        </Sequence>,
      );
    }
  }
  return <>{elements}</>;
};

interface DorianDemoV1_12_Props {
  /** Optional scene-duration overrides + per-scene config (V1.21+). When
   *  omitted, uses base SCENES_V1_12 timing — V1.13–V1.20 behavior unchanged. */
  sceneOverrides?: SceneOverridesV1_12;
  /** Optional parent composition ID. When set, scenes that support SD
   *  overrides (currently HomeScrollSceneV1_09) read saved waypoints from
   *  this comp's entry. V1.22+ passes "DorianFullV1-22" here so SD edits
   *  to scene 2 actually render. V1.13–V1.21 omit this — scenes keep their
   *  hardcoded paths byte-stable. */
  compositionId?: string;
}

export const DorianDemoV1_12: React.FC<DorianDemoV1_12_Props> = ({
  sceneOverrides,
  compositionId,
} = {}) => {
  const scenes = resolveScenesV1_12(sceneOverrides);
  const sceneEntries = buildSceneEntries(scenes);
  const productPageConfig = sceneOverrides?.productPage?.sceneConfig;

  // SD-override wrapper: when compositionId is set (V1.22+), wrap each
  // scene with SDOverrideProvider so FloatingHand instances inside —
  // including frozen scenes 3-7 — read SD-saved props per scene name.
  // V1.13–V1.21 don't pass compositionId → MaybeOverride is a pass-through
  // → byte-stable. See .claude/rules/sd-overrides-must-honor-saved.md.
  const MaybeOverride: React.FC<{
    sceneName: string;
    children: React.ReactNode;
  }> = ({ sceneName, children }) => {
    if (!compositionId) return <>{children}</>;
    return (
      <SDOverrideProvider compositionId={compositionId} sceneName={sceneName}>
        {children}
      </SDOverrideProvider>
    );
  };

  return (
    <AbsoluteFill style={{ background: 'transparent' }}>
      <DorianAudioV1_12 sceneEntries={sceneEntries} />
      <AudioFromLayers />
      <DorianSecondaryHandsV1_12 sceneEntries={sceneEntries} />

      <Sequence
        from={scenes.intro.start}
        durationInFrames={scenes.intro.duration}
        name="1-Intro"
      >
        <MaybeOverride sceneName="1-Intro">
          <IntroScene />
        </MaybeOverride>
      </Sequence>
      <Sequence
        from={scenes.homeScroll.start}
        durationInFrames={scenes.homeScroll.duration}
        name="2-HomeScroll"
      >
        <MaybeOverride sceneName="2-HomeScroll">
          <HomeScrollSceneV1_09 compositionId={compositionId} />
        </MaybeOverride>
      </Sequence>
      <Sequence
        from={scenes.tapBubble.start}
        durationInFrames={scenes.tapBubble.duration}
        name="3-TapBubble"
      >
        <MaybeOverride sceneName="3-TapBubble">
          <TapAIBubbleScene />
        </MaybeOverride>
      </Sequence>
      <Sequence
        from={scenes.chatOpen.start}
        durationInFrames={scenes.chatOpen.duration}
        name="4-ChatOpen"
      >
        <MaybeOverride sceneName="4-ChatOpen">
          <ChatOpenScene />
        </MaybeOverride>
      </Sequence>
      <Sequence
        from={scenes.userTyping.start}
        durationInFrames={scenes.userTyping.duration}
        name="5-UserTyping"
      >
        <MaybeOverride sceneName="5-UserTyping">
          <UserTypingScene />
        </MaybeOverride>
      </Sequence>
      <Sequence
        from={scenes.aiThinking.start}
        durationInFrames={scenes.aiThinking.duration}
        name="6-AIThinking"
      >
        <MaybeOverride sceneName="6-AIThinking">
          <AIThinkingScene />
        </MaybeOverride>
      </Sequence>
      <Sequence
        from={scenes.aiResponse.start}
        durationInFrames={scenes.aiResponse.duration}
        name="7-AIResponse"
      >
        <MaybeOverride sceneName="7-AIResponse">
          <AIResponseScene />
        </MaybeOverride>
      </Sequence>
      <Sequence
        from={scenes.productPage.start}
        durationInFrames={scenes.productPage.duration}
        name="8-ProductPage"
      >
        <MaybeOverride sceneName="8-ProductPage">
          <ProductPageSceneV1_12
            sceneConfig={productPageConfig}
            compositionId={compositionId}
          />
        </MaybeOverride>
      </Sequence>
      <Sequence
        from={scenes.productDetail.start}
        durationInFrames={scenes.productDetail.duration}
        name="9-ProductDetail"
      >
        <MaybeOverride sceneName="9-ProductDetail">
          <ProductDetailSceneV1_12 compositionId={compositionId} />
        </MaybeOverride>
      </Sequence>
      <Sequence
        from={scenes.outro.start}
        durationInFrames={scenes.outro.duration}
        name="10-Outro"
      >
        <MaybeOverride sceneName="10-Outro">
          <OutroScene />
        </MaybeOverride>
      </Sequence>
    </AbsoluteFill>
  );
};
