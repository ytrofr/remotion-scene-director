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
import { getSavedPath } from '../../SceneDirector/codedPaths';
import { COLORS, PHONE, COORDINATES, SCREENSHOTS } from '../constants';

/**
 * SendScene - Pan to send button and tap it
 * Duration: 30 frames
 * Scene 4 - Pan from input to send button, then tap
 *
 * V4: Uses FloatingHand with hand-click Lottie animation
 */
export const SendScene: React.FC = () => {
  const frame = useCurrentFrame();

  const panEnd = 12;
  const sendTapStart = 12;
  const sendTapEnd = 25;

  // Pan progress (frames 0-12)
  const panProgress = interpolate(frame, [0, panEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // Zoom out progress (frames 18-30)
  const zoomOutProgress = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // Pan from right (input at -120) to left (send button at +100)
  const zoomOffsetX = interpolate(panProgress, [0, 1], [-120, 100]);
  const zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-350, 0]);
  const zoomScale = interpolate(zoomOutProgress, [0, 1], [1.4, 1]);

  const finalScale = PHONE.baseScale * zoomScale;

  // Hand position for send button - convert phone coordinates to screen coordinates
  const baseHandX = 540 + (COORDINATES.sendButton.x - PHONE.width / 2) * PHONE.baseScale - 40; // -40 to shift left
  const baseHandY = 960 + (COORDINATES.sendButton.y - PHONE.height / 2) * PHONE.baseScale + 120 - 190; // +120 global offset, -190 to raise click position

  // Hand path: enter from right, move to send button, tap, then exit
  const savedV4Send = getSavedPath('MobileChatDemoCombined', '9-V4-Send');
  const handPath = savedV4Send?.path ?? [
    // Enter from right side
    { x: baseHandX + 300, y: baseHandY - 100, frame: 0, gesture: 'pointer' as const, scale: 1 },
    // Move to send button area (following the pan)
    { x: baseHandX + 50, y: baseHandY, frame: 10, gesture: 'pointer' as const, scale: 1 },
    // Position at send button
    { x: baseHandX, y: baseHandY, frame: 12, gesture: 'pointer' as const, scale: 1 },
    // Click gesture
    { x: baseHandX, y: baseHandY, frame: 13, gesture: 'click' as const, scale: 1, duration: 6 },
    // Exit - move down and away
    { x: baseHandX + 100, y: baseHandY + 250, frame: 24, gesture: 'pointer' as const, scale: 1 },
  ];

  const showHand = frame >= 0 && frame < 26;

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
          screenshot={SCREENSHOTS.readyToSend}
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
            floatAmplitude: 2,
            floatSpeed: 0.04,
            velocityScale: 0.3,
            maxRotation: 12,
            shadowEnabled: true,
            shadowDistance: 10,
            shadowBlur: 12,
            smoothing: 0.15,
          }}
        />
      )}

      {/* Audio: send tap at local frame 13 (hand clicks send) */}
      <Sequence from={13} durationInFrames={15}>
        <Audio src={staticFile('audio/send-click.wav')} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
