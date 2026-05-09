/**
 * Hand Path Validation Script
 *
 * Validates codedPaths.ts entries against CODED_AUDIO_REGISTRY for consistency.
 * Catches: missing audio, trailing pointers, coordinate/frame bounds, missing gesture fields.
 *
 * Usage:
 *   npx tsx scripts/validate-hand-paths.ts          # Validate all real data
 *   npx tsx scripts/validate-hand-paths.ts --test    # Run self-test fixtures
 */

// We import the registries directly — they have no React dependencies
// compositions.ts CAN'T be imported (React deps), so we use a lightweight lookup
import { getCodedPath } from '../src/compositions/SceneDirector/codedPaths';
import { getCodedAudio } from '../src/compositions/SceneDirector/layers';
import type { CodedPath } from '../src/compositions/SceneDirector/codedPaths';
import type { CodedAudioEntry } from '../src/compositions/SceneDirector/layers';

// ── Types ──

type Severity = 'PASS' | 'WARN' | 'FAIL';

interface CheckResult {
  check: string;
  severity: Severity;
  detail: string;
}

// ── Composition metadata (can't import compositions.ts — React deps) ──
// Scene durations derived from existing composition constants.
// Update when compositions change.

interface SceneMeta {
  start: number;
  end: number;
}

interface CompMeta {
  width: number;
  height: number;
  scenes: Record<string, SceneMeta>;
}

const COMP_META: Record<string, CompMeta> = {
  MobileChatDemoCombined: {
    width: 1080,
    height: 1920,
    scenes: {
      '3-V2-Typing': { start: 0, end: 90 },
      '4-V2-Send': { start: 90, end: 135 },
      '8-V4-Typing': { start: 0, end: 90 },
      '9-V4-Send': { start: 0, end: 90 },
    },
  },
  DorianDemo: {
    width: 1080,
    height: 1920,
    scenes: {
      '2-HomeScroll': { start: 0, end: 200 },
      '3-TapBubble': { start: 0, end: 120 },
      '4-ChatOpen': { start: 0, end: 90 },
      '5-UserTyping': { start: 0, end: 150 },
      '7-AIResponse': { start: 0, end: 120 },
      '8-ProductPage': { start: 0, end: 200 },
    },
  },
  DorianStores: {
    width: 1080,
    height: 1920,
    scenes: {
      '1-StoreDashboard': { start: 0, end: 570 },
      '2-MapSearch': { start: 0, end: 180 },
      '3-AIProducts': { start: 0, end: 280 },
    },
  },
  SigmaAppDemo: {
    width: 1920,
    height: 1080,
    scenes: {
      HubChatOpen: { start: 0, end: 200 },
      WebsiteRequest: { start: 0, end: 360 },
      PageReveal: { start: 0, end: 270 },
      CreativeRequest: { start: 0, end: 270 },
      CreativeReveal: { start: 0, end: 210 },
      Closing: { start: 0, end: 480 },
    },
  },
};

// Click SFX file patterns — any audio file matching these is considered a "click" sound
const CLICK_SFX_PATTERNS = ['mouse-click', 'soft-click', 'send-click'];

// ── Validation functions ──

