/**
 * saveDiff — pure utility comparing a proposed save vs disk/registry baseline.
 *
 * Used by Save, Save-as-Version, and bump pre-flight to surface destructive
 * changes BEFORE they're committed. Pure functions — no I/O, no React, fully
 * testable via scripts/test-save-diff.ts.
 *
 * Severity levels:
 *   safe    — no prompt needed (additive changes, first save, identical)
 *   warn    — confirm with diff details (waypoint count drop, lock change,
 *             cursor-invisible-at-start risk)
 *   danger  — strong confirm (all waypoints removed, locked-scene overwrite)
 */

import type { CodedPath } from './codedPaths';
import type { HandPathPoint } from '../../components/FloatingHand/types';

export type DiffSeverity = 'safe' | 'warn' | 'danger';

export interface SaveProposal {
  path: HandPathPoint[];
  gesture: string;
  animation?: string;
  dark?: boolean;
  locked?: boolean;
  secondaryLayers?: Array<{ gesture: string; path: HandPathPoint[] }>;
}

export interface DiffResult {
  severity: DiffSeverity;
  reasons: string[]; // headline list ("Removed 3 waypoints", etc.)
  details: string[]; // concrete waypoint diffs
  before: { count: number; firstFrame: number | null; locked: boolean };
  after: { count: number; firstFrame: number | null; locked: boolean };
  comparedAgainst: 'disk' | 'registry' | 'none';
}

const CURSOR_INVISIBLE_THRESHOLD = 5; // frames before "cursor invisible at start" warning fires

/**
 * Compare a save proposal against the disk-saved state (preferred) or
 * registry default (fallback). Returns severity + reasons for UI.
 *
 * Decision rules (each rule can ONLY raise severity, never lower it):
 *   1. No baseline AND proposal has waypoints → safe (first save)
 *   2. Baseline had waypoints AND proposal has none → DANGER (delete all)
 *   3. Saving over a locked scene → DANGER (handled separately by Toolbar
 *      confirm; this util reports it as warn so Save-as-Version sees it)
 *   4. Waypoint count decreased → warn
 *   5. First waypoint frame jumped from 0 → >5 → warn (cursor invisible)
 *   6. Lock state changed → warn
 *   7. Otherwise → safe
 */
