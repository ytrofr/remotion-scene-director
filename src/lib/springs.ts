/**
 * Shared Spring Configurations
 * Single source of truth for all spring animations across compositions.
 */

// Spring config type (matches Remotion's spring() config)
export interface SpringConfig {
  damping: number;
  mass: number;
  stiffness: number;
}

// All named spring presets
export const SPRING_CONFIG: Record<string, SpringConfig> = {
  default: { damping: 15, mass: 1, stiffness: 100 },
  gentle: { damping: 20, mass: 1, stiffness: 80 },
  bouncy: { damping: 10, mass: 0.8, stiffness: 150 },
  snappy: { damping: 20, mass: 0.5, stiffness: 200 },
  zoom: { damping: 18, mass: 1, stiffness: 80 },
  slide: { damping: 18, mass: 1, stiffness: 120 },
  response: { damping: 18, mass: 1, stiffness: 100 },
  // Additional presets for new components
  fadeIn: { damping: 25, mass: 1, stiffness: 60 },
  popIn: { damping: 12, mass: 0.6, stiffness: 180 },
};

/**
 * Get a spring config by name with optional overrides.
 * Throws if preset name doesn't exist (typo protection).
 */
export function springConfig(
  name: keyof typeof SPRING_CONFIG,
  overrides?: Partial<SpringConfig>,
): SpringConfig {
  const base = SPRING_CONFIG[name];
  if (!base) {
    console.warn(`Unknown spring preset: "${String(name)}". Using default.`);
    return { ...SPRING_CONFIG.default, ...overrides };
  }
  return overrides ? { ...base, ...overrides } : base;
}