function validateScene(
  _compId: string,
  sceneName: string,
  path: CodedPath,
  audio: CodedAudioEntry[],
  meta: CompMeta | undefined,
): CheckResult[] {
  const results: CheckResult[] = [];
  const wps = path.path;

  // Check: empty path
  if (!wps || wps.length === 0) {
    results.push({
      check: 'empty-path',
      severity: 'FAIL',
      detail: 'CodedPath exists but path array is empty',
    });
    return results; // Can't run other checks
  }

  // Check: missing gesture field
  for (let i = 0; i < wps.length; i++) {
    if (!wps[i].gesture) {
      results.push({
        check: 'missing-gesture',
        severity: 'FAIL',
        detail: `Waypoint ${i} has no gesture field (x=${wps[i].x}, y=${wps[i].y}, frame=${wps[i].frame})`,
      });
    }
  }

  // Check: coordinate bounds
  if (meta) {
    for (let i = 0; i < wps.length; i++) {
      const wp = wps[i];
      if (wp.x < 0 || wp.x > meta.width || wp.y < 0 || wp.y > meta.height) {
        results.push({
          check: 'coordinate-bounds',
          severity: 'FAIL',
          detail: `Waypoint ${i} at (${wp.x}, ${wp.y}) is outside ${meta.width}x${meta.height} bounds`,
        });
      }
    }
  }

  // Check: frame bounds
  const sceneMeta = meta?.scenes[sceneName];
  if (sceneMeta) {
    const sceneDuration = sceneMeta.end - sceneMeta.start;
    for (let i = 0; i < wps.length; i++) {
      const wp = wps[i];
      if (
        wp.frame !== undefined &&
        (wp.frame < 0 || wp.frame >= sceneDuration)
      ) {
        results.push({
          check: 'frame-bounds',
          severity: 'FAIL',
          detail: `Waypoint ${i} at frame ${wp.frame} exceeds scene duration ${sceneDuration} frames`,
        });
      }
    }
  }

  // Check: audio parity — scene has hand gestures but no audio
  if (audio.length === 0) {
    results.push({
      check: 'audio-parity',
      severity: 'FAIL',
      detail:
        'Scene has hand gestures but zero audio entries in CODED_AUDIO_REGISTRY',
    });
  } else {
    results.push({
      check: 'audio-parity',
      severity: 'PASS',
      detail: `${audio.length} audio entries found`,
    });
  }

  // Check: click-audio sync — each click waypoint should have a click SFX nearby
  const clickWps = wps.filter((wp) => wp.gesture === 'click');
  for (const clickWp of clickWps) {
    const clickFrame = clickWp.frame ?? 0;
    const hasNearbySfx = audio.some((a) => {
      const isClickSfx = CLICK_SFX_PATTERNS.some((p) => a.file.includes(p));
      return isClickSfx && Math.abs(a.startFrame - clickFrame) <= 10;
    });
    if (!hasNearbySfx) {
      results.push({
        check: 'click-audio-sync',
        severity: 'WARN',
        detail: `Click at frame ${clickFrame} has no click SFX within ±10 frames`,
      });
    }
  }

  // Check: trailing pointer — last waypoint is 'pointer' after a 'click'
  if (wps.length >= 2) {
    const last = wps[wps.length - 1];
    const secondLast = wps[wps.length - 2];
    if (
      last.gesture === 'pointer' &&
      (secondLast.gesture === 'click' ||
        (wps.length >= 3 && wps.some((wp) => wp.gesture === 'click')))
    ) {
      // Only warn if this trailing pointer is after the last click
      const lastClickIdx = [...wps]
        .reverse()
        .findIndex((wp) => wp.gesture === 'click');
      if (lastClickIdx !== -1 && lastClickIdx === 0) {
        // Second-to-last is the click, last is trailing pointer
      } else if (lastClickIdx === 1) {
        // The click is at wps.length-2, trailing pointer at end
        results.push({
          check: 'trailing-pointer',
          severity: 'WARN',
          detail: `Last waypoint is gesture:'pointer' at (${last.x}, ${last.y}) frame ${last.frame} after click — consider removing`,
        });
      }
    }
  }

  // Check: secondaryLayers hint
  if (!path.secondaryLayers || path.secondaryLayers.length === 0) {
    const clicks = wps.filter((wp) => wp.gesture === 'click');
    if (clicks.length >= 3) {
      const frames = clicks.map((c) => c.frame ?? 0).sort((a, b) => a - b);
      let hasLargeGap = false;
      for (let i = 1; i < frames.length; i++) {
        if (frames[i] - frames[i - 1] > 100) {
          hasLargeGap = true;
          break;
        }
      }
      if (hasLargeGap) {
        results.push({
          check: 'secondary-layers-hint',
          severity: 'WARN',
          detail: `${clicks.length} clicks with >100 frame gap — consider using secondaryLayers`,
        });
      }
    }
  }

  // If no failures/warnings, add overall PASS
  if (results.length === 0) {
    results.push({
      check: 'all',
      severity: 'PASS',
      detail: 'All checks passed',
    });
  }

  return results;
}

// ── Registry walking ──

// The registries are keyed by compositionId → sceneName.
// We need to discover all keys. Since we can't enumerate the registry directly
// (it's accessed via getCodedPath), we use COMP_META keys + known scenes.

function getAllScenes(): Array<{ compId: string; sceneName: string }> {
  const scenes: Array<{ compId: string; sceneName: string }> = [];
  for (const [compId, meta] of Object.entries(COMP_META)) {
    for (const sceneName of Object.keys(meta.scenes)) {
      scenes.push({ compId, sceneName });
    }
  }
  return scenes;
}

// ── Report formatting ──

