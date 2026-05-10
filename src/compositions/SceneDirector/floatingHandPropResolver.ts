/**
 * floatingHandPropResolver — pure helper for the SceneDirector preview's
 * FloatingHand prop bag.
 *
 * Single source of truth for what SD shows on screen, mirroring the math
 * inside `overlays/FloatingHandOverlay.tsx`. Extracted so the parity test
 * harness (`__tests__/floatingHandParity.test.ts`) can compare what
 * production scene files pass to `<FloatingHand>` against what SD would
 * render at the same (compositionId, sceneName, layer) — without needing a
 * React tree.
 *
 * If you change how SD computes any prop, change it HERE; the overlay calls
 * `resolveSDPreviewProps` so the visual and the test stay in lockstep.
 */

import type {
  HandPathPoint,
  HandPhysicsConfig,
  LottieAnimation,
} from '../../components/FloatingHand/types';
import { DEFAULT_PHYSICS } from '../../components/FloatingHand/types';
import {
  GESTURE_PRESETS,
  buildClickAnimationFile,
  type GestureTool,
} from './gestures';
import type { HandLayerData } from './layers';
import type { CompositionEntry, DirectorState } from './state.types';

export interface ResolvedFloatingHandProps {
  animation: LottieAnimation;
  size: number;
  dark: boolean;
  physics: HandPhysicsConfig;
  showRipple: boolean;
  clickAnimationFile: string | undefined;
  clickStyle: 'default' | 'soft-pulse' | undefined;
  /** Path summary for assertion-friendly diffing (full path is large). */
  pathLength: number;
  /** First waypoint by source order (NOT by lowest .frame). */
  firstWaypoint: HandPathPoint | undefined;
  /** Last waypoint by source order. */
  lastWaypoint: HandPathPoint | undefined;
}

export interface ResolveArgs {
  /** Used for symmetry with productionPropProbes; not consumed by formula today. */
  compositionId: string;
  /** Used for symmetry with productionPropProbes; not consumed by formula today. */
  sceneName: string;
  /** Scene's zoom level (default 1.8 = base phone scale). Affects size fallback. */
  sceneZoom: number;
  /** The layer's effective gesture (from `layer.data.gesture`). */
  gesture: GestureTool;
  /** The layer's effective data (waypoints + size + gesture). */
  layerData: HandLayerData;
  /** Slice of DirectorState the resolver reads. */
  state: Pick<DirectorState, 'sceneAnimation' | 'sceneDark' | 'clickAnimation'>;
  /** Slice of CompositionEntry the resolver reads. */
  composition: Pick<CompositionEntry, 'clickAnimationOverride' | 'clickStyle'>;
}

/**
 * Compute the FloatingHand prop bag SD would render for one hand layer.
 * Pure: no React, no DOM, no localStorage. Mirrors
 * `FloatingHandOverlay.tsx::SingleHandRenderer` lines 86-110.
 */
export function resolveSDPreviewProps(
  args: ResolveArgs,
): ResolvedFloatingHandProps {
  const { sceneName, sceneZoom, gesture, layerData, state, composition } = args;

  const preset = GESTURE_PRESETS[gesture];

  // Animation: per-scene SD override > gesture preset
  const animation = state.sceneAnimation[sceneName] ?? preset.animation;

  // Dark: per-scene SD override > gesture preset
  const dark = state.sceneDark[sceneName] ?? preset.dark;

  // Size: per-layer override > zoom-adjusted default (base 120 at zoom 1.8).
  // Mirrors `handSizeForZoom` from DorianDemo/constants.ts (no rounding) so
  // the parity test sees exact equality on chat-zoom scenes.
  const zoomDefault = 120 * (sceneZoom / 1.8);
  const size = layerData.size ?? zoomDefault;

  // Click animation file: per-comp override > global state.clickAnimation.
  // null explicitly suppresses (used by V1.19+ to match render output that
  // doesn't load any burst Lottie either).
  let clickAnimationFile: string | undefined;
  if (composition.clickAnimationOverride === null) {
    clickAnimationFile = undefined;
  } else if (composition.clickAnimationOverride !== undefined) {
    clickAnimationFile = buildClickAnimationFile(
      animation,
      composition.clickAnimationOverride,
    );
  } else {
    clickAnimationFile = buildClickAnimationFile(
      animation,
      state.clickAnimation,
    );
  }

  const wps = layerData.waypoints ?? [];

  return {
    animation,
    size,
    dark,
    physics: { ...DEFAULT_PHYSICS, ...preset.physics },
    showRipple: preset.showRipple,
    clickAnimationFile,
    clickStyle: composition.clickStyle,
    pathLength: wps.length,
    firstWaypoint: wps[0],
    lastWaypoint: wps[wps.length - 1],
  };
}
