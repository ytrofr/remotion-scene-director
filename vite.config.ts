import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { updateHfScene } from './scripts/hf-exporter.mjs';

// ──────────────────────────────────────────────────────────────────────────
// Auto-wire helpers for /api/versions/bump
// ──────────────────────────────────────────────────────────────────────────
// When a bump succeeds, we now also clone the OLD version's entries in 5
// registry files into a NEW entry directly under the OLD one. Idempotent:
// if the NEW entry already exists, the helper is a no-op.
//
// Each helper returns one of:
//   - 'wired'           — successfully edited the file
//   - 'already-present' — NEW entry was already there (idempotent skip)
//   - 'skipped:<reason>' — anchor not found / file shape unexpected
//   - 'failed:<reason>'  — IO or parse error
//
// All helpers are best-effort. If one fails, the bump still succeeds and
// the failure surfaces as a manual instruction to the user.

type WireArgs = {
  family: string;
  oldLabel: string; // 'V1.14'
  newLabel: string; // 'V1.15'
  oldIdent: string; // 'V1_14'
  newIdent: string; // 'V1_15'
  oldCompId: string; // 'DorianFullV1-14'
  newCompId: string; // 'DorianFullV1-15'
  oldBase: string; // 'DorianFullV1.14.tsx'
  newBase: string; // 'DorianFullV1.15.tsx'
  rootDir: string;
};

/** Find a balanced `{...}` block starting at the given index. Returns the
 *  index AFTER the matching `}` (exclusive end), or -1 if unbalanced. */
