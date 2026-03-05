/**
 * LottieHandStandalone - Renders Lottie hand animations WITHOUT Remotion context.
 * Uses lottie-web directly instead of @remotion/lottie.
 * For use in SceneDirector live preview (outside Remotion Player).
 *
 * Click animation: Both base and click Lotties are pre-loaded at mount.
 * On gesture='click', the click layer is shown instantly (no async swap).
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import type { HandGesture, LottieAnimation } from '../types';

interface Props {
  gesture: HandGesture;
  size: number;
  animationFile?: LottieAnimation;
  dark?: boolean;
  clickAnimationFile?: string;
}

export const LottieHandStandalone: React.FC<Props> = memo(
  ({
    gesture,
    size,
    animationFile = 'hand-click',
    dark = false,
    clickAnimationFile,
  }) => {
    const baseRef = useRef<HTMLDivElement>(null);
    const clickRef = useRef<HTMLDivElement>(null);
    const baseAnimRef = useRef<AnimationItem | null>(null);
    const clickAnimRef = useRef<AnimationItem | null>(null);
    const [baseLoaded, setBaseLoaded] = useState(false);
    const [clickLoaded, setClickLoaded] = useState(false);
    // Sticky: once click animation starts, keep showing until it finishes
    const [clickPlaying, setClickPlaying] = useState(false);

    const showClick =
      (gesture === 'click' || clickPlaying) &&
      !!clickAnimationFile &&
      clickLoaded;

    // Load base animation
    useEffect(() => {
      if (!baseRef.current) return;

      if (baseAnimRef.current) {
        baseAnimRef.current.destroy();
        baseAnimRef.current = null;
        setBaseLoaded(false);
      }

      const anim = lottie.loadAnimation({
        container: baseRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: `/lottie/${animationFile}.json`,
      });

      baseAnimRef.current = anim;
      anim.addEventListener('DOMLoaded', () => setBaseLoaded(true));

      return () => {
        anim.destroy();
        baseAnimRef.current = null;
      };
    }, [animationFile]);

    // Load click animation (pre-loaded, hidden until needed)
    useEffect(() => {
      if (!clickRef.current || !clickAnimationFile) {
        setClickLoaded(false);
        return;
      }

      if (clickAnimRef.current) {
        clickAnimRef.current.destroy();
        clickAnimRef.current = null;
        setClickLoaded(false);
      }

      const anim = lottie.loadAnimation({
        container: clickRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/${clickAnimationFile}.json`,
      });

      clickAnimRef.current = anim;
      anim.addEventListener('DOMLoaded', () => setClickLoaded(true));
      anim.addEventListener('complete', () => setClickPlaying(false));

      return () => {
        anim.destroy();
        clickAnimRef.current = null;
      };
    }, [clickAnimationFile]);

    // Control base playback
    useEffect(() => {
      const anim = baseAnimRef.current;
      if (!anim || !baseLoaded) return;

      if (showClick) {
        // Base hidden during click — pause to save CPU
        anim.pause();
      } else {
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
            anim.setSpeed(0.001);
            anim.play();
            break;
        }
      }
    }, [gesture, baseLoaded, showClick]);

    // Trigger click animation on gesture='click' (sticky — plays through fully)
    useEffect(() => {
      if (
        gesture === 'click' &&
        clickLoaded &&
        clickAnimRef.current &&
        !clickPlaying
      ) {
        setClickPlaying(true);
        clickAnimRef.current.setSpeed(1);
        clickAnimRef.current.goToAndPlay(0, true);
      }
    }, [gesture, clickLoaded, clickPlaying]);

    const filterStyle = dark
      ? 'invert(1) drop-shadow(3px 4px 6px rgba(0,0,0,0.4))'
      : 'drop-shadow(3px 4px 6px rgba(0,0,0,0.3))';

    return (
      <div
        style={{
          width: size,
          height: size,
          position: 'relative',
          filter: filterStyle,
        }}
      >
        {/* Base animation (always mounted, hidden during click) */}
        <div
          ref={baseRef}
          style={{
            width: size,
            height: size,
            display: showClick ? 'none' : 'block',
          }}
        />
        {/* Click animation (always mounted when file provided, shown on click gesture) */}
        {clickAnimationFile && (
          <div
            ref={clickRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: size,
              height: size,
              display: showClick ? 'block' : 'none',
            }}
          />
        )}
      </div>
    );
  },
);

LottieHandStandalone.displayName = 'LottieHandStandalone';
