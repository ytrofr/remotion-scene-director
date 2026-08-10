#!/usr/bin/env node
// Generates the L.I.M.O.R voice-over: one wav per cue, placed by the cut sheet.
//
// One wav per LINE rather than one long take is deliberate. The brief asks for
// meaningful pauses and space around important sentences; Kokoro delivers a line at a
// natural clip and cannot be told to "wait here". Cutting per line lets the cut sheet
// own the silence, which is where the film's tone actually lives.
//
// Usage: node scripts/generate-limor-vo.mjs [--voice bf_emma] [--speed 0.80]

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sheet = JSON.parse(readFileSync(join(root, 'src/compositions/LimorFilm/cutsheet.json'), 'utf8'));

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const voice = arg('voice', 'bf_emma');
const speed = arg('speed', '0.80');
const python = process.env.HYPERFRAMES_PYTHON || `${process.env.HOME}/.venvs/kokoro/bin/python`;

const outDir = join(root, 'public/limor/vo');
mkdirSync(outDir, { recursive: true });

console.log(`voice=${voice} speed=${speed} cues=${sheet.vo.length}\n`);

for (const cue of sheet.vo) {
  const file = join(outDir, `${cue.id}.wav`);
  if (existsSync(file) && !process.argv.includes('--force')) {
    console.log(`  ${cue.id}  (cached)`);
    continue;
  }
  execFileSync(
    'npx',
    ['--yes', 'hyperframes', 'tts', cue.text, '--voice', voice, '--speed', speed, '-o', file],
    { cwd: root, stdio: ['ignore', 'ignore', 'ignore'], env: { ...process.env, HYPERFRAMES_PYTHON: python } }
  );
  console.log(`  ${cue.id}  "${cue.text.slice(0, 46)}${cue.text.length > 46 ? '...' : ''}"`);
}

// Measure what was actually produced. The overlap check in validate-limor-cutsheet.mjs
// runs on an ESTIMATE of speech rate; this one runs on the real files, which is the
// number that decides whether two lines collide in the finished film.
const probe = `
import soundfile as sf, json, sys
print(json.dumps({f: sf.info(f).duration for f in sys.argv[1:]}))
`;
const files = sheet.vo.map((c) => join(outDir, `${c.id}.wav`));
const durations = JSON.parse(execFileSync(python, ['-c', probe, ...files], { encoding: 'utf8' }));

const manifest = sheet.vo.map((c) => ({
  id: c.id,
  at: c.at,
  src: `limor/vo/${c.id}.wav`,
  duration: +durations[join(outDir, `${c.id}.wav`)].toFixed(3),
  text: c.text,
}));

const problems = [];
for (let i = 0; i < manifest.length; i++) {
  const m = manifest[i];
  const end = m.at + m.duration;
  const next = manifest[i + 1];
  if (next && end > next.at + 1e-6) {
    problems.push(`${m.id} ends at ${end.toFixed(2)}s but ${next.id} starts at ${next.at}s`);
  }
  if (end > sheet.totalSeconds) problems.push(`${m.id} ends at ${end.toFixed(2)}s, past the ${sheet.totalSeconds}s film`);
}

writeFileSync(join(root, 'src/compositions/LimorFilm/vo-manifest.json'), JSON.stringify({ voice, speed: +speed, cues: manifest }, null, 2) + '\n');

const speech = manifest.reduce((a, m) => a + m.duration, 0);
console.log('');
console.log(`speech   ${speech.toFixed(1)}s of ${sheet.totalSeconds}s (${((speech / sheet.totalSeconds) * 100).toFixed(0)}%)`);
console.log(`silence  ${(sheet.totalSeconds - speech).toFixed(1)}s`);
console.log(`rate     ${(manifest.reduce((a, m) => a + m.text.split(/\s+/).length, 0) / speech).toFixed(2)} words/sec`);

if (problems.length) {
  console.error(`\nFAIL - measured overlap on ${problems.length} cue(s):`);
  for (const p of problems) console.error(`  x ${p}`);
  process.exit(1);
}
console.log('\nOK - no measured overlap. Manifest written.');
