/**
 * SD ↔ render parity test for FloatingHand props.
 *
 * For every probe in PRODUCTION_PROBES, computes:
 *   - the SD-preview prop bag (via `resolveSDPreviewProps` — the same
 *     formula `FloatingHandOverlay` actually uses on screen)
 *   - the production prop bag (via the manually-mirrored probe — what
 *     the scene file passes to `<FloatingHand>`)
 *
 * Asserts they're field-equal. Fails loud with a per-field diff so the
 * implementer knows exactly which prop diverged on which scene.
 *
 * Add a probe for every new `<FloatingHand>` instance reachable from a
 * versioned composition. When a probe fails, you have two choices:
 *   1. Fix production: thread `compositionId` to the scene + read SD-
 *      saved data per `.claude/rules/sd-overrides-must-honor-saved.md`.
 *   2. Fix SD: update SD's formula in `floatingHandPropResolver.ts` and
 *      this test follows automatically (resolver is single source of
 *      truth for SD).
 */

import { describe, it, expect } from 'vitest';
import { resolveSDPreviewProps } from '../floatingHandPropResolver';
import {
  PRODUCTION_PROBES,
  parseProbeKey,
  type ProductionProbe,
} from './productionPropProbes';
import { initialState } from '../state.types';
import { getSavedPath, getCodedPath } from '../codedPaths';
import type { GestureTool } from '../gestures';
import type { HandLayerData } from '../layers';

/**
 * Per-scene zoom map for each composition under test, MIRRORING the
 * `scenes[].zoom` values in `compositions.ts`. We can't import COMPOSITIONS
 * directly here — it pulls in React component module trees, which load
 * `lottie-web` and require Canvas (broken in jsdom). Keep this map in sync
 * with the composition entry; the parity test will surface a mismatch as
 * a size divergence so drift is loud.
 */
const SCENE_ZOOM_MAP: Record<string, Record<string, number>> = {
  'DorianFullV1-22': {
    '1-Intro': 1.8,
    '2-HomeScroll': 1.8,
    '3-TapBubble': 2.75,
    '4-ChatOpen': 2.75,
    '5-UserTyping': 2.75,
    '6-AIThinking': 2.75,
    '7-AIResponse': 2.75,
    '8-ProductPage': 1.8,
    '9-ProductDetail': 1.8,
  },
};

/** Per-composition click-anim + click-style — MIRRORS compositions.ts entries. */
const COMPOSITION_META: Record<
  string,
  {
    clickAnimationOverride: string | null | undefined;
    clickStyle: 'default' | 'soft-pulse' | undefined;
  }
> = {
  'DorianFullV1-22': {
    clickAnimationOverride: null,
    clickStyle: 'soft-pulse',
  },
};

/** Build the SD-side prop bag for a probe key, mirroring what
 * FloatingHandOverlay would render for that scene's primary hand layer. */
function resolveSDForProbe(key: string) {
  const { compositionId, sceneName } = parseProbeKey(key);

  // SD's overlay reads layer.data — that data is hydrated from saved JSON
  // (or coded fallback) at scene-mount via ENSURE_SCENE_LAYERS. Mirror that
  // same hydration here so the test sees what SD actually sees.
  const saved = getSavedPath(compositionId, sceneName);
  const coded = getCodedPath(compositionId, sceneName);
  const source = saved ?? coded ?? null;

  if (!source || !Array.isArray(source.path)) {
    throw new Error(
      `[parity-test] No saved or coded path for ${compositionId}|${sceneName}.` +
        ` SD would render nothing — probe is meaningless. Either remove the` +
        ` probe or seed saved/coded data.`,
    );
  }

  const gesture = (source.gesture ?? 'click') as GestureTool;
  const layerData: HandLayerData = {
    waypoints: source.path,
    gesture,
    // No per-layer size override in saved JSON today — overlay falls back
    // to zoom-adjusted default.
    size: undefined,
  };

  // Read scene zoom + composition meta from the test-local mirrors above
  // (cannot import COMPOSITIONS directly — it transitively requires Canvas).
  // SET_SCENE_ANIMATION / SET_SCENE_DARK haven't fired in tests, so
  // sceneAnimation / sceneDark fall through to gesture presets.
  const sceneZoom = SCENE_ZOOM_MAP[compositionId]?.[sceneName] ?? 1.8;
  const composition = COMPOSITION_META[compositionId] ?? {
    clickAnimationOverride: undefined,
    clickStyle: undefined,
  };

  return resolveSDPreviewProps({
    compositionId,
    sceneName,
    sceneZoom,
    gesture,
    layerData,
    state: {
      sceneAnimation: initialState.sceneAnimation,
      sceneDark: initialState.sceneDark,
      clickAnimation: initialState.clickAnimation,
    },
    composition,
  });
}

