/**
 * Pure entry-merge logic for /api/save-path.
 *
 * Stage 2 bug history (2026-05-10): the inline entry-building in
 * vite.config.ts rebuilt entries from scratch every save. Stage 2 added
 * `physicsPreset/showRipple/size` to the client proposal, but the server
 * never destructured them. Result: every Save silently wiped any seeded
 * value for those fields, defeating the parity test the moment a user
 * saved any scene. Extracting the logic here makes it (a) unit-testable
 * and (b) extension-safe — adding a Stage 3+ field requires touching one
 * place, with semantics that prevent silent drops.
 *
 * Field semantics:
 *   - "always-present" fields (gesture/animation/path): rebuild from
 *     incoming. Stage 1 invariant; client always sends.
 *   - "explicit-set" fields (dark/_locked/secondaryLayers): write only
 *     when truthy/present in incoming. Drops on absence — matches prior
 *     behavior because client always sends an explicit value.
 *   - "preserve-on-absence" fields (physicsPreset/showRipple/size):
 *     incoming undefined → keep prev value. incoming explicit null →
 *     clear. Matches Stage 2 Inspector flow where "didn't touch" =
 *     undefined and the field stays sticky in the JSON.
 *
 * If you add a new Stage N field that flows through SD-saved data path,
 * add it to the preserve-on-absence list — never to the always-present
 * list — unless every save is guaranteed to send it.
 */

/** Subset of fields the client may send. Permissive on type since this
 * sits at a JSON boundary; the receiver does its own validation. */
export interface SavePathIncoming {
  gesture?: string;
  animation?: string;
  path?: unknown;
  dark?: boolean;
  locked?: boolean;
  secondaryLayers?: unknown[];
  // Stage 2 fields
  physicsPreset?: string | null;
  showRipple?: boolean | null;
  size?: number | null;
}

/** Structural shape of a previously-saved entry — mirrors `CodedPath` but
 * declared inline so this module has zero imports (vite.config.ts loads
 * it at config-time before the full src/ graph is resolvable). */
export interface PrevSavedEntry {
  physicsPreset?: string;
  showRipple?: boolean;
  size?: number;
  [k: string]: unknown;
}

export type SavePathEntry = Record<string, unknown>;

/**
 * Merge an incoming save body with the previous saved entry.
 * Returns the entry to write back to the JSON file.
 *
 * `prevEntry` is null when this is the first save for a scene.
 */
export function mergeSavePathEntry(
  prevEntry: PrevSavedEntry | null,
  incoming: SavePathIncoming,
): SavePathEntry {
  const entry: SavePathEntry = {
    gesture: incoming.gesture,
    animation: incoming.animation,
    path: incoming.path,
  };

  // Explicit-set fields: write only when truthy/present.
  if (incoming.dark !== undefined) entry.dark = incoming.dark;
  if (incoming.locked === true) entry._locked = true;
  if (
    Array.isArray(incoming.secondaryLayers) &&
    incoming.secondaryLayers.length > 0
  ) {
    entry.secondaryLayers = incoming.secondaryLayers;
  }

  // Preserve-on-absence Stage 2 fields. undefined = preserve prev,
  // null = explicit clear, value = override. Skip the JSON key when
  // resolved value is null/undefined so JSON stays compact.
  const preservedPhysics =
    incoming.physicsPreset !== undefined
      ? incoming.physicsPreset
      : (prevEntry?.physicsPreset ?? undefined);
  const preservedRipple =
    incoming.showRipple !== undefined
      ? incoming.showRipple
      : (prevEntry?.showRipple ?? undefined);
  const preservedSize =
    incoming.size !== undefined
      ? incoming.size
      : (prevEntry?.size ?? undefined);

  if (preservedPhysics !== undefined && preservedPhysics !== null) {
    entry.physicsPreset = preservedPhysics;
  }
  if (preservedRipple !== undefined && preservedRipple !== null) {
    entry.showRipple = preservedRipple;
  }
  if (preservedSize !== undefined && preservedSize !== null) {
    entry.size = preservedSize;
  }

  return entry;
}
