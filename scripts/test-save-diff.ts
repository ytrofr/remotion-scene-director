/**
 * Tests for saveDiff utility — covers every decision rule + the user's
 * actual scene-4 incident that triggered this whole work.
 *
 * Run: npx tsx scripts/test-save-diff.ts
 */

import {
  diffSave,
  formatDiffPrompt,
  type SaveProposal,
  type DiffResult,
} from '../src/compositions/SceneDirector/saveDiff';
import type { CodedPath } from '../src/compositions/SceneDirector/codedPaths';
import type { HandPathPoint } from '../src/components/FloatingHand/types';

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(
  label: string,
  ok: boolean,
  expected?: unknown,
  actual?: unknown,
) {
  if (ok) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    if (expected !== undefined)
      console.log(`      expected: ${JSON.stringify(expected)}`);
    if (actual !== undefined)
      console.log(`      actual:   ${JSON.stringify(actual)}`);
  }
}

function suite(name: string, fn: () => void) {
  console.log(`\n— ${name}`);
  fn();
}

const wp = (
  x: number,
  y: number,
  frame: number,
  gesture: HandPathPoint['gesture'] = 'pointer',
  extra: Partial<HandPathPoint> = {},
): HandPathPoint => ({ x, y, frame, gesture, scale: 1, ...extra });

const proposal = (
  path: HandPathPoint[],
  overrides: Partial<SaveProposal> = {},
): SaveProposal => ({
  path,
  gesture: 'click',
  animation: 'cursor-real-black',
  dark: false,
  locked: false,
  ...overrides,
});

const codedPath = (
  path: HandPathPoint[],
  extra: Partial<CodedPath> = {},
): CodedPath => ({
  path,
  gesture: 'click',
  animation: 'cursor-real-black',
  ...extra,
});

// ─── Suite 1: baseline selection ────────────────────────────────────────────
suite('baseline selection', () => {
  const r1 = diffSave(proposal([wp(0, 0, 0)]), null, null);
  check(
    'no disk + no registry → comparedAgainst="none"',
    r1.comparedAgainst === 'none',
  );
  check('no disk + no registry → severity safe', r1.severity === 'safe');

  const r2 = diffSave(proposal([wp(0, 0, 0)]), null, codedPath([wp(0, 0, 0)]));
  check(
    'no disk + registry → comparedAgainst="registry"',
    r2.comparedAgainst === 'registry',
  );

  const r3 = diffSave(
    proposal([wp(0, 0, 0)]),
    proposal([wp(0, 0, 0)]),
    codedPath([wp(0, 0, 0)]),
  );
  check(
    'disk + registry → comparedAgainst="disk" (disk wins)',
    r3.comparedAgainst === 'disk',
  );
});

// ─── Suite 2: identical paths ──────────────────────────────────────────────
suite('identical paths', () => {
  const same = [wp(100, 100, 0), wp(200, 200, 30, 'click', { duration: 5 })];
  const r = diffSave(proposal(same), proposal(same), null);
  check('same waypoints → safe', r.severity === 'safe', 'safe', r.severity);
  check(
    'same waypoints → reasons mentions no changes',
    r.reasons.some((x) => /no waypoint changes/i.test(x)),
  );
});

// ─── Suite 3: deleting all waypoints (DANGER) ──────────────────────────────
suite('deleting all waypoints', () => {
  const before = proposal([wp(100, 100, 0), wp(200, 200, 30)]);
  const after = proposal([]);
  const r = diffSave(after, before, null);
  check('all → none → DANGER', r.severity === 'danger', 'danger', r.severity);
  check(
    'reason mentions deleting all',
    r.reasons.some((x) => /Deleting ALL 2/i.test(x)),
  );
});

// ─── Suite 4: waypoint count drop (WARN) ───────────────────────────────────
suite('waypoint count decrease', () => {
  const before = proposal([
    wp(518, 992, 0, 'pointer', { scale: 2.2 }),
    wp(500, 1200, 20, 'pointer', { scale: 1.5 }),
    wp(480, 1520, 45, 'pointer'),
    wp(480, 1550, 48, 'click', { duration: 5 }),
    wp(480, 1550, 60, 'pointer'),
  ]);
  const after = proposal([
    wp(954, 1484, 45, 'pointer', { duration: 60 }),
    wp(482, 1637, 60, 'click', { duration: 45 }),
  ]);
  const r = diffSave(after, before, null);
  check('5 → 2 → warn', r.severity === 'warn', 'warn', r.severity);
  check(
    'reason mentions count drop',
    r.reasons.some((x) => /5 → 2 \(–3 removed\)/.test(x)),
    'mentions 5 → 2',
    r.reasons,
  );
  check('details list 3 removed waypoints by frame', r.details.length === 3);
  check(
    'details mention frame 0',
    r.details.some((x) => /frame 0/.test(x)),
  );
  check(
    'details mention frame 20',
    r.details.some((x) => /frame 20/.test(x)),
  );
  check(
    'details mention frame 48 click',
    r.details.some((x) => /frame 48: click/.test(x)),
  );
});

