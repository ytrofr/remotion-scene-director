/**
 * CrossfadeTransition — Crossfade timing helper for TransitionSeries
 * Provides pre-configured crossfade presentations for @remotion/transitions.
 */
import { linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

export interface CrossfadeConfig {
  /** Duration of crossfade in frames (default 20) */
  durationInFrames?: number;
}

/**
 * Get a crossfade timing config for TransitionSeries.
 * Usage:
 * ```tsx
 * <TransitionSeries>
 *   <TransitionSeries.Sequence durationInFrames={90}>
 *     <SceneA />
 *   </TransitionSeries.Sequence>
 *   <TransitionSeries.Transition {...crossfadeTiming()} />
 *   <TransitionSeries.Sequence durationInFrames={90}>
 *     <SceneB />
 *   </TransitionSeries.Sequence>
 * </TransitionSeries>
 * ```
 */
export function crossfadeTiming(config: CrossfadeConfig = {}) {
  const { durationInFrames = 20 } = config;
  return {
    presentation: fade(),
    timing: linearTiming({ durationInFrames }),
  };
}

// Preset crossfade durations
export const CROSSFADE = {
  /** Quick crossfade (10 frames / 0.33s at 30fps) */
  quick: () => crossfadeTiming({ durationInFrames: 10 }),
  /** Standard crossfade (20 frames / 0.67s at 30fps) */
  standard: () => crossfadeTiming({ durationInFrames: 20 }),
  /** Slow crossfade (45 frames / 1.5s at 30fps) */
  slow: () => crossfadeTiming({ durationInFrames: 45 }),
} as const;
