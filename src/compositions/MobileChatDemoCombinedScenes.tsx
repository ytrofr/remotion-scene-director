/**
 * Custom V2 scenes with FloatingHand pointer gesture for MobileChatDemoCombined.
 *
 * These scenes replace the standard V2 typing/send scenes with versions
 * that include a hand cursor that clicks the input field and send button.
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  Audio,
  Sequence,
  staticFile,
} from 'remotion';

import {
  PHONE as V2_PHONE,
  COORDINATES as V2_COORDINATES,
  TYPING as V2_TYPING,
  COLORS,
} from './MobileChatDemo/constants';
import { PhoneMockup } from '../components/PhoneMockup';
import { FloatingHand } from '../components/FloatingHand';
import { getSavedPath } from './SceneDirector/codedPaths';

// ============ CUSTOM V2 SCENES WITH POINTER GESTURE ============

/**
 * V2TypingSceneWithPointer - Click input, then type
 * 1. Empty chat visible, hand enters and clicks input (frames 0-15)
 * 2. Typing begins after click (frames 15+), with zoom
 */
const TYPING_START_FRAME = 15; // Frame when typing starts (after hand click + exit)

export const V2TypingSceneWithPointer: React.FC = () => {
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
      Math.floor(typingFrame / framesPerStage) + 1,
    );
    return `mobile-chat-type-${String(stage).padStart(2, '0')}.png`;
  };

  // Zoom starts after click, during typing
  const zoomProgress = interpolate(
    frame,
    [TYPING_START_FRAME, TYPING_START_FRAME + 12],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

  const zoomScale = interpolate(zoomProgress, [0, 1], [1, 1.4]);
  const zoomOffsetY = interpolate(zoomProgress, [0, 1], [0, -350]);
  const zoomOffsetX = interpolate(zoomProgress, [0, 1], [0, -120]);

  const finalScale = V2_PHONE.baseScale * zoomScale;

  // Hand position - convert phone coordinates to screen coordinates
  const baseHandX =
    540 +
    (V2_COORDINATES.chatInput.x - V2_PHONE.width / 2) * V2_PHONE.baseScale;
  const baseHandY =
    960 +
    (V2_COORDINATES.chatInput.y - V2_PHONE.height / 2) * V2_PHONE.baseScale +
    120 -
    120; // -120 = raised 20px from -100

  // Hand path: enter, click input, exit
  const savedV2Typing = getSavedPath('MobileChatDemoCombined', '3-V2-Typing');
  const handPath = savedV2Typing?.path ?? [
    {
      x: baseHandX + 250,
      y: baseHandY + 300,
      frame: 0,
      gesture: 'pointer' as const,
      scale: 1,
    },
    {
      x: baseHandX,
      y: baseHandY,
      frame: 5,
      gesture: 'pointer' as const,
      scale: 1,
    },
    {
      x: baseHandX,
      y: baseHandY,
      frame: 6,
      gesture: 'click' as const,
      scale: 1,
      duration: 4,
    },
    {
      x: baseHandX - 150,
      y: baseHandY + 250,
      frame: 14,
      gesture: 'pointer' as const,
      scale: 1,
    },
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
      <Sequence
        from={TYPING_START_FRAME}
        durationInFrames={70 - TYPING_START_FRAME}
      >
        <Audio src={staticFile('audio/typing-soft.wav')} volume={0.5} loop />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * V2SendSceneWithPointer - Send with FloatingHand pointer (no click)
 * Uses pointer gesture - hand moves to send button, points, then exits
 */
export const V2SendSceneWithPointer: React.FC = () => {
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
  const baseHandX =
    540 +
    (V2_COORDINATES.sendButton.x - V2_PHONE.width / 2) * V2_PHONE.baseScale -
    40;
  const baseHandY =
    960 +
    (V2_COORDINATES.sendButton.y - V2_PHONE.height / 2) * V2_PHONE.baseScale +
    120 -
    150;

  // Hand path: pointer gesture (no click)
  const savedV2Send = getSavedPath('MobileChatDemoCombined', '4-V2-Send');
  const handPath = savedV2Send?.path ?? [
    {
      x: baseHandX + 300,
      y: baseHandY - 100,
      frame: 0,
      gesture: 'pointer' as const,
      scale: 1,
    },
    {
      x: baseHandX + 50,
      y: baseHandY,
      frame: 10,
      gesture: 'pointer' as const,
      scale: 1,
    },
    {
      x: baseHandX,
      y: baseHandY,
      frame: 12,
      gesture: 'pointer' as const,
      scale: 1,
    },
    {
      x: baseHandX,
      y: baseHandY,
      frame: 18,
      gesture: 'pointer' as const,
      scale: 1,
    }, // Hold pointer
    {
      x: baseHandX - 200,
      y: baseHandY + 200,
      frame: 26,
      gesture: 'pointer' as const,
      scale: 1,
    },
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
