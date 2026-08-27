#!/usr/bin/env node
/**
 * SPATIAL probe - how a frame uses its own area.
 *
 * Measures the operator's actual complaint ("the current screen are too texty") as two
 * numbers that need no cooperation from the composition, so the FROZEN v1 baseline can
 * be measured on exactly the same instrument as every new arm.
 *
 *   ink share       % of the frame that is not background. A near-empty frame is not
 *                   "clean", it is unfurnished - v1's real problem is as much emptiness
 *                   as it is text.
 *   ink dispersion  normalised entropy of ink across a 6x6 grid. A centred headline on
 *                   black concentrates every lit pixel into two cells and scores LOW.
 *                   A composed frame uses its corners and scores HIGH. This is what
 *                   separates "a caption over a background" from "a picture".
 *
 * NOTE ON METHOD (changed from plan section 5a, deliberately, and this is the reason):
 * the plan proposed isolating type by rendering each arm twice, once with type hidden,
 * and diffing. That cannot measure v1 - v1 is frozen and its components take no such
 * prop - and a metric that cannot measure the baseline cannot measure improvement
 * against it. Dispersion captures the same complaint and applies uniformly.
 *
 *   node scripts/bench-video/probe-frame.mjs <a.mp4> [b.mp4 ...]
 *   node scripts/bench-video/probe-frame.mjs --negative-control
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

const GW = 192; // sample grid. Plenty for area statistics, ~100x faster than full res.
const GH = 108;
const CELLS = 6;
const SAMPLE_FPS = 4; // 4 frames a second: enough to characterise a 25s film.

/** Pull downscaled raw RGB frames. Returns an array of Buffers, one per sampled frame. */
function frames(file) {
  const raw = execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', file, '-vf', `fps=${SAMPLE_FPS},scale=${GW}:${GH}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
    { maxBuffer: 1 << 30 },
  );
  const per = GW * GH * 3;
  const out = [];
  for (let i = 0; i + per <= raw.length; i += per) out.push(raw.subarray(i, i + per));
  return out;
}

/**
 * Background level = the 10th-percentile luma of the clip, CAPPED at a fixed dark
 * reference.
 *
 * The cap is load-bearing and the negative control is what found it: a purely derived
 * floor sends an all-light clip's own floor to 255, so the threshold outruns every
 * pixel and a fully-lit frame reports ZERO ink - the exact inverse of the truth. The cap
 * means "ink" is measured against the darker of (this clip's own base, a fixed dark
 * reference), so an arm that grades to a light base is correctly scored as a full frame
 * rather than an empty one.
 */
const DARK_REF = 40;
function floorLuma(fs) {
  const s = [];
  for (const f of fs) for (let p = 0; p < f.length; p += 3 * 97) s.push(luma(f, p));
  s.sort((a, b) => a - b);
  return Math.min(s[Math.floor(s.length * 0.1)] ?? 0, DARK_REF);
}

const luma = (f, p) => 0.2126 * f[p] + 0.7152 * f[p + 1] + 0.0722 * f[p + 2];

function analyse(f, floor) {
  const thr = floor + 18; // 18/255 above the floor counts as lit
  const cell = new Float64Array(CELLS * CELLS);
  let lit = 0;
  let wsum = 0;
  let r2sum = 0;
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const p = (y * GW + x) * 3;
      const v = luma(f, p);
      if (v <= thr) continue;
      lit++;
      const w = v - thr;
      cell[Math.min(CELLS - 1, ((y / GH) * CELLS) | 0) * CELLS + Math.min(CELLS - 1, ((x / GW) * CELLS) | 0)] += w;
      // Normalised offset from frame centre, in half-width / half-height units.
      const nx = (x / (GW - 1)) * 2 - 1;
      const ny = (y / (GH - 1)) * 2 - 1;
      r2sum += w * (nx * nx + ny * ny);
      wsum += w;
    }
  }
  const share = lit / (GW * GH);
  // Shannon entropy over the cell histogram, normalised to [0,1].
  const total = cell.reduce((a, b) => a + b, 0);
  let H = 0;
  if (total > 0) {
    for (const c of cell) {
      if (c <= 0) continue;
      const p = c / total;
      H -= p * Math.log2(p);
    }
  }
  // RMS radius of the ink about the frame centre, normalised so 1 = all ink in the
  // corners. Entropy alone counts HOW MANY cells are lit and is blind to WHICH - four
  // adjacent cells and four corner cells score identically, which is the difference
  // between a caption and a composition. This is the term that can see it.
  const spread = wsum > 0 ? Math.sqrt(r2sum / wsum / 2) : 0;
  return { share, even: total > 0 ? H / Math.log2(CELLS * CELLS) : 0, spread };
}