function formatReport(
  allResults: Array<{
    compId: string;
    sceneName: string;
    results: CheckResult[];
  }>,
): {
  text: string;
  hasFailure: boolean;
  counts: { pass: number; warn: number; fail: number };
} {
  let text = '\n═══ Hand Path Validation Report ═══\n\n';
  let hasFailure = false;
  const counts = { pass: 0, warn: 0, fail: 0 };

  let currentComp = '';

  for (const { compId, sceneName, results } of allResults) {
    if (compId !== currentComp) {
      currentComp = compId;
      text += `── ${compId} ──\n`;
    }

    const maxSeverity = results.reduce<Severity>((max, r) => {
      if (r.severity === 'FAIL') return 'FAIL';
      if (r.severity === 'WARN' && max !== 'FAIL') return 'WARN';
      return max;
    }, 'PASS');

    const icon =
      maxSeverity === 'PASS' ? '✓' : maxSeverity === 'WARN' ? '⚠' : '✗';
    text += `  ${icon} ${sceneName}: ${maxSeverity}\n`;

    for (const r of results) {
      if (r.severity !== 'PASS') {
        text += `    [${r.severity}] ${r.check}: ${r.detail}\n`;
      }
      if (r.severity === 'FAIL') {
        hasFailure = true;
        counts.fail++;
      } else if (r.severity === 'WARN') {
        counts.warn++;
      } else {
        counts.pass++;
      }
    }
  }

  text += `\n═══ Summary: ${counts.fail} FAIL, ${counts.warn} WARN, ${counts.pass} PASS ═══\n`;
  return { text, hasFailure, counts };
}

// ── Self-test ──

function runSelfTest(): boolean {
  console.log('\n═══ Self-Test Mode ═══\n');
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail: string) {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.log(`  ✗ ${name}: ${detail}`);
      failed++;
    }
  }

  const meta1080: CompMeta = {
    width: 1080,
    height: 1920,
    scenes: { TestScene: { start: 0, end: 230 } },
  };

  // Fixture 1: Known-good (DorianStores 1-StoreDashboard structure)
  {
    const path: CodedPath = {
      gesture: 'click',
      animation: 'cursor-real-black',
      path: [
        { x: 900, y: 1600, frame: 10, gesture: 'pointer', scale: 1 },
        { x: 814, y: 1543, frame: 50, gesture: 'click', scale: 1, duration: 8 },
      ],
    };
    const audio: CodedAudioEntry[] = [
      {
        file: 'audio/sfx/mouse-click.wav',
        startFrame: 55,
        durationInFrames: 15,
        volume: 0.6,
      },
    ];
    const results = validateScene('Test', 'TestScene', path, audio, meta1080);
    const hasFail = results.some((r) => r.severity === 'FAIL');
    assert(
      'Fixture 1 (known-good)',
      !hasFail,
      `Expected no FAIL, got: ${JSON.stringify(results.filter((r) => r.severity === 'FAIL'))}`,
    );
  }

  // Fixture 2: Missing audio
  {
    const path: CodedPath = {
      gesture: 'click',
      animation: 'cursor-real-black',
      path: [
        { x: 540, y: 960, frame: 10, gesture: 'pointer', scale: 1 },
        { x: 540, y: 960, frame: 20, gesture: 'click', scale: 1, duration: 5 },
      ],
    };
    const results = validateScene('Test', 'TestScene', path, [], meta1080);
    const hasAudioFail = results.some(
      (r) => r.check === 'audio-parity' && r.severity === 'FAIL',
    );
    assert(
      'Fixture 2 (missing audio)',
      hasAudioFail,
      'Expected FAIL on audio-parity',
    );
  }

  // Fixture 3: Trailing pointer after click
  {
    const path: CodedPath = {
      gesture: 'click',
      animation: 'cursor-real-black',
      path: [
        { x: 540, y: 960, frame: 10, gesture: 'pointer', scale: 1 },
        { x: 540, y: 960, frame: 20, gesture: 'click', scale: 1, duration: 5 },
        { x: 600, y: 1000, frame: 35, gesture: 'pointer', scale: 1 },
      ],
    };
    const audio: CodedAudioEntry[] = [
      {
        file: 'audio/sfx/mouse-click.wav',
        startFrame: 20,
        durationInFrames: 15,
        volume: 0.6,
      },
    ];
    const results = validateScene('Test', 'TestScene', path, audio, meta1080);
    const hasTrailingWarn = results.some(
      (r) => r.check === 'trailing-pointer' && r.severity === 'WARN',
    );
    assert(
      'Fixture 3 (trailing pointer)',
      hasTrailingWarn,
      'Expected WARN on trailing-pointer',
    );
  }

  // Fixture 4: Out of bounds coordinates
  {
    const path: CodedPath = {
      gesture: 'click',
      animation: 'cursor-real-black',
      path: [
        { x: 2000, y: 960, frame: 10, gesture: 'pointer', scale: 1 },
        { x: 540, y: 960, frame: 20, gesture: 'click', scale: 1, duration: 5 },
      ],
    };
    const audio: CodedAudioEntry[] = [
      {
        file: 'audio/sfx/mouse-click.wav',
        startFrame: 20,
        durationInFrames: 15,
        volume: 0.6,
      },
    ];
    const results = validateScene('Test', 'TestScene', path, audio, meta1080);
    const hasBoundsFail = results.some(
      (r) => r.check === 'coordinate-bounds' && r.severity === 'FAIL',
    );
    assert(
      'Fixture 4 (out of bounds)',
      hasBoundsFail,
      'Expected FAIL on coordinate-bounds',
    );
  }

  // Fixture 5: Frame overflow
  {
    const path: CodedPath = {
      gesture: 'click',
      animation: 'cursor-real-black',
      path: [
        { x: 540, y: 960, frame: 10, gesture: 'pointer', scale: 1 },
        { x: 540, y: 960, frame: 500, gesture: 'click', scale: 1, duration: 5 },
      ],
    };
    const audio: CodedAudioEntry[] = [
      {
        file: 'audio/sfx/mouse-click.wav',
        startFrame: 500,
        durationInFrames: 15,
        volume: 0.6,
      },
    ];
    const results = validateScene('Test', 'TestScene', path, audio, meta1080);
    const hasFrameFail = results.some(
      (r) => r.check === 'frame-bounds' && r.severity === 'FAIL',
    );
    assert(
      'Fixture 5 (frame overflow)',
      hasFrameFail,
      'Expected FAIL on frame-bounds',
    );
  }

  // Fixture 6: Click without nearby SFX
  {
    const path: CodedPath = {
      gesture: 'click',
      animation: 'cursor-real-black',
      path: [
        { x: 540, y: 960, frame: 10, gesture: 'pointer', scale: 1 },
        { x: 540, y: 960, frame: 100, gesture: 'click', scale: 1, duration: 5 },
      ],
    };
    const audio: CodedAudioEntry[] = [
      {
        file: 'audio/sfx/mouse-click.wav',
        startFrame: 200,
        durationInFrames: 15,
        volume: 0.6,
      },
    ];
    const results = validateScene('Test', 'TestScene', path, audio, meta1080);
    const hasSyncWarn = results.some(
      (r) => r.check === 'click-audio-sync' && r.severity === 'WARN',
    );
    assert(
      'Fixture 6 (click without nearby SFX)',
      hasSyncWarn,
      'Expected WARN on click-audio-sync',
    );
  }

  console.log(`\n═══ Self-Test: ${passed} passed, ${failed} failed ═══\n`);
  return failed === 0;
}

