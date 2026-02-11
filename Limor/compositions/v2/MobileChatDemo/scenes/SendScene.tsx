import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { TouchAnimation, createTouchPath } from '../../../components/TouchAnimation';
import { COLORS, PHONE, COORDINATES } from '../constants';

/**
 * SendScene - Pan to send button and tap it
 * Duration: 30 frames (1s)
 * Scene 4:
 *   - Phase 1 (0-12): Pan from input (right) to send button (left) - no finger
 *   - Phase 2 (12-25): Finger appears at send button and taps
 *   - Phase 3 (18-30): Zoom out to full view
 */
export const SendScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase timing
  const panEnd = 12;          // Pan complete
  const sendTapStart = 12;    // Finger appears at send button
  const sendTapEnd = 25;      // Tap animation complete

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

  // Keep Y steady during pan, then animate to 0 during zoom out
  const zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-350, 0]);

  // Keep zoomed in during pan, then zoom out
  const zoomScale = interpolate(zoomOutProgress, [0, 1], [1.4, 1]);

  // Touch path for send button tap
  const sendTapPath = createTouchPath(
    [
      { x: COORDINATES.sendButton.x, y: COORDINATES.sendButton.y, tap: true },
    ],
    5,
    0
  );

  const finalScale = PHONE.baseScale * zoomScale;

  // Show finger only when tapping send button (after pan completes)
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
          screenshot="mobile-chat-3-ready.png"
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        >
          {/* Send button tap animation - appears after pan */}
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
