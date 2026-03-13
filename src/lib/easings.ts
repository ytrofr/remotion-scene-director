/**
 * Shared Easing Functions
 * Named easings for zoom keyframes, transitions, and interpolations.
 */

export type EasingName =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'bounce'
  | 'elastic';

// Core easing implementations
const EASINGS: Record<EasingName, (t: number) => number> = {
  linear: (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => 1 - (1 - t) * (1 - t),
  'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
  spring: (t) => 1 - Math.cos(t * Math.PI * 0.5) * Math.exp(-t * 3),
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  elastic: (t) =>
    t === 0 || t === 1
      ? t
      : -Math.pow(2, 10 * t - 10) *
        Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),
};

/**
 * Apply a named easing function to a 0-1 progress value.
 */
export function applyNamedEasing(t: number, name: EasingName): number {
  const fn = EASINGS[name];
  if (!fn) {
    console.warn(`Unknown easing: "${name}". Using linear.`);
    return t;
  }
  return fn(Math.max(0, Math.min(1, t)));
}

/** Get the raw easing function by name */
export function getEasingFn(name: EasingName): (t: number) => number {
  return EASINGS[name] || EASINGS.linear;
}
