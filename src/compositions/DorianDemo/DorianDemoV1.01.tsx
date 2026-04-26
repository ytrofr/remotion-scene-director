/**
 * DorianDemoV1_01 — V1.01 of DorianDemo.
 *
 * Diff vs V1.00 (DorianDemo.tsx):
 *   - Scene 9 (ProductDetail) extended 90f → 180f (3s → 6s)
 *   - Scene 9 imports ProductDetailSceneV1_01 (scroll + Add to Cart + hamburger menu nav)
 *   - Outro shifts: start 960 → 1050
 *   - Total duration: 1140 → 1230
 *   - Scenes 1-8 + Outro: identical imports from V1.00 (those files are frozen)
 *
 * Companion: DorianFullV1.01.tsx uses this and replaces white-flash transition
 * with a slide. See .claude/rules/version-safe-iteration.md.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { SCENES } from './constants';
import {
  IntroScene,
  HomeScrollScene,
  TapAIBubbleScene,
  ChatOpenScene,
  UserTypingScene,
  AIThinkingScene,
  AIResponseScene,
  ProductPageScene,
  OutroScene,
} from './scenes';
import { ProductDetailSceneV1_01 } from './scenes/ProductDetailSceneV1.01';
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

// ── V1.01 scene timing overrides ──
// Scene 9 extended; outro shifted accordingly. Scenes 1-8 unchanged.
export const SCENES_V1_01 = {
  intro: SCENES.intro,
  homeScroll: SCENES.homeScroll,
  tapBubble: SCENES.tapBubble,
  chatOpen: SCENES.chatOpen,
  userTyping: SCENES.userTyping,
  aiThinking: SCENES.aiThinking,
  aiResponse: SCENES.aiResponse,
  productPage: SCENES.productPage,
  productDetail: { start: 870, duration: 180 }, // was 90
  outro: { start: 1050, duration: 180 }, // was {960, 180}
};

export const VIDEO_V1_01 = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1230, // was 1140
};

const SCENE_ENTRIES = [
  {
    name: '1-Intro',
    start: SCENES_V1_01.intro.start,
    duration: SCENES_V1_01.intro.duration,
  },
  {
    name: '2-HomeScroll',
    start: SCENES_V1_01.homeScroll.start,
    duration: SCENES_V1_01.homeScroll.duration,
  },
  {
    name: '3-TapBubble',
    start: SCENES_V1_01.tapBubble.start,
    duration: SCENES_V1_01.tapBubble.duration,
  },
  {
    name: '4-ChatOpen',
    start: SCENES_V1_01.chatOpen.start,
    duration: SCENES_V1_01.chatOpen.duration,
  },
  {
    name: '5-UserTyping',
    start: SCENES_V1_01.userTyping.start,
    duration: SCENES_V1_01.userTyping.duration,
  },
  {
    name: '6-AIThinking',
    start: SCENES_V1_01.aiThinking.start,
    duration: SCENES_V1_01.aiThinking.duration,
  },
  {
    name: '7-AIResponse',
    start: SCENES_V1_01.aiResponse.start,
    duration: SCENES_V1_01.aiResponse.duration,
  },
  {
    name: '8-ProductPage',
    start: SCENES_V1_01.productPage.start,
    duration: SCENES_V1_01.productPage.duration,
  },
  {
    name: '9-ProductDetail',
    start: SCENES_V1_01.productDetail.start,
    duration: SCENES_V1_01.productDetail.duration,
  },
  {
    name: '10-Outro',
    start: SCENES_V1_01.outro.start,
    duration: SCENES_V1_01.outro.duration,
  },
];

// Audio reads from 'DorianDemo' registry (scenes 1-8 + outro audio is identical
// to V1.00). New audio for scene 9 V1.01 can be added via 'DorianDemoV1.01' key.
const DorianAudioV1_01: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of SCENE_ENTRIES) {
    // Read from BOTH V1.00 (shared scenes 1-8 + outro) AND V1.01 keys
    const entries = [
      ...getCodedAudio('DorianDemo', scene.name),
      ...getCodedAudio('DorianDemoV1.01', scene.name),
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

const DorianSecondaryHandsV1_01: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const elements: React.ReactElement[] = [];
  for (const scene of SCENE_ENTRIES) {
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

export const DorianDemoV1_01: React.FC = () => {
  return (
    // Transparent wrapper (NOT white) so scene 9's end-of-scene slide-off
    // reveals scene 10 underneath (rendered earlier in DorianFullV1_01 JSX).
    // Individual scenes still have their own white backgrounds.
    <AbsoluteFill style={{ background: 'transparent' }}>
      <DorianAudioV1_01 />
      <AudioFromLayers />
      <DorianSecondaryHandsV1_01 />

      <Sequence
        from={SCENES_V1_01.intro.start}
        durationInFrames={SCENES_V1_01.intro.duration}
        name="1-Intro"
      >
        <IntroScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_01.homeScroll.start}
        durationInFrames={SCENES_V1_01.homeScroll.duration}
        name="2-HomeScroll"
      >
        <HomeScrollScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_01.tapBubble.start}
        durationInFrames={SCENES_V1_01.tapBubble.duration}
        name="3-TapBubble"
      >
        <TapAIBubbleScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_01.chatOpen.start}
        durationInFrames={SCENES_V1_01.chatOpen.duration}
        name="4-ChatOpen"
      >
        <ChatOpenScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_01.userTyping.start}
        durationInFrames={SCENES_V1_01.userTyping.duration}
        name="5-UserTyping"
      >
        <UserTypingScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_01.aiThinking.start}
        durationInFrames={SCENES_V1_01.aiThinking.duration}
        name="6-AIThinking"
      >
        <AIThinkingScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_01.aiResponse.start}
        durationInFrames={SCENES_V1_01.aiResponse.duration}
        name="7-AIResponse"
      >
        <AIResponseScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_01.productPage.start}
        durationInFrames={SCENES_V1_01.productPage.duration}
        name="8-ProductPage"
      >
        <ProductPageScene />
      </Sequence>
      <Sequence
        from={SCENES_V1_01.productDetail.start}
        durationInFrames={SCENES_V1_01.productDetail.duration}
        name="9-ProductDetail"
      >
        <ProductDetailSceneV1_01 />
      </Sequence>
      <Sequence
        from={SCENES_V1_01.outro.start}
        durationInFrames={SCENES_V1_01.outro.duration}
        name="10-Outro"
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
