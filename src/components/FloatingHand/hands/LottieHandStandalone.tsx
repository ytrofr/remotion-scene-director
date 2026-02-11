/**
 * LottieHandStandalone - Renders Lottie hand animations WITHOUT Remotion context.
 * Uses lottie-web directly instead of @remotion/lottie.
 * For use in SceneDirector live preview (outside Remotion Player).
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import type { HandGesture, LottieAnimation } from '../types';

interface Props {
  gesture: HandGesture;
  size: number;
  animationFile?: LottieAnimation;
  dark?: boolean;
}

export const LottieHandStandalone: React.FC<Props> = memo(({
  gesture,
  size,
  animationFile = 'hand-click',
  dark = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load animation
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous
    if (animRef.current) {
      animRef.current.destroy();
      animRef.current = null;
      setLoaded(false);
    }

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      // Works in both Vite dev server and Remotion Studio (public/ directory)
      path: `/lottie/${animationFile}.json`,
    });

    animRef.current = anim;
    anim.addEventListener('DOMLoaded', () => setLoaded(true));

    return () => {
      anim.destroy();
      animRef.current = null;
    };
  }, [animationFile]);

  // Control playback based on gesture
  useEffect(() => {
    const anim = animRef.current;
    if (!anim || !loaded) return;

    switch (gesture) {
      case 'click':
        anim.setSpeed(1.2);
        anim.play();
        break;
      case 'scroll':
      case 'drag':
        anim.setSpeed(0.5);
        anim.play();
        break;
      default:
        // Nearly frozen for pointer/other gestures
        anim.setSpeed(0.001);
        anim.play();
        break;
    }
  }, [gesture, loaded]);

  const filterStyle = dark
    ? 'invert(1) drop-shadow(3px 4px 6px rgba(0,0,0,0.4))'
    : 'drop-shadow(3px 4px 6px rgba(0,0,0,0.3))';

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        filter: filterStyle,
      }}
    />
  );
});

LottieHandStandalone.displayName = 'LottieHandStandalone';
