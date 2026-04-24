import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { updateHfScene } from './scripts/hf-exporter.mjs';

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
              secondaryLayers,
            } = JSON.parse(body);
            const filePath = path.resolve(
              __dirname,
              'src/compositions/SceneDirector/codedPaths.data.json',
            );
            const existing = fs.existsSync(filePath)
              ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
              : {};

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
              if (secondaryLayers?.length > 0)
                entry.secondaryLayers = secondaryLayers;
              existing[compositionId][sceneName] = entry;
            }

            fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

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
