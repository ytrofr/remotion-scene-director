/**
 * ClickStyleContext — Tree-scoped click visual treatment for FloatingHand.
 *
 * Why a context: V1.13+ wants ALL clicks in the composition to use the
 * 'soft-pulse' style. A context lets us wrap the composition once
 * (`<ClickStyleProvider value="soft-pulse">`) and have every nested
 * FloatingHand pick it up — without cloning every scene file.
 *
 * Per-instance prop overrides the context (escape hatch). Default
 * 'default' = current behavior, so V1.12 and older are unaffected.
 */
import React, { createContext, useContext } from 'react';

export type ClickStyle = 'default' | 'soft-pulse';

const ClickStyleContext = createContext<ClickStyle>('default');

export const ClickStyleProvider: React.FC<{
  value: ClickStyle;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <ClickStyleContext.Provider value={value}>
    {children}
  </ClickStyleContext.Provider>
);

/**
 * Resolve the active click style. A per-instance prop wins over context.
 */
export function useClickStyle(override?: ClickStyle): ClickStyle {
  const fromContext = useContext(ClickStyleContext);
  return override ?? fromContext;
}

/**
 * Compute the soft-pulse scale multiplier for a given local frame.
 * Returns 1.0 outside click windows; 1.0 → peak → 1.0 during a click,
 * over a TIGHT fixed window centered on the click frame — punchy beat.
 *
 * Why a fixed window (not waypoint.duration): click waypoints carry
 * `duration` for Lottie click-anim sync (typically 45 frames / 1.5s),
 * which is way too slow for a perceptual click beat. The pulse is a
 * separate visual concern — short and deep so the eye reads "click".
 *
 * Pure function — safe in render path.
 */
const PULSE_WINDOW_FRAMES = 6; // total triangle window (down + back up)
const PULSE_PEAK = 0.66; // shrink to 66% at the bottom of the beat

export function computeClickPulseScale(
  path: { gesture?: string; frame?: number; duration?: number }[],
  localFrame: number,
  windowFrames = PULSE_WINDOW_FRAMES,
  peak = PULSE_PEAK,
): number {
  for (const wp of path) {
    if (wp.gesture !== 'click') continue;
    const wf = wp.frame ?? 0;
    // Pulse plays in the first `windowFrames` of the click waypoint.
    if (localFrame >= wf && localFrame < wf + windowFrames) {
      const t = (localFrame - wf) / windowFrames;
      // Triangle wave 0 → 1 → 0 over the window (peak at midpoint)
      const tri = t < 0.5 ? t * 2 : (1 - t) * 2;
      return 1 - (1 - peak) * tri;
    }
  }
  return 1;
}
