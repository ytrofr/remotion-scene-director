#!/usr/bin/env node
/**
 * EDGE-BLEED probe - does anything get CUT OFF by the frame?
 *
 * Written because D1's first full render pushed the cost line off the right edge and
 * nothing caught it: tsc was clean, the doctrine linter was clean, ink/spread/motion
 * were all healthy, and the contact sheet made it look like a mid-wipe. It took a
 * hand-run luminance read of a 6px column to prove it. That is a class of defect the
 * harness could not see, so it gets an instrument.
 *
 * THE HARD PART is not finding bright edges - it is not firing on the ones that are
 * meant to be bright. A vignette, a full-bleed gradient and a bloom halo all reach the
 * frame edge legitimately. What a CUT GLYPH adds is high-frequency structure: a sharp
 * stroke ending in mid-air. So the discriminator is CONTRAST WITHIN the edge strip
 * (max minus median), never brightness alone. A smooth gradient has a bright strip with
 * almost no internal contrast; a severed word has both.
 *
 * KNOWN LIMIT, found by the probe's first encounter with a real travelling camera:
 * it CANNOT tell a mistake from a pan. D3 is one unbroken lateral move, so labels
 * legitimately enter and leave frame; the probe reported 6 bleeds at contrast 86 and
 * every one of them was the camera doing exactly what that direction is for. My five
 * controls covered severed-glyph versus gradient, versus bloom, versus black - and
 * none of them moved. A static composition's edge ink is a defect; a moving one's is
 * a decision, and pixels alone do not carry the difference.
 *
 * So: trust this probe on locked-off compositions, read it as a PROMPT TO LOOK on
 * anything with a camera move, and never quote its count as a defect count without
 * naming which kind of film it ran on.
 *
 *   node scripts/bench-video/probe-bleed.mjs <a.mp4> [b.mp4 ...]
 *   node scripts/bench-video/probe-bleed.mjs --selftest
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';

const STRIP = 6;        // px of border examined per edge
const SAMPLE_FPS = 4;
const CONTRAST_HIT = 60; // largest adjacent-pixel jump along the edge that counts as a cut
const MIN_HIT = 45;      // and the strip must actually be lit; a dark strip cannot bleed

/** Raw gray frames at full width so the border strip is real pixels, not resampled. */
function grayFrames(file, w, h) {
  const raw = execFileSync('ffmpeg',
    ['-v', 'error', '-i', file, '-vf', `fps=${SAMPLE_FPS}`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
    { maxBuffer: 1 << 30 });
  const per = w * h;
  const out = [];
  for (let i = 0; i + per <= raw.length; i += per) out.push(raw.subarray(i, i + per));
  return out;
}

function dims(file) {
  const s = execFileSync('ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
     '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim().split(',');
  return { w: +s[0], h: +s[1] };
}

const median = (arr) => {
  const a = Uint8Array.prototype.slice.call(arr).sort();
  return a[a.length >> 1];
};

/**
 * One edge strip -> {max, contrast}, where contrast is HIGH-FREQUENCY: the largest
 * jump between two ADJACENT pixels running ALONG the edge.
 *
 * The first version used max-minus-median across the whole strip, and a control caught
 * it: a smooth ramp running along an edge spans 200 levels end to end and scored 116,
 * higher than plenty of real severed glyphs, while having no edge in it at all. What
 * distinguishes a cut word is not that the strip is varied - it is that the variation
 * happens in ONE PIXEL. A ramp of 200 levels over 1920px is 0.1 per pixel. A glyph
 * stroke ending in mid-air is a step of 100+ between neighbours.
 */
function strip(buf, w, h, edge) {
  const line = [];
  if (edge === 'left' || edge === 'right') {
    const x = edge === 'left' ? 0 : w - 1;
    // Read the outermost column, brightest-of-STRIP per row, so a 1px gap does not hide it.
    for (let y = 0; y < h; y++) {
      let m = 0;
      for (let k = 0; k < STRIP; k++) {
        const xx = edge === 'left' ? k : x - k;
        const v = buf[y * w + xx];
        if (v > m) m = v;
      }
      line.push(m);
    }
  } else {
    const y = edge === 'top' ? 0 : h - 1;
    for (let xx = 0; xx < w; xx++) {
      let m = 0;
      for (let k = 0; k < STRIP; k++) {
        const yy = edge === 'top' ? k : y - k;
        const v = buf[yy * w + xx];
        if (v > m) m = v;
      }
      line.push(m);
    }
  }
  let max = 0;
  let jump = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] > max) max = line[i];
    if (i > 0) {
      const d = Math.abs(line[i] - line[i - 1]);
      if (d > jump) jump = d;
    }
  }
  return { max, med: median(Uint8Array.from(line)), contrast: jump };
}

const EDGES = ['left', 'right', 'top', 'bottom'];