function findBalancedBlockEnd(src: string, openBraceIdx: number): number {
  if (src[openBraceIdx] !== '{') return -1;
  let depth = 0;
  for (let i = openBraceIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

/** Clone a string literal-key block in a registry object.
 *  Anchor: `${quoteKey}: {` … balanced `}` … optional `,`.
 *  Adds `${newKey}: {…same body…},` immediately after, on its own line(s).
 *  Idempotent: skip if `${newKey}: {` already in source. */
function cloneRegistryBlock(
  src: string,
  oldKey: string,
  newKey: string,
): { out: string; status: 'wired' | 'already-present' | 'skipped:no-anchor' } {
  const newAnchor = `'${newKey}': {`;
  if (src.includes(newAnchor)) return { out: src, status: 'already-present' };
  const oldAnchor = `'${oldKey}': {`;
  const anchorIdx = src.indexOf(oldAnchor);
  if (anchorIdx < 0) return { out: src, status: 'skipped:no-anchor' };
  const openBraceIdx = anchorIdx + oldAnchor.length - 1;
  const closeIdx = findBalancedBlockEnd(src, openBraceIdx);
  if (closeIdx < 0) return { out: src, status: 'skipped:no-anchor' };
  // Capture trailing `,\n` if present (registry entries are comma-separated)
  let endIdx = closeIdx;
  if (src[endIdx] === ',') endIdx++;
  const oldEntry = src.slice(anchorIdx, endIdx);
  const newEntry = oldEntry.replace(`'${oldKey}': {`, `${newAnchor}`);
  // Insert newline + new entry right after old entry (preserve any trailing
  // newline already in oldEntry's source slice).
  const insertAt = endIdx;
  // Match the indentation of oldEntry's first line
  const lineStart = src.lastIndexOf('\n', anchorIdx) + 1;
  const indent = src.slice(lineStart, anchorIdx);
  const insertion = `\n${indent}${newEntry}`;
  return {
    out: src.slice(0, insertAt) + insertion + src.slice(insertAt),
    status: 'wired',
  };
}

function wireRootTsx(args: WireArgs): string {
  const file = path.join(args.rootDir, 'src/Root.tsx');
  if (!fs.existsSync(file)) return 'skipped:file-missing';
  let src = fs.readFileSync(file, 'utf8');
  if (
    src.includes(`id="${args.newCompId}"`) &&
    src.includes(
      `from './compositions/${args.family}/${args.newBase.replace(/\.tsx$/, '')}'`,
    )
  ) {
    return 'already-present';
  }
  let importStatus: 'wired' | 'already-present' | 'skipped' = 'skipped';
  let compStatus: 'wired' | 'already-present' | 'skipped' = 'skipped';
  // 1. Clone import block
  const oldImport = `import {\n  ${args.family}${args.oldIdent},\n  FULL_VIDEO_${args.oldIdent},\n} from './compositions/${args.family}/${args.oldBase.replace(/\.tsx$/, '')}';`;
  const newImport = `import {\n  ${args.family}${args.newIdent},\n  FULL_VIDEO_${args.newIdent},\n} from './compositions/${args.family}/${args.newBase.replace(/\.tsx$/, '')}';`;
  if (src.includes(newImport)) {
    importStatus = 'already-present';
  } else if (src.includes(oldImport)) {
    src = src.replace(oldImport, `${oldImport}\n${newImport}`);
    importStatus = 'wired';
  }
  // 2. Clone <Composition .../> block — match by id, balanced angle brackets
  //    not needed since <Composition .../> is self-closing on a known shape.
  const compAnchor = `<Composition\n          id="${args.oldCompId}"`;
  const compIdx = src.indexOf(compAnchor);
  if (src.includes(`id="${args.newCompId}"`)) {
    compStatus = 'already-present';
  } else if (compIdx >= 0) {
    // Find the closing '/>' on its own line for this <Composition> block
    const closeMarker = '/>';
    const closeIdx = src.indexOf(closeMarker, compIdx);
    if (closeIdx >= 0) {
      const blockEnd = closeIdx + closeMarker.length;
      const oldBlock = src.slice(compIdx, blockEnd);
      const newBlock = oldBlock
        .replace(`id="${args.oldCompId}"`, `id="${args.newCompId}"`)
        .replace(
          `component={${args.family}${args.oldIdent}}`,
          `component={${args.family}${args.newIdent}}`,
        )
        .replace(
          new RegExp(`FULL_VIDEO_${args.oldIdent}`, 'g'),
          `FULL_VIDEO_${args.newIdent}`,
        );
      // Insert newBlock right after oldBlock (with the same leading indent)
      const lineStart = src.lastIndexOf('\n', compIdx) + 1;
      const indent = src.slice(lineStart, compIdx);
      src =
        src.slice(0, blockEnd) + `\n${indent}${newBlock}` + src.slice(blockEnd);
      compStatus = 'wired';
    }
  }
  if (importStatus === 'skipped' || compStatus === 'skipped') {
    return `skipped:import=${importStatus},comp=${compStatus}`;
  }
  fs.writeFileSync(file, src);
  return 'wired';
}

function wireCompositionsTs(args: WireArgs): string {
  const file = path.join(
    args.rootDir,
    'src/compositions/SceneDirector/compositions.ts',
  );
  if (!fs.existsSync(file)) return 'skipped:file-missing';
  let src = fs.readFileSync(file, 'utf8');
  // 1. Clone import
  const oldImport = `import {\n  ${args.family}${args.oldIdent},\n  FULL_VIDEO_${args.oldIdent},\n} from '../${args.family}/${args.oldBase.replace(/\.tsx$/, '')}';`;
  const newImport = `import {\n  ${args.family}${args.newIdent},\n  FULL_VIDEO_${args.newIdent},\n} from '../${args.family}/${args.newBase.replace(/\.tsx$/, '')}';`;
  if (!src.includes(newImport)) {
    if (src.includes(oldImport)) {
      src = src.replace(oldImport, `${oldImport}\n${newImport}`);
    }
    // else: import shape unexpected — best effort, don't fail
  }
  // 2. Clone COMPOSITIONS array entry (uses cloneRegistryBlock pattern but
  //    with `id: '...'` not `'...':` key — different anchor)
  const oldEntryAnchor = `id: '${args.oldCompId}',`;
  const newEntryAnchor = `id: '${args.newCompId}',`;
  if (!src.includes(newEntryAnchor)) {
    const idx = src.indexOf(oldEntryAnchor);
    if (idx >= 0) {
      // The entry is `{` … `id: '...',` … `},` — find the enclosing `{` BEFORE
      // idx and the matching `}` AFTER.
      const openIdx = src.lastIndexOf('{', idx);
      if (openIdx >= 0) {
        const closeIdx = findBalancedBlockEnd(src, openIdx);
        if (closeIdx > 0) {
          let endIdx = closeIdx;
          if (src[endIdx] === ',') endIdx++;
          const oldBlock = src.slice(openIdx, endIdx);
          const newBlock = oldBlock
            .replace(oldEntryAnchor, newEntryAnchor)
            .replace(
              new RegExp(`FULL_VIDEO_${args.oldIdent}`, 'g'),
              `FULL_VIDEO_${args.newIdent}`,
            );
          const lineStart = src.lastIndexOf('\n', openIdx) + 1;
          const indent = src.slice(lineStart, openIdx);
          src =
            src.slice(0, endIdx) + `\n${indent}${newBlock}` + src.slice(endIdx);
        }
      }
    }
  }
  // 3. Clone component map line: `'oldCompId': FamilyOldIdent,`
  const oldMapLine = `'${args.oldCompId}': ${args.family}${args.oldIdent},`;
  const newMapLine = `'${args.newCompId}': ${args.family}${args.newIdent},`;
  if (!src.includes(newMapLine) && src.includes(oldMapLine)) {
    src = src.replace(oldMapLine, `${oldMapLine}\n  ${newMapLine}`);
  }
  // Verify all 3 landed
  const ok =
    src.includes(newImport) &&
    src.includes(newEntryAnchor) &&
    src.includes(newMapLine);
  if (!ok) return 'skipped:partial-wire';
  fs.writeFileSync(file, src);
  return 'wired';
}

function wireCodedPathsTs(args: WireArgs): string {
  const file = path.join(
    args.rootDir,
    'src/compositions/SceneDirector/codedPaths.ts',
  );
  if (!fs.existsSync(file)) return 'skipped:file-missing';
  let src = fs.readFileSync(file, 'utf8');
  const newKey = `'${args.newCompId}':`;
  if (src.includes(newKey)) return 'already-present';
  // Anchor on the OLD compId's mergePaths line and clone full statement.
  // Shape: `  'OLD': mergePaths(\n    BASELINE,\n    saved['OLD'],\n  ),`
  const oldAnchor = `'${args.oldCompId}': mergePaths(`;
  const idx = src.indexOf(oldAnchor);
  if (idx < 0) return 'skipped:no-anchor';
  // Find the matching `),` closing the mergePaths(...) call
  const openParenIdx = src.indexOf('(', idx);
  if (openParenIdx < 0) return 'skipped:no-paren';
  let depth = 0;
  let closeParenIdx = -1;
  for (let i = openParenIdx; i < src.length; i++) {
    if (src[i] === '(') depth++;
    else if (src[i] === ')') {
      depth--;
      if (depth === 0) {
        closeParenIdx = i;
        break;
      }
    }
  }
  if (closeParenIdx < 0) return 'skipped:unbalanced';
  let endIdx = closeParenIdx + 1;
  if (src[endIdx] === ',') endIdx++;
  const oldBlock = src.slice(idx, endIdx);
  const newBlock = oldBlock.replace(
    new RegExp(args.oldCompId, 'g'),
    args.newCompId,
  );
  const lineStart = src.lastIndexOf('\n', idx) + 1;
  const indent = src.slice(lineStart, idx);
  src = src.slice(0, endIdx) + `\n${indent}${newBlock}` + src.slice(endIdx);
  fs.writeFileSync(file, src);
  return 'wired';
}

function wireLayersTs(args: WireArgs): string {
  const file = path.join(
    args.rootDir,
    'src/compositions/SceneDirector/layers.ts',
  );
  if (!fs.existsSync(file)) return 'skipped:file-missing';
  const src = fs.readFileSync(file, 'utf8');
  const { out, status } = cloneRegistryBlock(
    src,
    args.oldCompId,
    args.newCompId,
  );
  if (status === 'wired') fs.writeFileSync(file, out);
  return status;
}

function wirePackageJson(args: WireArgs): string {
  const file = path.join(args.rootDir, 'package.json');
  if (!fs.existsSync(file)) return 'skipped:file-missing';
  let src = fs.readFileSync(file, 'utf8');
  // Heuristic: render scripts contain BOTH the old compId AND old label
  // (e.g. "DorianFullV1-14" and "v1.14" / "v1-14"). For each such line,
  // produce a sibling line with both replaced. Idempotent skip if the new
  // mp4 path already appears (e.g. "v1.15.mp4").
  const oldLabelLow = args.oldLabel.toLowerCase(); // 'v1.14'
  const newLabelLow = args.newLabel.toLowerCase(); // 'v1.15'
  const oldLabelDash = oldLabelLow.replace('.', '-'); // 'v1-14'
  const newLabelDash = newLabelLow.replace('.', '-'); // 'v1-15'
  const lines = src.split('\n');
  const out: string[] = [];
  let added = 0;
  let alreadyPresent = false;
  for (const line of lines) {
    out.push(line);
    if (
      line.includes(args.oldCompId) &&
      (line.includes(oldLabelLow) || line.includes(oldLabelDash))
    ) {
      const newLine = line
        .replace(new RegExp(args.oldCompId, 'g'), args.newCompId)
        .replace(new RegExp(oldLabelLow.replace('.', '\\.'), 'g'), newLabelLow)
        .replace(new RegExp(oldLabelDash, 'g'), newLabelDash);
      // Idempotent: if `newLine` already in src, skip insertion
      if (src.includes(newLine.trim())) {
        alreadyPresent = true;
        continue;
      }
      out.push(newLine);
      added++;
    }
  }
  if (added === 0) {
    return alreadyPresent ? 'already-present' : 'skipped:no-anchor';
  }
  fs.writeFileSync(file, out.join('\n'));
  return 'wired';
}

function autoWireRegistries(args: WireArgs): {
  rootTsx: string;
  compositionsTs: string;
  codedPathsTs: string;
  layersTs: string;
  packageJson: string;
} {
  return {
    rootTsx: safeWire(() => wireRootTsx(args)),
    compositionsTs: safeWire(() => wireCompositionsTs(args)),
    codedPathsTs: safeWire(() => wireCodedPathsTs(args)),
    layersTs: safeWire(() => wireLayersTs(args)),
    packageJson: safeWire(() => wirePackageJson(args)),
  };
}

function safeWire(fn: () => string): string {
  try {
    return fn();
  } catch (err) {
    return `failed:${(err as Error).message?.slice(0, 80) ?? 'unknown'}`;
  }
}

function savePathPlugin(): Plugin {
  return {
    name: 'scene-director-save-path',
    configureServer(server) {
      // Redirect / to /scene-director.html
      server.middlewares.use((req, res, next) => {
        if (req.url === '/') {
          res.writeHead(302, { Location: '/scene-director.html' });
          res.end();
          return;
        }
        next();
      });

      // Save gallery feedback to disk (so Claude can read it)
      server.middlewares.use('/__save-feedback', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk: string) => (body += chunk));
        req.on('end', () => {
          try {
            const feedbackPath = path.resolve(
              __dirname,
              'gallery-feedback.json',
            );
            fs.writeFileSync(feedbackPath, body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // Bulk-delete gallery items: remove Lottie files + galleryData entries
      server.middlewares.use('/__delete-gallery-items', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk: string) => (body += chunk));
        req.on('end', () => {
          try {
            const { ids } = JSON.parse(body) as { ids: string[] };
            if (!Array.isArray(ids) || ids.length === 0) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'ids array required' }));
              return;
            }

            // 1. Delete Lottie JSON files
            const deleted: string[] = [];
            for (const id of ids) {
              const lottieFile = path.resolve(
                __dirname,
                `public/lottie/${id}.json`,
              );
              if (fs.existsSync(lottieFile)) {
                fs.unlinkSync(lottieFile);
                deleted.push(id);
              }
            }

            // 2. Remove entries from galleryData.ts
            const galleryPath = path.resolve(
              __dirname,
              'src/compositions/SceneDirector/panels/galleryData.ts',
            );
            let src = fs.readFileSync(galleryPath, 'utf8');
            const idSet = new Set(ids);

            // 2a. Rebuild POINTER_SHAPES: remove deleted variants, drop empty shapes
            const shapesStart = src.indexOf('export const POINTER_SHAPES');
            const shapesArrayStart = src.indexOf('[', shapesStart);
            // Find matching '];\n' — count bracket depth
            let depth = 0;
            let shapesEnd = -1;
            for (let i = shapesArrayStart; i < src.length; i++) {
              if (src[i] === '[') depth++;
              else if (src[i] === ']') {
                depth--;
                if (depth === 0) {
                  shapesEnd = i + 1;
                  break;
                }
              }
            }

            if (shapesStart !== -1 && shapesEnd !== -1) {
              // Extract shape objects by matching { name: ... variants: [...] }
              const shapesContent = src.slice(
                shapesArrayStart + 1,
                shapesEnd - 1,
              );
              // Parse each shape block: find top-level { } pairs (2-space indent)
              const shapeBlocks: string[] = [];
              let blockDepth = 0;
              let blockStart = -1;
              for (let i = 0; i < shapesContent.length; i++) {
                if (shapesContent[i] === '{' && blockDepth === 0) {
                  blockStart = i;
                }
                if (shapesContent[i] === '{') blockDepth++;
                if (shapesContent[i] === '}') {
                  blockDepth--;
                  if (blockDepth === 0 && blockStart !== -1) {
                    shapeBlocks.push(shapesContent.slice(blockStart, i + 1));
                    blockStart = -1;
                  }
                }
              }

              // Filter variants within each shape, drop empty shapes
              const keptShapes: string[] = [];
              for (const block of shapeBlocks) {
                // Check if any deleted ID is in this block
                const hasDeleted = ids.some((id) => block.includes(`'${id}'`));
                if (!hasDeleted) {
                  keptShapes.push(block);
                  continue;
                }
                // Extract name
                const nameMatch = block.match(/name:\s*'([^']+)'/);
                if (!nameMatch) continue;
                // Extract variants array content
                const varStart = block.indexOf('[');
                const varEnd = block.lastIndexOf(']');
                if (varStart === -1 || varEnd === -1) continue;
                const varContent = block.slice(varStart + 1, varEnd);
                // Parse individual variant objects
                const variants: string[] = [];
                let vDepth = 0;
                let vStart = -1;
                for (let i = 0; i < varContent.length; i++) {
                  if (varContent[i] === '{' && vDepth === 0) vStart = i;
                  if (varContent[i] === '{') vDepth++;
                  if (varContent[i] === '}') {
                    vDepth--;
                    if (vDepth === 0 && vStart !== -1) {
                      const v = varContent.slice(vStart, i + 1);
                      // Keep variant only if its ID is not in the delete set
                      const idMatch = v.match(/id:\s*'([^']+)'/);
                      if (idMatch && !idSet.has(idMatch[1])) {
                        variants.push(v.trim());
                      }
                      vStart = -1;
                    }
                  }
                }
                // Only keep shape if it still has variants
                if (variants.length > 0) {
                  const varLines = variants
                    .map((v) => `      ${v},`)
                    .join('\n');
                  keptShapes.push(
                    `{\n    name: '${nameMatch[1]}',\n    variants: [\n${varLines}\n    ],\n  }`,
                  );
                }
              }

              const newShapesArray =
                keptShapes.length > 0
                  ? `[\n  ${keptShapes.join(',\n  ')},\n]`
                  : '[]';
              src =
                src.slice(0, shapesArrayStart) +
                newShapesArray +
                src.slice(shapesEnd);
            }

            // 2b. Remove from GESTURES array
            for (const id of ids) {
              // Single-line: { id: 'xxx', ... },\n
              const singleLine = new RegExp(
                `  \\{[^}]*id: '${id}'[^}]*\\},?\\n`,
                'g',
              );
              // Multi-line: {\n    id: 'xxx', ...\n  },\n
              const multiLine = new RegExp(
                `  \\{\\n[\\s\\S]*?id: '${id}'[\\s\\S]*?\\},?\\n`,
                'g',
              );
              src = src.replace(singleLine, '');
              src = src.replace(multiLine, '');
            }

            fs.writeFileSync(galleryPath, src);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ deleted, removed: ids.length }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // Render-mode dispatcher: spawns a detached npm/bash script.
      // Body: { mode: 'remotion' | 'hybrid' | 'hf' }
      // Returns immediately with logPath so the UI can poll tail.
      server.middlewares.use('/api/render-mode', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk: string) => (body += chunk));
        req.on('end', () => {
          try {
            const { mode } = JSON.parse(body) as {
              mode: 'remotion' | 'hybrid' | 'hf';
            };
            const MODE_MAP: Record<string, { cmd: string; args: string[] }> = {
              remotion: { cmd: 'npm', args: ['run', 'render:full'] },
              hybrid: {
                cmd: 'bash',
                args: ['scripts/assemble-dorian-three-way.sh'],
              },
              hf: { cmd: 'npm', args: ['run', 'render:hf-full'] },
            };
            const spec = MODE_MAP[mode];
            if (!spec) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `unknown mode: ${mode}` }));
              return;
            }
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            const logPath = `/tmp/render-${mode}-${ts}.log`;
            const logFd = fs.openSync(logPath, 'w');
            const child = spawn(spec.cmd, spec.args, {
              cwd: __dirname,
              detached: true,
              stdio: ['ignore', logFd, logFd],
            });
            child.unref();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: true,
                mode,
                pid: child.pid,
                logPath,
              }),
            );
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // Poll render log: tail last N lines of a logfile.
      server.middlewares.use('/api/render-status', (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const logPath = url.searchParams.get('logPath') || '';
          // Only allow /tmp/render-*.log paths — prevent path traversal
          if (!/^\/tmp\/render-[a-z]+-[\d\-TZ]+\.log$/.test(logPath)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'invalid logPath' }));
            return;
          }
          if (!fs.existsSync(logPath)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ running: false, tail: '' }));
            return;
          }
          const content = fs.readFileSync(logPath, 'utf8');
          const lines = content.split('\n');
          const tail = lines.slice(-20).join('\n');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ running: true, tail, bytes: content.length }),
          );
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      // ── Version control: GET frozen list ──
      server.middlewares.use('/api/versions/frozen', (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const file = path.resolve(__dirname, 'src/compositions/.frozen.json');
          const content = fs.existsSync(file)
            ? fs.readFileSync(file, 'utf8')
            : '{"version":1,"frozen":[]}';
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(content);
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      // ── Version control: scan for files matching a version label ──
      // GET /api/versions/scan?label=V1.01 → list of *V1.01.tsx files under
      // src/compositions/, with frozen status. Used by the Freeze action to
      // know which files to add to .frozen.json.
      server.middlewares.use('/api/versions/scan', (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const label = url.searchParams.get('label') || '';
          // Strict: V<digit>.<digit><digit> (e.g. V1.01)
          if (!/^V\d+\.\d{2}$/.test(label)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({ error: 'invalid label (expected V1.0X)' }),
            );
            return;
          }
          const root = path.resolve(__dirname, 'src/compositions');
          const found: string[] = [];
          const suffix = `${label}.tsx`;
          const walk = (dir: string) => {
            for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
              const full = path.join(dir, ent.name);
              if (ent.isDirectory()) {
                if (ent.name === 'node_modules' || ent.name.startsWith('.'))
                  continue;
                walk(full);
              } else if (ent.isFile() && ent.name.endsWith(suffix)) {
                found.push(path.relative(__dirname, full));
              }
            }
          };
          walk(root);
          // Cross-reference with .frozen.json
          const frozenFile = path.resolve(
            __dirname,
            'src/compositions/.frozen.json',
          );
          const frozenSet = new Set<string>();
          if (fs.existsSync(frozenFile)) {
            const data = JSON.parse(fs.readFileSync(frozenFile, 'utf8'));
            for (const e of data.frozen || []) frozenSet.add(e.file);
          }
          const files = found.map((f) => ({
            file: f,
            frozen: frozenSet.has(f),
          }));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ label, files }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      // ── Version control: bump (clone top → next sub-version) ──
      // Body: { family: "DorianFull", currentVersion: "V1.01",
      //         currentFile: "src/compositions/DorianFull/DorianFullV1.01.tsx" }
      // Only supports V1.0X → V1.0X+1 (not base → V1.01 — that's manual).
      // Renames V1.0X → V1.0Y in filename + file contents (both label and
      // underscore identifier forms).
      server.middlewares.use('/api/versions/bump', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk: string) => (body += chunk));
        req.on('end', () => {
          try {
            const { family, currentVersion, currentFile } = JSON.parse(
              body,
            ) as {
              family: string;
              currentVersion: string;
              currentFile: string;
            };
            // Validate inputs
            if (!/^[A-Za-z][A-Za-z0-9]*$/.test(family || '')) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'invalid family name' }));
              return;
            }
            const verMatch = /^V(\d+)\.(\d{2})$/.exec(currentVersion || '');
            if (!verMatch) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error:
                    'currentVersion must be V1.0X (manual first bump required for base — see version-safe-iteration.md)',
                }),
              );
              return;
            }
            // V1.00 baseline → first bump must be done manually (the rename
            // can't safely word-boundary-match `${family}` as an identifier
            // because peer files may import the same name).
            if (verMatch[1] === '1' && verMatch[2] === '00') {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error:
                    'V1.00 → V1.01 first bump must be done manually (see .claude/rules/version-safe-iteration.md). API only supports V1.0X → V1.0Y for X ≥ 1.',
                }),
              );
              return;
            }
            // Resolve absolute path safely under src/compositions/
            const compRoot = path.resolve(__dirname, 'src/compositions');
            const absCurrent = path.resolve(__dirname, currentFile);
            if (!absCurrent.startsWith(compRoot + path.sep)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error: 'currentFile must live under src/compositions/',
                }),
              );
              return;
            }
            if (!fs.existsSync(absCurrent)) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'currentFile does not exist' }));
              return;
            }

            const major = parseInt(verMatch[1], 10);
            const minor = parseInt(verMatch[2], 10);
            const nextMinor = minor + 1;
            const oldLabel = `V${major}.${String(minor).padStart(2, '0')}`;
            const newLabel = `V${major}.${String(nextMinor).padStart(2, '0')}`;
            const oldIdent = `V${major}_${String(minor).padStart(2, '0')}`;
            const newIdent = `V${major}_${String(nextMinor).padStart(2, '0')}`;

            const dir = path.dirname(absCurrent);
            const base = path.basename(absCurrent);
            if (!base.includes(oldLabel)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error: `currentFile basename does not contain ${oldLabel}`,
                }),
              );
              return;
            }
            const newBase = base.replace(oldLabel, newLabel);
            const absNew = path.join(dir, newBase);
            if (fs.existsSync(absNew)) {
              res.writeHead(409, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error: `next version file already exists: ${path.relative(__dirname, absNew)}`,
                }),
              );
              return;
            }

            // Read, transform, write
            let content = fs.readFileSync(absCurrent, 'utf8');
            // Order matters: replace longer pattern first (label has dot,
            // ident has underscore — distinct shapes, no overlap).
            content = content.split(oldLabel).join(newLabel);
            content = content.split(oldIdent).join(newIdent);
            fs.writeFileSync(absNew, content);

            const newId = `${family}${newIdent}`; // e.g. DorianFullV1_02 (export form). Composition id uses dash form.
            const oldCompId = `${family}${oldLabel.replace('.', '-')}`; // DorianFullV1-01
            const newCompId = `${family}${newLabel.replace('.', '-')}`; // DorianFullV1-02
            const relNew = path.relative(__dirname, absNew);

            // Auto-seed codedPaths.data.json: copy the old compId's saved scene
            // data under the new compId. Saves the user one wire-up step and
            // means "Save as Version" produces a working snapshot of the
            // current scene state ready for the new version.
            let seededFromJson = false;
            try {
              const jsonPath = path.resolve(
                __dirname,
                'src/compositions/SceneDirector/codedPaths.data.json',
              );
              if (fs.existsSync(jsonPath)) {
                const raw = fs.readFileSync(jsonPath, 'utf8');
                const data = JSON.parse(raw) as Record<string, unknown>;
                if (data[oldCompId] && !data[newCompId]) {
                  // Deep clone via JSON roundtrip — entries are plain JSON
                  data[newCompId] = JSON.parse(JSON.stringify(data[oldCompId]));
                  fs.writeFileSync(
                    jsonPath,
                    JSON.stringify(data, null, 2) + '\n',
                  );
                  seededFromJson = true;
                }
              }
            } catch {
              /* best-effort — tsx clone already succeeded; surface in instructions */
            }

            // Auto-wire all 5 registry files. Each helper is best-effort
            // and idempotent. Failures surface to the user as remaining
            // manual steps; the bump itself still succeeds.
            const wired = autoWireRegistries({
              family,
              oldLabel,
              newLabel,
              oldIdent,
              newIdent,
              oldCompId,
              newCompId,
              oldBase: base,
              newBase,
              rootDir: __dirname,
            });

            const wireSummary = (
              key: keyof typeof wired,
              label: string,
            ): string => {
              const s = wired[key];
              if (s === 'wired') return `✓ ${label}: auto-wired`;
              if (s === 'already-present') return `✓ ${label}: already wired`;
              return `✗ ${label}: ${s} — wire manually`;
            };

            const instructions = [
              wireSummary('rootTsx', 'src/Root.tsx'),
              wireSummary(
                'compositionsTs',
                'src/compositions/SceneDirector/compositions.ts',
              ),
              wireSummary(
                'codedPathsTs',
                'src/compositions/SceneDirector/codedPaths.ts',
              ),
              wireSummary(
                'layersTs',
                'src/compositions/SceneDirector/layers.ts',
              ),
              wireSummary('packageJson', 'package.json render scripts'),
              seededFromJson
                ? `✓ codedPaths.data.json: '${newCompId}' auto-seeded from '${oldCompId}'`
                : `✗ codedPaths.data.json: copy '${oldCompId}' to '${newCompId}' manually`,
              `Edit ${relNew} freely — it's not in .frozen.json yet.`,
              `When approved, click Freeze to seal V${major}.${String(nextMinor).padStart(2, '0')}.`,
            ];

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: true,
                family,
                newVersion: newLabel,
                newId,
                newCompId,
                newFile: relNew,
                seededFromJson,
                wired,
                instructions,
              }),
            );
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // ── Version control: freeze (append files to .frozen.json) ──
      // Body: { files: ["src/.../X.tsx", ...], version: "DorianFull V1.01" }
      server.middlewares.use('/api/versions/freeze', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk: string) => (body += chunk));
        req.on('end', () => {
          try {
            const { files, version } = JSON.parse(body) as {
              files: string[];
              version: string;
            };
            if (!Array.isArray(files) || files.length === 0) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'files array required' }));
              return;
            }
            if (!version || typeof version !== 'string') {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'version string required' }));
              return;
            }
            const compRoot = path.resolve(__dirname, 'src/compositions');
            // Validate: each file must resolve under src/compositions/ and exist
            for (const f of files) {
              const abs = path.resolve(__dirname, f);
              if (!abs.startsWith(compRoot + path.sep)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    error: `file outside src/compositions/: ${f}`,
                  }),
                );
                return;
              }
              if (!fs.existsSync(abs)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `file does not exist: ${f}` }));
                return;
              }
            }
            const frozenFile = path.resolve(
              __dirname,
              'src/compositions/.frozen.json',
            );
            const data = fs.existsSync(frozenFile)
              ? JSON.parse(fs.readFileSync(frozenFile, 'utf8'))
              : { version: 1, frozen: [] };
            const existing = new Set(
              (data.frozen || []).map((e: { file: string }) => e.file),
            );
            const today = new Date().toISOString().slice(0, 10);
            let added = 0;
            for (const f of files) {
              if (existing.has(f)) continue;
              data.frozen.push({ file: f, version, frozenAt: today });
              added += 1;
            }
            fs.writeFileSync(frozenFile, JSON.stringify(data, null, 2) + '\n');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: true,
                added,
                skipped: files.length - added,
                total: data.frozen.length,
              }),
            );
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // GET disk state for a (compositionId, sceneName) — fresh read.
      // Used by Save handler to compute diff vs disk before committing.
      server.middlewares.use('/api/get-saved-entry', (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const compositionId = url.searchParams.get('compositionId');
          const sceneName = url.searchParams.get('sceneName');
          if (!compositionId || !sceneName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({ error: 'compositionId+sceneName required' }),
            );
            return;
          }
          const filePath = path.resolve(
            __dirname,
            'src/compositions/SceneDirector/codedPaths.data.json',
          );
          const data = fs.existsSync(filePath)
            ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
            : {};
          const entry = data?.[compositionId]?.[sceneName] ?? null;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ entry }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      // GET all saved scenes for a compositionId — used by bump pre-flight.
      server.middlewares.use('/api/get-saved-comp', (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const compositionId = url.searchParams.get('compositionId');
          if (!compositionId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'compositionId required' }));
            return;
          }
          const filePath = path.resolve(
            __dirname,
            'src/compositions/SceneDirector/codedPaths.data.json',
          );
          const data = fs.existsSync(filePath)
            ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
            : {};
          const entries = data?.[compositionId] ?? {};
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ entries }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      // GET save history for a (compositionId, sceneName). Returns the last
      // N saves (newest first). History is append-only JSONL; each line is a
      // record of one save, including the previous on-disk entry.
      server.middlewares.use('/api/save-history', (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const compositionId = url.searchParams.get('compositionId');
          const sceneName = url.searchParams.get('sceneName');
          const limitParam = url.searchParams.get('limit');
          const limit = limitParam
            ? Math.min(parseInt(limitParam, 10), 50)
            : 20;
          const histPath = path.resolve(
            __dirname,
            'src/compositions/SceneDirector/codedPaths.history.jsonl',
          );
          if (!fs.existsSync(histPath)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ entries: [] }));
            return;
          }
          const raw = fs.readFileSync(histPath, 'utf8');
          const lines = raw.split('\n').filter((l) => l.trim().length > 0);
          // Newest first; filter by comp+scene if provided
          const all = lines
            .map((l) => {
              try {
                return JSON.parse(l) as Record<string, unknown>;
              } catch {
                return null;
              }
            })
            .filter((e) => e !== null);
          const filtered = all.filter((e) => {
            if (compositionId && e!.compositionId !== compositionId)
              return false;
            if (sceneName && e!.sceneName !== sceneName) return false;
            return true;
          });
          const newestFirst = filtered.reverse().slice(0, limit);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ entries: newestFirst }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      server.middlewares.use('/api/save-path', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk: string) => (body += chunk));
        req.on('end', () => {
          try {
            const {
              compositionId,
              sceneName,
              path: pathData,
              gesture,
              animation,
              dark,
              locked,
              secondaryLayers,
            } = JSON.parse(body);
            const filePath = path.resolve(
              __dirname,
              'src/compositions/SceneDirector/codedPaths.data.json',
            );
            const existing = fs.existsSync(filePath)
              ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
              : {};
            const prevEntry = existing?.[compositionId]?.[sceneName] ?? null;

            if (!pathData || pathData.length === 0) {
              // Empty path = user removed the hand — delete the scene entry
              if (existing[compositionId]) {
                delete existing[compositionId][sceneName];
                if (Object.keys(existing[compositionId]).length === 0) {
                  delete existing[compositionId];
                }
              }
            } else {
              if (!existing[compositionId]) existing[compositionId] = {};
              const entry: Record<string, unknown> = {
                gesture,
                animation,
                path: pathData,
              };
              if (dark !== undefined) entry.dark = dark;
              if (locked === true) entry._locked = true;
              if (secondaryLayers?.length > 0)
                entry.secondaryLayers = secondaryLayers;
              existing[compositionId][sceneName] = entry;
            }

            fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

            // Append to history (best-effort; never fails the save). Bounded
            // to MAX_HISTORY_LINES; oldest lines pruned if exceeded.
            try {
              const histPath = path.resolve(
                __dirname,
                'src/compositions/SceneDirector/codedPaths.history.jsonl',
              );
              const newEntry = existing?.[compositionId]?.[sceneName] ?? null;
              const record = {
                timestamp: Date.now(),
                compositionId,
                sceneName,
                prevEntry,
                newEntry,
              };
              fs.appendFileSync(histPath, JSON.stringify(record) + '\n');
              // Prune to last N lines
              const MAX_HISTORY_LINES = 500;
              const histRaw = fs.readFileSync(histPath, 'utf8');
              const histLines = histRaw
                .split('\n')
                .filter((l) => l.trim().length > 0);
              if (histLines.length > MAX_HISTORY_LINES) {
                const trimmed =
                  histLines.slice(-MAX_HISTORY_LINES).join('\n') + '\n';
                fs.writeFileSync(histPath, trimmed);
              }
            } catch {
              // History is best-effort; primary save already succeeded
            }

            // Auto-sync HF scene HTML (marker-scoped). Only fires for
            // compositions that have HF counterparts (DorianFull / DorianDemo)
            // and scenes whose .html file contains the markers — other scenes
            // are skipped gracefully.
            let hfSync: {
              updated: boolean;
              reason?: string;
              hfFile?: string;
            } | null = null;
            if (
              pathData &&
              pathData.length > 0 &&
              (compositionId === 'DorianFull' || compositionId === 'DorianDemo')
            ) {
              hfSync = updateHfScene(__dirname, sceneName, {
                gesture,
                animation,
                dark,
                path: pathData,
              });
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, hfSync }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // Persist feedback pins to disk so Claude can read them without a
      // manual Save. Written as a flat { compositionId: FeedbackPin[] } map.
      server.middlewares.use('/api/save-feedback-pins', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk: string) => (body += chunk));
        req.on('end', () => {
          try {
            const { feedbackPins } = JSON.parse(body);
            if (typeof feedbackPins !== 'object' || feedbackPins === null) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({ error: 'feedbackPins object required' }),
              );
              return;
            }
            const filePath = path.resolve(
              __dirname,
              'src/compositions/SceneDirector/feedbackNotes.data.json',
            );
            fs.writeFileSync(filePath, JSON.stringify(feedbackPins, null, 2));
            const total = Object.values(feedbackPins).reduce(
              (sum: number, arr: unknown) =>
                sum + (Array.isArray(arr) ? arr.length : 0),
              0,
            );
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, total }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // Read feedback pins back from disk — fallback when localStorage is
      // empty (fresh browser, post-Reload). Returns {} if file missing.
      server.middlewares.use('/api/load-feedback-pins', (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const filePath = path.resolve(
            __dirname,
            'src/compositions/SceneDirector/feedbackNotes.data.json',
          );
          if (!fs.existsSync(filePath)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{}');
            return;
          }
          const content = fs.readFileSync(filePath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(content);
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), savePathPlugin()],
  root: '.',
  publicDir: 'public',
  build: { outDir: 'dist-scene-director' },
  server: {
    open: '/scene-director.html',
  },
  resolve: {
    alias: {
      // Allow remotion's staticFile() to resolve in Vite context
    },
  },
});
