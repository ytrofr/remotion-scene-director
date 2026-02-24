import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';

// V2 Scene components (first question) - non-hand scenes only
import {
  IntroScene as V2IntroScene,
  ChatEmptyScene as V2ChatEmptyScene,
  UserMessageScene as V2UserMessageScene,
  ThinkingScene as V2ThinkingScene,
  ResponseScene as V2ResponseScene,
} from './MobileChatDemo/scenes';

// V2 custom scenes with pointer gesture (extracted)
import {
  V2TypingSceneWithPointer,
  V2SendSceneWithPointer,
} from './MobileChatDemoCombinedScenes';

// V4 Scene components (second question with Lottie hand)
import {
  TypingScene as V4TypingScene,
  SendScene as V4SendScene,
  UserMessageScene as V4UserMessageScene,
  ThinkingScene as V4ThinkingScene,
  ResponseScene as V4ResponseScene,
  OutroScene as V4OutroScene,
} from './MobileChatDemoV4/scenes';

// Constants
import { COLORS } from './MobileChatDemo/constants';

// Debug types for scene info export
import type { DebugSceneInfo } from '../components/debug';

/**
 * MobileChatDemoCombined - Two questions in one video
 *
 * Combines V2 (first question) and V4 (second question with Lottie hand)
 * into a single continuous demo showing two Q&A interactions.
 *
 * Duration: ~20 seconds @ 30fps = 600 frames
 * Output: 1080x1920 (9:16 vertical)
 *
 * Scene Breakdown:
 * === V2: First Question ===
 * 1. Intro (35 frames)           - Phone slides in
 * 2. ChatEmpty (45 frames)       - Empty chat UI
 * 3. Typing (70 frames)          - Type "כמה הכנסות היו השבוע?"
 * 4. Send (30 frames)            - Pan to send, tap
 * 5. UserMessage (30 frames)     - First question appears
 * 6. Thinking (45 frames)        - AI thinking dots
 * 7. Response (60 frames)        - First AI response
 *
 * === V4: Second Question (Lottie Hand) ===
 * 8. Typing (85 frames)          - Type "כמה שעות עבדו העובדים השבוע?"
 * 9. Send (30 frames)            - Hand tap send
 * 10. UserMessage (30 frames)    - Second question appears
 * 11. Thinking (45 frames)       - AI thinking dots
 * 12. Response (60 frames)       - Second AI response
 * 13. Outro (35 frames)          - CTA overlay
 */

// Timing configuration
const TIMINGS = {
  // V2 scenes
  v2Intro: 35,
  v2ChatEmpty: 45,
  v2Typing: 70,
  v2Send: 30,
  v2UserMessage: 30,
  v2Thinking: 45,
  v2Response: 60,
  // V4 scenes
  v4Typing: 85,
  v4Send: 30,
  v4UserMessage: 30,
  v4Thinking: 45,
  v4Response: 60,
  v4Outro: 35,
};

const TRANSITIONS_CONFIG = {
  fadeIntro: 15,
  slideOutro: 15,
  crossfade: 10, // Transition between V2 response and V4 typing
};

export const COMBINED_VIDEO = {
  durationInFrames: 600, // ~20 seconds
  fps: 30,
  width: 1080,
  height: 1920,
};