function probe(file) {
  const { w, h } = dims(file);
  const fs_ = grayFrames(file, w, h);
  const worst = Object.fromEntries(EDGES.map((e) => [e, { contrast: 0, max: 0, t: 0 }]));
  let hits = 0;
  for (let i = 0; i < fs_.length; i++) {
    for (const e of EDGES) {
      const s = strip(fs_[i], w, h, e);
      const hit = s.contrast >= CONTRAST_HIT && s.max >= MIN_HIT;
      if (hit) hits++;
      if (s.contrast > worst[e].contrast) worst[e] = { ...s, t: i / SAMPLE_FPS };
    }
  }
  return { file, frames: fs_.length, hits, worst };
}

function report(rs) {
  console.log(`\npopulation: ${rs.length} arm(s), ${rs[0]?.frames ?? 0} frames each, ${STRIP}px border`);
  console.log(`hit rule: strip contrast >= ${CONTRAST_HIT} AND strip max >= ${MIN_HIT}\n`);
  console.log('  arm                              bleeds   worst edge  contrast   at');
  // Printed every run, like the UNCALIBRATED note on probe-motion's holds column. A
  // caveat that lives only in a docstring is a caveat nobody reading the number sees.
  const caveat = () => console.log(
    '\n  NOTE: a count above zero means "look here", not "defect here". On a film with\n' +
    '  a camera move, type leaving frame is the move, not a mistake - measured on D3.');
  for (const r of rs) {
    const [e, v] = Object.entries(r.worst).sort((a, b) => b[1].contrast - a[1].contrast)[0];
    console.log(`  ${basename(r.file).padEnd(32)} ${String(r.hits).padStart(5)}   ${e.padEnd(10)} ${String(v.contrast).padStart(8)}   ${v.t.toFixed(2)}s`);
  }
  caveat();
  console.log('');
}

/** Controls. A bleed detector that has never been watched fire is not evidence. */
function selftest() {
  const d = mkdtempSync(join(tmpdir(), 'bleed-'));
  const mk = (name, vf) => {
    const f = join(d, name);
    execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=1920x1080:r=30:d=2',
      '-vf', vf, '-frames:v', '60', '-pix_fmt', 'yuv420p', f, '-y']);
    return f;
  };
  const cases = [
    // MUST FIRE: a word severed by the right edge.
    ['severed word at right edge', mk('sev.mp4',
      "drawtext=text='OVERFLOWING':fontsize=140:fontcolor=white:x=1500:y=400"), true],
    // MUST NOT FIRE: the same word, wholly inside frame.
    ['same word inside frame', mk('in.mp4',
      "drawtext=text='OVERFLOWING':fontsize=140:fontcolor=white:x=500:y=400"), false],
    // MUST NOT FIRE: a smooth full-bleed gradient - bright at the edge, no structure.
    // Hand-rolled with geq rather than the `gradients` source, because `gradients`
    // ANIMATES by default: this same control measured 51 on one run and 88 on the
    // next against a threshold of 60, so it was flipping between pass and fail on
    // nothing but the clock. A control that is not deterministic cannot fail
    // meaningfully, which makes it worse than no control - it manufactures both
    // false alarms and false confidence. A linear ramp is exactly as smooth and
    // is the same every run.
    ['full-bleed gradient', mk('grad.mp4',
      "geq=lum='16+200*X/W':cb=128:cr=128"), false],
    // MUST NOT FIRE: a radial bloom, the other legitimately-bright-at-the-edge case
    // and the one our own films actually contain.
    ['radial bloom to the edges', mk('bloom.mp4',
      "geq=lum='240*exp(-((X-W/2)^2+(Y-H/2)^2)/(2*(W/3)^2))':cb=128:cr=128"), false],
    // MUST NOT FIRE: pure black.
    ['black', mk('blk.mp4', 'null'), false],
    // MUST FIRE: a hard-edged bar running out of frame at the bottom.
    ['bar cut by bottom edge', mk('bar.mp4',
      'drawbox=x=300:y=1000:w=900:h=200:color=white@1:t=fill'), true],
  ];
  let bad = 0;
  console.log('\ncontrols (expected -> actual)\n');
  for (const [name, f, expect] of cases) {
    const r = probe(f);
    const fired = r.hits > 0;
    const ok = fired === expect;
    if (!ok) bad++;
    const [e, v] = Object.entries(r.worst).sort((a, b) => b[1].contrast - a[1].contrast)[0];
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(28)} expect ${expect ? 'FIRE ' : 'quiet'} -> ${fired ? 'FIRE ' : 'quiet'}  (worst ${e} contrast ${v.contrast})`);
  }
  rmSync(d, { recursive: true, force: true });
  console.log(`\n${bad === 0 ? 'all controls behaved' : bad + ' CONTROL(S) WRONG - do not trust this probe'}\n`);
  process.exit(bad === 0 ? 0 : 1);
}

const args = process.argv.slice(2);
if (args[0] === '--selftest') selftest();
else if (!args.length) { console.error('usage: probe-bleed.mjs <file.mp4>... | --selftest'); process.exit(2); }
else report(args.filter((f) => existsSync(f)).map(probe));
