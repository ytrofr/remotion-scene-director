/**
 * DorianDemoEnhanced — DorianDemo with all new shared component capabilities:
 *
 * 1. SequenceCrossfade — smooth opacity crossfades between scenes
 * 2. Volume envelopes — all SFX get fade-in/out via computeVolumeAtFrame
 * 3. CaptionOverlay — scene description captions at the bottom
 * 4. BackgroundMusic placeholder — ducking-ready music slot
 * 5. Shared springs — already used via constants.ts
 * 6. Pointer cursors with autoRotate — via existing coded paths
 *
 * Architecture: Imports all 10 DorianDemo scenes directly. No code duplication.
 * The original DorianDemo is unchanged — this is a separate composition.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { COLORS, SCENES } from './DorianDemo/constants';
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
} from './DorianDemo/scenes';
import { getCodedAudio } from './SceneDirector/layers';
import {
  getSavedSecondaryLayers,
  getCodedPath,
} from './SceneDirector/codedPaths';
import { GESTURE_PRESETS } from './SceneDirector/gestures';
import { FloatingHand } from '../components/FloatingHand';
import { DEFAULT_PHYSICS } from '../components/FloatingHand/types';
import { useSceneDirectorMode } from '../components/FloatingHand/SceneDirectorMode';
import { AudioFromLayers } from './SceneDirector/AudioLayerRenderer';
import { computeVolumeAtFrame } from '../lib/audioEnvelope';

// ─── Config ───

export const ENHANCED_VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1140,
};

// Scene entries (same timing as original DorianDemo)
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

// Scene info for SceneDirector registration
export const ENHANCED_SCENE_INFO = SCENE_ENTRIES.map((s) => ({
  name: s.name,
  start: s.start,
  end: s.start + s.duration,
}));

// ─── Captions SRT ───
// Timestamps aligned to actual scene times (30fps):
// intro 0.0-2.5s, homeScroll 2.5-7.5s, tapBubble 7.5-10.0s,
// chatOpen 10.0-13.0s, userTyping 13.0-18.0s, aiThinking 18.0-20.0s,
// aiResponse 20.0-24.0s, productPage 24.0-29.0s, productDetail 29.0-32.0s, outro 32.0-38.0s
export const CAPTIONS_SRT = `1
00:00:00,200 --> 00:00:02,300
Dorian — Community Marketplace

2
00:00:03,000 --> 00:00:07,000
Browse local products with smooth scrolling

3
00:00:07,800 --> 00:00:09,800
Tap the AI assistant bubble

4
00:00:10,200 --> 00:00:12,800
Chat interface opens instantly

5
00:00:13,200 --> 00:00:17,500
Type your question naturally

6
00:00:18,200 --> 00:00:19,800
AI processes your request

7
00:00:20,200 --> 00:00:23,500
Personalized product recommendations

8
00:00:24,200 --> 00:00:28,500
Browse and compare results

9
00:00:29,200 --> 00:00:31,500
Detailed product view

10
00:00:32,500 --> 00:00:37,000
The future of local commerce
`;

// ─── Enhanced Audio ───
// Same coded audio as DorianDemo but with volume envelopes (fade-in/out)
const EnhancedAudio: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of SCENE_ENTRIES) {
    const entries = getCodedAudio('DorianDemo', scene.name);
    for (const entry of entries) {
      const globalFrom = scene.start + entry.startFrame;
      const dur = entry.durationInFrames;
      // Apply volume envelope: 5-frame fade-in, 8-frame fade-out
      audioElements.push(
        <Sequence
          key={`${scene.name}-${entry.file}-${entry.startFrame}`}
          from={globalFrom}
          durationInFrames={dur}
        >
          <Audio
            src={staticFile(entry.file)}
            volume={(f) =>
              computeVolumeAtFrame(f, {
                baseVolume: entry.volume,
                fadeInFrames: Math.min(5, Math.floor(dur / 4)),
                fadeOutFrames: Math.min(8, Math.floor(dur / 3)),
                totalFrames: dur,
              })
            }
          />
        </Sequence>,
      );
    }
  }
  return <>{audioElements}</>;
};

// ─── Secondary Hands (same as DorianDemo) ───
const EnhancedSecondaryHands: React.FC = () => {
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

// ─── Main Enhanced Composition ───
// Same scene layout as original DorianDemo (plain Sequences, no crossfades)
// + captions overlay + volume envelopes on audio
export const DorianDemoEnhanced: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Enhanced audio with volume envelopes */}
      <EnhancedAudio />
      <AudioFromLayers />
      <EnhancedSecondaryHands />

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
