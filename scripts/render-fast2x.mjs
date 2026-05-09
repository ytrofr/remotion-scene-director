#!/usr/bin/env node
/**
 * scripts/render-fast2x.mjs — V1.22 default render pipeline.
 *
 * Goal: video + SFX at 2x speed, music at native 1x tempo, smooth.
 *
 * Why this exists: the legacy `node scripts/render-2x.js` post-processes the
 * full Remotion-rendered MP4 with `[0:v]setpts=0.5*PTS;[0:a]atempo=2.0`. That
 * speeds music up too — `atempo=2.0` preserves pitch but crunches the groove.
 * For V1.22 we want fast visuals AND a clean music bed. The two require
 * different speed treatments, which means music must be a separate stream
 * stitched in AFTER the video+SFX speed-up.
 *
 * Pipeline (3 stages):
 *
 *   1. Master render — Remotion render of <compId> with `noMusic=true`
 *      so the embedded BackgroundMusic doesn't bake into the audio stream.
 *      Output has only SFX (clicks, scrolls, etc) at 1x.
 *      → out/<comp>-master-no-music.mp4
 *
 *   2. 2x speed-up — ffmpeg `setpts=0.5*PTS` on video + `atempo=2.0` on the
 *      SFX-only audio. Both visuals and SFX compress to half-duration in
 *      sync.
 *      → out/<comp>-2x-no-music.mp4
 *
 *   3. Music overlay — amix the music track at native 1x tempo on top of
 *      the now-2x SFX stream. SFX stays louder via `weights=2 1`. Music is
 *      faded in/out and trimmed to video length via `duration=shortest`.
 *      → out/<comp>.mp4   (the deliverable)
 *
 * Intermediate stages persist so re-runs can skip stage 1 (the slow part)
 * if the master is fresh per render.mjs cache rules.
 *
 * Per rule 56: GL = swiftshader is delegated to scripts/render.mjs which
 * already encodes the cursor-Lottie heuristic. We just call its module.
 *
 * Usage:
 *   node scripts/render-fast2x.mjs <compositionId>
 *   node scripts/render-fast2x.mjs <compositionId> --force      # ignore cache, re-master
 *   node scripts/render-fast2x.mjs <compositionId> --skip-master  # reuse last master
 *   node scripts/render-fast2x.mjs --selftest                   # plan unit test
 *
 * Music source for DorianFull family: kml-funkorama.mp3. Override with
 * MUSIC_TRACK env var if needed (relative to public/audio/music/).
 *
 * Kill switch: FAST2X_ENABLED=false → suggest `:1x` script + exit 2.
 */

import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decideRenderPlan } from './render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const DEFAULT_MUSIC = 'audio/music/kml-funkorama.mp3';
const MUSIC_VOLUME = 0.15; // matches BackgroundMusic default in V1.21/V1.22
const MUSIC_FADE_IN_S = 1.0;
const MUSIC_FADE_OUT_S = 2.0;
const SFX_WEIGHT = 2; // SFX ducks music ~6dB during clicks (amix weights)
const MUSIC_WEIGHT = 1;

/**
 * Decide the 3-stage filenames + ffmpeg flags. Pure; safe to selftest.
 */
export function decideFast2xPlan(compId) {
  const base = decideRenderPlan(compId, { intent: 'standard' });
  // base.outputFile is "out/<kebab>.mp4"; we redirect to the intermediates.
  const stem = base.outputFile.replace(/\.mp4$/, '');
  return {
    compId,
    family: base.family,
    gl: base.gl,
    crf: base.crf,
    masterFile: `${stem}-master-no-music.mp4`, // stage 1 output
    speedUpFile: `${stem}-2x-no-music.mp4`, // stage 2 output
    finalFile: base.outputFile, // stage 3 deliverable
    musicTrack: process.env.MUSIC_TRACK || DEFAULT_MUSIC,
  };
}

function which(cmd) {
  const paths = (process.env.PATH || '').split(path.delimiter);
  for (const dir of paths) {
    const full = path.join(dir, cmd);
    if (existsSync(full)) return full;
  }
  return null;
}