export function diffSave(
  proposal: SaveProposal,
  diskState: SaveProposal | null | undefined,
  registryFallback: CodedPath | null | undefined,
): DiffResult {
  // Pick baseline: disk wins over registry (registry is what's in
  // codedPaths.ts hardcoded). If neither, this is a brand-new scene.
  let baseline: SaveProposal | null = null;
  let comparedAgainst: DiffResult['comparedAgainst'] = 'none';
  if (diskState) {
    baseline = diskState;
    comparedAgainst = 'disk';
  } else if (registryFallback) {
    baseline = {
      path: registryFallback.path ?? [],
      gesture: registryFallback.gesture,
      animation: registryFallback.animation,
      dark: registryFallback.dark,
      locked: registryFallback._locked ?? false,
      secondaryLayers: registryFallback.secondaryLayers,
    };
    comparedAgainst = 'registry';
  }

  const before = {
    count: baseline?.path?.length ?? 0,
    firstFrame: baseline?.path?.[0]?.frame ?? null,
    locked: baseline?.locked ?? false,
  };
  const after = {
    count: proposal.path?.length ?? 0,
    firstFrame: proposal.path?.[0]?.frame ?? null,
    locked: proposal.locked ?? false,
  };

  const result: DiffResult = {
    severity: 'safe',
    reasons: [],
    details: [],
    before,
    after,
    comparedAgainst,
  };

  // Rule 1: no baseline → first save, nothing to compare against.
  if (!baseline) {
    result.reasons.push('First save — no prior version to compare against.');
    return result;
  }

  // Rule 2: deleting all waypoints when there were some → danger.
  if (before.count > 0 && after.count === 0) {
    result.severity = 'danger';
    result.reasons.push(
      `Deleting ALL ${before.count} waypoint${before.count > 1 ? 's' : ''} from this scene.`,
    );
    // Don't bother with finer-grained reasons; this is the headline.
    return result;
  }

  // Rule 3: lock state change.
  if (before.locked && !after.locked) {
    result.severity = raise(result.severity, 'warn');
    result.reasons.push('Unlocking 🔓 this scene as part of save.');
  } else if (!before.locked && after.locked) {
    result.reasons.push('Locking 🔒 this scene as part of save.');
  }

  // Rule 4: waypoint count decreased.
  if (after.count < before.count) {
    result.severity = raise(result.severity, 'warn');
    const drop = before.count - after.count;
    result.reasons.push(
      `Waypoints: ${before.count} → ${after.count} (–${drop} removed)`,
    );
    const beforeFrames = (baseline.path ?? []).map((p) => p.frame);
    const afterFrames = new Set((proposal.path ?? []).map((p) => p.frame));
    const removed = baseline.path.filter((p) => !afterFrames.has(p.frame));
    for (const wp of removed) {
      const dur = wp.duration ? ` duration:${wp.duration}` : '';
      result.details.push(
        `  – frame ${wp.frame}: ${wp.gesture} (${wp.x}, ${wp.y})${dur}`,
      );
    }
    void beforeFrames;
  } else if (after.count > before.count) {
    result.reasons.push(
      `Waypoints: ${before.count} → ${after.count} (+${after.count - before.count} added)`,
    );
  }

  // Rule 5: cursor invisible at scene start.
  if (
    before.firstFrame === 0 &&
    after.firstFrame !== null &&
    after.firstFrame > CURSOR_INVISIBLE_THRESHOLD
  ) {
    result.severity = raise(result.severity, 'warn');
    result.reasons.push(
      `First waypoint moved from frame 0 → ${after.firstFrame}. Cursor invisible for the first ${after.firstFrame} frames of the scene.`,
    );
  }

  // Sanity check: if after exists but before existed, and they're identical
  // by JSON-stringify of paths, mark as no-op.
  if (
    result.severity === 'safe' &&
    result.reasons.length === 0 &&
    pathsEqual(baseline.path ?? [], proposal.path ?? [])
  ) {
    result.reasons.push('No waypoint changes detected.');
  }

  return result;
}

function raise(current: DiffSeverity, next: DiffSeverity): DiffSeverity {
  const order: DiffSeverity[] = ['safe', 'warn', 'danger'];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}

function pathsEqual(a: HandPathPoint[], b: HandPathPoint[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const pa = a[i];
    const pb = b[i];
    if (
      pa.x !== pb.x ||
      pa.y !== pb.y ||
      pa.frame !== pb.frame ||
      pa.gesture !== pb.gesture ||
      (pa.scale ?? 1) !== (pb.scale ?? 1) ||
      (pa.duration ?? 0) !== (pb.duration ?? 0) ||
      (pa.rotation ?? 0) !== (pb.rotation ?? 0)
    ) {
      return false;
    }
  }
  return true;
}

/** Build the human-readable confirm prompt body from a DiffResult. */
export function formatDiffPrompt(scene: string, diff: DiffResult): string {
  const header =
    diff.severity === 'danger'
      ? `⚠️ DESTRUCTIVE save to "${scene}"`
      : diff.severity === 'warn'
        ? `⚠️ Heads up before saving "${scene}"`
        : `Save "${scene}"?`;
  const baselineLabel =
    diff.comparedAgainst === 'disk'
      ? 'Comparing against last saved version on disk.'
      : diff.comparedAgainst === 'registry'
        ? 'Comparing against the hardcoded baseline (no prior save exists).'
        : 'Brand-new scene (no baseline to compare against).';
  const lines: string[] = [
    header,
    baselineLabel,
    '',
    ...diff.reasons.map((r) => `• ${r}`),
  ];
  if (diff.details.length > 0) {
    lines.push('', 'Removed waypoints:');
    lines.push(...diff.details);
  }
  lines.push(
    '',
    diff.severity === 'safe'
      ? 'Continue?'
      : 'Click OK to save anyway, or Cancel to keep current saved version.',
  );
  return lines.join('\n');
}
