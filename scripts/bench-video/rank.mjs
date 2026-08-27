#!/usr/bin/env node
/**
 * Bradley-Terry ranking from pairwise votes, with bootstrap confidence.
 *
 * Pairwise beats a 1-5 overall score for ranking because a rater does not have to hold
 * a consistent internal meaning for "7 out of 10" across a session. What pairwise cannot
 * do is tell you WHY, which is what the per-dimension rubric is for - the two are
 * separate jobs and are never averaged into one number here.
 *
 * Stops on RANK STABILITY, not on a vote count: resample the votes, refit, and ask how
 * often the ordering survives. Close arms need far more comparisons than separated ones,
 * so "N votes per arm" is the wrong stopping rule.
 *
 *   node scripts/bench-video/rank.mjs out/bench-votes.jsonl
 *   node scripts/bench-video/rank.mjs --negative-control
 */
import { readFileSync, existsSync } from 'node:fs';

/** Deterministic PRNG - a bootstrap that cannot be reproduced is not evidence. */
const rng = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

/**
 * Fit strengths by minorization-maximization. Ties count as half a win each way, which
 * is the standard treatment and keeps a tie from silently vanishing.
 */
function fit(votes, arms) {
  const idx = Object.fromEntries(arms.map((a, i) => [a, i]));
  const n = arms.length;
  let p = new Array(n).fill(1);
  const wins = new Array(n).fill(0);
  const pairs = new Map();
  for (const v of votes) {
    const a = idx[v.a];
    const b = idx[v.b];
    if (a === undefined || b === undefined) continue;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    pairs.set(key, (pairs.get(key) ?? 0) + 1);
    if (v.winner === 'tie') {
      wins[a] += 0.5;
      wins[b] += 0.5;
    } else {
      wins[idx[v.winner]] += 1;
    }
  }
  for (let iter = 0; iter < 400; iter++) {
    const next = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let denom = 0;
      for (const [key, cnt] of pairs) {
        const [x, y] = key.split(',').map(Number);
        if (x !== i && y !== i) continue;
        const j = x === i ? y : x;
        denom += cnt / (p[i] + p[j]);
      }
      next[i] = denom > 0 ? wins[i] / denom : p[i];
    }
    const mean = next.reduce((a, b) => a + b, 0) / n;
    p = next.map((v) => (mean > 0 ? v / mean : 1));
  }
  return Object.fromEntries(arms.map((a, i) => [a, p[i]]));
}

function bootstrap(votes, arms, reps = 600) {
  const rand = rng(20260826);
  const orders = [];
  const strengths = Object.fromEntries(arms.map((a) => [a, []]));
  for (let r = 0; r < reps; r++) {
    const sample = Array.from({ length: votes.length }, () => votes[Math.floor(rand() * votes.length)]);
    const s = fit(sample, arms);
    for (const a of arms) strengths[a].push(s[a]);
    orders.push([...arms].sort((x, y) => s[y] - s[x]).join('>'));
  }
  const counts = new Map();
  for (const o of orders) counts.set(o, (counts.get(o) ?? 0) + 1);
  const [topOrder, topCount] = [...counts].sort((a, b) => b[1] - a[1])[0];
  const ci = Object.fromEntries(
    arms.map((a) => {
      const s = strengths[a].slice().sort((x, y) => x - y);
      return [a, [s[Math.floor(reps * 0.025)], s[Math.floor(reps * 0.975)]]];
    }),
  );
  return { topOrder, stability: topCount / reps, ci };
}

