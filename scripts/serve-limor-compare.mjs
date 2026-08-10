#!/usr/bin/env node
// Static server for the tournament compare page, WITH HTTP Range support.
//
// python -m http.server ignores Range entirely and answers every request with the whole
// file. A <video> element needs ranges to seek, so on that server the scrub bar and the
// jump-to-act buttons silently do nothing while the browser re-downloads 17MB.
//
// Usage: node scripts/serve-limor-compare.mjs [port]

import { createServer } from 'node:http';
import { createReadStream, statSync, existsSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'out');
const port = Number(process.argv[2] ?? 8899);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.wav': 'audio/wav',
};

createServer((req, res) => {
  const rel = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const path = join(root, normalize(rel === '/' ? '/compare.html' : rel).replace(/^(\.\.[/\\])+/, ''));

  if (!path.startsWith(root) || !existsSync(path) || statSync(path).isDirectory()) {
    res.writeHead(404).end('not found');
    return;
  }

  const { size } = statSync(path);
  const type = TYPES[extname(path)] ?? 'application/octet-stream';
  const range = req.headers.range;

  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m && m[1] ? parseInt(m[1], 10) : 0;
    const end = m && m[2] ? parseInt(m[2], 10) : size - 1;
    if (start >= size || end >= size || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
      return;
    }
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': type,
    });
    createReadStream(path, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, { 'Content-Length': size, 'Content-Type': type, 'Accept-Ranges': 'bytes' });
  createReadStream(path).pipe(res);
}).listen(port, '0.0.0.0', () => {
  console.log(`serving ${root} on http://localhost:${port}/  (Range supported)`);
});
