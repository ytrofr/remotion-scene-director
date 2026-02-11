import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';

// Scene components
import {
  IntroScene,
  ChatWithResponseScene,
  TypingScene,
  SendScene,
  UserMessageScene,
  ThinkingScene,
  ResponseScene,
  OutroScene,
} from './MobileChatDemoV3/scenes';

// Audio
import { AudioLayer } from '../audio/AudioLayer';

// Constants
import { COLORS, TRANSITIONS, TIMINGS } from './MobileChatDemoV3/constants';

/**
 * MobileChatDemoV3 - Video 2: Worker Hours Question
 *
 * Continuation of the first video, showing:
 * - Existing conversation (first Q&A)
 * - User types second question about worker hours
 * - AI responds with both conversations visible
 *
 * Duration: ~11 seconds @ 30fps = 335 frames
 * Output: 1080x1920 (9:16 vertical)
 *
 * Scene Breakdown:
 * 1. Intro (35 frames)              - Phone slides in with first Q&A
 * 2. ChatWithResponse (45 frames)   - Shows existing conversation
 * 3. Typing (85 frames)             - Letter-by-letter (28 chars)
 * 4. Send (30 frames)               - Pan to send, tap send
 * 5. UserMessage (30 frames)        - Second question appears
 * 6. Thinking (45 frames)           - AI thinking with dots
 * 7. Response (60 frames)           - AI response slides up
 * 8. Outro (35 frames)              - CTA overlay
 */
export const MobileChatDemoV3: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Global vertical offset - shift everything down 120px */}
      <div style={{ transform: 'translateY(120px)', width: '100%', height: '100%' }}>
        <TransitionSeries>
          {/* Scene 1: Intro - Phone slides in */}
          <TransitionSeries.Sequence
            name="1-Intro"
            durationInFrames={TIMINGS.intro.duration}
            premountFor={10}
          >
            <IntroScene />
          </TransitionSeries.Sequence>

          {/* Fade transition */}
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: TRANSITIONS.fadeIntro })}
          />

          {/* Scene 2: ChatWithResponse - Shows first Q&A */}
          <TransitionSeries.Sequence
            name="2-ChatWithResponse"
            durationInFrames={TIMINGS.chatWithResponse.duration}
            premountFor={15}
          >
            <ChatWithResponseScene />
          </TransitionSeries.Sequence>

          {/* Scene 3: Typing - Letter by letter (28 chars) */}
          <TransitionSeries.Sequence
            name="3-Typing"
            durationInFrames={TIMINGS.typing.duration}
            premountFor={10}
          >
            <TypingScene />
          </TransitionSeries.Sequence>

          {/* Scene 4: Send - Pan to send, tap send */}
          <TransitionSeries.Sequence
            name="4-Send"
            durationInFrames={TIMINGS.send.duration}
            premountFor={10}
          >
            <SendScene />
          </TransitionSeries.Sequence>

          {/* Scene 5: UserMessage - Second question appears */}
          <TransitionSeries.Sequence
            name="5-UserMessage"
            durationInFrames={TIMINGS.userMessage.duration}
            premountFor={10}
          >
            <UserMessageScene />
          </TransitionSeries.Sequence>

          {/* Scene 6: Thinking - AI thinking with dots */}
          <TransitionSeries.Sequence
            name="6-Thinking"
            durationInFrames={TIMINGS.thinking.duration}
            premountFor={10}
          >
            <ThinkingScene />
          </TransitionSeries.Sequence>

          {/* Scene 7: Response - AI response slides up */}
          <TransitionSeries.Sequence
            name="7-Response"
            durationInFrames={TIMINGS.response.duration}
            premountFor={10}
          >
            <ResponseScene />
          </TransitionSeries.Sequence>

          {/* Slide transition to outro */}
          <TransitionSeries.Transition
            presentation={slide({ direction: 'from-top' })}
            timing={springTiming({
              config: { damping: 20, stiffness: 100 },
              durationInFrames: TRANSITIONS.slideOutro,
            })}
          />

          {/* Scene 8: Outro - CTA */}
          <TransitionSeries.Sequence
            name="8-Outro"
            durationInFrames={TIMINGS.outro.duration}
            premountFor={10}
          >
            <OutroScene />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </div>

      {/* Audio layer - typing sound enabled */}
      <AudioLayer enabled={true} />
    </AbsoluteFill>
  );
};

export default MobileChatDemoV3;
