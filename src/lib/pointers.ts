/**
 * Pointer Preset Registry
 * Maps pointer gallery IDs to their Lottie file paths and recommended physics.
 */

export interface PointerPreset {
  id: string;
  file: string; // Lottie JSON path relative to public/
  defaultSize?: number;
  rotationOffset?: number; // Degrees offset for autoRotate (default -45 for arrows)
}

// Standard arrow pointers (from gallery)
export const POINTER_PRESETS: Record<string, PointerPreset> = {
  'cursor-real-black': {
    id: 'cursor-real-black',
    file: 'lottie/cursor-real-black.json',
    rotationOffset: -45,
  },
  'cursor-real-outline': {
    id: 'cursor-real-outline',
    file: 'lottie/cursor-real-outline.json',
    rotationOffset: -45,
  },
  'cursor-outline-simple': {
    id: 'cursor-outline-simple',
    file: 'lottie/cursor-outline-simple.json',
    rotationOffset: -45,
  },
  'cursor-filled-simple': {
    id: 'cursor-filled-simple',
    file: 'lottie/cursor-filled-simple.json',
    rotationOffset: -45,
  },
};

/**
 * Check if an animation ID is a pointer cursor (not a hand gesture).
 * Pointer cursors benefit from autoRotate physics.
 */
export function isPointerAnimation(animationId: string | undefined): boolean {
  if (!animationId) return false;
  return animationId.startsWith('cursor-');
}

/**
 * Get the recommended rotation offset for a pointer.
 * Returns -45 for standard arrows, 0 for unknown.
 */
export function getRotationOffset(animationId: string): number {
  const preset = POINTER_PRESETS[animationId];
  if (preset?.rotationOffset !== undefined) return preset.rotationOffset;
  // Default for cursor-* prefix animations
  if (animationId.startsWith('cursor-')) return -45;
  return 0;
}
