#!/usr/bin/env node
/**
 * TEMPORAL probe - how a film uses its own running time.
 *
 * Three numbers, each answering a word the operator used:
 *
 *   energy      mean frame-to-frame change. How much is happening at all.
 *   escalation  energy in the last third over energy in the first third. A film that
 *               builds scores >1. A film that runs at one level for 25 seconds - which
 *               is what "boring" usually means in practice - scores ~1.
 *   holds       runs of near-stillness >=0.8s that FOLLOW a high-energy moment. A hold
 *               is the pause that lets a payoff land; it is the single cheapest thing
 *               that separates a film from a slideshow, and v1 has none by construction.
 *
 * "Boring" is not directly observable and this does not claim to measure it. These are
 * PROXIES, and they are only worth anything where they agree with the operator's eye
 * (see ~/.claude/skills/eyeball-calibrated-scoring). A metric that disagrees with the
 * eye is a wrong metric, not a wrong eye.
 *
 *   node scripts/bench-video/probe-motion.mjs <a.mp4> [b.mp4 ...] [--csv]
 *   node scripts/bench-video/probe-motion.mjs --negative-control
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

const GW = 160;
const GH = 90;
/**
 * Sample at the SOURCE frame rate, never below it.
 *
 * This was 15 and the negative control is what caught it: sampling a 30fps source at
 * 15fps takes every other frame, so an alternating-frame strobe is sampled at a single
 * phase and its delta is exactly ZERO - the highest-energy clip conceivable reported as
 * perfectly still. Real films alias the same way, just less visibly: every motion
 * component near the Nyquist limit was being under-reported. All our compositions are
 * 30fps.
 */
const FPS = 30;
const HOLD_MIN = 0.8; // seconds
const HOLD_LEVEL = 0.18; // fraction of the clip's own mean energy that counts as "still"
const EVENT_LEVEL = 1.5; // fraction of mean energy that counts as "a high-energy moment"

/** Spatial std-dev of one gray frame. An empty frame is flat; a composed one is not. */
function texture(buf) {
  let sum = 0;
  const n = buf.length;
  for (let p = 0; p < n; p++) sum += buf[p];
  const m = sum / n;
  let v = 0;
  for (let p = 0; p < n; p++) v += (buf[p] - m) * (buf[p] - m);
  return Math.sqrt(v / n) / 255;
}

function series(file) {
  const raw = execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', file, '-vf', `fps=${FPS},scale=${GW}:${GH}`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
    { maxBuffer: 1 << 30 },
  );
  const per = GW * GH;
  const n = Math.floor(raw.length / per);
  const e = [];
  const tex = [];
  for (let i = 1; i < n; i++) {
    const a = raw.subarray((i - 1) * per, i * per);
    const b = raw.subarray(i * per, (i + 1) * per);
    let s = 0;
    for (let p = 0; p < per; p++) s += Math.abs(b[p] - a[p]);
    e.push(s / per / 255);
    tex.push(texture(b));
  }
  return { e, tex };
}

function analyse(file) {
  const { e, tex } = series(file);
  if (e.length < 4) throw new Error(`too few frames in ${file}`);
  const mean = e.reduce((a, b) => a + b, 0) / e.length;
  const third = Math.floor(e.length / 3);
  const first = e.slice(0, third).reduce((a, b) => a + b, 0) / third;
  const last = e.slice(-third).reduce((a, b) => a + b, 0) / third;
  const escalation = first > 1e-6 ? last / first : last > 1e-6 ? Infinity : 1;

  // A hold only counts if something happened before it. Stillness that follows nothing
  // is just dead air, and rewarding it would score a static image as cinematic.
  //
  // DEAD_FLOOR is load-bearing and the negative control is what found it: with a clip
  // whose mean energy is ~0 every relative threshold collapses to 0, so `e >= 0` marks
  // an event on the first frame and `e <= 0` marks the entire clip as a hold - a static
  // image scored as the most cinematic thing in the set. Below this floor nothing is
  // happening at all, so there are no events and there can be no holds.
  const DEAD_FLOOR = 1e-4;
  if (mean < DEAD_FLOOR) {
    return { file, samples: e.length, mean, escalation, holds: [], deadAir: [], peak: Math.max(...e), e };
  }
  const stillThr = mean * HOLD_LEVEL;
  const eventThr = mean * EVENT_LEVEL;
  const minLen = Math.round(HOLD_MIN * FPS);

  /**
   * A hold must be stillness on a FRAME WORTH HOLDING.
   *
   * The first version of this counted any still run after any event, and reported six
   * "holds" in a film that has none - because the gaps between one caption fading out
   * and the next fading in are still runs too. Dead air and a held payoff are
   * indistinguishable by motion alone; what separates them is what is ON SCREEN.
   * `texture` (spatial std-dev) is near zero on an empty frame and high on a composed
   * one, so the run only counts if the frame during it is above the clip's own median.
   */
  const medTex = [...tex].sort((a, b) => a - b)[Math.floor(tex.length / 2)] ?? 0;
  const substantial = (from, to) => {
    let s = 0;
    for (let i = from; i < to; i++) s += tex[i];
    return s / Math.max(1, to - from) >= medTex * 0.9;
  };
  /**
   * The event must be RECENT.
   *
   * `seenEvent` was sticky for the whole clip, so once anything happened at all every
   * later pause qualified - which in a film made of captions means every gap between
   * captions. A hold is the beat AFTER a payoff, so the payoff has to be within
   * EVENT_RECENCY seconds of the pause starting. This is a different mechanism, not a
   * re-tuned threshold: it asks WHEN the event was, where the old one only asked IF.
   */
  const EVENT_RECENCY = 1.2;
  const recencyWindow = Math.round(EVENT_RECENCY * FPS);
  let lastEvent = -Infinity;
  const holds = [];
  const deadAir = [];
  let run = 0;
  const close = (endIdx) => {
    if (run < minLen) return;
    const startIdx = endIdx - run;
    if (startIdx - lastEvent > recencyWindow) return; // stillness with no recent payoff
    const rec = { at: startIdx / FPS, len: run / FPS };
    (substantial(startIdx, endIdx) ? holds : deadAir).push(rec);
  };
  for (let i = 0; i < e.length; i++) {
    if (e[i] >= eventThr) lastEvent = i;
    if (e[i] <= stillThr) {
      run++;
    } else {
      close(i);
      run = 0;
    }
  }
  close(e.length);

  const peak = Math.max(...e);
  return { file, samples: e.length, mean, escalation, holds, deadAir, peak, e };
}

// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

if (args.includes('--negative-control')) {
  const tmp = '/tmp/.bench-motion-nc';
  const gen = (name, src, extra = []) =>
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', src, '-t', '6', ...extra, '-pix_fmt', 'yuv420p', `${tmp}-${name}.mp4`]);
  gen('still', 'color=c=gray:s=320x180:r=30');
  gen('strobe', "nullsrc=s=320x180:r=30,geq=lum='255*mod(N\\,2)':cb=128:cr=128");
  // Something happens, then it stops dead for 3s: the shape of a payoff plus a hold.
  gen('eventhold', "color=c=black:s=320x180:r=30,geq=lum='if(lt(T,2),random(1)*255,40)':cb=128:cr=128");

  const s = analyse(`${tmp}-still.mp4`);
  const b = analyse(`${tmp}-strobe.mp4`);
  const h = analyse(`${tmp}-eventhold.mp4`);

  console.log(`population: 3 synthetic clips, ${FPS}fps sampling, hold >= ${HOLD_MIN}s`);
  const row = (n, r) =>
    console.log(`  ${n.padEnd(10)} energy ${r.mean.toFixed(4)}  escalation ${String(r.escalation.toFixed(2)).padStart(6)}  holds ${r.holds.length}`);
  row('still', s);
  row('strobe', b);
  row('event+hold', h);
  console.log('');

  const checks = [
    ['a still image reads ~0 energy', s.mean < 0.002],
    ['a still image scores NO holds (nothing happened first)', s.holds.length === 0],
    ['a strobe saturates energy', b.mean > 0.3],
    ['a strobe scores NO holds', b.holds.length === 0],
    ['event-then-stillness IS detected as a hold', h.holds.length >= 1],
    ['the detected hold is >= 2s long', (h.holds[0]?.len ?? 0) >= 2],
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
  console.log('\nall controls behaved: the probe can tell a hold from dead air.');
  process.exit(0);
}

// --json emits the raw fields so a CALLER never has to parse the human table.
// The ledger already shipped one column-shift bug from doing exactly that, where
// "3.9%" was dropped by a Number() filter and every value silently moved one place
// left. Machines read this branch; people read the table below it.
if (args.includes('--json')) {
  const fs_ = args.filter((a) => !a.startsWith('--'));
  const out = fs_.map((f) => {
    const r = analyse(f);
    return {
      file: f, samples: r.samples, energy: r.mean, escalation: r.escalation,
      holds: r.holds.length, deadAir: r.deadAir.length, peak: r.peak,
    };
  });
  console.log(JSON.stringify(out));
  process.exit(0);
}

const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('usage: probe-motion.mjs <a.mp4> [b.mp4 ...] [--csv]  |  --negative-control');
  process.exit(2);
}
const missing = files.filter((f) => !existsSync(f));
if (missing.length) {
  console.error(`missing: ${missing.join(', ')}`);
  process.exit(2);
}

const rows = files.map(analyse);
if (args.includes('--csv')) {
  console.log('arm,t,energy');
  for (const r of rows) r.e.forEach((v, i) => console.log(`${basename(r.file)},${(i / FPS).toFixed(3)},${v.toFixed(6)}`));
  process.exit(0);
}

console.log(`population: ${rows.length} arm(s), ${rows[0].samples} deltas each, ${FPS}fps sampling`);
console.log('');
console.log('  arm                              energy  escalation  holds  deadair  held at');
for (const r of rows) {
  const h = r.holds.length ? r.holds.map((x) => `${x.at.toFixed(1)}s`).join(' ') : '--';
  console.log(
    `  ${basename(r.file).padEnd(32)}${r.mean.toFixed(4)}  ${String(r.escalation.toFixed(2)).padStart(9)}   ${String(r.holds.length).padStart(4)}   ${String(r.deadAir.length).padStart(5)}    ${h}`,
  );
}
console.log('');
console.log('  escalation ~1.0 means the film runs at one level throughout; <1 means it decays.');
console.log('  CALIBRATED   escalation - robust, and the strongest signal here.');
console.log('  UNCALIBRATED holds - two mechanism changes did not make it discriminate on');
console.log('               caption-driven films: a word appearing IS an energy spike, and the');
console.log('               word then sitting still IS a pause, so a slideshow reads as held.');
console.log('               Do not quote this column until it has agreed with the operator');
console.log('               eye at least once. deadair is the same stillness on an empty frame.');
