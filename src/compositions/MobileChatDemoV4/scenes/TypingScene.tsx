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
import { PhoneMockup } from '../../../components/PhoneMockup';
import { FloatingHand } from '../../../components/FloatingHand';
import { COLORS, PHONE, COORDINATES, TYPING, SCREENSHOTS } from '../constants';

/**
 * TypingScene - Letter-by-letter typing with zoom
 * Duration: 85 frames
 * Scene 3 - User types second question (28 characters)
 *
 * V4: Uses FloatingHand with hand-click Lottie animation
 */
export const TypingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const totalTypingFrames = 85; // Total scene duration

  // Timing: Click at frame 5, wait 30 frames (1 second), then start typing at frame 35
  const typingStartFrame = 35;
  const typingEndFrame = 80;

  // Calculate which typing stage to show (1-28)
  const typingProgress = interpolate(frame, [typingStartFrame, typingEndFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const currentStage = Math.min(
    Math.max(1, Math.ceil(typingProgress * TYPING.stages)),
    TYPING.stages
  );

  // Pad stage number to 2 digits
  const stageNum = currentStage.toString().padStart(2, '0');
  const screenshotPath = `${SCREENSHOTS.typingPrefix}${stageNum}.png`;

  // Zoom in after click, before typing (frames 15-30)
  const zoomProgress = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const zoomScale = interpolate(zoomProgress, [0, 1], [1, 1.4]);
  const zoomOffsetY = interpolate(zoomProgress, [0, 1], [0, -350]);
  const zoomOffsetX = interpolate(zoomProgress, [0, 1], [0, -120]); // Shift to center input

  const finalScale = PHONE.baseScale * zoomScale;

  // Hand position - convert phone coordinates to screen coordinates
  // The phone is centered at 540, 960 (center of 1080x1920)
  // Account for zoom and offset
  const baseHandX = 540 + (COORDINATES.chatInput.x - PHONE.width / 2) * PHONE.baseScale;
  const baseHandY = 960 + (COORDINATES.chatInput.y - PHONE.height / 2) * PHONE.baseScale + 120 - 140; // +120 global offset, -140 to raise click position

  // Hand path: enter from right, tap input, then exit BEFORE typing starts
  const handPath = [
    // Enter from bottom-right
    { x: baseHandX + 250, y: baseHandY + 300, frame: 0, gesture: 'pointer' as const, scale: 1 },
    // Move to input position
    { x: baseHandX, y: baseHandY, frame: 4, gesture: 'pointer' as const, scale: 1 },
    // Click gesture (hold for the click animation)
    { x: baseHandX, y: baseHandY, frame: 5, gesture: 'click' as const, scale: 1, duration: 10 },
    // Exit - move away before typing starts (typing starts at frame 35)
    { x: baseHandX - 150, y: baseHandY + 250, frame: 25, gesture: 'pointer' as const, scale: 1 },
  ];

  // Show hand only during click sequence (frames 0-28)
  const showHand = frame < 30;

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
          screenshot={screenshotPath}
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        />
      </div>

      {/* FloatingHand with hand-click Lottie animation */}
      {showHand && (
        <FloatingHand
          path={handPath}
          startFrame={0}
          animation="hand-click"
          size={132}
          showRipple={true}
          physics={{
            floatAmplitude: 3,
            floatSpeed: 0.04,
            velocityScale: 0.35,
            maxRotation: 15,
            shadowEnabled: true,
            shadowDistance: 10,
            shadowBlur: 12,
            smoothing: 0.18,
          }}
        />
      )}

      {/* Audio: tap on input field at local frame 5 */}
      <Sequence from={5} durationInFrames={15}>
        <Audio src={staticFile('audio/send-click.wav')} volume={0.5} />
      </Sequence>

      {/* Audio: typing sound from local frame 35 to 80 */}
      <Sequence from={35} durationInFrames={45}>
        <Audio src={staticFile('audio/typing-soft.wav')} volume={0.5} loop />
      </Sequence>
    </AbsoluteFill>
  );
};
