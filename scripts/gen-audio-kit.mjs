#!/usr/bin/env node
/**
 * Deterministic audio kit for the SIGMA films.
 *
 * Synthesises a scored bed plus a set of one-shots as pure Node maths. No API key, no
 * network, no dependency, and - the load-bearing property - byte-identical on every run,
 * so the determinism gate that `check-determinism.sh` enforces on the picture keeps
 * holding once the films have sound.
 *
 * The score is DERIVED FROM THE CUT SHEET, never hand-timed. `cutsheet.json` is the single
 * source of truth for the picture; if the music carried its own copy of the beat times the
 * two would drift the first time a beat moved, silently, and only the finished mix would
 * show it.
 *
 * Technique borrowed (read and re-authored, not installed) from
 * haidrrrry/claude-remotion-skill `examples/scripts/gen-track.mjs`, MIT.
 *
 *   node scripts/gen-audio-kit.mjs            write the kit
 *   node scripts/gen-audio-kit.mjs --verify   write twice, prove the bytes match
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CUT = JSON.parse(
  readFileSync(join(ROOT, 'src/compositions/SigmaFilm/cutsheet.json'), 'utf8'),
);
const OUT = join(ROOT, 'public/audio/sfx');
const SR = 44100;

/** Beat start times by id, straight off the cut sheet. */
const at = Object.fromEntries(CUT.frames.map((f) => [f.id, f.start]));
const DUR = CUT.totalSeconds;

// ---------------------------------------------------------------------------
// deterministic noise. Math.random() would break byte-stability on every render.
// ---------------------------------------------------------------------------
let seed = 1;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647 - 0.5;
};
const reseed = () => {
  seed = 1;
};

// ---------------------------------------------------------------------------
// buffer helpers
// ---------------------------------------------------------------------------
const buffer = (seconds) => new Float32Array(Math.ceil(SR * seconds));

/** Mix `fn(t, progress)` into `buf` starting at `start` seconds. */
const add = (buf, start, dur, fn) => {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const j = s0 + i;
    if (j < 0 || j >= buf.length) continue;
    buf[j] += fn(i / SR, i / n);
  }
};

const sine = (f, t) => Math.sin(2 * Math.PI * f * t);

// ---------------------------------------------------------------------------
// voices
// ---------------------------------------------------------------------------
const kick = (buf, t, gain = 0.85) =>
  add(buf, t, 0.3, (ts, p) => sine(140 - 95 * Math.min(1, ts * 9), ts) * Math.exp(-p * 7) * gain);

const hat = (buf, t, gain = 0.09) =>
  add(buf, t, 0.045, (_ts, p) => rnd() * 2 * Math.exp(-p * 10) * gain);

const bass = (buf, t, f, dur = 0.24, gain = 0.3) =>
  add(buf, t, dur, (ts, p) => {
    const env = Math.min(1, ts * 90) * Math.exp(-p * 4);
    return (sine(f, ts) + sine(f * 3, ts) / 3.5) * env * gain;
  });

/** Low boom + noise crack. The only sound allowed to be loud. */
const impact = (buf, t, gain = 1) => {
  add(buf, t, 1.1, (ts, p) => sine(60 - 25 * Math.min(1, ts * 3), ts) * Math.exp(-p * 4.2) * 0.9 * gain);
  add(buf, t, 0.4, (_ts, p) => rnd() * 2 * Math.exp(-p * 6) * 0.32 * gain);
};

/** Filtered-noise sweep that climbs into an impact. */
const riser = (buf, t, dur, gain = 0.3) =>
  add(buf, t, dur, (ts, p) => {
    const tone = sine(180 + 900 * p * p, ts) * 0.35;
    return (rnd() * 2 * 0.5 + tone) * Math.pow(p, 2.2) * gain;
  });

/** Short struck bell - one per agent waking up. */
const ping = (buf, t, f, gain = 0.18) =>
  add(buf, t, 0.85, (ts, p) => {
    const env = Math.min(1, ts * 400) * Math.exp(-p * 5.5);
    return (sine(f, ts) + sine(f * 2.01, ts) * 0.4 + sine(f * 3.02, ts) * 0.15) * env * gain;
  });

/** Sustained triad. `fade` is a 0-1 multiplier applied over the whole span. */
const pad = (buf, start, dur, freqs, gain, fade = () => 1) =>
  add(buf, start, dur, (ts, p) => {
    const attack = Math.min(1, ts / 1.5);
    const release = Math.min(1, ((dur - ts) / 1.2) || 0);
    return freqs.reduce((a, f) => a + sine(f, ts), 0) * gain * attack * release * fade(p);
  });

