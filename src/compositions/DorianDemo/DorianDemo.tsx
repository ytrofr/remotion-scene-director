import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { COLORS, SCENES } from './constants';
import {
  IntroScene,
  HomeScrollScene,
  TapAIBubbleScene,
  ChatOpenScene,
  UserTypingScene,
  AIThinkingScene,
  AIResponseScene,
  ProductPageScene,
  ProductDetailScene,
  OutroScene,
} from './scenes';
import { getCodedAudio } from '../SceneDirector/layers';
import {
  getSavedSecondaryLayers,
  getCodedPath,
} from '../SceneDirector/codedPaths';
import { GESTURE_PRESETS } from '../SceneDirector/gestures';
import { FloatingHand } from '../../components/FloatingHand';
import { DEFAULT_PHYSICS } from '../../components/FloatingHand/types';

// ============ CENTRALIZED AUDIO ============
// All audio is driven from the coded audio registry (layers.ts).
// Scene components no longer contain inline <Audio> — this is the single source of truth.

const SCENE_ENTRIES = [
  {
    name: '1-Intro',
    start: SCENES.intro.start,
    duration: SCENES.intro.duration,
  },
  {
    name: '2-HomeScroll',
    start: SCENES.homeScroll.start,
    duration: SCENES.homeScroll.duration,
  },
  {
    name: '3-TapBubble',
    start: SCENES.tapBubble.start,
    duration: SCENES.tapBubble.duration,
  },
  {
    name: '4-ChatOpen',
    start: SCENES.chatOpen.start,
    duration: SCENES.chatOpen.duration,
  },
  {
    name: '5-UserTyping',
    start: SCENES.userTyping.start,
    duration: SCENES.userTyping.duration,
  },
  {
    name: '6-AIThinking',
    start: SCENES.aiThinking.start,
    duration: SCENES.aiThinking.duration,
  },
  {
    name: '7-AIResponse',
    start: SCENES.aiResponse.start,
    duration: SCENES.aiResponse.duration,
  },
  {
    name: '8-ProductPage',
    start: SCENES.productPage.start,
    duration: SCENES.productPage.duration,
  },
  {
    name: '9-ProductDetail',
    start: SCENES.productDetail.start,
    duration: SCENES.productDetail.duration,
  },
  {
    name: '10-Outro',
    start: SCENES.outro.start,
    duration: SCENES.outro.duration,
  },
];

