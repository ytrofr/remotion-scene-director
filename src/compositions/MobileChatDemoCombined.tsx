import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Audio, Sequence, staticFile } from 'remotion';
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

// V2 constants for custom scenes
import { PHONE as V2_PHONE, COORDINATES as V2_COORDINATES, TYPING as V2_TYPING } from './MobileChatDemo/constants';

// PhoneMockup and FloatingHand for custom V2 scenes with pointer gesture
import { PhoneMockup } from '../components/PhoneMockup';
import { FloatingHand } from '../components/FloatingHand';

// V4 Scene components (second question with Lottie hand)
import {
  TypingScene as V4TypingScene,
  SendScene as V4SendScene,
  UserMessageScene as V4UserMessageScene,
  ThinkingScene as V4ThinkingScene,
  ResponseScene as V4ResponseScene,
  OutroScene as V4OutroScene,
} from './MobileChatDemoV4/scenes';

// Audio is embedded inside each scene component using local frame numbers
// This ensures perfect sync with TransitionSeries timing

// Constants
import { COLORS } from './MobileChatDemo/constants';

// ============ CUSTOM V2 SCENES WITH POINTER GESTURE ============

/**
 * V2TypingSceneWithPointer - Click input, then type
 * 1. Empty chat visible, hand enters and clicks input (frames 0-15)
 * 2. Typing begins after click (frames 15+), with zoom
 */
const TYPING_START_FRAME = 15; // Frame when typing starts (after hand click + exit)