// ── Main ──

function main() {
  const isTestMode = process.argv.includes('--test');

  if (isTestMode) {
    const success = runSelfTest();
    process.exit(success ? 0 : 2);
  }

  // Validate all known scenes
  const allScenes = getAllScenes();
  const allResults: Array<{
    compId: string;
    sceneName: string;
    results: CheckResult[];
  }> = [];

  for (const { compId, sceneName } of allScenes) {
    const codedPath = getCodedPath(compId, sceneName);
    if (!codedPath) continue; // No path for this scene — skip

    const audio = getCodedAudio(compId, sceneName);
    const meta = COMP_META[compId];
    const results = validateScene(compId, sceneName, codedPath, audio, meta);

    // Also validate secondary layers
    if (codedPath.secondaryLayers) {
      for (let i = 0; i < codedPath.secondaryLayers.length; i++) {
        const secLayer = codedPath.secondaryLayers[i];
        const secPath: CodedPath = {
          gesture: secLayer.gesture,
          animation: codedPath.animation,
          path: secLayer.path,
        };
        const secResults = validateScene(
          compId,
          `${sceneName}[secondary-${i}]`,
          secPath,
          audio,
          meta,
        );
        // Only include non-audio checks (secondary layers share parent audio)
        const filteredResults = secResults.filter(
          (r) => r.check !== 'audio-parity',
        );
        results.push(...filteredResults);
      }
    }

    allResults.push({ compId, sceneName, results });
  }

  if (allResults.length === 0) {
    console.log('\nNo scenes with coded paths found. Nothing to validate.\n');
    process.exit(0);
  }

  const { text, hasFailure, counts } = formatReport(allResults);
  console.log(text);

  if (hasFailure) {
    process.exit(1);
  } else if (counts.warn > 0) {
    console.log('Validation passed with warnings.\n');
    process.exit(0);
  } else {
    console.log('All validations passed.\n');
    process.exit(0);
  }
}

main();
