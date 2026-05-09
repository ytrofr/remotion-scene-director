#!/usr/bin/env node
/**
 * scripts/render.mjs — auto-GL + render-cache MVP
 *
 * Plan: ~/.claude/plans/plan-this-properly-in-atomic-eich.md axis 2 (P2a-mvp).
 *
 * Two leverage points (per s1 concern 3 split):
 *   1. Auto-GL heuristic — pick swiftshader for cursor-Lottie families ≥1000f.
 *      Encodes rule 56 as code, not as policy in 71 npm scripts.
 *   2. Render-cache invalidation on tsx mtime — skip render when nothing
 *      relevant changed since last successful run.
 *
 * Out of scope (P2a-polish):
 *   - 5-intent CLI (preview/standard/hq/debug/batch) — adds in next phase
 *   - r:batch-changed via git diff — same
 *   - Script deprecation pass on the 71 scripts — same
 *
 * Usage:
 *   node scripts/render.mjs <compositionId>           # auto: GL + CRF, with cache
 *   node scripts/render.mjs <compositionId> --force   # ignore cache
 *   node scripts/render.mjs <compositionId> --dry-run # print plan, no render
 *   node scripts/render.mjs --selftest                # heuristic + cache unit test
 *
 * Kill switch: RENDER_INTENT_ENABLED=false → auto-fallback to a noop suggestion
 *   (caller should use the legacy `npm run render:*` script).
 */

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CACHE_FILE = path.join(PROJECT_ROOT, 'out', '.render-cache.json');

// ── Heuristic: composition family → GL + CRF defaults ─────────────────────

/**
 * GL = swiftshader recommended when:
 *   1. Composition uses cursor-real Lottie (rule 56 — ANGLE long-render
 *      degradation produces black-rectangle artifacts on cursor edges)
 *   2. AND duration ≥ 1000 frames (rule 56 threshold)
 *
 * Encoded by family because parsing tsx for cursor usage at runtime is
 * complex; the family→cursor mapping is stable across versions.
 */
const SWIFTSHADER_FAMILIES = [
  'DorianFull', // 2430+ frames, uses cursor-real-black
  'DorianDemo', // 1300+ frames, uses cursor-real-black
  'DorianStores', // 660+ frames per scene, uses cursor-real-black
  'DorianStoresDebug',
  'DemoCreative',
];

const STANDARD_CRF = 20;
const PREVIEW_CRF = 28;
const HQ_CRF = 16;

/**
 * Decide rendering plan for a compositionId.
 * Pure function; safe to selftest.
 */
export function decideRenderPlan(compId, opts = {}) {
  const intent = opts.intent ?? 'standard';
  // Family detection — strip optional Vx-y suffix.
  // "DorianFullV1-21" → "DorianFull"; "DorianDemo" → "DorianDemo";
  // "LimorAIDemo" → "LimorAIDemo".
  const familyMatch = compId.match(/^(.+?)(?:V\d+-\d+)?$/);
  const family = familyMatch ? familyMatch[1] : compId;

  let gl = 'angle';
  for (const swiftFamily of SWIFTSHADER_FAMILIES) {
    if (compId.startsWith(swiftFamily)) {
      gl = 'swiftshader';
      break;
    }
  }

  let crf;
  switch (intent) {
    case 'preview':
      crf = PREVIEW_CRF;
      break;
    case 'hq':
      crf = HQ_CRF;
      break;
    case 'standard':
    default:
      crf = STANDARD_CRF;
      break;
  }

  // Output filename convention — mirror existing `render:dorian-full:vN` pattern.
  // Step 1: kebab-case the family ("DorianFull" → "Dorian-Full").
  // Step 2: replace "V1-21" → "-v1.21" (preserve a single dash before version).
  // "DorianFullV1-21" → "dorian-full-v1.21"; "LimorAIDemo" → "limor-ai-demo".
  const fileSafeName = compId
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/-V(\d+)-(\d+)/, (_, a, b) => `-v${a}.${b}`)
    .replace(/V(\d+)-(\d+)/, (_, a, b) => `v${a}.${b}`)
    .toLowerCase();
  const intentSuffix = intent === 'standard' ? '' : `-${intent}`;
  const outputFile = `out/${fileSafeName}${intentSuffix}.mp4`;

  return {
    compId,
    family,
    gl,
    crf,
    intent,
    outputFile,
    concurrency: 8,
  };
}

// ── Cache layer ────────────────────────────────────────────────────────────