export const MobileChatDemoCombined: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Global vertical offset - shift everything down 120px */}
      <div
        style={{
          transform: 'translateY(120px)',
          width: '100%',
          height: '100%',
        }}
      >
        <TransitionSeries>
          {/* ========== V2: FIRST QUESTION ========== */}

          {/* Scene 1: Intro - Phone slides in */}
          <TransitionSeries.Sequence
            name="1-Intro"
            durationInFrames={TIMINGS.v2Intro}
            premountFor={10}
          >
            <V2IntroScene />
          </TransitionSeries.Sequence>

          {/* Fade transition */}
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({
              durationInFrames: TRANSITIONS_CONFIG.fadeIntro,
            })}
          />

          {/* Scene 2: ChatEmpty - Brand title */}
          <TransitionSeries.Sequence
            name="2-ChatEmpty"
            durationInFrames={TIMINGS.v2ChatEmpty}
            premountFor={15}
          >
            <V2ChatEmptyScene />
          </TransitionSeries.Sequence>

          {/* Scene 3: Typing - First question (with pointer gesture) */}
          <TransitionSeries.Sequence
            name="3-V2-Typing"
            durationInFrames={TIMINGS.v2Typing}
            premountFor={10}
          >
            <V2TypingSceneWithPointer />
          </TransitionSeries.Sequence>

          {/* Scene 4: Send (with pointer gesture) */}
          <TransitionSeries.Sequence
            name="4-V2-Send"
            durationInFrames={TIMINGS.v2Send}
            premountFor={10}
          >
            <V2SendSceneWithPointer />
          </TransitionSeries.Sequence>

          {/* Scene 5: UserMessage */}
          <TransitionSeries.Sequence
            name="5-V2-UserMessage"
            durationInFrames={TIMINGS.v2UserMessage}
            premountFor={10}
          >
            <V2UserMessageScene />
          </TransitionSeries.Sequence>

          {/* Scene 6: Thinking */}
          <TransitionSeries.Sequence
            name="6-V2-Thinking"
            durationInFrames={TIMINGS.v2Thinking}
            premountFor={10}
          >
            <V2ThinkingScene />
          </TransitionSeries.Sequence>

          {/* Scene 7: Response - First AI answer */}
          <TransitionSeries.Sequence
            name="7-V2-Response"
            durationInFrames={TIMINGS.v2Response}
            premountFor={10}
          >
            <V2ResponseScene />
          </TransitionSeries.Sequence>

          {/* ========== V4: SECOND QUESTION (LOTTIE HAND) ========== */}

          {/* Crossfade transition between questions */}
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({
              durationInFrames: TRANSITIONS_CONFIG.crossfade,
            })}
          />

          {/* Scene 8: Typing - Second question with Lottie hand */}
          <TransitionSeries.Sequence
            name="8-V4-Typing"
            durationInFrames={TIMINGS.v4Typing}
            premountFor={10}
          >
            <V4TypingScene />
          </TransitionSeries.Sequence>

          {/* Scene 9: Send - Lottie hand tap */}
          <TransitionSeries.Sequence
            name="9-V4-Send"
            durationInFrames={TIMINGS.v4Send}
            premountFor={10}
          >
            <V4SendScene />
          </TransitionSeries.Sequence>

          {/* Scene 10: UserMessage */}
          <TransitionSeries.Sequence
            name="10-V4-UserMessage"
            durationInFrames={TIMINGS.v4UserMessage}
            premountFor={10}
          >
            <V4UserMessageScene />
          </TransitionSeries.Sequence>

          {/* Scene 11: Thinking */}
          <TransitionSeries.Sequence
            name="11-V4-Thinking"
            durationInFrames={TIMINGS.v4Thinking}
            premountFor={10}
          >
            <V4ThinkingScene />
          </TransitionSeries.Sequence>

          {/* Scene 12: Response - Second AI answer */}
          <TransitionSeries.Sequence
            name="12-V4-Response"
            durationInFrames={TIMINGS.v4Response}
            premountFor={10}
          >
            <V4ResponseScene />
          </TransitionSeries.Sequence>

          {/* Slide transition to outro */}
          <TransitionSeries.Transition
            presentation={slide({ direction: 'from-top' })}
            timing={springTiming({
              config: { damping: 20, stiffness: 100 },
              durationInFrames: TRANSITIONS_CONFIG.slideOutro,
            })}
          />

          {/* Scene 13: Outro - CTA */}
          <TransitionSeries.Sequence
            name="13-Outro"
            durationInFrames={TIMINGS.v4Outro}
            premountFor={10}
          >
            <V4OutroScene />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </div>

      {/* V2 audio is inside scene components (local frames = perfect sync) */}
      {/* V4 audio is inside V4 scene files */}
    </AbsoluteFill>
  );
};

// ============ SCENE INFO FOR DEBUG ============

export const COMBINED_SCENE_INFO: DebugSceneInfo[] = [
  { name: '1-Intro', start: 0, end: 35, part: 'V2' },
  { name: '2-ChatEmpty', start: 20, end: 65, part: 'V2' },
  { name: '3-V2-Typing', start: 65, end: 135, part: 'V2', hand: 'pointer' },
  { name: '4-V2-Send', start: 135, end: 165, part: 'V2', hand: 'pointer' },
  { name: '5-V2-UserMessage', start: 165, end: 195, part: 'V2' },
  { name: '6-V2-Thinking', start: 195, end: 240, part: 'V2' },
  { name: '7-V2-Response', start: 240, end: 300, part: 'V2' },
  { name: '8-V4-Typing', start: 290, end: 375, part: 'V4', hand: 'click' },
  { name: '9-V4-Send', start: 375, end: 405, part: 'V4', hand: 'click' },
  { name: '10-V4-UserMessage', start: 405, end: 435, part: 'V4' },
  { name: '11-V4-Thinking', start: 435, end: 480, part: 'V4' },
  { name: '12-V4-Response', start: 480, end: 540, part: 'V4' },
  { name: '13-Outro', start: 525, end: 600, part: 'V4' },
];

export default MobileChatDemoCombined;
