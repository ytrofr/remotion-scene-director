import React, { useEffect, useState } from 'react';
import { Lottie, LottieAnimationData } from '@remotion/lottie';
import {
  staticFile,
  delayRender,
  continueRender,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';

/**
 * ScrollSyncedHand - Hand that ONLY animates during active scrolling
 *
 * KEY FEATURES:
 * - Hand stays in ONE PLACE (doesn't move)
 * - Uses hand-scroll-clean animation
 * - Animation ONLY plays when isScrolling=true
 * - Tilted 20° to the left
 * - Perfect sync with screen scroll
 *
 * @example
 * ```tsx
 * <ScrollSyncedHand
 *   x={600}
 *   y={960}
 *   isScrolling={isScrolling}
 *   scrollProgress={scrollProgress}
 *   enterFrame={0}
 *   exitFrame={300}
 *   totalFrames={350}
 * />
 * ```
 */

interface ScrollSyncedHandProps {
  /** X position where hand stays */
  x: number;
  /** Y position where hand stays */
  y: number;
  /** Whether screen is currently scrolling */
  isScrolling: boolean;
  /** Progress of current scroll (0-1) */
  scrollProgress: number;
  /** Frame when hand enters */
  enterFrame?: number;
  /** Frame when hand exits */
  exitFrame: number;
  /** Total frames in video */
  totalFrames: number;
  /** Hand size (default: 140) */
  size?: number;
  /** Tilt angle in degrees (default: -20 = left) */
  tilt?: number;
}

export const ScrollSyncedHand: React.FC<ScrollSyncedHandProps> = ({
  x,
  y,
  isScrolling,
  scrollProgress,
  enterFrame = 0,
  exitFrame,
  totalFrames,
  size = 140,
  tilt = -20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);
  const [handle] = useState(() => delayRender('Loading scroll hand animation'));

  // Load Lottie animation
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch(staticFile('lottie/hand-scroll-clean.json'));
        const data = await response.json();
        setAnimationData(data as LottieAnimationData);
        continueRender(handle);
      } catch (error) {
        console.error('Failed to load hand animation:', error);
        continueRender(handle);
      }
    };
    loadAnimation();
  }, [handle]);

  // Calculate enter/exit visibility
  const enterDuration = 30;
  const exitDuration = 20;

  // Enter animation
  const enterProgress = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // Exit animation
  const exitProgress = frame >= exitFrame
    ? interpolate(frame, [exitFrame, exitFrame + exitDuration], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  // Combined opacity
  const opacity = enterProgress * exitProgress;

  // Position animation (enter from right, exit to right)
  const posX = interpolate(
    enterProgress,
    [0, 1],
    [x + 300, x]
  );

  const exitX = frame >= exitFrame
    ? interpolate(frame, [exitFrame, exitFrame + exitDuration], [x, x + 300], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : posX;

  // Rotation animation (0 → tilt during enter, tilt → 0 during exit)
  const rotation = interpolate(
    enterProgress,
    [0, 1],
    [0, tilt]
  );

  const exitRotation = frame >= exitFrame
    ? interpolate(frame, [exitFrame, exitFrame + exitDuration], [tilt, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : rotation;

  // Don't render if not visible
  if (opacity <= 0 || !animationData) {
    return null;
  }

  // ★ KEY: playbackRate based on scroll state
  // When scrolling: animate fast (2x)
  // When paused: freeze (0.001 - nearly stopped)
  const playbackRate = isScrolling ? 2 : 0.001;

  return (
    <div
      style={{
        position: 'absolute',
        left: exitX,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${exitRotation}deg)`,
        opacity,
        filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.4))',
        pointerEvents: 'none',
      }}
    >
      <Lottie
        animationData={animationData}
        style={{
          width: '100%',
          height: '100%',
        }}
        playbackRate={playbackRate}
        loop={true}
        direction="forward"
      />
    </div>
  );
};

export default ScrollSyncedHand;