/** Walk both prop bags, list every field that differs. Returns empty
 * array on full equality. Renders compactly for diff output. */
function diffPropBags(
  sd: ReturnType<typeof resolveSDPreviewProps>,
  prod: ReturnType<ProductionProbe>,
): string[] {
  const diffs: string[] = [];
  const fields = [
    'animation',
    'size',
    'dark',
    'showRipple',
    'clickAnimationFile',
    'clickStyle',
    'pathLength',
  ] as const;

  for (const f of fields) {
    if (sd[f] !== prod[f]) {
      diffs.push(`  ${f}: SD=${stringify(sd[f])}  PROD=${stringify(prod[f])}`);
    }
  }

  // Physics: structural compare (deep). Compact diff per field that differs.
  const physicsDiffs: string[] = [];
  const allPhysicsKeys = new Set([
    ...Object.keys(sd.physics),
    ...Object.keys(prod.physics),
  ]);
  for (const k of allPhysicsKeys) {
    const a = (sd.physics as unknown as Record<string, unknown>)[k];
    const b = (prod.physics as unknown as Record<string, unknown>)[k];
    if (a !== b) {
      physicsDiffs.push(
        `    physics.${k}: SD=${stringify(a)} PROD=${stringify(b)}`,
      );
    }
  }
  if (physicsDiffs.length > 0) {
    diffs.push('  physics:');
    diffs.push(...physicsDiffs);
  }

  // Waypoints: just first/last x,y,frame. Full diff is too noisy.
  for (const which of ['firstWaypoint', 'lastWaypoint'] as const) {
    const a = sd[which];
    const b = prod[which];
    if (!shallowWaypointEqual(a, b)) {
      diffs.push(`  ${which}: SD=${stringify(a)}  PROD=${stringify(b)}`);
    }
  }

  return diffs;
}

