#!/usr/bin/env node
/**
 * Write a benchmark run to the machine ledger, WITH NUMBERS.
 *
 * The gap this closes: ~/.claude/metrics/tournament-runs.jsonl holds 12 rows whose only
 * outcome field is a free-text `verdict`, and NEITHER of our two video tournaments
 * (2026-08-10, 2026-08-26) is in it at all. So nothing measured in either one can be
 * compared to anything measured later, which is the whole point of keeping a ledger.
 *
 * Emits through the house emitter so the row lands in the same stream, same schema
 * envelope, as every other skill's runs.
 *
 *   node scripts/bench-video/ledger.mjs --brick "sigma film v2" --dry-run
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const EMIT = `${process.env.HOME}/.claude/scripts/skill-run-emit.sh`;
const OUT = 'out';

const arg = (n, d = null) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const dry = process.argv.includes('--dry-run');

/**
 * Parse a probe's table output back into per-arm numbers.
 *
 * The `%` on the ink column is why this is not a one-liner. The first version was
 * `.map(Number).filter(n => !Number.isNaN(n))`, which DROPPED "3.9%" and silently shifted
 * every remaining column one place left - spread was written into inkShare and even into
 * spread. It produced a plausible row with every value wrong, into a permanent ledger.
 * Filtering NaN away is how a parse failure becomes a fabricated number.
 */
function runProbe(script, files) {
  const out = execFileSync('node', [script, ...files], { encoding: 'utf8' });
  const rows = {};
  for (const line of out.split('\n')) {
    const m = /^\s{2}(\S+\.mp4)\s+(.+)$/.exec(line);
    if (!m) continue;
    const cells = m[2].trim().split(/\s+/);
    rows[m[1]] = cells.map((c) => {
      if (/^-+$/.test(c) || /s\/|s$/.test(c)) return null; // hold timestamps, not metrics
      const n = Number(c.endsWith('%') ? c.slice(0, -1) : c);
      if (Number.isNaN(n)) return null;
      return c.endsWith('%') ? n / 100 : n;
    });
  }
  return rows;
}

/** Take the first `k` numeric cells, refusing to guess when a column is missing. */
const nums = (row, k) => {
  const v = (row ?? []).filter((x) => x !== null);
  if (v.length < k) throw new Error(`probe row had ${v.length} numeric cells, expected >= ${k}`);
  return v;
};

const files = [
  'sigma-film-25s.mp4',
  'a0plus-v1-with-score.mp4',
  'd1-inside-the-system.mp4',
  'd2-the-product.mp4',
  'd3-one-take.mp4',
].map((f) => join(OUT, f)).filter(existsSync);

if (!files.length) {
  console.error('no arm MP4s in out/ - nothing to record.');
  process.exit(2);
}

const frame = runProbe('scripts/bench-video/probe-frame.mjs', files);
const motion = runProbe('scripts/bench-video/probe-motion.mjs', files);

const arms = files.map((f) => {
  const b = basename(f);
  const [share, spread, even] = nums(frame[b], 3);
  const [energy, escalation, holds, deadair] = nums(motion[b], 4);
  return { arm: b.replace(/\.mp4$/, ''), inkShare: share, spread, even, energy, escalation, holds, deadair };
});

/** Ranking, if the operator has scored. Absent is honest; invented is not. */
let ranking = null;
const votesFile = join(OUT, 'bench-votes.jsonl');
if (existsSync(votesFile)) {
  const n = readFileSync(votesFile, 'utf8').trim().split('\n').filter(Boolean).length;
  ranking = { votes: n, note: 'run rank.mjs for the fitted order and stability' };
}

const record = {
  brick: arg('brick', 'sigma film direction'),
  cells: arms.length,
  winner: arg('winner', null),
  verdict: arg('verdict', ranking ? 'scored' : 'measured, not yet scored'),
  metrics: { rubric: 'scripts/bench-video/rubric.v1.json@v1', composite: false, arms },
  humanRanking: ranking,
  probeControls: 'both probe batteries fired; see --negative-control',
  caveats: ['holds is UNCALIBRATED on caption-driven films', 'ink/spread/escalation are proxies pending eyeball agreement'],
};

console.log(JSON.stringify(record, null, 2));
if (dry) {
  console.log('\n--dry-run: nothing written.');
  process.exit(0);
}
if (!existsSync(EMIT)) {
  console.error(`emitter not found at ${EMIT}; row NOT written.`);
  process.exit(1);
}
execFileSync('bash', [EMIT, 'append', '--skill', 'tournament', '--json', JSON.stringify(record)], { stdio: 'inherit' });
console.log('\nwritten to ~/.claude/metrics/tournament-runs.jsonl');
