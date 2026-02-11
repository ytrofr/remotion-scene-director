import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { TouchAnimation, createTouchPath } from '../../../components/TouchAnimation';
import { COLORS, PHONE, COORDINATES, TYPING } from '../constants';

/**
 * TypingScene - Letter-by-letter typing with zoom effect
 * Duration: 70 frames (2.3s) - 1.5X FASTER
 *
 * Finger behavior:
 * - Frames 0-8: Finger taps input field
 * - Frames 8+: Finger disappears, just typing animation
 */
export const TypingScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Finger visibility - only show for initial tap (frames 0-8)
  const showFinger = frame < 8;

  // Get current screenshot based on typing progress - 1.5X FASTER
  const getScreenshot = () => {
    const framesPerStage = 60 / TYPING.stages; // 60 frames for all typing (1.5x faster)
    const stage = Math.min(
      TYPING.stages,
      Math.floor(frame / framesPerStage) + 1
    );
    return `mobile-chat-type-${String(stage).padStart(2, '0')}.png`;
  };

  // Zoom effect during typing - zoom in once at start, then hold
  const zoomProgress = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const zoomScale = interpolate(zoomProgress, [0, 1], [1, 1.4]);
  // Shift Y up and X to the right to center input field
  const zoomOffsetY = interpolate(zoomProgress, [0, 1], [0, -350]);
  const zoomOffsetX = interpolate(zoomProgress, [0, 1], [0, -120]); // Shift LEFT to center input

  // Touch path for input tap only
  const touchPath = createTouchPath(
    [
      { x: COORDINATES.chatInput.x, y: COORDINATES.chatInput.y, tap: true },
    ],
    5,
    2 // Small delay before tap
  );

  const finalScale = PHONE.baseScale * zoomScale;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Phone with zoom effect */}
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
          width={PHONE.width}
          height={PHONE.height}
          shadowIntensity={0.6}
        >
          {/* Touch animation - only visible for first 8 frames */}
          {showFinger && (
            <TouchAnimation
              path={touchPath}
              startFrame={0}
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
