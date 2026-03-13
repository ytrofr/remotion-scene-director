/**
 * Audio Envelope — Volume fade-in/fade-out computation
 * Pure functions for computing volume at any frame.
 */

export interface VolumeEnvelope {
  baseVolume: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  totalFrames: number;
}

// Recommended mixing levels
export const MIXING_LEVELS = {
  voiceover: 0.85,
  sfx: 0.6,
  music: 0.15,
  musicDucked: 0.05,
} as const;

/**
 * Compute volume at a specific frame with fade-in/fade-out envelope.
 * Returns a value between 0 and baseVolume.
 */
export function computeVolumeAtFrame(
  localFrame: number,
  envelope: VolumeEnvelope,
): number {
  const {
    baseVolume,
    fadeInFrames = 0,
    fadeOutFrames = 0,
    totalFrames,
  } = envelope;

  if (localFrame < 0 || localFrame >= totalFrames) return 0;

  let multiplier = 1;

  // Fade in
  if (fadeInFrames > 0 && localFrame < fadeInFrames) {
    multiplier = localFrame / fadeInFrames;
  }

  // Fade out
  const fadeOutStart = totalFrames - fadeOutFrames;
  if (fadeOutFrames > 0 && localFrame >= fadeOutStart) {
    multiplier = Math.min(
      multiplier,
      (totalFrames - localFrame) / fadeOutFrames,
    );
  }

  return baseVolume * Math.max(0, Math.min(1, multiplier));
}

export interface DuckTrigger {
  startFrame: number;
  endFrame: number;
  duckLevel: number; // 0-1, multiplier applied during duck
}

/**
 * Compute ducking multiplier at a frame.
 * Returns 1.0 when not ducking, duckLevel when ducking.
 */
export function computeDuckingAtFrame(
  globalFrame: number,
  triggers: DuckTrigger[],
): number {
  for (const trigger of triggers) {
    if (globalFrame >= trigger.startFrame && globalFrame < trigger.endFrame) {
      return trigger.duckLevel;
    }
  }
  return 1.0;
}
