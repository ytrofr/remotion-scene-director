#!/usr/bin/env node
/**
 * The doctrine, enforced.
 *
 * Reads doctrine.json - the SAME file that states the law - so the rule and its
 * enforcement cannot drift apart. A clause with `detect: null` is reported as
 * unenforceable rather than quietly skipped: a doctrine that hides which of its own
 * clauses it cannot check is worse than one with fewer clauses.
 *
 * RED fixture is real shipped code, not a synthetic mutation. `--selftest` runs the
 * linter against SigmaFilm v1, which is frozen and which measured zero on eight craft
 * primitives, and REQUIRES it to fail. A linter nobody has watched fire is not a gate.
 *
 *   node lint-composition.mjs src/compositions/SigmaFilmD1
 *   node lint-composition.mjs --selftest
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const DOCTRINE = JSON.parse(readFileSync(join(HERE, 'doctrine.json'), 'utf8'));
const REPO = process.cwd();
/** Set from --mp4. Artifact clauses stay unevaluated while this is null. */
let MP4 = null;

function sources(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(p)) out.push(p);
    }
  };
  walk(dir);
  return out;
}

/** Strip comments so a rule quoted in a docstring is not counted as a violation. */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const count = (body, re) => (body.match(new RegExp(re, 'g')) ?? []).length;

function evaluate(clause, files) {
  const d = clause.detect;
  if (!d) return { status: 'UNENFORCEABLE', hits: [] };

  if (d.kind === 'artifact') {
    // An artifact clause reads the RENDERED FILM, because some rules are simply not
    // visible in source. R1 ("the film must build") is the case that forced this: it
    // shipped `enforced: true` with a detector that returned ARTIFACT and nothing ever
    // called it, so the clause answered "fine" to every reader while D1 decayed at
    // exactly the same 0.62 as the baseline it was meant to beat.
    if (!MP4) return { status: 'ARTIFACT', hits: [] };
    let row;
    try {
      const out = execFileSync('node', [join(REPO, d.probe), '--json', MP4], {
        encoding: 'utf8', maxBuffer: 1 << 28,
      });
      row = JSON.parse(out)[0];
    } catch (e) {
      // Three states, never two: an errored probe must not collapse into a pass.
      return { status: 'ERROR', note: `probe failed: ${String(e.message).split('\n')[0]}`, hits: [] };
    }
    const v = row?.[d.field];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      return { status: 'ERROR', note: `probe returned no numeric "${d.field}"`, hits: [] };
    }
    const ok = d.min !== undefined ? v >= d.min : d.max !== undefined ? v <= d.max : true;
    return {
      status: ok ? 'PASS' : 'FAIL',
      note: `${d.field} = ${v.toFixed(3)} (need ${d.min !== undefined ? '>= ' + d.min : '<= ' + d.max}) on ${basename(MP4)}`,
      hits: [],
    };
  }

  if (d.kind === 'ratio') {
    let num = 0;
    let den = 0;
    for (const [, body] of files) {
      num += count(body, d.numerator);
      den += count(body, d.denominator);
    }
    if (den === 0) return { status: 'PASS', note: `no ${d.denominator} to check`, hits: [] };
    const r = num / den;
    return {
      status: r >= d.min ? 'PASS' : 'FAIL',
      note: `${num} eased / ${den} interpolate = ${(r * 100).toFixed(0)}% (need ${d.min * 100}%)`,
      hits: [],
    };
  }

  if (d.kind === 'declared-unused') {
    const hits = [];
    for (const [file, body] of files) {
      for (const name of d.names) {
        const decl = new RegExp(`(?:export\\s+)?const\\s+(${name}\\w*)\\s*[:=]`, 'g');
        let m;
        while ((m = decl.exec(body))) {
          const sym = m[1];
          // Uses anywhere in the composition, excluding the declaration itself.
          const uses = files.reduce((a, [, b]) => a + count(b, `\\b${sym}\\b`), 0);
          if (uses <= 1) hits.push(`${relative(REPO, file)}: ${sym} declared, never consumed`);
        }
      }
    }
    return { status: hits.length ? 'FAIL' : 'PASS', hits };
  }

  if (d.kind === 'depth-expressed') {
    /**
     * Depth is a PROPERTY, not a library. Accept either: the shared camera module, or a
     * hand-rolled depth term that actually drives rendering (used several times, and
     * feeding position, blur or opacity). The first version of this detector matched
     * only the import and false-failed a direction whose parallax is entirely its own.
     */
    let viaLib = 0;
    let depthUses = 0;
    let drives = 0;
    for (const [, body] of files) {
      viaLib += count(body, 'lib/camera|planeStyle|depthBlur|cameraAt');
      depthUses += count(body, '\\bdepth\\b');
      drives += count(body, 'depth\\s*\\*|\\*\\s*depth|depth\\s*[<>]|1\\s*-\\s*depth');
    }
    const ok = viaLib > 0 || (depthUses >= 4 && drives >= 2);
    return {
      status: ok ? 'PASS' : 'FAIL',
      note: viaLib > 0 ? `${viaLib} via lib/camera` : `${depthUses} depth refs, ${drives} driving position/blur/opacity`,
      hits: [],
    };
  }

  if (d.kind === 'grain-static') {
    /**
     * A regex was the wrong tool here and produced a FALSE PASS on the RED fixture -
     * `useMemo\([^)]*grain` never reaches the marker word because `[^)]*` stops at the
     * first paren inside `Array.from({length:900}, (_, i) => ...)`. Worse than a missed
     * clause: it reported a known violation as clean.
     *
     * The real semantic is simply whether the grain depends on the frame at all.
     */
    const hits = [];
    for (const [file, body] of files) {
      const re = /(?:const|function)\s+(\w*(?:Grain|Noise))\s*[:=][\s\S]{0,900}/g;
      let m;
      while ((m = re.exec(body))) {
        const block = m[0];
        const framey = /useCurrentFrame|frame\s*%|seed=\{?\s*frame|noise[23]D/.test(block);
        if (!framey) {
          const line = body.slice(0, m.index).split('\n').length;
          hits.push(`${relative(REPO, file)}:${line}  ${m[1]} never reads the frame - the same plate on every frame`);
        }
      }
    }
    return { status: hits.length ? 'FAIL' : 'PASS', hits };
  }

  if (d.kind === 'forbid' || d.kind === 'require') {
    const hits = [];
    for (const [file, body] of files) {
      const re = new RegExp(d.pattern, 'g');
      let m;
      while ((m = re.exec(body))) {
        const line = body.slice(0, m.index).split('\n').length;
        hits.push(`${relative(REPO, file)}:${line}  ${m[0].slice(0, 60).replace(/\s+/g, ' ')}`);
      }
    }
    if (d.kind === 'forbid') return { status: hits.length ? 'FAIL' : 'PASS', hits: hits.slice(0, 6) };
    return { status: hits.length ? 'PASS' : 'FAIL', hits: [], note: hits.length ? `${hits.length} match(es)` : 'none found' };
  }

  return { status: 'UNENFORCEABLE', hits: [] };
}