function probe(file) {
  const fs = frames(file);
  if (!fs.length) throw new Error(`no frames decoded from ${file}`);
  const floor = floorLuma(fs);
  const per = fs.map((f) => analyse(f, floor));
  const mean = (k) => per.reduce((a, r) => a + r[k], 0) / per.length;
  return { file, sampled: per.length, floor, share: mean('share'), even: mean('even'), spread: mean('spread'), per };
}

const pct = (n) => (n * 100).toFixed(1).padStart(5) + '%';

// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

if (args.includes('--negative-control')) {
  // Five synthetic clips whose correct answers are known a priori. If any disagrees,
  // every number this probe prints about a real film is worthless.
  const tmp = '/tmp/.bench-frame-nc';
  const gen = (name, src) =>
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', src, '-t', '2', '-pix_fmt', 'yuv420p', `${tmp}-${name}.mp4`]);
  const box = (x, y) => `drawbox=x=${x}:y=${y}:w=40:h=20:color=white@1:t=fill`;
  gen('black', 'color=c=black:s=384x216:r=30');
  gen('white', 'color=c=white:s=384x216:r=30');
  // A centred block: the literal shape of "a caption on an empty frame".
  gen('centred', `color=c=black:s=384x216:r=30,${box(172, 98)},${box(172, 118)},${box(132, 98)},${box(132, 118)}`);
  // The SAME amount of ink, in the corners. Composed rather than captioned.
  gen('corners', `color=c=black:s=384x216:r=30,${box(10, 10)},${box(334, 10)},${box(10, 186)},${box(334, 186)}`);

  const b = probe(`${tmp}-black.mp4`);
  const w = probe(`${tmp}-white.mp4`);
  const c = probe(`${tmp}-centred.mp4`);
  const k = probe(`${tmp}-corners.mp4`);

  console.log(`population: 4 synthetic clips, ${CELLS}x${CELLS} grid, ${SAMPLE_FPS}fps sampling`);
  const row = (n, r) =>
    console.log(`  ${n.padEnd(9)} share ${pct(r.share)}   spread ${r.spread.toFixed(3)}   even ${r.even.toFixed(3)}`);
  row('black', b);
  row('white', w);
  row('centred', c);
  row('corners', k);
  console.log('');

  const checks = [
    ['black clip reads ~0 ink', b.share < 0.01],
    ['white clip reads ~100 ink (floor cap works)', w.share > 0.98],
    ['uniform white spreads ~0.58 (the analytic value)', Math.abs(w.spread - 0.577) < 0.05],
    ['centred ink scores LOW spread', c.spread < 0.3],
    ['corner ink scores HIGH spread', k.spread > 0.75],
    ['centred and corners carry the SAME ink', Math.abs(c.share - k.share) < 0.01],
    // Not "entropy is blind" - it separates them a little. The real, testable claim is
    // that `spread` is the discriminating column and `even` is nearly useless here.
    ['spread separates caption-vs-composed >=5x better than even', Math.abs(c.spread - k.spread) > 5 * Math.abs(c.even - k.even)],
  ];
  let bad = 0;
  for (const [name, ok] of checks) {
    if (!ok) bad++;
    console.log(`  ${ok ? 'FIRED ' : 'SILENT'}  ${name}`);
  }
  if (bad) {
    console.error(`\n${bad} control(s) did not behave. This probe is not trustworthy - ignore its numbers.`);
    process.exit(1);
  }
  const sepS = Math.abs(c.spread - k.spread);
  const sepE = Math.abs(c.even - k.even);
  console.log('\nall controls behaved.');
  console.log(`separation on the caption-vs-composed pair:  spread ${sepS.toFixed(3)}  vs  even ${sepE.toFixed(3)}`);
  console.log(`spread is ${(sepS / Math.max(sepE, 1e-9)).toFixed(1)}x more discriminating - read the spread column.`);
  process.exit(0);
}

const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('usage: probe-frame.mjs <a.mp4> [b.mp4 ...]  |  --negative-control');
  process.exit(2);
}
const missing = files.filter((f) => !existsSync(f));
if (missing.length) {
  console.error(`missing: ${missing.join(', ')}`);
  process.exit(2);
}

const rows = files.map(probe);
console.log(`population: ${rows.length} arm(s), ${rows[0].sampled} frames each, ${CELLS}x${CELLS} grid`);
console.log('');
console.log('  arm                              ink     spread   even');
for (const r of rows) {
  const bar = '█'.repeat(Math.round(r.spread * 24));
  console.log(`  ${basename(r.file).padEnd(32)}${pct(r.share)}   ${r.spread.toFixed(3)}   ${r.even.toFixed(3)}  ${bar}`);
}
console.log('');
console.log('  spread: 0 = every lit pixel is dead centre (a caption). ~0.58 = the frame is');
console.log('  used evenly. Higher = the composition reaches its own corners.');