function stringify(v: unknown): string {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function shallowWaypointEqual(
  a: { x: number; y: number; frame?: number } | undefined,
  b: { x: number; y: number; frame?: number } | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && (a.frame ?? 0) === (b.frame ?? 0);
}

/**
 * Per-probe known-deferred divergences. When a field appears here, the
 * parity test surfaces the diff in stderr (so the user sees the backlog)
 * but does NOT fail — the gap is acknowledged. Anything OUTSIDE this list
 * is an UNEXPECTED divergence and fails loud.
 *
 * Remove entries as the corresponding migration ships.
 *
 * Format keys: top-level field name, OR `physics.<key>` for nested.
 */
const ALLOWED_DIVERGENCE: Record<string, string[]> = {
  // Category B (physics — deferred): scene picks scrollbar physics, SD picks
  // gesture-preset physics. Migration plan: extend CodedPath schema to save
  // per-scene physics; SD reads it via getCodedPath/getSavedPath.
  'DorianFullV1-22|2-HomeScroll|0': [
    'physics.velocityScale',
    'physics.maxRotation',
    'physics.floatAmplitude',
    'physics.floatSpeed',
    'physics.shadowDistance',
    'physics.shadowBlur',
  ],
  // Stage 1: SDOverrideProvider closed Category C path divergence for the
  // frozen scenes. Only physics (Category B — Stage 2) remains here.
  'DorianFullV1-22|3-TapBubble|0': [
    'physics.smoothing',
    'physics.velocityScale',
    'physics.maxRotation',
    'physics.floatAmplitude',
    'physics.floatSpeed',
    'physics.shadowDistance',
    'physics.shadowBlur',
  ],
  'DorianFullV1-22|4-ChatOpen|0': [
    'physics.smoothing',
    'physics.velocityScale',
    'physics.maxRotation',
    'physics.floatSpeed',
    'physics.shadowDistance',
    'physics.shadowBlur',
  ],
  'DorianFullV1-22|5-UserTyping|0': [
    'physics.smoothing',
    'physics.velocityScale',
    'physics.maxRotation',
    'physics.floatSpeed',
    'physics.shadowDistance',
    'physics.shadowBlur',
  ],
  'DorianFullV1-22|7-AIResponse|0': [
    'physics.smoothing',
    'physics.velocityScale',
    'physics.maxRotation',
    'physics.floatSpeed',
    'physics.shadowDistance',
    'physics.shadowBlur',
  ],
  // Category B (physics) + D (showRipple — gesture preset says false, scene
  // hardcodes true). Path is now in parity post Cat-C migration.
  'DorianFullV1-22|8-ProductPage|0': [
    'showRipple',
    'physics.velocityScale',
    'physics.maxRotation',
    'physics.floatAmplitude',
    'physics.floatSpeed',
    'physics.shadowDistance',
    'physics.shadowBlur',
  ],
  'DorianFullV1-22|9-ProductDetail|0': [
    'showRipple',
    'physics.velocityScale',
    'physics.maxRotation',
    'physics.floatAmplitude',
    'physics.floatSpeed',
    'physics.shadowDistance',
    'physics.shadowBlur',
  ],
};

/** Convert a top-level diff line like "  pathLength: SD=2 PROD=3" or
 *  "    physics.velocityScale: SD=0.4 PROD=0" to its allowlist key. */
function diffLineToFieldKey(line: string): string {
  const m = line.match(/^\s*(physics\.)?(\w+):/);
  return m ? `${m[1] ?? ''}${m[2]}` : '';
}

describe('FloatingHand SD ↔ render parity', () => {
  const probeContext = {
    frame: 0, // dynamic-zoom probes baked their own sample frame inside
    defaultClickAnimation: initialState.clickAnimation,
  };

  for (const key of Object.keys(PRODUCTION_PROBES)) {
    it(`parity: ${key}`, () => {
      const sd = resolveSDForProbe(key);
      const prod = PRODUCTION_PROBES[key](probeContext);
      const diffs = diffPropBags(sd, prod);
      const allowed = new Set(ALLOWED_DIVERGENCE[key] ?? []);
      const unexpected: string[] = [];
      const known: string[] = [];
      for (const line of diffs) {
        // Top-level "physics:" header line — skip routing decision; child
        // lines carry the real keys.
        if (/^\s*physics:\s*$/.test(line)) continue;
        const field = diffLineToFieldKey(line);
        if (allowed.has(field)) known.push(line);
        else unexpected.push(line);
      }
      if (known.length > 0) {
        // Print to stderr so user sees the deferred-gap backlog without
        // failing the build.
        // eslint-disable-next-line no-console
        console.warn(
          `\n[parity ${key}] known-deferred divergences (allowed):\n` +
            known.join('\n'),
        );
      }
      if (unexpected.length > 0) {
        const msg =
          `\nUNEXPECTED divergence at ${key}:\n` +
          unexpected.join('\n') +
          `\n\nResolution:\n` +
          `  • Migrate the scene to read SD-saved data per` +
          ` .claude/rules/sd-overrides-must-honor-saved.md, OR\n` +
          `  • If intentional, add the diverging field to ALLOWED_DIVERGENCE` +
          ` for this probe with a comment explaining why.\n`;
        throw new Error(msg);
      }
    });
  }
});
