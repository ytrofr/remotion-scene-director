import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
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
} from './MobileChatDemoV4/scenes';

// Audio
import { AudioLayer } from '../audio/AudioLayer';

// Constants
import {
  COLORS,
  TRANSITIONS,
  TIMINGS,
  TOTAL_FRAMES,
} from './MobileChatDemoV4/constants';

// Shared debug components
import type { DebugSceneInfo } from '../components/debug';
import {
  useDebugCoordinates,
  DebugCrosshair,
  DebugClickMarkers,
  DebugSceneOverlay,
  DebugSceneTimeline,
} from '../components/debug';

// Scene info for debug overlay (accounting for 15-frame fade transition after intro)
const SCENE_INFO: DebugSceneInfo[] = [
  { name: '1-Intro', start: 0, end: 35, hand: 'none', gesture: 'none' },
  {
    name: '2-ChatWithResponse',
    start: 20,
    end: 65,
    hand: 'none',
    gesture: 'none',
  },
  {
    name: '3-Typing',
    start: 65,
    end: 150,
    hand: 'hand-click',
    gesture: 'click @ frame 5',
  },
  {
    name: '4-Send',
    start: 150,
    end: 180,
    hand: 'hand-click',
    gesture: 'click @ frame 13',
  },
  {
    name: '5-UserMessage',
    start: 180,
    end: 210,
    hand: 'none',
    gesture: 'none',
  },
  { name: '6-Thinking', start: 210, end: 255, hand: 'none', gesture: 'none' },
  { name: '7-Response', start: 255, end: 315, hand: 'none', gesture: 'none' },
  { name: '8-Outro', start: 300, end: 335, hand: 'none', gesture: 'none' },
];

/**
 * MobileChatDemoV4 - Video with Lottie Hand Gestures
 *
 * Same as V3 but uses professional Lottie hand-click animation
 * instead of the simple finger indicator.
 *
 * Duration: ~11 seconds @ 30fps = 335 frames
 * Output: 1080x1920 (9:16 vertical)
 *
 * Scene Breakdown:
 * 1. Intro (35 frames)              - Phone slides in with first Q&A
 * 2. ChatWithResponse (45 frames)   - Shows existing conversation
 * 3. Typing (85 frames)             - Letter-by-letter with hand tap
 * 4. Send (30 frames)               - Pan to send, hand tap send
 * 5. UserMessage (30 frames)        - Second question appears
 * 6. Thinking (45 frames)           - AI thinking with dots
 * 7. Response (60 frames)           - AI response slides up
 * 8. Outro (35 frames)              - CTA overlay
 */
export const MobileChatDemoV4: React.FC = () => {
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

          {/* Scene 3: Typing - Letter by letter with hand gesture */}
          <TransitionSeries.Sequence
            name="3-Typing"
            durationInFrames={TIMINGS.typing.duration}
            premountFor={10}
          >
            <TypingScene />
          </TransitionSeries.Sequence>

          {/* Scene 4: Send - Pan to send, hand tap send */}
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

export default MobileChatDemoV4;

// ============ INTERACTIVE DEBUG WITH CLICK-TO-MARK ============

export const MobileChatDemoV4DebugInteractive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { mousePos, handleMouseMove, handleClick, markers, clearMarkers } =
    useDebugCoordinates(1080, 1920);

  const handleExportCopy = () => {
    const output = markers
      .map((m) => `{ x: ${m.x}, y: ${m.y}, frame: ${m.frame} }, // ${m.label}`)
      .join('\n');
    navigator.clipboard.writeText(output);
  };

  return (
    <AbsoluteFill
      style={{ background: COLORS.background, cursor: 'crosshair' }}
      onClick={(e) => handleClick(e, frame)}
      onMouseMove={handleMouseMove}
    >
      {/* Main Demo */}
      <MobileChatDemoV4 />

      {/* Crosshairs */}
      <DebugCrosshair
        x={mousePos.x}
        y={mousePos.y}
        width={1080}
        height={1920}
      />

      {/* Click Markers */}
      <DebugClickMarkers
        markers={markers}
        currentFrame={frame}
        onClear={clearMarkers}
        onCopy={handleExportCopy}
      />

      {/* Debug Panel - Top Left */}
      <DebugSceneOverlay
        scenes={SCENE_INFO}
        currentFrame={frame}
        fps={fps}
        mousePos={mousePos}
        markerCount={markers.length}
        showHandInfo
      >
        {/* Instructions */}
        <div
          style={{
            marginTop: 10,
            fontSize: 10,
            color: '#666',
            borderTop: '1px solid #333',
            paddingTop: 8,
          }}
        >
          Click anywhere to mark - Markers persist across frames
          <br />
          Tell Claude: &quot;Move hand from M1 to M2 at frame X&quot;
        </div>
      </DebugSceneOverlay>

      {/* Scene Timeline - Bottom */}
      <DebugSceneTimeline
        scenes={SCENE_INFO}
        currentFrame={frame}
        totalFrames={durationInFrames}
      />

      {/* Quick Scene Reference - Top Right */}
      <div
        style={{
          position: 'absolute',
          top: 15,
          right: 15,
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid #444',
          borderRadius: 8,
          padding: '8px 12px',
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#888',
          zIndex: 9999,
        }}
      >
        {SCENE_INFO.map((scene, i) => {
          const isActive = frame >= scene.start && frame < scene.end;
          return (
            <div
              key={i}
              style={{
                color: isActive ? '#00ff00' : '#666',
                fontWeight: isActive ? 'bold' : 'normal',
                marginBottom: 2,
              }}
            >
              {isActive ? '▶' : '○'} {scene.name}: {scene.start}-{scene.end}{' '}
              {scene.hand !== 'none' ? `[${scene.hand}]` : ''}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