const V2TypingSceneWithPointer: React.FC = () => {
  const frame = useCurrentFrame();

  // Screenshot: empty chat during click, then typing progression
  const getScreenshot = () => {
    if (frame < TYPING_START_FRAME) {
      return 'mobile-chat-1-empty.png';
    }
    const typingFrame = frame - TYPING_START_FRAME;
    const typingDuration = 70 - TYPING_START_FRAME; // remaining frames for typing
    const framesPerStage = typingDuration / V2_TYPING.stages;
    const stage = Math.min(
      V2_TYPING.stages,
      Math.floor(typingFrame / framesPerStage) + 1
    );
    return `mobile-chat-type-${String(stage).padStart(2, '0')}.png`;
  };

  // Zoom starts after click, during typing
  const zoomProgress = interpolate(frame, [TYPING_START_FRAME, TYPING_START_FRAME + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const zoomScale = interpolate(zoomProgress, [0, 1], [1, 1.4]);
  const zoomOffsetY = interpolate(zoomProgress, [0, 1], [0, -350]);
  const zoomOffsetX = interpolate(zoomProgress, [0, 1], [0, -120]);

  const finalScale = V2_PHONE.baseScale * zoomScale;

  // Hand position - convert phone coordinates to screen coordinates
  const baseHandX = 540 + (V2_COORDINATES.chatInput.x - V2_PHONE.width / 2) * V2_PHONE.baseScale;
  const baseHandY = 960 + (V2_COORDINATES.chatInput.y - V2_PHONE.height / 2) * V2_PHONE.baseScale + 120 - 120; // -120 = raised 20px from -100

  // Hand path: enter, click input, exit
  const handPath = [
    { x: baseHandX + 250, y: baseHandY + 300, frame: 0, gesture: 'pointer' as const, scale: 1 },
    { x: baseHandX, y: baseHandY, frame: 5, gesture: 'pointer' as const, scale: 1 },
    { x: baseHandX, y: baseHandY, frame: 6, gesture: 'click' as const, scale: 1, duration: 4 },
    { x: baseHandX - 150, y: baseHandY + 250, frame: 14, gesture: 'pointer' as const, scale: 1 },
  ];

  const showHand = frame < 16;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${finalScale}) translate(${zoomOffsetX / finalScale}px, ${zoomOffsetY / finalScale}px)`,
          transformOrigin: 'center center',
        }}
      >
        <PhoneMockup
          screenshot={getScreenshot()}
          width={V2_PHONE.width}
          height={V2_PHONE.height}
          shadowIntensity={0.6}
        />
      </div>

      {/* FloatingHand - click then exit */}
      {showHand && (
        <FloatingHand
          path={handPath}
          animation="hand-click"
          size={120}
          showRipple={true}
        />
      )}

      {/* Audio: tap on input field at local frame 6 */}
      <Sequence from={6} durationInFrames={15}>
        <Audio src={staticFile('audio/send-click.wav')} volume={0.5} />
      </Sequence>

      {/* Audio: typing sound from local frame 15 to 70 */}
      <Sequence from={TYPING_START_FRAME} durationInFrames={70 - TYPING_START_FRAME}>
        <Audio src={staticFile('audio/typing-soft.wav')} volume={0.5} loop />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * V2SendSceneWithPointer - Send with FloatingHand pointer (no click)
 * Uses pointer gesture - hand moves to send button, points, then exits
 */
const V2SendSceneWithPointer: React.FC = () => {
  const frame = useCurrentFrame();

  const panEnd = 12;

  // Pan progress
  const panProgress = interpolate(frame, [0, panEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // Zoom out progress
  const zoomOutProgress = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const panOffsetX = interpolate(panProgress, [0, 1], [-120, 100]);
  // During zoom out, bring X offset back to 0 (center)
  const zoomOffsetX = interpolate(zoomOutProgress, [0, 1], [panOffsetX, 0]);
  const zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-350, 0]);
  const zoomScale = interpolate(zoomOutProgress, [0, 1], [1.4, 1]);

  const finalScale = V2_PHONE.baseScale * zoomScale;

  // Hand position for send button
  const baseHandX = 540 + (V2_COORDINATES.sendButton.x - V2_PHONE.width / 2) * V2_PHONE.baseScale - 40;
  const baseHandY = 960 + (V2_COORDINATES.sendButton.y - V2_PHONE.height / 2) * V2_PHONE.baseScale + 120 - 150;

  // Hand path: pointer gesture (no click)
  const handPath = [
    { x: baseHandX + 300, y: baseHandY - 100, frame: 0, gesture: 'pointer' as const, scale: 1 },
    { x: baseHandX + 50, y: baseHandY, frame: 10, gesture: 'pointer' as const, scale: 1 },
    { x: baseHandX, y: baseHandY, frame: 12, gesture: 'pointer' as const, scale: 1 },
    { x: baseHandX, y: baseHandY, frame: 18, gesture: 'pointer' as const, scale: 1 }, // Hold pointer
    { x: baseHandX - 200, y: baseHandY + 200, frame: 26, gesture: 'pointer' as const, scale: 1 },
  ];

  const showHand = frame < 28;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${finalScale}) translate(${zoomOffsetX / finalScale}px, ${zoomOffsetY / finalScale}px)`,
          transformOrigin: 'center center',
        }}
      >
        <PhoneMockup
          screenshot="mobile-chat-3-ready.png"
          width={V2_PHONE.width}
          height={V2_PHONE.height}
          shadowIntensity={0.6}
        />
      </div>

      {/* FloatingHand with pointer gesture */}
      {showHand && (
        <FloatingHand
          path={handPath}
          animation="hand-click"
          size={120}
          showRipple={false}
        />
      )}

      {/* Audio: send tap at local frame 12 (hand reaches send button) */}
      <Sequence from={12} durationInFrames={15}>
        <Audio src={staticFile('audio/send-click.wav')} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};

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