// ---------------------------------------------------------------------------
// the score
// ---------------------------------------------------------------------------
function buildBed() {
  reseed();
  const b = buffer(DUR);

  // A minor drone under the whole film, ducking away where the numbers need air.
  pad(b, 0, DUR, [110, 130.81, 164.81], 0.042, (p) => {
    const t = p * DUR;
    return t > at.speed && t < at.reveal ? 0.45 : 1;
  });

  // chaos - arrhythmic ticks. Deliberately NOT on a grid: the picture is disorder.
  for (const t of [0.35, 0.83, 1.12, 1.71, 2.04, 2.29, 2.77]) hat(b, t, 0.07);

  // cost - the mess acquires a pulse, and the pulse speeds up.
  let t = at.cost;
  let step = 0.62;
  while (t < at.morph) {
    kick(b, t, 0.42);
    hat(b, t + step / 2, 0.06);
    t += step;
    step *= 0.86;
  }

  // morph - the one big move. Riser lands exactly on the beat boundary.
  riser(b, at.morph - 1.6, 1.6, 0.34);
  impact(b, at.morph, 1);

  // constellation - bass arrives, eight agents wake in sequence.
  const agents = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
  agents.forEach((f, i) => ping(b, at.constellation + 0.18 + i * 0.42, f, 0.16));
  for (let k = 0; k < 5; k++) bass(b, at.constellation + k * 0.9, 55, 0.3, 0.26);

  // routing - the ask forks and returns. Faster subdivision, no new material.
  for (let k = 0; k < 7; k++) {
    hat(b, at.routing + k * 0.42, 0.075);
    if (k % 2 === 0) bass(b, at.routing + k * 0.42, 73.42, 0.22, 0.22);
  }
  ping(b, at.routing + 2.55, 659.25, 0.14);

  // speed / price / proof - half-time. The mix opens up so the figures can land.
  kick(b, at.speed, 0.55);
  kick(b, at.speed + 1.7, 0.5);
  kick(b, at.price, 0.5);
  ping(b, at.speed + 0.2, 523.25, 0.12);
  ping(b, at.speed + 1.9, 587.33, 0.12);
  ping(b, at.proof, 659.25, 0.13);

  // reveal - final impact, long tail into silence.
  impact(b, at.reveal, 0.85);
  pad(b, at.reveal, DUR - at.reveal, [110, 164.81, 220], 0.05);

  return b;
}

/** One-shots, so a scene can fire a hit without slicing the bed. */
function buildShots() {
  const shots = {};
  const mk = (name, seconds, fn) => {
    reseed();
    const b = buffer(seconds);
    fn(b);
    shots[name] = b;
  };
  mk('impact', 1.2, (b) => impact(b, 0, 1));
  mk('riser', 1.6, (b) => riser(b, 0, 1.6, 0.34));
  mk('ping', 0.9, (b) => ping(b, 0, 440, 0.22));
  mk('tick', 0.06, (b) => hat(b, 0, 0.12));
  mk('sub', 0.4, (b) => bass(b, 0, 55, 0.35, 0.32));
  return shots;
}

// ---------------------------------------------------------------------------
// WAV encode - 16-bit PCM stereo
// ---------------------------------------------------------------------------
function toWav(samples) {
  const n = samples.length;
  const data = Buffer.alloc(n * 4); // 2 channels x 2 bytes
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(samples[i]));
  // Normalise to -1 dBFS. A fixed divisor would clip when the score gets denser.
  const norm = peak > 0 ? 0.891 / peak : 1;
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i] * norm));
    const s = Math.round(v * 32767);
    data.writeInt16LE(s, i * 4);
    data.writeInt16LE(s, i * 4 + 2);
  }
  const head = Buffer.alloc(44);
  head.write('RIFF', 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write('WAVE', 8);
  head.write('fmt ', 12);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20); // PCM
  head.writeUInt16LE(2, 22); // stereo
  head.writeUInt32LE(SR, 24);
  head.writeUInt32LE(SR * 4, 28);
  head.writeUInt16LE(4, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

function writeKit(dir) {
  mkdirSync(dir, { recursive: true });
  const files = [];
  const bed = toWav(buildBed());
  writeFileSync(join(dir, 'sigma-bed.wav'), bed);
  files.push(['sigma-bed.wav', bed]);
  for (const [name, buf] of Object.entries(buildShots())) {
    const wav = toWav(buf);
    writeFileSync(join(dir, `sigma-${name}.wav`), wav);
    files.push([`sigma-${name}.wav`, wav]);
  }
  return files;
}

const sha = (b) => createHash('sha256').update(b).digest('hex');

// ---------------------------------------------------------------------------
const verify = process.argv.includes('--verify');
const files = writeKit(OUT);

console.log(`population: ${files.length} files, ${DUR}s bed derived from ${CUT.frames.length} cut-sheet beats`);
for (const [name, buf] of files) {
  console.log(`  ${name.padEnd(20)} ${String((buf.length / 1024).toFixed(0)).padStart(5)} KB  ${sha(buf).slice(0, 16)}`);
}

if (verify) {
  const tmp = join(ROOT, '.audio-kit-verify');
  if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
  const again = writeKit(tmp);
  let bad = 0;
  console.log('\ndeterminism control: same generator, second run, must be IDENTICAL');
  for (let i = 0; i < files.length; i++) {
    const same = sha(files[i][1]) === sha(again[i][1]);
    if (!same) bad++;
    console.log(`  ${same ? 'IDENTICAL' : 'DIFFERS  '}  ${files[i][0]}`);
  }
  rmSync(tmp, { recursive: true, force: true });
  if (bad) {
    console.error(`\n${bad} file(s) are not reproducible. The audio breaks the determinism gate.`);
    process.exit(1);
  }
  console.log('\nall reproducible - the determinism gate survives adding sound.');
}
