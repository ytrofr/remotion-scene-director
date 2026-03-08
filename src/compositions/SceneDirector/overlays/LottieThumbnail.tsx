/**
 * LottieThumbnail - Renders first frame of a Lottie at small size.
 * Uses lottie-web directly (no Remotion context needed).
 * For dropdown/inspector previews of hand and pointer animations.
 */

import React, { useEffect, useRef, memo } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';

interface Props {
  animationFile: string;
  size?: number;
  dark?: boolean;
  /** Play animation on hover instead of showing frozen first frame */
  playOnHover?: boolean;
}

export const LottieThumbnail: React.FC<Props> = memo(
  ({ animationFile, size = 24, dark = false, playOnHover = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<AnimationItem | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }

      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/lottie/${animationFile}.json`,
      });

      animRef.current = anim;
      anim.addEventListener('DOMLoaded', () => {
        anim.goToAndStop(0, true);
      });

      return () => {
        anim.destroy();
        animRef.current = null;
      };
    }, [animationFile]);

    const handleMouseEnter = playOnHover
      ? () => {
          const anim = animRef.current;
          if (anim) {
            anim.goToAndPlay(0, true);
          }
        }
      : undefined;

    const handleMouseLeave = playOnHover
      ? () => {
          const anim = animRef.current;
          if (anim) {
            anim.goToAndStop(0, true);
          }
        }
      : undefined;

    return (
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          filter: dark ? 'invert(1)' : undefined,
        }}
      />
    );
  },
);

LottieThumbnail.displayName = 'LottieThumbnail';
