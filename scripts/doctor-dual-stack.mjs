#!/usr/bin/env node
// doctor-dual-stack.mjs — Health check for the HF auto-sync + dual-stack pipeline.
//
// Runs a set of read-only lint checks on the HF scene files + codedPaths +
// exporter integration. Exits 0 if healthy, 1 if problems found. <10 seconds.
//
// Checks:
//  1) Every HF scene with markers has the `setC` helper + `#cursor` element.
//  2) Every HF scene with markers has NO hand-authored `tl.to('#cursor' ...)`
//     OUTSIDE the markers (prevents drift — cursor path must be auto-gen only).
//  3) Every HF scene with markers has a matching scene entry in
//     codedPaths.data.json (so Save round-trips).
//  4) Every HF scene with markers matches the exporter output bit-exactly
//     (no drift since last Save).
//  5) HF scenes with phone-stage at scale != 1.528 AND markers present →
//     warn (coord-system equivalence may be broken).
//  6) vite.config.ts /api/save-path allowlist — compositions with HF
//     counterparts are wired for auto-sync.
//
// Usage: node scripts/doctor-dual-stack.mjs [--verbose]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { waypointsToHfBlock } from './hf-exporter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCENES_DIR = path.join(ROOT, 'hf/scenes');
const CODED_PATHS = path.join(
  ROOT,
  'src/compositions/SceneDirector/codedPaths.data.json',
);
const VITE_CONFIG = path.join(ROOT, 'vite.config.ts');
const START_MARKER = '// @auto-generated-from-scene-director:start';
const END_MARKER = '// @auto-generated-from-scene-director:end';

const VERBOSE = process.argv.includes('--verbose');
const problems = [];
const warnings = [];
const ok = [];

function err(msg) {
  problems.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}
function pass(msg) {
  ok.push(msg);
}

// Resolve "3-TapBubble" → "03-tapbubble.html" (match exporter)
function sceneNameToHfFilename(sceneName) {
  const m = sceneName.match(/^(\d+)-(.+)$/);
  if (!m) return null;
  return `${m[1].padStart(2, '0')}-${m[2].toLowerCase()}.html`;
}

// Inverse: "03-tapbubble.html" → plausible scene-name prefix for lookup
function hfFilenameSceneNum(filename) {
  const m = filename.match(/^(\d+)-/);
  return m ? parseInt(m[1], 10) : null;
}

// Load HF scenes with markers and check structure
const hfFiles = fs.readdirSync(SCENES_DIR).filter((f) => f.endsWith('.html'));
const wiredScenes = [];

