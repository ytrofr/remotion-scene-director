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
import { DEFAULT_PHYSICS } from '../../../components/FloatingHand/types';
import {
  HAND_PHYSICS,
  PHONE,
  handSizeForZoom,
} from '../../DorianDemo/constants';
import { getSavedPath } from '../codedPaths';

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
  // HomeScrollSceneV1_09 with compositionId='DorianFullV1-22' (V1.22 wires it).
  // Reads SD-saved path; prop literals: animation, size (zoom 1.8), dark, physics.
  'DorianFullV1-22|2-HomeScroll|0': () => {
    const sdSaved = getSavedPath('DorianFullV1-22', '2-HomeScroll');
    // V1.22 scene file uses sdPath if ≥2 waypoints; otherwise hardcoded.
    const path =
      sdSaved && Array.isArray(sdSaved.path) && sdSaved.path.length >= 2
        ? sdSaved.path
        : []; // hardcoded fallback — listed in scene file only
    return {
      animation: 'cursor-real-black',
      size: handSizeForZoom(PHONE.displayScale), // = 120
      dark: false,
      physics: HAND_PHYSICS.scrollbar as ResolvedFloatingHandProps['physics'],
      showRipple: false,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: path.length,
      firstWaypoint: path[0],
      lastWaypoint: path[path.length - 1],
    };
  },

  // ── 4-ChatOpen ───────────────────────────────────────────────────────
  // ChatOpenScene reads getSavedPath('DorianDemo',...). Stage 1: FloatingHand
  // is now wrapped in SDOverrideProvider(compositionId='DorianFullV1-22'),
  // so SD-saved data for V1.22 wins when present. Probe reflects:
  // V1.22 saved (from override) > DorianDemo saved (scene literal) > defaults.
  'DorianFullV1-22|4-ChatOpen|0': () => {
    const v22 = getSavedPath('DorianFullV1-22', '4-ChatOpen');
    const v22HasPath = v22 && Array.isArray(v22.path) && v22.path.length >= 2;
    const fallback = getSavedPath('DorianDemo', '4-ChatOpen');
    const path = v22HasPath ? v22!.path : (fallback?.path ?? []);
    return {
      animation: v22?.animation ?? fallback?.animation ?? 'cursor-real-black',
      size: handSizeForZoom(2.75), // ≈ 183.33
      dark: v22?.dark ?? fallback?.dark ?? true,
      physics: {
        ...DEFAULT_PHYSICS,
        ...HAND_PHYSICS.tap,
      } as ResolvedFloatingHandProps['physics'],
      showRipple: true,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: path.length,
      firstWaypoint: path[0],
      lastWaypoint: path[path.length - 1],
    };
  },

  // ── 5-UserTyping ─────────────────────────────────────────────────────
  'DorianFullV1-22|5-UserTyping|0': () => {
    const v22 = getSavedPath('DorianFullV1-22', '5-UserTyping');
    const v22HasPath = v22 && Array.isArray(v22.path) && v22.path.length >= 2;
    const fallback = getSavedPath('DorianDemo', '5-UserTyping');
    const path = v22HasPath ? v22!.path : (fallback?.path ?? []);
    return {
      animation: v22?.animation ?? fallback?.animation ?? 'cursor-real-black',
      size: handSizeForZoom(2.75),
      dark: v22?.dark ?? fallback?.dark ?? true,
      physics: {
        ...DEFAULT_PHYSICS,
        ...HAND_PHYSICS.tapGentle,
      } as ResolvedFloatingHandProps['physics'],
      showRipple: true,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: path.length,
      firstWaypoint: path[0],
      lastWaypoint: path[path.length - 1],
    };
  },

  // ── 7-AIResponse ─────────────────────────────────────────────────────
  'DorianFullV1-22|7-AIResponse|0': () => {
    const v22 = getSavedPath('DorianFullV1-22', '7-AIResponse');
    const v22HasPath = v22 && Array.isArray(v22.path) && v22.path.length >= 2;
    const fallback = getSavedPath('DorianDemo', '7-AIResponse');
    const path = v22HasPath ? v22!.path : (fallback?.path ?? []);
    return {
      animation: v22?.animation ?? fallback?.animation ?? 'cursor-real-black',
      size: handSizeForZoom(2.75),
      dark: v22?.dark ?? fallback?.dark ?? true,
      physics: {
        ...DEFAULT_PHYSICS,
        ...HAND_PHYSICS.tapGentle,
      } as ResolvedFloatingHandProps['physics'],
      showRipple: true,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: path.length,
      firstWaypoint: path[0],
      lastWaypoint: path[path.length - 1],
    };
  },

  // ── 9-ProductDetail ──────────────────────────────────────────────────
  // ProductDetailSceneV1_12 — `size={120}` literal. animation/dark hardcoded.
  // V1.22+ wires compositionId; scene now reads V1.22 first, falls back to
  // 'DorianFullV1-10' (legacy frozen pattern).
  'DorianFullV1-22|9-ProductDetail|0': () => {
    const saved =
      getSavedPath('DorianFullV1-22', '9-ProductDetail') ??
      getSavedPath('DorianFullV1-10', '9-ProductDetail');
    return {
      animation: 'cursor-real-black',
      size: 120, // literal
      dark: false,
      physics: HAND_PHYSICS.scrollbar as ResolvedFloatingHandProps['physics'],
      showRipple: true,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: saved?.path?.length ?? 0,
      firstWaypoint: saved?.path?.[0],
      lastWaypoint: saved?.path?.[(saved?.path?.length ?? 1) - 1],
    };
  },

  // ── 3-TapBubble (dynamic zoom) ───────────────────────────────────────
  // zoomScale = interpolate(zoomProgress, [0, 1], [1.8, 2.75]).
  // Probed at the click frame ~75 (zoomProgress saturates well before that).
  // Stage 1: SDOverrideProvider lets V1.22 saved win over scene's
  // 'DorianDemo' literal source.
  'DorianFullV1-22|3-TapBubble|0': () => {
    const v22 = getSavedPath('DorianFullV1-22', '3-TapBubble');
    const v22HasPath = v22 && Array.isArray(v22.path) && v22.path.length >= 2;
    const fallback = getSavedPath('DorianDemo', '3-TapBubble');
    const path = v22HasPath ? v22!.path : (fallback?.path ?? []);
    return {
      animation: v22?.animation ?? fallback?.animation ?? 'cursor-real-black',
      // zoomScale ≈ 2.75 at frame 75 (zoomProgress fully clamped to 1)
      size: handSizeForZoom(2.75),
      dark: v22?.dark ?? fallback?.dark ?? true,
      physics: {
        ...DEFAULT_PHYSICS,
        ...HAND_PHYSICS.trailResponsive,
      } as ResolvedFloatingHandProps['physics'],
      showRipple: true,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: path.length,
      firstWaypoint: path[0],
      lastWaypoint: path[path.length - 1],
    };
  },

  // ── 8-ProductPage (dynamic zoom — zooms OUT from 2.75 → 1.8) ─────────
  // Click frame ~125; zoomScale ≈ 1.8 by then (zoomOut fully complete).
  // V1.22+ now reads getSavedPath('DorianFullV1-22', ...) first, falls back
  // to hardcoded path. Probe mirrors that.
  'DorianFullV1-22|8-ProductPage|0': () => {
    const saved = getSavedPath('DorianFullV1-22', '8-ProductPage');
    const sdPath =
      saved && Array.isArray(saved.path) && saved.path.length >= 2
        ? saved.path
        : null;
    return {
      animation: 'cursor-real-black',
      size: handSizeForZoom(1.8), // = 120 at click frame
      dark: false,
      physics: HAND_PHYSICS.scrollbar as ResolvedFloatingHandProps['physics'],
      showRipple: true,
      clickAnimationFile: V1_22_CLICK_ANIM_FILE,
      clickStyle: V1_22_CLICK_STYLE,
      pathLength: sdPath?.length ?? 0,
      firstWaypoint: sdPath?.[0],
      lastWaypoint: sdPath?.[(sdPath?.length ?? 1) - 1],
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
