import type { SpringConfig } from 'remotion';

/**
 * Spring Configuration Presets
 * Use these for consistent animation feel across all scenes
 */

export const SPRING_PRESETS: Record<string, SpringConfig> = {
  // Snappy - quick response, minimal overshoot (UI elements, taps)
  snappy: {
    damping: 25,
    stiffness: 200,
    mass: 0.8,
    overshootClamping: false,
  },

  // Bouncy - playful, noticeable overshoot (entrances, reveals)
  bouncy: {
    damping: 12,
    stiffness: 150,
    mass: 1,
    overshootClamping: false,
  },

  // Smooth - gentle, no overshoot (subtle movements, fades)
  smooth: {
    damping: 30,
    stiffness: 80,
    mass: 1.2,
    overshootClamping: true,
  },

  // Phone entrance - slide in from bottom
  phoneEntrance: {
    damping: 20,
    stiffness: 100,
    mass: 1,
    overshootClamping: false,
  },

  // Zoom effect - during typing
  zoom: {
    damping: 18,
    stiffness: 120,
    mass: 0.9,
    overshootClamping: false,
  },

  // Response reveal - dramatic entrance
  responseReveal: {
    damping: 15,
    stiffness: 100,
    mass: 1.1,
    overshootClamping: false,
  },
};

// Helper to get spring config with fallback
export const getSpringConfig = (name: keyof typeof SPRING_PRESETS): SpringConfig => {
  return SPRING_PRESETS[name] || SPRING_PRESETS.smooth;
};