for (const filename of hfFiles.sort()) {
  const filePath = path.join(SCENES_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const hasMarkers =
    content.includes(START_MARKER) && content.includes(END_MARKER);

  if (!hasMarkers) {
    if (VERBOSE) pass(`[skip] ${filename} — no markers (not wired)`);
    continue;
  }

  wiredScenes.push(filename);

  // 1) setC helper present
  if (!/const\s+setC\s*=\s*\(x,\s*y\)\s*=>\s*\(\{\s*x:\s*x\s*-\s*TIP_X/.test(content)) {
    err(`${filename}: markers present but missing \`setC\` helper`);
  }
  // #cursor element + ripple
  if (!/id=["']cursor["']/.test(content)) {
    err(`${filename}: markers present but missing \`#cursor\` element`);
  }
  if (!/id=["']ripple["']/.test(content)) {
    err(`${filename}: markers present but missing \`#ripple\` element`);
  }

  // 2) No hand-authored tl.to('#cursor' OUTSIDE markers
  const startIdx = content.indexOf(START_MARKER);
  const endIdx = content.indexOf(END_MARKER);
  const outsideMarkers =
    content.substring(0, startIdx) + content.substring(endIdx);
  const cursorTlMatches = outsideMarkers.match(/tl\.(to|set)\(['"]#cursor['"]/g);
  if (cursorTlMatches && cursorTlMatches.length > 0) {
    err(
      `${filename}: ${cursorTlMatches.length} hand-authored tl.(to|set)('#cursor') call(s) OUTSIDE markers — will conflict with auto-gen`,
    );
  }

  // 5) Coord-system equivalence check for HF chat-zoom scenes (4-9)
  const sceneNum = hfFilenameSceneNum(filename);
  const isChatZoomRange = sceneNum !== null && sceneNum >= 4 && sceneNum <= 9;
  if (isChatZoomRange) {
    const hasCorrectTransform =
      /phone-stage.*(?:scale: 1\.528|scale:1\.528)/s.test(content) ||
      /gsap\.set\(['"]#phone-stage['"].*scale:\s*1\.528/s.test(content);
    const hasPhoneStage = /id=['"]phone-stage['"]/.test(content);
    if (hasPhoneStage && !hasCorrectTransform) {
      warn(
        `${filename}: chat-zoom range (4-9) but phone-stage scale != 1.528 — coord equivalence may be broken`,
      );
    }
  }
}

if (wiredScenes.length === 0) {
  err('No HF scenes are wired with auto-sync markers');
} else {
  pass(`${wiredScenes.length} HF scene(s) wired: ${wiredScenes.join(', ')}`);
}

// 3 + 4) Verify each wired scene's block matches the exporter output for its codedPaths entry
const codedPathsExists = fs.existsSync(CODED_PATHS);
if (!codedPathsExists) {
  err(`codedPaths.data.json not found at ${CODED_PATHS}`);
} else {
  const codedPaths = JSON.parse(fs.readFileSync(CODED_PATHS, 'utf8'));

  // Build index: scene-name → composition (first match wins — DorianFull preferred)
  const sceneIndex = new Map();
  for (const comp of ['DorianFull', 'DorianDemo', 'DorianStores']) {
    for (const [name, data] of Object.entries(codedPaths[comp] || {})) {
      if (!sceneIndex.has(name)) sceneIndex.set(name, { comp, data });
    }
  }

  for (const filename of wiredScenes) {
    // Find the matching scene entry for this HF filename
    let match = null;
    for (const [sceneName, entry] of sceneIndex.entries()) {
      if (sceneNameToHfFilename(sceneName) === filename) {
        match = { sceneName, ...entry };
        break;
      }
    }
    if (!match) {
      err(
        `${filename}: markers present but no scene entry in codedPaths.data.json (run Save in SceneDirector)`,
      );
      continue;
    }

    // Compare actual block vs exporter output
    const filePath = path.join(SCENES_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const startIdx = content.indexOf(START_MARKER) + START_MARKER.length;
    const endIdx = content.indexOf(END_MARKER);
    const actualBlock = content.substring(startIdx, endIdx).trim();

    const expected = waypointsToHfBlock(match.data);
    const expectedInline = expected.trim();

    if (actualBlock !== expectedInline) {
      err(
        `${filename}: auto-gen block differs from exporter output (out-of-sync — run Save in SceneDirector)`,
      );
      if (VERBOSE) {
        console.error('--- ACTUAL ---\n' + actualBlock);
        console.error('--- EXPECTED ---\n' + expectedInline);
      }
    } else if (VERBOSE) {
      pass(`${filename}: block matches exporter output (${match.comp}/${match.sceneName})`);
    }
  }
}

// 6) vite.config.ts allowlist check
if (fs.existsSync(VITE_CONFIG)) {
  const vc = fs.readFileSync(VITE_CONFIG, 'utf8');
  const expectedAllowed = ['DorianFull', 'DorianDemo'];
  for (const comp of expectedAllowed) {
    if (!vc.includes(`compositionId === '${comp}'`)) {
      warn(
        `vite.config.ts /api/save-path missing allowlist entry for \`${comp}\``,
      );
    }
  }
} else {
  err('vite.config.ts not found');
}

// Report
console.log(`\n=== Dual-Stack Doctor Report ===`);
console.log(`Wired scenes: ${wiredScenes.length}`);
console.log(`Problems: ${problems.length}`);
console.log(`Warnings: ${warnings.length}`);

if (problems.length > 0) {
  console.log('\nProblems:');
  for (const p of problems) console.log(`  ✗ ${p}`);
}
if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
if (VERBOSE && ok.length > 0) {
  console.log('\nPassed:');
  for (const p of ok) console.log(`  ✓ ${p}`);
}

if (problems.length > 0) {
  console.log('\n  → Run Save on affected scenes in SceneDirector to regenerate.');
  process.exit(1);
} else {
  console.log('\n  ✓ All wired HF scenes are in sync with codedPaths.data.json.');
  process.exit(0);
}
