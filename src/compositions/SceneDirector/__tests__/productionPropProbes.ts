/**
 * Production prop probes — manual mirror of what each scene file passes to
 * `<FloatingHand>` for a given (compositionId, sceneName, layerIndex).
 *
 * The probe MUST match what the scene file does. If a scene is later
 * migrated to read from `getSavedPath()` for some prop, update its probe
 * to reflect the new source. The parity test catches drift between the
 * probe and what SD would render — i.e. drift between the production
 * scene file and the SD preview.
 *
 * Coverage: V1.22 only for now. Dynamic-zoom scenes (3-TapBubble,
 * 8-ProductPage) have `zoom` interpolated frame-by-frame; for those the
 * probe samples at a representative click frame. Add new probes one per
 * `<FloatingHand>` instance reachable from `<DorianFullV1_22 />`.
 */

import type { ResolvedFloatingHandProps } from '../floatingHandPropResolver';
import { GESTURE_PRESETS, buildClickAnimationFile } from '../gestures';
import {
  DEFAULT_PHYSICS,
  type HandPathPoint,
  type HandPhysicsConfig,
  type LottieAnimation,
} from '../../../components/FloatingHand/types';
import {
  HAND_PHYSICS,
  PHONE,
  handSizeForZoom,
} from '../../DorianDemo/constants';
import { getSavedPath, type CodedPath } from '../codedPaths';
import { resolvePhysicsPreset } from '../physicsPresets';

/**
 * Apply Stage 2 SDOverrideContext merge logic ON TOP of the literal
 * prop bag a scene file passes to <FloatingHand>. This mirrors what
 * applySDOverride does at runtime, so the probe represents what
 * <FloatingHand> ACTUALLY renders after all overrides are applied.
 *
 * Saved JSON wins per field. Returns a fully-resolved prop bag for
 * comparison with the SD-preview side of the parity test.
 */
function mergeWithSavedOverride(
  literal: {
    animation: LottieAnimation;
    size: number;
    dark: boolean;
    physics: HandPhysicsConfig; // already DEFAULT-merged
    showRipple: boolean;
    path?: HandPathPoint[];
  },
  saved: CodedPath | null,
): {
  animation: LottieAnimation;
  size: number;
  dark: boolean;
  physics: HandPhysicsConfig;
  showRipple: boolean;
  path: HandPathPoint[];
} {
  const path =
    saved && Array.isArray(saved.path) && saved.path.length >= 2
      ? saved.path
      : (literal.path ?? []);
  const animation =
    typeof saved?.animation === 'string' && saved.animation.length > 0
      ? (saved.animation as LottieAnimation)
      : literal.animation;
  const dark = typeof saved?.dark === 'boolean' ? saved.dark : literal.dark;
  const size =
    typeof saved?.size === 'number' && saved.size > 0
      ? saved.size
      : literal.size;
  const showRipple =
    typeof saved?.showRipple === 'boolean'
      ? saved.showRipple
      : literal.showRipple;
  // Physics: saved physicsPreset (named registry) wins; free-form `physics`
  // partial layers on top. Mirrors applySDOverride exactly.
  const presetCfg = resolvePhysicsPreset(saved?.physicsPreset);
  const physics: HandPhysicsConfig = presetCfg
    ? { ...DEFAULT_PHYSICS, ...presetCfg, ...(saved?.physics ?? {}) }
    : saved?.physics
      ? { ...literal.physics, ...saved.physics }
      : literal.physics;
  return { animation, size, dark, physics, showRipple, path };
}

/**
 * Inputs the parity test will pass to each probe. SD-side reads
 * `state.clickAnimation` from initialState's default; probes mirror that
 * to keep the comparison apples-to-apples for V1.22 (which has
 * `clickAnimationOverride: null` so this never matters).
 */
export interface ProbeContext {
  /** Sample frame (relevant only for dynamic-zoom scenes). */
  frame: number;
  /** Default global click-animation style (mirrors initialState.clickAnimation). */
  defaultClickAnimation: string;
}

export type ProductionProbe = (ctx: ProbeContext) => ResolvedFloatingHandProps;

/**
 * Build the click-animation file string the way SD's overlay does for
 * V1.22's `clickAnimationOverride: null` setting (= always undefined).
 * Kept verbose so the per-probe code reads as a literal mirror.
 */
const V1_22_CLICK_ANIM_FILE: string | undefined = undefined; // null override → suppressed

const V1_22_CLICK_STYLE: 'soft-pulse' = 'soft-pulse';

/**
 * SD scene zoom in V1.22 is undefined (composition entry's `scenes` list
 * has no `zoom` field), so the overlay falls back to 1.8 → all SD sizes
 * = 120. Probes capture what the scene PRODUCES, not what SD shows.
 */