// Calculate total frames
const calculateTotal = () => {
  const v2Total = TIMINGS.v2Intro + TIMINGS.v2ChatEmpty + TIMINGS.v2Typing +
                  TIMINGS.v2Send + TIMINGS.v2UserMessage + TIMINGS.v2Thinking + TIMINGS.v2Response;
  const v4Total = TIMINGS.v4Typing + TIMINGS.v4Send + TIMINGS.v4UserMessage +
                  TIMINGS.v4Thinking + TIMINGS.v4Response + TIMINGS.v4Outro;
  const transitionOverlap = TRANSITIONS_CONFIG.fadeIntro + TRANSITIONS_CONFIG.crossfade + TRANSITIONS_CONFIG.slideOutro;
  return v2Total + v4Total - transitionOverlap;
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
      <div style={{ transform: 'translateY(120px)', width: '100%', height: '100%' }}>
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
            timing={linearTiming({ durationInFrames: TRANSITIONS_CONFIG.fadeIntro })}
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
            timing={linearTiming({ durationInFrames: TRANSITIONS_CONFIG.crossfade })}
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

export const COMBINED_SCENE_INFO = [
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
const SCENE_INFO = COMBINED_SCENE_INFO;


// ============ HAND PATH MARKERS (from verified click positions) ============

// Verified anchor positions (user-clicked) + 120 translateY offset
const V2_INPUT = { x: 671, y: 1703 };  // Chat input (1603 + 120 - 20 raised)
const V2_SEND  = { x: 127, y: 1730 };  // Send button (1610 + 120)
// V4 scenes have -40px Y offset vs V2
const V4_INPUT = { x: 671, y: 1683 };  // (1563 + 120)
const V4_SEND  = { x: 127, y: 1690 };  // (1570 + 120)

export const COMBINED_HAND_PATH_MARKERS = [
  // V2 Typing (scene starts at global frame 65) - click input, then type
  { x: V2_INPUT.x + 250, y: V2_INPUT.y + 300, globalFrame: 65, localFrame: 0, scene: '3-V2-Typing', gesture: 'pointer', label: 'V2-T1 enter' },
  { x: V2_INPUT.x, y: V2_INPUT.y, globalFrame: 70, localFrame: 5, scene: '3-V2-Typing', gesture: 'pointer', label: 'V2-T2 input' },
  { x: V2_INPUT.x, y: V2_INPUT.y, globalFrame: 71, localFrame: 6, scene: '3-V2-Typing', gesture: 'click', label: 'V2-T3 CLICK' },
  { x: V2_INPUT.x - 150, y: V2_INPUT.y + 250, globalFrame: 79, localFrame: 14, scene: '3-V2-Typing', gesture: 'pointer', label: 'V2-T4 exit' },

  // V2 Send (scene starts at global frame 135)
  { x: V2_SEND.x + 300, y: V2_SEND.y - 100, globalFrame: 135, localFrame: 0, scene: '4-V2-Send', gesture: 'pointer', label: 'V2-S1 enter' },
  { x: V2_SEND.x + 50, y: V2_SEND.y, globalFrame: 145, localFrame: 10, scene: '4-V2-Send', gesture: 'pointer', label: 'V2-S2 approach' },
  { x: V2_SEND.x, y: V2_SEND.y, globalFrame: 147, localFrame: 12, scene: '4-V2-Send', gesture: 'pointer', label: 'V2-S3 send' },
  { x: V2_SEND.x, y: V2_SEND.y, globalFrame: 153, localFrame: 18, scene: '4-V2-Send', gesture: 'pointer', label: 'V2-S4 hold' },
  { x: V2_SEND.x - 200, y: V2_SEND.y + 200, globalFrame: 161, localFrame: 26, scene: '4-V2-Send', gesture: 'pointer', label: 'V2-S5 exit' },

  // V4 Typing (scene starts at global frame 290)
  { x: V4_INPUT.x + 250, y: V4_INPUT.y + 300, globalFrame: 290, localFrame: 0, scene: '8-V4-Typing', gesture: 'pointer', label: 'V4-T1 enter' },
  { x: V4_INPUT.x, y: V4_INPUT.y, globalFrame: 294, localFrame: 4, scene: '8-V4-Typing', gesture: 'pointer', label: 'V4-T2 input' },
  { x: V4_INPUT.x, y: V4_INPUT.y, globalFrame: 295, localFrame: 5, scene: '8-V4-Typing', gesture: 'click', label: 'V4-T3 CLICK' },
  { x: V4_INPUT.x - 150, y: V4_INPUT.y + 250, globalFrame: 315, localFrame: 25, scene: '8-V4-Typing', gesture: 'pointer', label: 'V4-T4 exit' },

  // V4 Send (scene starts at global frame 375)
  { x: V4_SEND.x + 300, y: V4_SEND.y - 100, globalFrame: 375, localFrame: 0, scene: '9-V4-Send', gesture: 'pointer', label: 'V4-S1 enter' },
  { x: V4_SEND.x + 50, y: V4_SEND.y, globalFrame: 385, localFrame: 10, scene: '9-V4-Send', gesture: 'pointer', label: 'V4-S2 approach' },
  { x: V4_SEND.x, y: V4_SEND.y, globalFrame: 387, localFrame: 12, scene: '9-V4-Send', gesture: 'pointer', label: 'V4-S3 send' },
  { x: V4_SEND.x, y: V4_SEND.y, globalFrame: 388, localFrame: 13, scene: '9-V4-Send', gesture: 'click', label: 'V4-S4 CLICK' },
  { x: V4_SEND.x + 100, y: V4_SEND.y + 250, globalFrame: 399, localFrame: 24, scene: '9-V4-Send', gesture: 'pointer', label: 'V4-S5 exit' },
];
const HAND_PATH_MARKERS = COMBINED_HAND_PATH_MARKERS;

// ============ INTERACTIVE DEBUG ============

export const MobileChatDemoCombinedDebugInteractive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [markers, setMarkers] = React.useState<Array<{x: number, y: number, frame: number, label: string}>>([]);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  // Find current scene
  const currentScene = SCENE_INFO.find(s => frame >= s.start && frame < s.end) || SCENE_INFO[0];
  const frameInScene = frame - currentScene.start;

  // Time formatting
  const seconds = Math.floor(frame / fps);
  const frames = frame % fps;
  const timeStr = `${seconds}:${frames.toString().padStart(2, '0')}`;

  const overlayRef = React.useRef<HTMLDivElement>(null);

  const getCompositionCoords = (e: React.MouseEvent) => {
    if (!overlayRef.current) return { x: 0, y: 0 };
    const rect = overlayRef.current.getBoundingClientRect();
    // Map screen pixels to composition pixels (1080x1920)
    return {
      x: Math.round((e.clientX - rect.left) * (1080 / rect.width)),
      y: Math.round((e.clientY - rect.top) * (1920 / rect.height)),
    };
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    const { x, y } = getCompositionCoords(e);
    const label = `M${markers.length + 1}`;
    setMarkers([...markers, { x, y, frame, label }]);
    console.log(`MARKER ${label}: (${x}, ${y}) @ frame ${frame} [${timeStr}] - ${currentScene.name}`);
  };

  const handleOverlayMouseMove = (e: React.MouseEvent) => {
    setMousePos(getCompositionCoords(e));
  };

  const exportMarkers = () => {
    const output = markers.map(m => `{ x: ${m.x}, y: ${m.y}, frame: ${m.frame} }, // ${m.label}`).join('\n');
    navigator.clipboard.writeText(output);
    alert('Markers copied to clipboard!\n\n' + output);
  };

  return (
    <AbsoluteFill style={{ background: COLORS.background }}>
      {/* Main Demo */}
      <MobileChatDemoCombined />

      {/* Transparent click-capture overlay - sits above demo, below UI panels */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          zIndex: 9980,
        }}
        onClick={handleOverlayClick}
        onMouseMove={handleOverlayMouseMove}
      />

      {/* Crosshairs */}
      <div style={{ position: 'absolute', left: mousePos.x - 1, top: 0, bottom: 0, width: 2, background: 'rgba(255,0,0,0.7)', pointerEvents: 'none', zIndex: 9995 }} />
      <div style={{ position: 'absolute', top: mousePos.y - 1, left: 0, right: 0, height: 2, background: 'rgba(255,0,0,0.7)', pointerEvents: 'none', zIndex: 9995 }} />
      {/* Crosshair center dot */}
      <div style={{ position: 'absolute', left: mousePos.x - 4, top: mousePos.y - 4, width: 8, height: 8, borderRadius: '50%', background: '#ff0', border: '1px solid #f00', pointerEvents: 'none', zIndex: 9996 }} />

      {/* Hand Path Markers - computed from scene formulas */}
      {HAND_PATH_MARKERS.filter(hp => hp.x >= 0 && hp.x <= 1080 && hp.y >= 0 && hp.y <= 1920).map((hp, i) => {
        const isCurrentFrame = frame === hp.globalFrame;
        const isInRange = frame >= hp.globalFrame - 5 && frame <= hp.globalFrame + 5;
        const isClick = hp.gesture === 'click';
        const isV4 = hp.scene.startsWith('8') || hp.scene.startsWith('9');

        return (
          <div
            key={`hp-${i}`}
            style={{
              position: 'absolute',
              left: hp.x,
              top: hp.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9990,
              opacity: isCurrentFrame ? 1 : isInRange ? 0.8 : 0.4,
            }}
          >
            <div
              style={{
                width: isClick ? 28 : 18,
                height: isClick ? 28 : 18,
                borderRadius: isClick ? '4px' : '50%',
                background: isClick ? '#ff0' : (isV4 ? '#00ff6b' : '#ff6b00'),
                border: isCurrentFrame ? '4px solid #fff' : '2px solid rgba(255,255,255,0.6)',
                boxShadow: isCurrentFrame ? '0 0 20px #fff' : '0 0 8px rgba(0,0,0,0.5)',
                transform: isClick ? 'rotate(45deg)' : 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -30,
                left: '50%',
                transform: 'translateX(-50%)',
                background: isClick ? '#ff0' : (isV4 ? '#00ff6b' : '#ff6b00'),
                color: '#000',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 9,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                fontWeight: isClick ? 'bold' : 'normal',
              }}
            >
              {hp.label}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)',
                color: '#fff',
                padding: '1px 4px',
                borderRadius: 3,
                fontSize: 8,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}
            >
              @{hp.globalFrame}
            </div>
          </div>
        );
      })}

      {/* Connection lines between hand path points */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9989 }}>
        {['3-V2-Typing', '4-V2-Send', '8-V4-Typing', '9-V4-Send'].map(sceneName => {
          const pts = HAND_PATH_MARKERS.filter(m => m.scene === sceneName);
          const isV4 = sceneName.startsWith('8') || sceneName.startsWith('9');
          return (
            <polyline
              key={sceneName}
              points={pts.map(m => `${m.x},${m.y}`).join(' ')}
              fill="none"
              stroke={isV4 ? '#00ff6b' : '#ff6b00'}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          );
        })}
      </svg>

      {/* User Markers */}
      {markers.map((m, i) => {
        const isActive = frame === m.frame;
        const markerColor = isActive ? '#ff0' : '#f00';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: m.x,
              top: m.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9998,
            }}
          >
            {/* Crosshair lines */}
            <div style={{ position: 'absolute', left: -20, top: -1, width: 40, height: 2, background: markerColor }} />
            <div style={{ position: 'absolute', top: -20, left: -1, width: 2, height: 40, background: markerColor }} />
            {/* Center circle */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: markerColor,
                border: '3px solid #fff',
                boxShadow: `0 0 15px ${markerColor}, 0 0 30px rgba(255,0,0,0.3)`,
                transform: 'translate(-50%, -50%)',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
            {/* Label */}
            <div
              style={{
                position: 'absolute',
                top: -35,
                left: '50%',
                transform: 'translateX(-50%)',
                background: markerColor,
                color: '#000',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
              }}
            >
              {m.label} ({m.x},{m.y}) @{m.frame}
            </div>
          </div>
        );
      })}

      {/* Debug Panel - Top Left */}
      <div
        style={{
          position: 'absolute',
          top: 15,
          left: 15,
          background: 'rgba(0,0,0,0.95)',
          border: '2px solid #00ff00',
          borderRadius: 12,
          padding: '12px 16px',
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#fff',
          minWidth: 320,
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, borderBottom: '1px solid #333', paddingBottom: 8 }}>
          <span style={{ color: '#00ff00', fontSize: 20, fontWeight: 'bold' }}>{timeStr}</span>
          <span style={{ color: '#ff0' }}>Frame {frame}</span>
        </div>

        {/* Scene + Part */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Scene: </span>
          <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{currentScene.name}</span>
          <span style={{
            marginLeft: 8,
            padding: '2px 6px',
            background: currentScene.part === 'V2' ? '#ff6b00' : '#00ff6b',
            color: '#000',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 'bold',
          }}>
            {currentScene.part}
          </span>
        </div>
        <div style={{ color: '#666', marginBottom: 8 }}>Local frame: {frameInScene}</div>

        {/* Mouse Position */}
        <div style={{ marginBottom: 8, padding: 8, background: '#111', borderRadius: 6 }}>
          <div style={{ color: '#f00', marginBottom: 4 }}>🎯 MOUSE</div>
          <div style={{ fontSize: 16, color: '#ff0' }}>x: {mousePos.x}, y: {mousePos.y}</div>
        </div>

        {/* Nearest Hand Marker */}
        {(() => {
          const nearby = HAND_PATH_MARKERS.find(m => Math.abs(m.globalFrame - frame) <= 3);
          return nearby ? (
            <div style={{ marginBottom: 8, padding: 8, background: nearby.gesture === 'click' ? '#332200' : '#112211', borderRadius: 6, border: nearby.gesture === 'click' ? '2px solid #ff0' : '1px solid #333' }}>
              <div style={{ color: nearby.gesture === 'click' ? '#ff0' : '#0f0', marginBottom: 4, fontWeight: 'bold' }}>
                {nearby.label}
              </div>
              <div style={{ fontSize: 11 }}>
                <div>({Math.round(nearby.x)}, {Math.round(nearby.y)}) @{nearby.globalFrame}</div>
              </div>
            </div>
          ) : null;
        })()}

        {/* User Markers */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: '#f0f', marginBottom: 4 }}>MARKERS ({markers.length})</div>
          <div style={{ maxHeight: 60, overflowY: 'auto', fontSize: 11 }}>
            {markers.length === 0 && <div style={{ color: '#666' }}>Click to mark...</div>}
            {markers.slice(-4).map((m, i) => (
              <div key={i} style={{ color: frame === m.frame ? '#ff0' : '#888' }}>
                {m.label}: ({m.x}, {m.y}) @{m.frame}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportMarkers}
            style={{ flex: 1, padding: '8px', background: '#0a0', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
          >
            COPY ALL
          </button>
          <button
            onClick={() => setMarkers([])}
            style={{ flex: 1, padding: '8px', background: '#a00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
          >
            CLEAR
          </button>
        </div>

      </div>

      {/* Scene Timeline - Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 15,
          left: 15,
          right: 15,
          background: 'rgba(0,0,0,0.9)',
          border: '2px solid #444',
          borderRadius: 8,
          padding: '10px 12px',
          fontFamily: 'monospace',
          fontSize: 11,
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      >
        {/* V2/V4 Labels */}
        <div style={{ display: 'flex', marginBottom: 4, fontSize: 10 }}>
          <div style={{ width: '50%', color: '#ff6b00', fontWeight: 'bold' }}>V2: First Question</div>
          <div style={{ width: '50%', color: '#00ff6b', fontWeight: 'bold', textAlign: 'right' }}>V4: Second Question</div>
        </div>
        <div style={{ display: 'flex', gap: 2, height: 24 }}>
          {SCENE_INFO.map((scene, i) => {
            const width = ((scene.end - scene.start) / durationInFrames) * 100;
            const isActive = frame >= scene.start && frame < scene.end;
            const isPast = frame >= scene.end;
            const bgColor = scene.part === 'V2'
              ? (isActive ? '#ff6b00' : isPast ? '#663300' : '#332200')
              : (isActive ? '#00ff6b' : isPast ? '#006633' : '#003322');

            return (
              <div
                key={i}
                style={{
                  width: `${width}%`,
                  height: '100%',
                  background: bgColor,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#000' : '#666',
                  fontWeight: isActive ? 'bold' : 'normal',
                  fontSize: 8,
                  overflow: 'hidden',
                }}
              >
                {scene.name.split('-')[0]}
              </div>
            );
          })}
        </div>
        {/* Playhead */}
        <div
          style={{
            position: 'absolute',
            left: `${(frame / durationInFrames) * 100}%`,
            top: 28,
            bottom: 8,
            width: 2,
            background: '#ff0',
            marginLeft: 12,
          }}
        />
      </div>

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
          fontSize: 9,
          color: '#888',
          zIndex: 9999,
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        {SCENE_INFO.map((scene, i) => {
          const isActive = frame >= scene.start && frame < scene.end;
          const partColor = scene.part === 'V2' ? '#ff6b00' : '#00ff6b';
          return (
            <div
              key={i}
              style={{
                color: isActive ? partColor : '#555',
                fontWeight: isActive ? 'bold' : 'normal',
                marginBottom: 2,
              }}
            >
              {isActive ? '▶' : '○'} {scene.name}: {scene.start}-{scene.end}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default MobileChatDemoCombined;
