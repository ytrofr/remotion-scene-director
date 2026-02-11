import React, { useEffect, useState } from 'react';
import { Lottie, LottieAnimationData } from '@remotion/lottie';
import { staticFile, delayRender, continueRender } from 'remotion';
import { HandStyleProps } from '../types';

/**
 * LottieHand - Professional animated hand using Lottie
 *
 * Uses pre-made Lottie animations from LottieFiles for smooth,
 * professional hand gestures with built-in click/tap animations.
 *
 * Available animations in public/lottie/:
 * - hand-click.json       (10KB)  - Click gesture with finger press animation
 * - hand-tap.json         (14KB)  - Quick tap gesture
 * - hand-tap-alt.json     (12KB)  - Alternative tap gesture (James Lashmar)
 * - hand-point.json       (4KB)   - Pointing finger icon (Eray Asena)
 * - hand-swipe-up.json    (5KB)   - Swipe up with arrow indicator
 * - hand-swipe-right.json (5KB)   - Swipe right gesture
 * - hand-scroll.json      (36KB)  - Scroll gesture with UI cards
 * - hand-scroll-clean.json (5KB) - ★ Clean dark finger scroll (no arrow)
 * - hand-drag.json        (64KB)  - Drag and drop gesture
 * - hand-pinch.json       (106KB) - Pinch zoom in/out gesture (David Tanner)
 *
 * @see https://www.remotion.dev/docs/lottie
 */

/** Available Lottie animation files */
export type LottieAnimationFile =
  | 'hand-click'
  | 'hand-tap'
  | 'hand-tap-alt'
  | 'hand-point'
  | 'hand-swipe-up'
  | 'hand-swipe-right'
  | 'hand-scroll'
  | 'hand-drag'
  | 'hand-pinch'
  | string; // Allow custom files

interface LottieHandProps extends Omit<HandStyleProps, 'color' | 'strokeColor' | 'strokeWidth'> {
  /** Which Lottie animation file to use */
  animationFile?: LottieAnimationFile;
  /** Playback speed (1 = normal, 2 = 2x speed) */
  playbackRate?: number;
  /** Loop the animation */
  loop?: boolean;
  /** Animation direction: 'forward' or 'backward' */
  direction?: 'forward' | 'backward';
  /** Use dark variant (for light backgrounds) */
  dark?: boolean;
}

export const LottieHand: React.FC<LottieHandProps> = ({
  gesture = 'pointer',
  size = 64,
  animationFile = 'hand-click',
  playbackRate = 1,
  loop = true,
  direction = 'forward',
  dark = false,
}) => {
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);
  const [pointerAnimationData, setPointerAnimationData] = useState<LottieAnimationData | null>(null);
  const [handle] = useState(() => delayRender('Loading Lottie animation'));

  // Determine which animation to show based on gesture
  // - pointer/drag: use hand-point (static pointer)
  // - click: use the specified animationFile (tap animation)
  // - scroll: use the specified animationFile (scroll animation)
  const isClickGesture = gesture === 'click';
  const isScrollGesture = gesture === 'scroll';
  const usePointerAnimation = !isClickGesture && !isScrollGesture;

  useEffect(() => {
    const loadAnimations = async () => {
      try {
        // Load the main animation (for click/scroll)
        const response = await fetch(staticFile(`lottie/${animationFile}.json`));
        const data = await response.json();
        setAnimationData(data as LottieAnimationData);

        // Load the pointer animation (for movement)
        const pointerResponse = await fetch(staticFile('lottie/hand-point.json'));
        const pointerData = await pointerResponse.json();
        setPointerAnimationData(pointerData as LottieAnimationData);

        continueRender(handle);
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
        continueRender(handle);
      }
    };

    loadAnimations();
  }, [animationFile, handle]);

  // Adjust playback based on gesture
  // ONLY animate on 'click' gesture - nearly freeze on all other gestures
  const getPlaybackRate = () => {
    switch (gesture) {
      case 'click':
        return playbackRate * 1.2; // Play animation on click
      case 'drag':
      case 'scroll':
        return playbackRate * 0.5; // Slow scroll animation
      default:
        return 0.001; // Nearly frozen - Lottie requires playbackRate > 0
    }
  };

  if (!animationData) {
    return null;
  }

  // Build filter string - dark mode inverts colors for light backgrounds
  const filterStyle = dark
    ? 'invert(1) drop-shadow(3px 4px 6px rgba(0,0,0,0.4))'
    : 'drop-shadow(3px 4px 6px rgba(0,0,0,0.3))';

  return (
    <div
      style={{
        width: size,
        height: size,
        filter: filterStyle,
      }}
    >
      <Lottie
        animationData={animationData}
        style={{
          width: '100%',
          height: '100%',
        }}
        playbackRate={getPlaybackRate()}
        loop={loop}
        direction={direction}
      />
    </div>
  );
};

export default LottieHand;