function lint(dir) {
  const files = sources(dir).map((p) => [p, strip(readFileSync(p, 'utf8'))]);
  const results = DOCTRINE.clauses.map((c) => ({ clause: c, ...evaluate(c, files) }));
  return { dir, files: files.length, results };
}

function report(r, { quiet = false } = {}) {
  const fails = r.results.filter((x) => x.status === 'FAIL' || x.status === 'ERROR');
  const unenf = r.results.filter((x) => x.status === 'UNENFORCEABLE');
  const art = r.results.filter((x) => x.status === 'ARTIFACT');
  if (!quiet) {
    console.log(`population: ${r.results.length} clauses (${r.results.length - unenf.length - art.length} checkable in source, ${art.length} artifact-only, ${unenf.length} unenforceable) over ${r.files} file(s)`);
    console.log(`target: ${relative(REPO, r.dir)}`);
    console.log('');
    for (const x of r.results) {
      const tag =
        x.status === 'FAIL' ? 'FAIL      '
        : x.status === 'PASS' ? 'pass      '
        : x.status === 'ARTIFACT' ? 'needs-mp4 '
        : x.status === 'ERROR' ? 'ERROR     '
        : 'no-detector';
      console.log(`  ${tag} ${x.clause.id.padEnd(3)} ${x.clause.title}${x.note ? '  - ' + x.note : ''}`);
      for (const h of x.hits) console.log(`             ${h}`);
    }
    console.log('');
  }
  return fails;
}

// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

/** The rendered film to judge artifact clauses against. Absent -> those stay ARTIFACT. */
const mp4Idx = args.indexOf('--mp4');
MP4 = mp4Idx >= 0 ? args[mp4Idx + 1] : null;
if (MP4 && !existsSync(MP4)) {
  console.error(`--mp4 ${MP4} does not exist`);
  process.exit(2);
}

if (args.includes('--selftest')) {
  const red = 'src/compositions/SigmaFilm';
  if (!existsSync(red)) {
    console.error(`RED fixture missing: ${red}`);
    process.exit(1);
  }
  console.log('RED fixture: SigmaFilm v1 - real shipped code, frozen, measured zero on');
  console.log('eight craft primitives. The linter MUST fail it.\n');
  const r = lint(red);
  const fails = report(r);
  if (fails.length === 0) {
    console.error('SILENT - the linter passed a composition known to violate the doctrine.');
    console.error('This gate has no teeth. Do not trust a green run against anything.');
    process.exit(1);
  }
  console.log(`FIRED - ${fails.length} clause(s) caught on the RED fixture: ${fails.map((f) => f.clause.id).join(', ')}`);
  console.log('The gate has teeth.');
  process.exit(0);
}

const target = args.find((a) => !a.startsWith('--'));
if (!target) {
  console.error('usage: lint-composition.mjs <composition-dir>  |  --selftest');
  process.exit(2);
}
const fails = report(lint(target));
if (fails.length) {
  console.error(`${fails.length} doctrine violation(s). Each one has a "cost" field in doctrine.json naming the failure that earned it.`);
  process.exit(1);
}
console.log('clean against every enforceable clause.');
