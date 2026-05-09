/**
 * Scene Config Registry — pure data layer for per-version scene customization.
 *
 * Plan: ~/.claude/plans/plan-this-properly-in-atomic-eich.md (P1, axis 1)
 *
 * What this is:
 *   A unified, JSON-only schema for per-composition + per-scene overrides
 *   (meta.duration, click flashes, audio cues, named markers, _locked, etc).
 *   Sits alongside `codedPaths.data.json` (which stays the source of truth for
 *   hand-path waypoints — see s1 concern 2 in plan §6 axis-1 risks). This file
 *   covers everything that ISN'T waypoints.
 *
 * Why a SEPARATE file (not merged into codedPaths.data.json):
 *   - Kill-switch granularity (delete sceneConfig.data.json without touching
 *     waypoints; flip SD_SCENE_CONFIG_ENABLED=false to ignore at read).
 *   - Independent slice-isolation (sceneConfig is the 10th DirectorSlice key).
 *   - Independent history log (sceneConfig.history.jsonl).
 *   See plan §6 axis-1 risks "Two-file divergence" mitigation:
 *     sequential POST queue per-scene + atomic per-file write + idempotent
 *     re-emission on next Save.
 *
 * Schema:
 *   {
 *     "<CompositionId>": {
 *       "_extends": "<BaseCompositionId>",  // optional; cycle-detect; max chain 5
 *       "_scenes": {
 *         "<SceneName>": {
 *           "meta":        { "duration": number, "zoom": number },
 *           "hand":        { ... future per-version path overrides ... },
 *           "clickFlash":  [ { x, y, frame, color, ... } ],
 *           "audio":       [ { file, frame, volume, fadeInFrames, fadeOutFrames } ],
 *           "markers":     { "<key>": { x, y, frame } },
 *           "_locked":     boolean,
 *           "_overlap_ok": boolean    // reserved for axis 4 secondary-layer overlap exception
 *         }
 *       }
 *     }
 *   }
 *
 * Resolution rules:
 *   - `_extends` walks the chain. Each level merges shallowly over the next:
 *     CHILD wins on every key. Per-scene merge is property-level (mirrors
 *     mergePaths() in codedPaths.ts).
 *   - Within a scene: `meta` and `hand` deep-merge (object spread). `markers`
 *     merge by key. `clickFlash` and `audio` arrays REPLACE wholesale (any
 *     entry in the child wins; appending requires an explicit empty array in
 *     the base).
 *   - Cycle detection throws. Max chain depth 5 throws.
 *
 * Back-compat:
 *   When sceneConfig.data.json is empty `{}` (initial state), all reads return
 *   `null` and callers fall back to legacy paths (codedPaths, in-tsx click
 *   trail constants, etc). Migration to sceneConfig is OPT-IN via the
 *   `/api/versions/migrate-coded-paths` endpoint (P1.5).
 *
 * Companion alias `sceneOverrides` is exported for the V1.21 prop-typing path
 * (s1 concern 1: alias-not-rename). See d25b724 callers.
 */

import type { HandPathPoint } from '../../components/FloatingHand/types';

// ── Schema types ───────────────────────────────────────────────────────────

export interface SceneMeta {
  duration?: number;
  zoom?: number;
}

export interface ClickFlashEntry {
  x: number;
  y: number;
  frame: number;
  color?: string;
  durationFrames?: number;
}