async function runCmd(cmd, args, opts = {}) {
  console.log(`  $ ${cmd} ${args.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' ')}`);
  await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: PROJECT_ROOT,
      stdio: opts.silent ? 'pipe' : 'inherit',
      env: { ...process.env, ...(opts.env || {}) },
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
    child.on('error', reject);
  });
}

async function stage1RenderMaster(plan, force) {
  const masterPath = path.join(PROJECT_ROOT, plan.masterFile);
  if (!force && existsSync(masterPath)) {
    const ageMs = Date.now() - statSync(masterPath).mtimeMs;
    console.log(`[stage 1] master exists (${(ageMs / 1000).toFixed(0)}s old) — skipping. Pass --force to re-render.`);
    return;
  }
  console.log(`[stage 1] rendering master (no music) → ${plan.masterFile}`);
  // Inject `noMusic=true` via Remotion --props.
  const propsJson = JSON.stringify({ noMusic: true });
  await runCmd('npx', [
    'remotion',
    'render',
    'src/index.ts',
    plan.compId,
    plan.masterFile,
    `--gl=${plan.gl}`,
    '--codec',
    'h264',
    '--crf',
    String(plan.crf),
    '--concurrency',
    '8',
    `--props=${propsJson}`,
  ]);
}

async function stage2SpeedUp(plan) {
  const ffmpeg = which('ffmpeg');
  if (!ffmpeg) throw new Error('ffmpeg not found in PATH');
  console.log(`[stage 2] 2x speed-up (video + SFX) → ${plan.speedUpFile}`);
  // setpts=0.5*PTS halves video duration; atempo=2.0 halves audio duration with
  // pitch preservation. Both produce exactly half-length streams that stay in
  // sync. -r 30 anchors output framerate.
  await runCmd(ffmpeg, [
    '-y',
    '-i',
    plan.masterFile,
    '-filter_complex',
    '[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]',
    '-map',
    '[v]',
    '-map',
    '[a]',
    '-r',
    '30',
    '-c:v',
    'libx264',
    '-crf',
    String(plan.crf),
    '-c:a',
    'aac',
    '-b:a',
    '160k',
    plan.speedUpFile,
  ]);
}

async function stage3OverlayMusic(plan) {
  const ffmpeg = which('ffmpeg');
  if (!ffmpeg) throw new Error('ffmpeg not found in PATH');
  const musicPath = path.join(PROJECT_ROOT, 'public', plan.musicTrack);
  if (!existsSync(musicPath)) {
    throw new Error(`music track not found: ${musicPath}`);
  }

  // Get sped-up video duration so we can fade out the music near the end.
  const probe = spawn('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    plan.speedUpFile,
  ], { cwd: PROJECT_ROOT });
  let probeOut = '';
  probe.stdout.on('data', (d) => (probeOut += d));
  await new Promise((resolve, reject) => {
    probe.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffprobe failed'))));
    probe.on('error', reject);
  });
  const videoDuration = parseFloat(probeOut.trim());
  if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
    throw new Error(`bad video duration: ${probeOut}`);
  }
  const fadeOutStart = Math.max(0, videoDuration - MUSIC_FADE_OUT_S);

  console.log(`[stage 3] overlay 1x music (${plan.musicTrack}, vol=${MUSIC_VOLUME}, fade ${MUSIC_FADE_IN_S}s/${MUSIC_FADE_OUT_S}s) → ${plan.finalFile}`);
  // amix=duration=shortest trims music to match video length; weights ducks
  // music below SFX. afade applies in/out envelopes. volume scales the music
  // bed before mixing.
  const filter =
    `[1:a]afade=t=in:st=0:d=${MUSIC_FADE_IN_S},` +
    `afade=t=out:st=${fadeOutStart.toFixed(3)}:d=${MUSIC_FADE_OUT_S},` +
    `volume=${MUSIC_VOLUME}[m];` +
    `[0:a][m]amix=inputs=2:duration=shortest:weights=${SFX_WEIGHT} ${MUSIC_WEIGHT}:dropout_transition=0[a]`;
  await runCmd(ffmpeg, [
    '-y',
    '-i',
    plan.speedUpFile,
    '-i',
    musicPath,
    '-filter_complex',
    filter,
    '-map',
    '0:v',
    '-map',
    '[a]',
    '-c:v',
    'copy', // no re-encode of video — saves time + preserves quality
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    plan.finalFile,
  ]);
}

