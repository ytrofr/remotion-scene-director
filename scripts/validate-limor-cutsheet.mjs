#!/usr/bin/env node
// Validates the L.I.M.O.R cut sheet - the sticky input both tournament arms build from.
// A drifted cut sheet would desync Remotion and HyperFrames identically, so nothing
// downstream would flag it. Fail loud here instead.
//
// Usage: node scripts/validate-limor-cutsheet.mjs [--mutate <kind>]
//   --mutate is the negative control: it deliberately breaks the sheet in memory and
//   asserts the checks go RED. A validator that has never failed proves nothing.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sheet = JSON.parse(readFileSync(join(root, 'src/compositions/LimorFilm/cutsheet.json'), 'utf8'));
const tokens = JSON.parse(readFileSync(join(root, 'src/compositions/LimorFilm/tokens.json'), 'utf8'));

const mutateIdx = process.argv.indexOf('--mutate');
const mutation = mutateIdx > -1 ? process.argv[mutateIdx + 1] : null;

if (mutation === 'gap') sheet.frames[5].start += 0.5;
if (mutation === 'total') sheet.frames.at(-1).dur += 2;
if (mutation === 'vo-orphan') sheet.vo[3].at = 999;
if (mutation === 'vo-overlap') sheet.vo[2].at = sheet.vo[1].at + 0.1;
if (mutation === 'canvas') tokens.canvas.durationInFrames = 99;

const problems = [];
const EPS = 1e-6;

// 1. Frames must tile the timeline with no gap and no overlap.
let cursor = 0;
for (const f of sheet.frames) {
  if (Math.abs(f.start - cursor) > EPS) {
    problems.push(
      `${f.id}: starts at ${f.start}s but previous frame ends at ${cursor}s ` +
        `(${(f.start - cursor).toFixed(3)}s ${f.start > cursor ? 'gap' : 'overlap'})`
    );
  }
  cursor = +(f.start + f.dur).toFixed(6);
}

// 2. Total must equal the declared duration AND the canvas frame count.
if (Math.abs(cursor - sheet.totalSeconds) > EPS) {
  problems.push(`timeline ends at ${cursor}s, cut sheet declares ${sheet.totalSeconds}s`);
}
const expectedFrames = sheet.totalSeconds * sheet.fps;
if (tokens.canvas.durationInFrames !== expectedFrames) {
  problems.push(
    `tokens.canvas.durationInFrames is ${tokens.canvas.durationInFrames}, ` +
      `cut sheet implies ${expectedFrames} (${sheet.totalSeconds}s x ${sheet.fps}fps)`
  );
}
if (tokens.canvas.fps !== sheet.fps) {
  problems.push(`fps mismatch: tokens ${tokens.canvas.fps} vs cut sheet ${sheet.fps}`);
}

// 3. Every VO cue must land inside a frame, in order, without colliding with the next.
//    Rough read speed for the brief's calm delivery; deliberately conservative.
const WPS = 2.35;
const spoken = sheet.vo.map((v) => ({ ...v, dur: (v.text.split(/\s+/).length / WPS) }));

for (let i = 0; i < spoken.length; i++) {
  const v = spoken[i];
  const host = sheet.frames.find((f) => v.at >= f.start - EPS && v.at < f.start + f.dur);
  if (!host) {
    problems.push(`${v.id}: cue at ${v.at}s falls outside every frame`);
    continue;
  }
  const end = v.at + v.dur;
  if (end > sheet.totalSeconds) {
    problems.push(`${v.id}: runs to ${end.toFixed(1)}s, past the end of the film`);
  }
  const next = spoken[i + 1];
  if (next && end > next.at + EPS) {
    problems.push(
      `${v.id} ("${v.text.slice(0, 28)}...") runs to ${end.toFixed(1)}s but ` +
        `${next.id} starts at ${next.at}s - overlapping speech`
    );
  }
}

// 4. The brief's hard holds.
const reveal = sheet.frames.at(-1);
if (reveal.holdSeconds < 4) problems.push(`final frame holds ${reveal.holdSeconds}s, brief requires >= 4s`);
if (reveal.sloganAt <= reveal.wordmarkAt) problems.push('slogan must appear after the wordmark, not with it');
if (sheet.vo.some((v) => v.text.includes(reveal.slogan))) problems.push('slogan must NEVER be spoken');

// 5. Duration must sit in the brief's non-negotiable window.
if (sheet.totalSeconds < 90 || sheet.totalSeconds > 105) {
  problems.push(`total ${sheet.totalSeconds}s is outside the brief's 90-105s window`);
}

// 6. No em dash anywhere in customer-facing copy (operator law).
const copy = [
  ...sheet.vo.map((v) => v.text),
  ...JSON.stringify(sheet.frames).match(/"[^"]*"/g).map((s) => s.slice(1, -1)),
];
const emDash = copy.filter((s) => /[—–―]/.test(s));
if (emDash.length) problems.push(`em/en dash in copy: ${emDash.slice(0, 3).join(' | ')}`);

const speechTotal = spoken.reduce((a, v) => a + v.dur, 0);

console.log('=== L.I.M.O.R cut sheet ===');
console.log(`frames        ${sheet.frames.length} (${sheet.frames.length - 1} story + brand reveal)`);
console.log(`duration      ${cursor}s = ${cursor * sheet.fps} frames @ ${sheet.fps}fps`);
console.log(`vo cues       ${sheet.vo.length}, ~${sheet.vo.reduce((a, v) => a + v.text.split(/\s+/).length, 0)} words`);
console.log(`speech        ~${speechTotal.toFixed(1)}s (${((speechTotal / cursor) * 100).toFixed(0)}% of runtime)`);
console.log(`silence       ~${(cursor - speechTotal).toFixed(1)}s`);
if (mutation) console.log(`MUTATION      ${mutation} (negative control)`);
console.log('');

if (problems.length) {
  console.error(`FAIL - ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  x ${p}`);
  process.exit(1);
}
console.log('OK - contiguous timeline, no overlapping speech, brief constraints held.');