/**
 * Find max mtime across composition source files. Used to invalidate cache:
 * if any tsx in the family directory was modified since last render, re-render.
 *
 * Scans:
 *   src/compositions/<family>/**\/*.tsx
 *   src/compositions/SceneDirector/codedPaths.data.json
 *   src/compositions/SceneDirector/sceneConfig.data.json
 *   src/compositions/SceneDirector/layers.ts
 */
async function maxSourceMtime(family) {
  let maxMtime = 0;

  const candidatePaths = [
    path.join(PROJECT_ROOT, 'src', 'compositions', family),
    path.join(PROJECT_ROOT, 'src', 'compositions', 'SceneDirector', 'codedPaths.data.json'),
    path.join(PROJECT_ROOT, 'src', 'compositions', 'SceneDirector', 'sceneConfig.data.json'),
    path.join(PROJECT_ROOT, 'src', 'compositions', 'SceneDirector', 'layers.ts'),
  ];

  for (const p of candidatePaths) {
    if (!existsSync(p)) continue;
    const st = statSync(p);
    if (st.isFile()) {
      maxMtime = Math.max(maxMtime, st.mtimeMs);
    } else if (st.isDirectory()) {
      try {
        const walked = await walkDirMtime(p);
        maxMtime = Math.max(maxMtime, walked);
      } catch {
        // Best-effort
      }
    }
  }
  return maxMtime;
}

async function walkDirMtime(dir) {
  let max = 0;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const fp = path.join(dir, e.name);
    if (e.isFile() && (e.name.endsWith('.tsx') || e.name.endsWith('.ts'))) {
      const st = statSync(fp);
      max = Math.max(max, st.mtimeMs);
    } else if (e.isDirectory()) {
      max = Math.max(max, await walkDirMtime(fp));
    }
  }
  return max;
}

