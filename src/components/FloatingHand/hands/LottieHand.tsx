import React, { useEffect, useState } from 'react';
import { Lottie, LottieAnimationData } from '@remotion/lottie';
import { staticFile, delayRender, continueRender } from 'remotion';
import { HandStyleProps } from '../types';

/**
 * LottieHand - Renders hand using @remotion/lottie (Remotion's native Lottie).
 *
 * Frozen at frame 0: playbackRate=0.001, loop=false.
 * These values NEVER change — no gesture-based rate switching, no loop resets,
 * no frame jumps. The hand position/rotation/scale come from useHandAnimation;
 * the Lottie just shows a static hand image.
 */

/**
 * Invert Lottie layer colors in-place (dark mode).
 * Walks the layer tree and inverts all color values [r,g,b,a] → [1-r,1-g,1-b,a].
 * This replaces CSS invert(1) which caused rendering artifacts in headless Chrome.
 */
function invertLottieColors(layers: Array<Record<string, unknown>>): void {
  for (const layer of layers) {
    invertColorsInObject(layer);
  }
}

function invertColorsInObject(obj: unknown): void {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) invertColorsInObject(item);
    return;
  }
  const record = obj as Record<string, unknown>;
  // Lottie color keys: "c" (color), "fc" (fill color), "sc" (stroke color)
  for (const colorKey of ['c', 'fc', 'sc']) {
    const colorProp = record[colorKey];
    if (colorProp && typeof colorProp === 'object') {
      const cp = colorProp as Record<string, unknown>;
      // Static color: { k: [r, g, b, a] }
      if (
        Array.isArray(cp.k) &&
        cp.k.length >= 3 &&
        typeof cp.k[0] === 'number'
      ) {
        cp.k = [
          1 - (cp.k[0] as number),
          1 - (cp.k[1] as number),
          1 - (cp.k[2] as number),
          ...(cp.k.length > 3 ? [cp.k[3]] : []),
        ];
      }
      // Animated color: { k: [{ s: [r,g,b,a], ... }, ...] }
      if (
        Array.isArray(cp.k) &&
        cp.k.length > 0 &&
        typeof cp.k[0] === 'object'
      ) {
        for (const kf of cp.k) {
          const keyframe = kf as Record<string, unknown>;
          if (
            Array.isArray(keyframe.s) &&
            keyframe.s.length >= 3 &&
            typeof keyframe.s[0] === 'number'
          ) {
            keyframe.s = [
              1 - (keyframe.s[0] as number),
              1 - (keyframe.s[1] as number),
              1 - (keyframe.s[2] as number),
              ...(keyframe.s.length > 3 ? [keyframe.s[3]] : []),
            ];
          }
          if (
            Array.isArray(keyframe.e) &&
            keyframe.e.length >= 3 &&
            typeof keyframe.e[0] === 'number'
          ) {
            keyframe.e = [
              1 - (keyframe.e[0] as number),
              1 - (keyframe.e[1] as number),
              1 - (keyframe.e[2] as number),
              ...(keyframe.e.length > 3 ? [keyframe.e[3]] : []),
            ];
          }
        }
      }
    }
  }
  // Recurse into all object values
  for (const val of Object.values(record)) {
    if (val && typeof val === 'object') invertColorsInObject(val);
  }
}

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
  | string;

interface LottieHandProps extends Omit<
  HandStyleProps,
  'color' | 'strokeColor' | 'strokeWidth'
> {
  animationFile?: LottieAnimationFile;
  playbackRate?: number;
  loop?: boolean;
  direction?: 'forward' | 'backward';
  dark?: boolean;
}

export const LottieHand: React.FC<LottieHandProps> = ({
  size = 64,
  animationFile = 'hand-click',
  dark = false,
}) => {
  const [animationData, setAnimationData] =
    useState<LottieAnimationData | null>(null);
  const [handle] = useState(() => delayRender('Loading Lottie animation'));

  useEffect(() => {
    fetch(staticFile(`lottie/${animationFile}.json`))
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        // Strip decorative layers (click indicator lines, etc.) — keep only
        // the "Hand" / shape layers. These decorative elements cause visual
        // artifacts in Remotion's headless render.
        if (Array.isArray(data.layers)) {
          data.layers = (data.layers as Array<Record<string, unknown>>).filter(
            (l) => {
              const name = String(l.nm || '');
              return !name.includes('Lines');
            },
          );
        }
        // Invert colors at JSON level for dark mode — avoids CSS invert(1)
        // compositing artifacts with transparency in headless Chrome.
        if (dark && Array.isArray(data.layers)) {
          invertLottieColors(data.layers as Array<Record<string, unknown>>);
        }
        setAnimationData(data as unknown as LottieAnimationData);
        continueRender(handle);
      })
      .catch((error) => {
        console.error('Failed to load Lottie animation:', error);
        continueRender(handle);
      });
  }, [animationFile, dark, handle]);

  if (!animationData) {
    return null;
  }

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
    >
      <Lottie
        animationData={animationData}
        style={{ width: '100%', height: '100%' }}
        playbackRate={0.001}
        loop={false}
      />
    </div>
  );
};

export default LottieHand;
