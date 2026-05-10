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
import { resolvePhysicsPreset } from '../../compositions/SceneDirector/physicsPresets';
import type {
  HandPathPoint,
  HandPhysicsConfig,
  LottieAnimation,
} from './types';

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
 * Subset of FloatingHandProps that SD can override. Stage 1+2 fields.
 */
export interface OverridableFloatingHandProps {
  path: HandPathPoint[];
  animation?: LottieAnimation;
  dark?: boolean;
  size?: number;
  showRipple?: boolean;
  physics?: Partial<HandPhysicsConfig>;
}

/**
 * Pure merge: saved CodedPath fields shadow literal props per field.
 *
 * Stage 1 fields:
 *  - path: requires ≥2 waypoints to override (guards against half-saved
 *    data; matches HomeScrollSceneV1.09 opt-in pattern).
 *  - animation, dark: simple per-field shadow.
 *
 * Stage 2 fields:
 *  - size: per-layer override.
 *  - showRipple: per-layer toggle.
 *  - physics: resolved from `physicsPreset` (named registry) and/or
 *    free-form `physics` partial. Preset wins as the base; free-form
 *    partial layers on top.
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
  if (typeof saved.size === 'number' && saved.size > 0) {
    next.size = saved.size;
  }
  if (typeof saved.showRipple === 'boolean') {
    next.showRipple = saved.showRipple;
  }
  // Physics: preset is the BASE (replaces literal physics entirely),
  // free-form `saved.physics` Partial layers on top of preset.
  // Literal physics is REPLACED only when the saved override exists —
  // otherwise the scene's literal physics wins (current behavior).
  const preset = resolvePhysicsPreset(saved.physicsPreset);
  if (preset) {
    next.physics = { ...preset, ...(saved.physics ?? {}) };
  } else if (saved.physics) {
    // free-form override only — merge on top of literal
    next.physics = { ...(literal.physics ?? {}), ...saved.physics };
  }
  return next;
}
