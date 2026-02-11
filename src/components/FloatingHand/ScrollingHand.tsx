import React from 'react';
import { FloatingHand } from './FloatingHand';
import { HandPathPoint } from './types';

/**
 * ScrollingHand - A static hand that performs scroll gesture while content scrolls
 *
 * KEY PATTERN (learned 2024):
 * - Hand stays in ONE PLACE (doesn't move during scroll)
 * - Uses hand-scroll-clean animation (dark finger, NO arrow)
 * - Tilted 20° to the left for natural look
 * - No floating/velocity - completely static position
 * - Screen/content scrolls while hand stays still
 * - Hand enters from right, exits to right
 *
 * @example
 * ```tsx
 * <ScrollingHand
 *   x={600}           // Static X position
 *   y={960}           // Static Y position
 *   enterFrame={0}    // When hand enters
 *   scrollStartFrame={35}  // When scroll gesture starts
 *   scrollEndFrame={200}   // When scroll gesture ends
 *   exitFrame={250}   // When hand exits
 *   totalFrames={300} // Total video frames
 * />
 * ```
 */

interface ScrollingHandProps {
  /** X position where hand stays during scroll */
  x: number;
  /** Y position where hand stays during scroll */
  y: number;
  /** Frame when hand enters from right */
  enterFrame?: number;
  /** Frame when scroll gesture starts */
  scrollStartFrame: number;
  /** Frame when scroll gesture ends */
  scrollEndFrame: number;
  /** Frame when hand starts exiting */
  exitFrame?: number;
  /** Total frames in video (for exit animation) */
  totalFrames: number;
  /** Hand size (default: 140) */
  size?: number;
  /** Tilt angle in degrees, negative = left (default: -20) */
  tilt?: number;
  /** Use dark variant for light backgrounds */
  dark?: boolean;
}

export const ScrollingHand: React.FC<ScrollingHandProps> = ({
  x,
  y,
  enterFrame = 0,
  scrollStartFrame,
  scrollEndFrame,
  exitFrame,
  totalFrames,
  size = 140,
  tilt = -20,
  dark = false,
}) => {
  // Default exitFrame to scrollEndFrame + 10 if not provided
  const actualExitFrame = exitFrame ?? scrollEndFrame + 10;

  // Generate static path - hand stays in place during scroll
  const path: HandPathPoint[] = [
    // Enter from right
    {
      x: 1200,
      y,
      frame: enterFrame,
      gesture: 'pointer',
      scale: 1,
      rotation: 0
    },
    {
      x,
      y,
      frame: enterFrame + 30,
      gesture: 'pointer',
      scale: 1,
      rotation: tilt
    },

    // Stay in place during scroll (gesture: scroll)
    {
      x,
      y,
      frame: scrollStartFrame,
      gesture: 'scroll',
      scale: 1,
      rotation: tilt
    },
    {
      x,
      y,
      frame: scrollEndFrame,
      gesture: 'scroll',
      scale: 1,
      rotation: tilt
    },

    // Exit to right
    {
      x,
      y,
      frame: actualExitFrame,
      gesture: 'pointer',
      scale: 1,
      rotation: tilt
    },
    {
      x: 1200,
      y,
      frame: totalFrames - 10,
      gesture: 'pointer',
      scale: 0.8,
      rotation: 0
    },
  ];

  return (
    <FloatingHand
      path={path}
      startFrame={enterFrame}
      animation="hand-scroll-clean"
      size={size}
      dark={dark}
      showRipple={false}
      physics={{
        smoothing: 0.15,
        velocityScale: 0,       // No velocity rotation - use fixed rotation
        maxRotation: 0,         // Disabled - using rotation from path
        floatAmplitude: 0,      // No floating - hand stays still
        floatSpeed: 0,
        shadowEnabled: true,
        shadowDistance: 12,
        shadowBlur: 15,
      }}
    />
  );
};

export default ScrollingHand;