export interface AudioCueEntry {
  file: string;
  frame: number;
  volume?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

export interface MarkerEntry {
  x: number;
  y: number;
  frame?: number;
}

export interface SceneConfigEntry {
  meta?: SceneMeta;
  hand?: { path?: HandPathPoint[] };
  clickFlash?: ClickFlashEntry[];
  audio?: AudioCueEntry[];
  markers?: Record<string, MarkerEntry>;
  /** Reload skips locked scenes; Save defends against empty-path overwrite. */
  _locked?: boolean;
  /** Allow secondary-layer overlap (axis 4 future doctor:dual-stack exception). */
  _overlap_ok?: boolean;
}

export interface CompSceneConfig {
  _extends?: string;
  _scenes: Record<string, SceneConfigEntry>;
}

export type SceneConfigRegistry = Record<string, CompSceneConfig>;

// ── Source of truth ────────────────────────────────────────────────────────

import savedSceneConfig from './sceneConfig.data.json';

const REGISTRY: SceneConfigRegistry = savedSceneConfig as SceneConfigRegistry;

// ── Resolver constants ─────────────────────────────────────────────────────

const MAX_CHAIN_DEPTH = 5;

// ── Cycle / depth detection ────────────────────────────────────────────────

class SceneConfigError extends Error {
  constructor(
    public readonly code: 'cycle' | 'depth',
    message: string,
  ) {
    super(`[sceneConfig] ${code}: ${message}`);
    this.name = 'SceneConfigError';
  }
}

/**
 * Walk the `_extends` chain starting at compId and return the resolved chain
 * from ROOT (no _extends) to LEAF (compId itself), inclusive.
 *
 * Throws SceneConfigError on cycle (compId visits a node twice) or when chain
 * length exceeds MAX_CHAIN_DEPTH.
 *
 * Pure function — does not mutate REGISTRY or any input.
 */
export function walkExtendsChain(
  compId: string,
  registry: SceneConfigRegistry = REGISTRY,
): string[] {
  const chain: string[] = [];
  const seen = new Set<string>();
  let cursor: string | undefined = compId;

  while (cursor) {
    if (seen.has(cursor)) {
      throw new SceneConfigError(
        'cycle',
        `cycle detected at "${cursor}" in chain ${[...chain, cursor].join(' → ')}`,
      );
    }
    seen.add(cursor);
    chain.push(cursor);
    if (chain.length > MAX_CHAIN_DEPTH) {
      throw new SceneConfigError(
        'depth',
        `chain depth > ${MAX_CHAIN_DEPTH} at ${chain.join(' → ')}`,
      );
    }
    const entry: CompSceneConfig | undefined = registry[cursor];
    cursor = entry?._extends;
  }

  // Reverse so [root, ..., leaf] for left-to-right merge (root first; child wins last).
  return chain.reverse();
}

// ── Merge ──────────────────────────────────────────────────────────────────

/**
 * Property-level merge — child wins on every key. `meta` and `hand` deep-merge
 * shallowly (object spread). `markers` merge by key. `clickFlash` and `audio`
 * arrays replace wholesale.
 */
export function mergeSceneEntry(
  base: SceneConfigEntry | undefined,
  child: SceneConfigEntry | undefined,
): SceneConfigEntry {
  if (!base && !child) return {};
  if (!base) return { ...child! };
  if (!child) return { ...base };
  return {
    ...base,
    ...child,
    meta: base.meta || child.meta ? { ...base.meta, ...child.meta } : undefined,
    hand: base.hand || child.hand ? { ...base.hand, ...child.hand } : undefined,
    markers:
      base.markers || child.markers
        ? { ...base.markers, ...child.markers }
        : undefined,
    // arrays: child replaces, falls back to base only if child undefined
    clickFlash: child.clickFlash ?? base.clickFlash,
    audio: child.audio ?? base.audio,
  };
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Resolve the effective SceneConfigEntry for a (compId, sceneName) pair.
 *
 * Walks `_extends` chain root→leaf and merges. Returns null if NOTHING in the
 * chain has the scene (caller falls back to legacy codedPaths or in-tsx
 * defaults — fail-closed per plan §4.7).
 *
 * Throws SceneConfigError on cycle / depth violation.
 */
export function resolveSceneConfig(
  compId: string,
  sceneName: string,
  registry: SceneConfigRegistry = REGISTRY,
): SceneConfigEntry | null {
  const chain = walkExtendsChain(compId, registry);
  let merged: SceneConfigEntry | null = null;
  for (const id of chain) {
    const entry = registry[id]?._scenes?.[sceneName];
    if (!entry) continue;
    merged = mergeSceneEntry(merged ?? undefined, entry);
  }
  return merged;
}

/**
 * Get ALL scenes resolved for a composition. Useful for SD UI to enumerate
 * configurable scenes. Returns empty record if no entries exist anywhere
 * in the chain.
 */
export function resolveAllScenes(
  compId: string,
  registry: SceneConfigRegistry = REGISTRY,
): Record<string, SceneConfigEntry> {
  const chain = walkExtendsChain(compId, registry);
  const out: Record<string, SceneConfigEntry> = {};
  for (const id of chain) {
    const scenes = registry[id]?._scenes;
    if (!scenes) continue;
    for (const [name, entry] of Object.entries(scenes)) {
      out[name] = mergeSceneEntry(out[name], entry);
    }
  }
  return out;
}

/** Lightweight existence check — does this comp have any sceneConfig anywhere in its chain? */
export function hasSceneConfig(
  compId: string,
  registry: SceneConfigRegistry = REGISTRY,
): boolean {
  try {
    const chain = walkExtendsChain(compId, registry);
    return chain.some(
      (id) =>
        registry[id] !== undefined &&
        Object.keys(registry[id]._scenes ?? {}).length > 0,
    );
  } catch {
    return false; // cycle/depth → treat as no config (fail-closed)
  }
}

/** Get the raw (unresolved) entry for THIS compId only. Used by save endpoints. */
export function getRawComp(compId: string): CompSceneConfig | undefined {
  return REGISTRY[compId];
}

// ── Back-compat alias (s1 concern 1: alias-not-rename) ────────────────────

/**
 * Generic per-scene-name override map — the new shape introduced by P1.
 * Keyed by FULL sceneName (e.g. "8-ProductPage") with the canonical
 * SceneConfigEntry shape (meta/hand/clickFlash/audio/markers/_locked).
 *
 * This is the shape future Dorian versions (V1.22+ data-only entries) will
 * carry in sceneConfig.data.json[compId]._scenes. For now d25b724 callers
 * (V1.21) keep their domain-specific `SceneOverridesV1_12` shape untouched
 * — that's the s1 concern 1 contract: byte-stable, no caller migration.
 *
 * Bridge to d25b724:
 *   - SceneOverridesV1_12 keys: `productPage`, `productDetail`, `outro`
 *     (Dorian-specific short names) → maps to FULL sceneName via convention
 *     "8-ProductPage", "9-ProductDetail", "10-Outro".
 *   - SceneOverridesV1_12.<scene>.duration → SceneConfigEntry.meta.duration.
 *   - SceneOverridesV1_12.<scene>.sceneConfig → reserved for nested
 *     scene-component config (e.g. ProductPageSceneV1_12_SceneConfig).
 *
 * No automatic conversion ships in P1 — d25b724 is intentionally untouched.
 * P2b adds the bridge when SD UI wires per-scene markers + duration.
 */
export type SceneOverrides = Record<string, SceneConfigEntry>;

/**
 * Convenience accessor that returns the `_scenes` map for a comp without
 * walking the extends chain. Use when the caller is OK with single-level
 * (e.g. the V1.12 sceneOverrides prop pattern). For cross-version inheritance
 * use resolveSceneConfig / resolveAllScenes instead.
 */
export function getSceneOverrides(compId: string): SceneOverrides {
  return REGISTRY[compId]?._scenes ?? {};
}

// ── Errors ─────────────────────────────────────────────────────────────────

export { SceneConfigError };