// ─── Suite 5: cursor invisible at start ────────────────────────────────────
suite('cursor invisible at scene start', () => {
  const before = proposal([wp(0, 0, 0), wp(100, 100, 30)]);
  const after = proposal([wp(0, 0, 45), wp(100, 100, 60)]);
  const r = diffSave(after, before, null);
  check('first frame 0 → 45 → warn', r.severity === 'warn', 'warn', r.severity);
  check(
    'reason mentions invisible',
    r.reasons.some((x) => /Cursor invisible for the first 45/.test(x)),
  );

  // Edge: small jump (≤ threshold) does NOT warn
  const after2 = proposal([wp(0, 0, 3), wp(100, 100, 30)]);
  const r2 = diffSave(after2, before, null);
  check(
    'first frame 0 → 3 (under threshold) → no invisibility warning',
    !r2.reasons.some((x) => /invisible/i.test(x)),
  );
});

// ─── Suite 6: lock state changes ───────────────────────────────────────────
suite('lock state changes', () => {
  const before = proposal([wp(0, 0, 0)], { locked: true });
  const after = proposal([wp(0, 0, 0)], { locked: false });
  const r = diffSave(after, before, null);
  check('locked → unlocked → warn', r.severity === 'warn', 'warn', r.severity);
  check(
    'reason mentions unlocking',
    r.reasons.some((x) => /Unlocking 🔓/.test(x)),
  );

  const r2 = diffSave(
    proposal([wp(0, 0, 0)], { locked: true }),
    proposal([wp(0, 0, 0)], { locked: false }),
    null,
  );
  check('unlocked → locked → safe (no risk)', r2.severity === 'safe');
  check(
    'reason mentions locking',
    r2.reasons.some((x) => /Locking 🔒/.test(x)),
  );
});

// ─── Suite 7: additive saves ───────────────────────────────────────────────
suite('additive saves', () => {
  const before = proposal([wp(0, 0, 0)]);
  const after = proposal([wp(0, 0, 0), wp(100, 100, 30)]);
  const r = diffSave(after, before, null);
  check('+1 waypoint → safe', r.severity === 'safe');
  check(
    'reason mentions add',
    r.reasons.some((x) => /\+1 added/.test(x)),
  );
});

// ─── Suite 8: REAL incident — user's scene 4 case ──────────────────────────
suite("user's scene-4 incident replayed", () => {
  // Original DORIAN_PATHS['4-ChatOpen']
  const registry = codedPath([
    wp(518, 992, 0, 'pointer', { scale: 2.2 }),
    wp(500, 1200, 20, 'pointer', { scale: 1.5 }),
    wp(480, 1520, 45, 'pointer'),
    wp(480, 1550, 48, 'click', { duration: 5 }),
    wp(480, 1550, 60, 'pointer'),
  ]);
  // What user actually saved (broken)
  const userSave = proposal([
    wp(954, 1484, 45, 'pointer', { duration: 60 }),
    wp(482, 1637, 60, 'click', { duration: 45 }),
  ]);
  // Scenario: first save ever for V1.11 scene 4 (no disk yet, only registry)
  const r = diffSave(userSave, null, registry);
  check(
    'first save vs registry → severity raised',
    r.severity !== 'safe',
    'warn or danger',
    r.severity,
  );
  check('comparedAgainst is registry', r.comparedAgainst === 'registry');
  check(
    'reason mentions count drop 5 → 2',
    r.reasons.some((x) => /5 → 2/.test(x)),
  );
  check(
    'reason mentions cursor invisible',
    r.reasons.some((x) => /invisible/i.test(x)),
  );

  console.log('\n  Prompt that user would have seen:');
  console.log(
    formatDiffPrompt('4-ChatOpen', r)
      .split('\n')
      .map((l) => '    ' + l)
      .join('\n'),
  );
});

// ─── Suite 9: prompt formatting ────────────────────────────────────────────
suite('formatDiffPrompt output', () => {
  const safe: DiffResult = {
    severity: 'safe',
    reasons: ['No waypoint changes detected.'],
    details: [],
    before: { count: 1, firstFrame: 0, locked: false },
    after: { count: 1, firstFrame: 0, locked: false },
    comparedAgainst: 'disk',
  };
  const out = formatDiffPrompt('test', safe);
  check('safe prompt has Save header', out.includes('Save "test"?'));
  check('safe prompt has reasons', out.includes('No waypoint changes'));

  const danger: DiffResult = {
    severity: 'danger',
    reasons: ['Deleting ALL 5 waypoints from this scene.'],
    details: [],
    before: { count: 5, firstFrame: 0, locked: false },
    after: { count: 0, firstFrame: null, locked: false },
    comparedAgainst: 'disk',
  };
  const out2 = formatDiffPrompt('test', danger);
  check('danger prompt has DESTRUCTIVE header', out2.includes('DESTRUCTIVE'));
  check('danger prompt has Cancel hint', out2.includes('Cancel to keep'));
});

// ─── Suite 10: severity escalation ─────────────────────────────────────────
suite('severity escalation (rules can only raise)', () => {
  // Combined: count drop (warn) + invisibility (warn) → still warn (not danger)
  const before = proposal([wp(0, 0, 0), wp(100, 100, 30), wp(200, 200, 60)]);
  const after = proposal([wp(0, 0, 45)]);
  const r = diffSave(after, before, null);
  check('count drop + invisibility → warn (not danger)', r.severity === 'warn');
  check('multiple reasons present', r.reasons.length >= 2);

  // All wp removed (danger) overrides everything
  const r2 = diffSave(
    proposal([], { locked: true }),
    proposal([wp(0, 0, 0)]),
    null,
  );
  check('delete-all is DANGER even with lock change', r2.severity === 'danger');
});

// ─── Summary ───────────────────────────────────────────────────────────────
console.log(`\n────────────`);
console.log(`${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log('Failures:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
process.exit(0);
