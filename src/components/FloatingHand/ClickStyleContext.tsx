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
 * Returns 1.0 outside click windows; 1.0 → 0.82 → 1.0 during a click
 * (triangle wave over the click duration, default 8 frames).
 *
 * Pure function — safe in render path.
 */
export function computeClickPulseScale(
  path: { gesture?: string; frame?: number; duration?: number }[],
  localFrame: number,
  fallbackDuration = 8,
  peak = 0.82,
): number {
  for (const wp of path) {
    if (wp.gesture !== 'click') continue;
    const wf = wp.frame ?? 0;
    const dur = wp.duration ?? fallbackDuration;
    if (localFrame >= wf && localFrame < wf + dur) {
      const t = (localFrame - wf) / dur;
      // Triangle wave 0 → 1 → 0 over the duration
      const tri = t < 0.5 ? t * 2 : (1 - t) * 2;
      return 1 - (1 - peak) * tri;
    }
  }
  return 1;
}