const PROBES: Record<string, ProductionProbe> = {
  // ── 2-HomeScroll ─────────────────────────────────────────────────────
  // HomeScrollSceneV1_09 with compositionId='DorianFullV1-22'. Stage 2:
  // FloatingHand applies saved override (path, physicsPreset, showRipple,
  // size, dark, animation) on top of the scene's literal props.
  'DorianFullV1-22|2-HomeScroll|0': () => {
    const merged = mergeWithSavedOverride(
      {
        animation: 'cursor-real-black' as LottieAnimation,
        size: handSizeForZoom(PHONE.displayScale), // = 120
        dark: false,
        physics: { ...DEFAULT_PHYSICS, ...HAND_PHYSICS.scrollbar },
        showRipple: false,
      },
      getSavedPath('DorianFullV1-22', '2-HomeScroll'),
    );
    return {
      ...merged,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: merged.path.length,
      firstWaypoint: merged.path[0],
      lastWaypoint: merged.path[merged.path.length - 1],
    };
  },

  // ── 4-ChatOpen ───────────────────────────────────────────────────────
  // Scene's literal props go in; saved override merges on top.
  'DorianFullV1-22|4-ChatOpen|0': () => {
    const merged = mergeWithSavedOverride(
      {
        animation: 'cursor-real-black' as LottieAnimation,
        size: handSizeForZoom(2.75), // ≈ 183.33
        dark: true,
        physics: { ...DEFAULT_PHYSICS, ...HAND_PHYSICS.tap },
        showRipple: true,
      },
      getSavedPath('DorianFullV1-22', '4-ChatOpen'),
    );
    return {
      ...merged,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: merged.path.length,
      firstWaypoint: merged.path[0],
      lastWaypoint: merged.path[merged.path.length - 1],
    };
  },

  // ── 5-UserTyping ─────────────────────────────────────────────────────
  'DorianFullV1-22|5-UserTyping|0': () => {
    const merged = mergeWithSavedOverride(
      {
        animation: 'cursor-real-black' as LottieAnimation,
        size: handSizeForZoom(2.75),
        dark: true,
        physics: { ...DEFAULT_PHYSICS, ...HAND_PHYSICS.tapGentle },
        showRipple: true,
      },
      getSavedPath('DorianFullV1-22', '5-UserTyping'),
    );
    return {
      ...merged,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: merged.path.length,
      firstWaypoint: merged.path[0],
      lastWaypoint: merged.path[merged.path.length - 1],
    };
  },

  // ── 7-AIResponse ─────────────────────────────────────────────────────
  'DorianFullV1-22|7-AIResponse|0': () => {
    const merged = mergeWithSavedOverride(
      {
        animation: 'cursor-real-black' as LottieAnimation,
        size: handSizeForZoom(2.75),
        dark: true,
        physics: { ...DEFAULT_PHYSICS, ...HAND_PHYSICS.tapGentle },
        showRipple: true,
      },
      getSavedPath('DorianFullV1-22', '7-AIResponse'),
    );
    return {
      ...merged,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: merged.path.length,
      firstWaypoint: merged.path[0],
      lastWaypoint: merged.path[merged.path.length - 1],
    };
  },

  // ── 9-ProductDetail ──────────────────────────────────────────────────
  // ProductDetailSceneV1_12 — `size={120}` literal. animation/dark hardcoded.
  // V1.22+ wires compositionId. Probe mirrors what the merged props end up
  // being after applySDOverride.
  'DorianFullV1-22|9-ProductDetail|0': () => {
    const merged = mergeWithSavedOverride(
      {
        animation: 'cursor-real-black' as LottieAnimation,
        size: 120,
        dark: false,
        physics: { ...DEFAULT_PHYSICS, ...HAND_PHYSICS.scrollbar },
        showRipple: true,
      },
      getSavedPath('DorianFullV1-22', '9-ProductDetail') ??
        getSavedPath('DorianFullV1-10', '9-ProductDetail'),
    );
    return {
      ...merged,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: merged.path.length,
      firstWaypoint: merged.path[0],
      lastWaypoint: merged.path[merged.path.length - 1],
    };
  },

  // ── 3-TapBubble (dynamic zoom) ───────────────────────────────────────
  // zoomScale ≈ 2.75 at click frame. Stage 2: V1.22 saved override applied.
  'DorianFullV1-22|3-TapBubble|0': () => {
    const merged = mergeWithSavedOverride(
      {
        animation: 'cursor-real-black' as LottieAnimation,
        size: handSizeForZoom(2.75),
        dark: true,
        physics: { ...DEFAULT_PHYSICS, ...HAND_PHYSICS.trailResponsive },
        showRipple: true,
      },
      getSavedPath('DorianFullV1-22', '3-TapBubble'),
    );
    return {
      ...merged,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: merged.path.length,
      firstWaypoint: merged.path[0],
      lastWaypoint: merged.path[merged.path.length - 1],
    };
  },

  // ── 8-ProductPage (dynamic zoom — zooms OUT from 2.75 → 1.8) ─────────
  // Click frame ~125; zoomScale ≈ 1.8 by then. Stage 2: merged via
  // applySDOverride.
  'DorianFullV1-22|8-ProductPage|0': () => {
    const merged = mergeWithSavedOverride(
      {
        animation: 'cursor-real-black' as LottieAnimation,
        size: handSizeForZoom(1.8),
        dark: false,
        physics: { ...DEFAULT_PHYSICS, ...HAND_PHYSICS.scrollbar },
        showRipple: true,
      },
      getSavedPath('DorianFullV1-22', '8-ProductPage'),
    );
    return {
      ...merged,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: merged.path.length,
      firstWaypoint: merged.path[0],
      lastWaypoint: merged.path[merged.path.length - 1],
    };
  },
};

/** Use object key splitting for ergonomic test loop. */
export type ProbeKey = keyof typeof PROBES;
export const PRODUCTION_PROBES = PROBES;

/** Parse a probe key into its (compositionId, sceneName, layerIndex) parts. */
export function parseProbeKey(key: string): {
  compositionId: string;
  sceneName: string;
  layerIndex: number;
} {
  const [compositionId, sceneName, layerIdxStr] = key.split('|');
  return {
    compositionId,
    sceneName,
    layerIndex: parseInt(layerIdxStr, 10),
  };
}