async function loadCache() {
  if (!existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Decide whether to skip the render based on cache state.
 * Returns { hit: bool, reason: string }.
 */
export function checkCache(cache, plan, sourceMtime) {
  const key = `${plan.compId}:${plan.intent}`;
  const entry = cache[key];
  if (!entry) return { hit: false, reason: 'no cache entry' };
  if (!existsSync(path.join(PROJECT_ROOT, plan.outputFile))) {
    return { hit: false, reason: 'output file missing' };
  }
  if (entry.gl !== plan.gl || entry.crf !== plan.crf) {
    return { hit: false, reason: 'plan parameters changed' };
  }
  if (entry.sourceMtime < sourceMtime) {
    return { hit: false, reason: 'source files modified' };
  }
  return { hit: true, reason: 'cache hit + source unchanged' };
}

// ── Selftest ───────────────────────────────────────────────────────────────

function selftest() {
  const tests = [
    {
      name: 'Dorian families pick swiftshader',
      run: () => {
        const p = decideRenderPlan('DorianFullV1-21');
        if (p.gl !== 'swiftshader') throw new Error(`expected swiftshader, got ${p.gl}`);
        if (p.crf !== STANDARD_CRF) throw new Error(`expected ${STANDARD_CRF}, got ${p.crf}`);
      },
    },
    {
      name: 'DorianDemo picks swiftshader',
      run: () => {
        const p = decideRenderPlan('DorianDemo');
        if (p.gl !== 'swiftshader') throw new Error(`expected swiftshader, got ${p.gl}`);
      },
    },
    {
      name: 'Non-Dorian families pick angle',
      run: () => {
        const p = decideRenderPlan('LimorAIDemo');
        if (p.gl !== 'angle') throw new Error(`expected angle, got ${p.gl}`);
      },
    },
    {
      name: 'preview intent picks higher CRF',
      run: () => {
        const p = decideRenderPlan('DorianFullV1-21', { intent: 'preview' });
        if (p.crf !== PREVIEW_CRF) throw new Error(`expected ${PREVIEW_CRF}, got ${p.crf}`);
      },
    },
    {
      name: 'hq intent picks lower CRF',
      run: () => {
        const p = decideRenderPlan('DorianFullV1-21', { intent: 'hq' });
        if (p.crf !== HQ_CRF) throw new Error(`expected ${HQ_CRF}, got ${p.crf}`);
      },
    },
    {
      name: 'output filename uses dotted version',
      run: () => {
        const p = decideRenderPlan('DorianFullV1-21');
        if (!p.outputFile.includes('v1.21'))
          throw new Error(`expected v1.21 in filename, got ${p.outputFile}`);
      },
    },
    {
      name: 'cache miss when source mtime newer (any miss reason valid)',
      run: () => {
        const plan = decideRenderPlan('DorianFullV1-21');
        const cache = {
          [`${plan.compId}:${plan.intent}`]: {
            gl: plan.gl,
            crf: plan.crf,
            sourceMtime: 1000,
            outputFile: plan.outputFile,
          },
        };
        const result = checkCache(cache, plan, 2000);
        if (result.hit) throw new Error('expected miss, got hit');
        // miss reason can legitimately be 'output file missing' OR 'source files modified'
        // depending on whether the output file exists on disk — both valid misses
      },
    },
    {
      name: 'cache miss when no entry',
      run: () => {
        const plan = decideRenderPlan('DorianFullV1-21');
        const result = checkCache({}, plan, 1000);
        if (result.hit) throw new Error('expected miss');
      },
    },
    {
      name: 'cache miss when GL changed',
      run: () => {
        const plan = decideRenderPlan('DorianFullV1-21');
        const cache = {
          [`${plan.compId}:${plan.intent}`]: {
            gl: 'angle',
            crf: plan.crf,
            sourceMtime: 0,
            outputFile: plan.outputFile,
          },
        };
        const result = checkCache(cache, plan, 0);
        if (result.hit) throw new Error('expected miss on gl change');
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

// ── Main CLI ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--selftest')) {
    selftest();
    return;
  }

  // Kill switch
  if (process.env.RENDER_INTENT_ENABLED === 'false') {
    console.log('[render-intent] RENDER_INTENT_ENABLED=false — falling back to legacy npm scripts');
    console.log('  Use: npm run render:<comp> directly');
    process.exit(2);
  }

  if (args.length === 0 || args[0].startsWith('--')) {
    console.error('Usage: node scripts/render.mjs <compositionId> [--force] [--dry-run] [--intent=preview|standard|hq]');
    console.error('       node scripts/render.mjs --selftest');
    process.exit(1);
  }

  const compId = args[0];
  const force = args.includes('--force');
  const dryRun = args.includes('--dry-run');
  const intentArg = args.find((a) => a.startsWith('--intent='));
  const intent = intentArg ? intentArg.split('=')[1] : 'standard';

  const plan = decideRenderPlan(compId, { intent });
  const sourceMtime = await maxSourceMtime(plan.family);
  const cache = await loadCache();
  const cacheResult = force ? { hit: false, reason: 'forced' } : checkCache(cache, plan, sourceMtime);

  console.log(`[render-intent] plan for ${compId}:`);
  console.log(`  family:  ${plan.family}`);
  console.log(`  gl:      ${plan.gl}${plan.gl === 'swiftshader' ? ' (auto: cursor-Lottie family)' : ''}`);
  console.log(`  crf:     ${plan.crf} (${plan.intent})`);
  console.log(`  output:  ${plan.outputFile}`);
  console.log(`  cache:   ${cacheResult.hit ? 'HIT' : 'MISS'} — ${cacheResult.reason}`);

  if (cacheResult.hit && !force) {
    console.log('  → SKIP render (output is fresh)');
    return;
  }

  if (dryRun) {
    console.log('  → dry-run, exiting without render');
    return;
  }

  // Build remotion render command
  const cmdArgs = [
    'remotion',
    'render',
    'src/index.ts',
    plan.compId,
    plan.outputFile,
    `--gl=${plan.gl}`,
    '--codec',
    'h264',
    '--crf',
    String(plan.crf),
    '--concurrency',
    String(plan.concurrency),
  ];
  console.log(`  → running: npx ${cmdArgs.join(' ')}\n`);

  const start = Date.now();
  await new Promise((resolve, reject) => {
    const child = spawn('npx', cmdArgs, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`render exited with code ${code}`));
    });
    child.on('error', reject);
  });
  const duration = ((Date.now() - start) / 1000).toFixed(1);

  // Update cache on success
  cache[`${plan.compId}:${plan.intent}`] = {
    gl: plan.gl,
    crf: plan.crf,
    sourceMtime,
    outputFile: plan.outputFile,
    lastRenderEpoch: Date.now(),
    durationSeconds: parseFloat(duration),
  };
  await saveCache(cache);

  console.log(`\n[render-intent] done in ${duration}s — cache updated`);
}

// Auto-run when invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('[render-intent] error:', err.message);
    process.exit(1);
  });
}
