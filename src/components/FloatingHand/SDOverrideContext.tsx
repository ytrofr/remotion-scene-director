/**
 * SDOverrideContext — SceneDirector-driven prop overrides for FloatingHand.
 *
 * Goal: make SceneDirector preview and rendered MP4 use the SAME data path.
 * Without this, frozen scene files pass hardcoded literal props, and SD has
 * to maintain a parallel formula in its overlay — drift is the default.
 *
 * Architecture:
 *   - <SDOverrideProvider compositionId="DorianFullV1-22" sceneName="4-ChatOpen">
 *     wraps each scene in the wrapper composition (DorianDemoV1.12 — editable).
 *   - FloatingHand reads context via useSDOverride().
 *   - applySDOverride(literalProps, override) merges saved props onto literal
 *     props. Saved data wins per field.
 *
 * Backward compat:
 *   - No Provider in scope → useSDOverride returns null → applySDOverride
 *     is a no-op → component renders byte-identically to today.
 *   - V1.10–V1.21 wrappers don't render the Provider (they don't pass
 *     compositionId). Their renders stay byte-stable.
 *
 * Stage 1 scope: overrides path, animation, dark (fields already in
 * CodedPath). Stage 2 extends to physics, size, showRipple. Stage 3 adds
 * a live-drag override so the production cursor can follow the user's
 * mouse during waypoint editing.
 *
 * Mirrors the shape of ClickStyleContext.tsx in this directory.
 */
import React, { createContext, useContext, useMemo } from 'react';
import {
  getSavedPath,
  type CodedPath,
} from '../../compositions/SceneDirector/codedPaths';
import type { HandPathPoint, LottieAnimation } from './types';

export interface SDOverrideValue {
  compositionId: string;
  sceneName: string;
}

const SDOverrideContext = createContext<SDOverrideValue | null>(null);

export const SDOverrideProvider: React.FC<{
  compositionId: string;
  sceneName: string;
  children: React.ReactNode;
}> = ({ compositionId, sceneName, children }) => {
  // Memoize the value object so context consumers don't re-render unless
  // the (compositionId, sceneName) pair actually changes.
  const value = useMemo<SDOverrideValue>(
    () => ({ compositionId, sceneName }),
    [compositionId, sceneName],
  );
  return (
    <SDOverrideContext.Provider value={value}>
      {children}
    </SDOverrideContext.Provider>
  );
};

/**
 * Hook: returns the resolved override (saved CodedPath if present, else null).
 * Returns null when no Provider wraps the call site OR no saved data exists.
 */
export function useSDOverride(): {
  context: SDOverrideValue | null;
  saved: CodedPath | null;
} {
  const context = useContext(SDOverrideContext);
  const saved = useMemo<CodedPath | null>(() => {
    if (!context) return null;
    return getSavedPath(context.compositionId, context.sceneName);
  }, [context]);
  return { context, saved };
}

/**
 * Subset of FloatingHandProps that SD can override. Stage 1 fields only.
 * Stage 2 will extend this interface with physics, size, showRipple.
 */
export interface OverridableFloatingHandProps {
  path: HandPathPoint[];
  animation?: LottieAnimation;
  dark?: boolean;
}

/**
 * Pure merge: saved CodedPath fields shadow literal props per field.
 * Path requires ≥2 waypoints to override (matches the existing
 * HomeScrollSceneV1.09 opt-in pattern — guards against half-saved data).
 *
 * No-op when saved is null (no Provider OR no saved data).
 */
export function applySDOverride<T extends OverridableFloatingHandProps>(
  literal: T,
  saved: CodedPath | null,
): T {
  if (!saved) return literal;
  const next: T = { ...literal };
  if (Array.isArray(saved.path) && saved.path.length >= 2) {
    next.path = saved.path;
  }
  if (typeof saved.animation === 'string' && saved.animation.length > 0) {
    next.animation = saved.animation as LottieAnimation;
  }
  if (typeof saved.dark === 'boolean') {
    next.dark = saved.dark;
  }
  return next;
}
