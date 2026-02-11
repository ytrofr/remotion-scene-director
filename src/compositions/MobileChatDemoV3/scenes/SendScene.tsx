import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { TouchAnimation, createTouchPath } from '../../../components/TouchAnimation';
import { COLORS, PHONE, COORDINATES, SCREENSHOTS } from '../constants';

/**
 * SendScene - Pan to send button and tap it
 * Duration: 30 frames
 * Scene 4 - Pan from input to send button, then tap
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

  const sendTapPath = createTouchPath(
    [{ x: COORDINATES.sendButton.x, y: COORDINATES.sendButton.y, tap: true }],
    5,
    0
  );

  const finalScale = PHONE.baseScale * zoomScale;
  const showSendFinger = frame >= sendTapStart && frame < sendTapEnd;

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
        >
          {showSendFinger && (
            <TouchAnimation
              path={sendTapPath}
              startFrame={sendTapStart}
              fingerSize={45 / zoomScale}
              rippleColor={COLORS.primary}
              showFinger={true}
            />
          )}
        </PhoneMockup>
      </div>
    </AbsoluteFill>
  );
};