// ── Selftest ───────────────────────────────────────────────────────────────

function selftest() {
  const tests = [
    {
      name: 'V1.22 plan picks swiftshader + correct stem',
      run: () => {
        const p = decideFast2xPlan('DorianFullV1-22');
        if (p.gl !== 'swiftshader') throw new Error(`expected swiftshader, got ${p.gl}`);
        if (p.crf !== 20) throw new Error(`expected crf 20, got ${p.crf}`);
        if (!p.masterFile.includes('v1.22-master-no-music'))
          throw new Error(`master path: ${p.masterFile}`);
        if (!p.speedUpFile.includes('v1.22-2x-no-music'))
          throw new Error(`speedup path: ${p.speedUpFile}`);
        if (!p.finalFile.endsWith('v1.22.mp4'))
          throw new Error(`final path: ${p.finalFile}`);
      },
    },
    {
      name: 'music track defaults to funkorama',
      run: () => {
        const p = decideFast2xPlan('DorianFullV1-22');
        if (!p.musicTrack.includes('funkorama'))
          throw new Error(`music: ${p.musicTrack}`);
      },
    },
    {
      name: 'MUSIC_TRACK env override is honored',
      run: () => {
        const orig = process.env.MUSIC_TRACK;
        process.env.MUSIC_TRACK = 'audio/music/kml-carefree.mp3';
        try {
          const p = decideFast2xPlan('DorianFullV1-22');
          if (!p.musicTrack.includes('carefree'))
            throw new Error(`override: ${p.musicTrack}`);
        } finally {
          if (orig === undefined) delete process.env.MUSIC_TRACK;
          else process.env.MUSIC_TRACK = orig;
        }
      },
    },
    {
      name: 'non-Dorian comp picks angle',
      run: () => {
        const p = decideFast2xPlan('LimorAIDemo');
        if (p.gl !== 'angle') throw new Error(`expected angle, got ${p.gl}`);
      },
    },
  ];

  let passed = 0;
  let failed = 0;
  for (const t of tests) {
    try {
      t.run();
      console.log(`  ✓ ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${t.name}: ${err.message}`);
      failed++;
    }
  }
  console.log(`\n${passed}/${passed + failed} selftest assertions passed`);
  process.exit(failed > 0 ? 1 : 0);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--selftest')) {
    selftest();
    return;
  }

  if (process.env.FAST2X_ENABLED === 'false') {
    console.log('[fast2x] FAST2X_ENABLED=false — falling back to 1x render');
    console.log('  Use: npm run render:dorian-full:v1.22:1x');
    process.exit(2);
  }

  if (args.length === 0 || args[0].startsWith('--')) {
    console.error('Usage: node scripts/render-fast2x.mjs <compositionId> [--force] [--skip-master]');
    console.error('       node scripts/render-fast2x.mjs --selftest');
    process.exit(1);
  }

  const compId = args[0];
  const force = args.includes('--force');
  const skipMaster = args.includes('--skip-master');
  const plan = decideFast2xPlan(compId);

  console.log(`[fast2x] plan for ${compId}:`);
  console.log(`  gl:       ${plan.gl}`);
  console.log(`  crf:      ${plan.crf}`);
  console.log(`  master:   ${plan.masterFile}`);
  console.log(`  speed-up: ${plan.speedUpFile}`);
  console.log(`  final:    ${plan.finalFile}`);
  console.log(`  music:    ${plan.musicTrack}\n`);

  const start = Date.now();
  if (!skipMaster) await stage1RenderMaster(plan, force);
  await stage2SpeedUp(plan);
  await stage3OverlayMusic(plan);
  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n[fast2x] done in ${duration}s → ${plan.finalFile}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('[fast2x] error:', err.message);
    process.exit(1);
  });
}
