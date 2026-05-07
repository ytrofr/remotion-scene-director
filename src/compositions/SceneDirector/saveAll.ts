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