const DorianAudio: React.FC = () => {
  // In SceneDirector, audio is injected via withAudioLayers() HOC — skip to avoid double playback
  const isSceneDirector =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('scene-director');
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of SCENE_ENTRIES) {
    const entries = getCodedAudio('DorianDemo', scene.name);
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

// ============ CENTRALIZED SECONDARY HANDS ============
// Renders secondary hand layers (user-added gestures beyond the primary)
// from the coded paths registry. Same skip-in-SceneDirector pattern as DorianAudio.

const DorianSecondaryHands: React.FC = () => {
  const isSceneDirector =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('scene-director');
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
            animation={preset.animation}
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

// ============ MAIN COMPOSITION ============

export const DorianDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Audio layer — single source of truth */}
      <DorianAudio />
      {/* Secondary hand layers from SceneDirector */}
      <DorianSecondaryHands />

      <Sequence
        from={SCENES.intro.start}
        durationInFrames={SCENES.intro.duration}
        name="1-Intro"
      >
        <IntroScene />
      </Sequence>

      <Sequence
        from={SCENES.homeScroll.start}
        durationInFrames={SCENES.homeScroll.duration}
        name="2-HomeScroll"
      >
        <HomeScrollScene />
      </Sequence>

      <Sequence
        from={SCENES.tapBubble.start}
        durationInFrames={SCENES.tapBubble.duration}
        name="3-TapBubble"
      >
        <TapAIBubbleScene />
      </Sequence>

      <Sequence
        from={SCENES.chatOpen.start}
        durationInFrames={SCENES.chatOpen.duration}
        name="4-ChatOpen"
      >
        <ChatOpenScene />
      </Sequence>

      <Sequence
        from={SCENES.userTyping.start}
        durationInFrames={SCENES.userTyping.duration}
        name="5-UserTyping"
      >
        <UserTypingScene />
      </Sequence>

      <Sequence
        from={SCENES.aiThinking.start}
        durationInFrames={SCENES.aiThinking.duration}
        name="6-AIThinking"
      >
        <AIThinkingScene />
      </Sequence>

      <Sequence
        from={SCENES.aiResponse.start}
        durationInFrames={SCENES.aiResponse.duration}
        name="7-AIResponse"
      >
        <AIResponseScene />
      </Sequence>

      <Sequence
        from={SCENES.productPage.start}
        durationInFrames={SCENES.productPage.duration}
        name="8-ProductPage"
      >
        <ProductPageScene />
      </Sequence>

      <Sequence
        from={SCENES.productDetail.start}
        durationInFrames={SCENES.productDetail.duration}
        name="9-ProductDetail"
      >
        <ProductDetailScene />
      </Sequence>

      <Sequence
        from={SCENES.outro.start}
        durationInFrames={SCENES.outro.duration}
        name="10-Outro"
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============ SCENE INFO FOR DEBUG ============

export const DORIAN_SCENE_INFO = [
  {
    name: '1-Intro',
    start: SCENES.intro.start,
    end: SCENES.intro.start + SCENES.intro.duration,
    hand: 'none',
    gesture: '-',
  },
  {
    name: '2-HomeScroll',
    start: SCENES.homeScroll.start,
    end: SCENES.homeScroll.start + SCENES.homeScroll.duration,
    hand: 'hand-scroll-clean',
    gesture: 'drag (scroll)',
    zoom: 1.8,
  },
  {
    name: '3-TapBubble',
    start: SCENES.tapBubble.start,
    end: SCENES.tapBubble.start + SCENES.tapBubble.duration,
    hand: 'hand-click',
    gesture: 'pointer → click',
    zoom: 2.75,
  },
  {
    name: '4-ChatOpen',
    start: SCENES.chatOpen.start,
    end: SCENES.chatOpen.start + SCENES.chatOpen.duration,
    hand: 'hand-click',
    gesture: 'pointer → click (input box) → hide',
    zoom: 2.75,
  },
  {
    name: '5-UserTyping',
    start: SCENES.userTyping.start,
    end: SCENES.userTyping.start + SCENES.userTyping.duration,
    hand: 'hand-click',
    gesture: 'pointer → click (send btn)',
    zoom: 2.75,
  },
  {
    name: '6-AIThinking',
    start: SCENES.aiThinking.start,
    end: SCENES.aiThinking.start + SCENES.aiThinking.duration,
    hand: 'none',
    gesture: 'thinking dots',
    zoom: 2.75,
  },
  {
    name: '7-AIResponse',
    start: SCENES.aiResponse.start,
    end: SCENES.aiResponse.start + SCENES.aiResponse.duration,
    hand: 'hand-click',
    gesture: 'pointer → click (View Products)',
    zoom: 2.75,
  },
  {
    name: '8-ProductPage',
    start: SCENES.productPage.start,
    end: SCENES.productPage.start + SCENES.productPage.duration,
    hand: 'hand-scroll-clean',
    gesture: 'drag (scroll listing)',
    zoom: 1.8,
  },
  {
    name: '9-ProductDetail',
    start: SCENES.productDetail.start,
    end: SCENES.productDetail.start + SCENES.productDetail.duration,
    hand: 'none',
    gesture: 'crossfade',
    zoom: 1.8,
  },
  {
    name: '10-Outro',
    start: SCENES.outro.start,
    end: SCENES.outro.start + SCENES.outro.duration,
    hand: 'none',
    gesture: '-',
  },
];
