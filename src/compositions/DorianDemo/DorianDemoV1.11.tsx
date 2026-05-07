/**
 * DorianDemoV1_11 — V1.11 of DorianDemo.
 *
 * Diff vs V1.09:
 *   - Scene 9 (ProductDetail) replaced with ProductDetailSceneV1_11: cursor
 *     does the BIG scrollbar drag (X=880, Y 860→1060) at scene start, then
 *     teleports invisibly to the V1.08 click sequence (Add to Cart →
 *     hamburger → My Store), unchanged.
 *   - Scenes 2 (HomeScroll) + 8 (ProductPage) already use the big scrollbar
 *     from V1.09 — reused unchanged.
 *   - Timing identical to V1.09.
 *
 * Companion: DorianFullV1.11.tsx uses this. See .claude/rules/version-safe-iteration.md.
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
import { ProductPageSceneV1_09 } from './scenes/ProductPageSceneV1.09';
import { ProductDetailSceneV1_11 } from './scenes/ProductDetailSceneV1.11';
import { getCodedAudio } from '../SceneDirector/layers';
import {
  getSavedSecondaryLayers,
  getCodedPath,
} from '../SceneDirector/codedPaths';
import { GESTURE_PRESETS } from '../SceneDirector/gestures';
import { FloatingHand } from '../../components/FloatingHand';
import { DEFAULT_PHYSICS } from '../../components/FloatingHand/types';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';
import { AudioFromLayers } from '../SceneDirector/AudioLayerRenderer';

export const SCENES_V1_11 = {
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

export const VIDEO_V1_11 = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1300,
};

const SCENE_ENTRIES = [
  {
    name: '1-Intro',
    start: SCENES_V1_11.intro.start,
    duration: SCENES_V1_11.intro.duration,
  },
  {
    name: '2-HomeScroll',
    start: SCENES_V1_11.homeScroll.start,
    duration: SCENES_V1_11.homeScroll.duration,
  },
  {
    name: '3-TapBubble',
    start: SCENES_V1_11.tapBubble.start,
    duration: SCENES_V1_11.tapBubble.duration,
  },
  {
    name: '4-ChatOpen',
    start: SCENES_V1_11.chatOpen.start,
    duration: SCENES_V1_11.chatOpen.duration,
  },
  {
    name: '5-UserTyping',
    start: SCENES_V1_11.userTyping.start,
    duration: SCENES_V1_11.userTyping.duration,
  },
  {
    name: '6-AIThinking',
    start: SCENES_V1_11.aiThinking.start,
    duration: SCENES_V1_11.aiThinking.duration,
  },
  {
    name: '7-AIResponse',
    start: SCENES_V1_11.aiResponse.start,
    duration: SCENES_V1_11.aiResponse.duration,
  },
  {
    name: '8-ProductPage',
    start: SCENES_V1_11.productPage.start,
    duration: SCENES_V1_11.productPage.duration,
  },
  {
    name: '9-ProductDetail',
    start: SCENES_V1_11.productDetail.start,
    duration: SCENES_V1_11.productDetail.duration,
  },
  {
    name: '10-Outro',
    start: SCENES_V1_11.outro.start,
    duration: SCENES_V1_11.outro.duration,
  },
];

const DorianAudioV1_11: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of SCENE_ENTRIES) {
    const entries = [
      ...getCodedAudio('DorianDemo', scene.name),
      ...getCodedAudio('DorianDemoV1.11', scene.name),
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

const DorianSecondaryHandsV1_11: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const elements: React.ReactElement[] = [];
  for (const scene of SCENE_ENTRIES) {
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

export const DorianDemoV1_11: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: 'transparent' }}>
      <DorianAudioV1_11 />
      <AudioFromLayers />
      <DorianSecondaryHandsV1_11 />

      <Sequence
        from={SCENES_V1_11.intro.start}
        durationInFrames={SCENES_V1_11.intro.duration}
        name="1-Intro"
      >
        <IntroScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_11.homeScroll.start}
        durationInFrames={SCENES_V1_11.homeScroll.duration}
        name="2-HomeScroll"
      >
        <HomeScrollSceneV1_09 />
      </Sequence>
      <Sequence
        from={SCENES_V1_11.tapBubble.start}
        durationInFrames={SCENES_V1_11.tapBubble.duration}
        name="3-TapBubble"
      >
        <TapAIBubbleScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_11.chatOpen.start}
        durationInFrames={SCENES_V1_11.chatOpen.duration}
        name="4-ChatOpen"
      >
        <ChatOpenScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_11.userTyping.start}
        durationInFrames={SCENES_V1_11.userTyping.duration}
        name="5-UserTyping"
      >
        <UserTypingScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_11.aiThinking.start}
        durationInFrames={SCENES_V1_11.aiThinking.duration}
        name="6-AIThinking"
      >
        <AIThinkingScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_11.aiResponse.start}
        durationInFrames={SCENES_V1_11.aiResponse.duration}
        name="7-AIResponse"
      >
        <AIResponseScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_11.productPage.start}
        durationInFrames={SCENES_V1_11.productPage.duration}
        name="8-ProductPage"
      >
        <ProductPageSceneV1_09 />
      </Sequence>
      <Sequence
        from={SCENES_V1_11.productDetail.start}
        durationInFrames={SCENES_V1_11.productDetail.duration}
        name="9-ProductDetail"
      >
        <ProductDetailSceneV1_11 />
      </Sequence>
      <Sequence
        from={SCENES_V1_11.outro.start}
        durationInFrames={SCENES_V1_11.outro.duration}
        name="10-Outro"
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