function report(votes, arms) {
  const s = fit(votes, arms);
  const b = bootstrap(votes, arms);
  const sorted = [...arms].sort((x, y) => s[y] - s[x]);
  console.log(`population: ${votes.length} votes over ${arms.length} arms, ${new Set(votes.map((v) => v.rater)).size} rater(s)`);
  console.log('');
  console.log('  rank  arm                          strength   95% CI');
  sorted.forEach((a, i) => {
    const [lo, hi] = b.ci[a];
    console.log(`  ${String(i + 1).padStart(4)}  ${a.padEnd(28)} ${s[a].toFixed(3).padStart(7)}   ${lo.toFixed(2)} - ${hi.toFixed(2)}`);
  });
  console.log('');
  console.log(`  most common ordering over 600 resamples: ${b.topOrder}`);
  console.log(`  rank stability: ${(b.stability * 100).toFixed(1)}%  ${b.stability >= 0.95 ? '(settled)' : '(NOT settled - this is a tie, report it as one)'}`);
  return b;
}

// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

if (args.includes('--negative-control')) {
  const arms = ['A', 'B', 'C'];
  const mk = (a, b, winner, n) => Array.from({ length: n }, () => ({ a, b, winner, rater: 'ctl' }));
  // 1. A dominant order must be recovered, and recovered stably.
  const clean = [...mk('A', 'B', 'A', 12), ...mk('B', 'C', 'B', 12), ...mk('A', 'C', 'A', 12)];
  console.log('control 1 - A>B>C by construction. Must recover it AND report high stability.');
  const c1 = report(clean, arms);
  console.log('');
  // 2. Coin-flip votes must NOT produce a confident ranking. A ranker that always
  //    reports a settled order is not measuring preference, it is measuring noise.
  const rand = rng(7);
  const noise = Array.from({ length: 36 }, () => {
    const pair = [['A', 'B'], ['B', 'C'], ['A', 'C']][Math.floor(rand() * 3)];
    return { a: pair[0], b: pair[1], winner: pair[Math.floor(rand() * 2)], rater: 'ctl' };
  });
  console.log('control 2 - coin-flip votes. Must NOT report a settled ordering.');
  const c2 = report(noise, arms);
  console.log('');
  const checks = [
    ['dominant order recovered', c1.topOrder === 'A>B>C'],
    ['dominant order is settled (>=95%)', c1.stability >= 0.95],
    ['noise is NOT settled (<95%)', c2.stability < 0.95],
    ['noise CIs are wider than signal CIs', (c2.ci.A[1] - c2.ci.A[0]) > (c1.ci.A[1] - c1.ci.A[0])],
  ];
  let bad = 0;
  for (const [name, ok] of checks) {
    if (!ok) bad++;
    console.log(`  ${ok ? 'FIRED ' : 'SILENT'}  ${name}`);
  }
  if (bad) {
    console.error(`\n${bad} control(s) did not behave. Do not trust any ranking this produces.`);
    process.exit(1);
  }
  console.log('\nall controls behaved: the ranker separates signal from noise and says which it has.');
  process.exit(0);
}

const file = args.find((a) => !a.startsWith('--')) ?? 'out/bench-votes.jsonl';
if (!existsSync(file)) {
  console.error(`no votes at ${file}. Run the scoring page first.`);
  process.exit(2);
}
const votes = readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const arms = [...new Set(votes.flatMap((v) => [v.a, v.b]))].sort();
const b = report(votes, arms);

// Order-flip rate: the same pair shown both ways. A high rate means position bias is
// contaminating the result, and no amount of extra votes fixes that.
const byPair = new Map();
for (const v of votes) {
  const key = [v.a, v.b].sort().join('|');
  if (!byPair.has(key)) byPair.set(key, []);
  byPair.get(key).push(v);
}
let flips = 0;
let checked = 0;
for (const [, vs] of byPair) {
  const left = vs.filter((v) => v.shownLeft === v.a);
  const right = vs.filter((v) => v.shownLeft !== v.a);
  if (!left.length || !right.length) continue;
  checked++;
  const lw = left.filter((v) => v.winner === v.shownLeft).length / left.length;
  const rw = right.filter((v) => v.winner === v.shownLeft).length / right.length;
  if (Math.abs(lw - rw) > 0.5) flips++;
}
console.log(`  position-bias check: ${checked} pair(s) seen in both orders, ${flips} inconsistent`);
if (checked === 0) console.log('  WARNING: no pair was shown in both orders, so position bias is UNMEASURED here.');
