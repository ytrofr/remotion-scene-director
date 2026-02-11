import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  Img,
  staticFile,
} from 'remotion';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { TouchAnimation, createTouchPath } from '../../../components/TouchAnimation';
import { COLORS, PHONE, COORDINATES, TYPING, SCREENSHOTS } from '../constants';

/**
 * TypingScene - Letter-by-letter typing with zoom
 * Duration: 85 frames
 * Scene 3 - User types second question (28 characters)
 */
export const TypingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const totalTypingFrames = 75; // Frames for typing animation

  // Calculate which typing stage to show (1-28)
  const typingProgress = interpolate(frame, [8, totalTypingFrames], [0, 1], {
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

  // Zoom in during typing (frames 5-20)
  const zoomProgress = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const zoomScale = interpolate(zoomProgress, [0, 1], [1, 1.4]);
  const zoomOffsetY = interpolate(zoomProgress, [0, 1], [0, -350]);
  const zoomOffsetX = interpolate(zoomProgress, [0, 1], [0, -120]); // Shift to center input

  // Touch path for initial tap on input
  const inputTapPath = createTouchPath(
    [{ x: COORDINATES.chatInput.x, y: COORDINATES.chatInput.y, tap: true }],
    5,
    0
  );

  const finalScale = PHONE.baseScale * zoomScale;

  // Show finger only at start (frames 0-8) - tap input then disappear
  const showFinger = frame < 8;

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
        >
          {/* Initial tap on input - only shows at start, then disappears */}
          {showFinger && (
            <TouchAnimation
              path={inputTapPath}
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
