/**
 * Save-all helper — pure functions extracted for testability.
 *
 * Used by the Toolbar Save handler to compute which scenes to save and
 * build the per-scene proposal payloads. Pure (no React, no localStorage,
 * no fetch) so the logic is unit-testable in isolation.
 */

import { GESTURE_PRESETS, type GestureTool } from './gestures';
import type { DirectorState } from './state';
import type { SaveProposal } from './saveDiff';
import type { SceneConfigEntry } from './sceneConfig';

/**
 * Collect every scene name in the current state that has any per-scene data.
 * Sorted for deterministic save order.
 *
 * Empty layer arrays from default seeding are NOT included — only scenes
 * with actual hand layers contribute. This prevents the server's
 * delete-on-empty path from firing on scenes that were never edited.
 */
export function collectScenesToSave(state: DirectorState): string[] {
  const scenes = new Set<string>();

  for (const k of Object.keys(state.waypoints)) scenes.add(k);
  for (const k of Object.keys(state.sceneGesture)) scenes.add(k);
  for (const k of Object.keys(state.sceneAnimation)) scenes.add(k);
  for (const k of Object.keys(state.sceneDark)) scenes.add(k);
  for (const k of Object.keys(state.sceneLocked)) scenes.add(k);
  for (const [k, layers] of Object.entries(state.layers)) {
    if (layers.some((l) => l.type === 'hand')) scenes.add(k);
  }

  return Array.from(scenes).sort();
}

/** Build a SaveProposal for one scene from current state. */
export function buildProposalForScene(
  state: DirectorState,
  scene: string,
): SaveProposal {
  const waypoints = state.waypoints[scene] || [];
  const gesture = (state.sceneGesture[scene] || 'click') as GestureTool;
  const preset = GESTURE_PRESETS[gesture];
  const sceneLayers = state.layers[scene] || [];
  const handLayers = sceneLayers.filter((l) => l.type === 'hand');
  const secondary = handLayers.slice(1).map((l) => ({
    gesture: l.data.gesture,
    path: ((l.data as { waypoints?: unknown[] }).waypoints || []) as never,
  }));
  return {
    path: waypoints,
    gesture,
    animation: state.sceneAnimation[scene] ?? preset.animation,
    dark: state.sceneDark[scene],
    locked: state.sceneLocked[scene] ?? false,
    secondaryLayers: secondary.length > 0 ? secondary : undefined,
  };
}

/**
 * Filter proposals to those that should actually be POSTed.
 * Empty path + not-locked = skip (would delete the disk entry).
 */
export function filterPersistableProposals(
  proposals: { scene: string; proposal: SaveProposal }[],
): { scene: string; proposal: SaveProposal }[] {
  return proposals.filter(
    ({ proposal }) => proposal.path.length > 0 || proposal.locked === true,
  );
}

// ── sceneConfig save flow (P1.4 — separate from path Save per s1 concern 2)

/**
 * Collect every scene name in the current state that has a sceneConfig entry.
 * Sorted for deterministic save order.
 *
 * Parallel to collectScenesToSave but pulls from `state.sceneConfig` only.
 * Toolbar.handleSave runs both flows sequentially: path Save first, then
 * sceneConfig Save. Two atomic file writes (per-file atomic via
 * writeFileSync); divergence between files is recovered by next idempotent
 * Save.
 */
export function collectSceneConfigsToSave(state: DirectorState): string[] {
  return Object.keys(state.sceneConfig).sort();
}

/** Return the sceneConfig entry for a scene (already in state form). */
export function buildSceneConfigProposal(
  state: DirectorState,
  scene: string,
): SceneConfigEntry | null {
  return state.sceneConfig[scene] ?? null;
}

/**
 * Filter sceneConfig proposals to those that should actually be POSTed.
 * Empty entry (`{}`) + not _locked = skip (nothing to persist; would create
 * a noise entry on disk).
 */
export function filterPersistableSceneConfigs(
  proposals: { scene: string; entry: SceneConfigEntry }[],
): { scene: string; entry: SceneConfigEntry }[] {
  return proposals.filter(({ entry }) => {
    const keys = Object.keys(entry);
    if (keys.length === 0) return false;
    // an entry with ONLY `_locked: false` and nothing else is also noise
    if (keys.length === 1 && keys[0] === '_locked' && entry._locked === false) {
      return false;
    }
    return true;
  });
}
