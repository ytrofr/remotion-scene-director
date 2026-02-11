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
  ChatEmptyScene,
  TypingScene,
  SendScene,
  UserMessageScene,
  ThinkingScene,
  ResponseScene,
  OutroScene,
} from './MobileChatDemo/scenes';


// Audio
import { AudioLayer } from '../audio/AudioLayer';

// Constants
import { COLORS, TRANSITIONS, TIMINGS } from './MobileChatDemo/constants';

/**
 * MobileChatDemo - 9:16 vertical video for TikTok/Reels
 *
 * REFACTORED VERSION with:
 * - TransitionSeries for smooth scene transitions
 * - Modular scene components
 * - Audio layer (optional)
 *
 * Duration: ~12 seconds @ 30fps = 350 frames (with transition overlaps)
 * Output: 1080x1920 (9:16 vertical)
 *
 * Scene Breakdown:
 * 1. Intro (35 frames)        - Phone slides in
 * 2. Chat Empty (45 frames)   - Brand title
 * 3. Typing (70 frames)       - Letter-by-letter with zoom
 * 4. Send (30 frames)         - Pan to send, tap send
 * 5. UserMessage (30 frames)  - User prompt appears in chat
 * 6. Thinking (45 frames)     - AI thinking with dots
 * 7. Response (60 frames)     - AI response appears
 * 8. Outro (35 frames)        - CTA overlay
 *
 * Transitions subtract from total:
 * - Fade intro->chatEmpty: 15 frames
 * - Slide response->outro: 15 frames
 * Total: 350 - 30 = 320 frames
 */
export const MobileChatDemoRefactored: React.FC = () => {
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

        {/* Fade transition to chat empty */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITIONS.fadeIntro })}
        />

        {/* Scene 2: Chat Empty - Brand title */}
        <TransitionSeries.Sequence
          name="2-ChatEmpty"
          durationInFrames={TIMINGS.chatEmpty.duration}
          premountFor={15}
        >
          <ChatEmptyScene />
        </TransitionSeries.Sequence>

        {/* Scene 3: Typing - Letter by letter with zoom */}
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

        {/* Scene 5: UserMessage - User prompt appears in chat */}
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

        {/* Scene 7: Response - AI response appears */}
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

// Default export for compatibility
export default MobileChatDemoRefactored;
