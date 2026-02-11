import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function savePathPlugin(): Plugin {
  return {
    name: 'scene-director-save-path',
    configureServer(server) {
      server.middlewares.use('/api/save-path', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk: string) => (body += chunk));
        req.on('end', () => {
          try {
            const { compositionId, sceneName, path: pathData, gesture, animation } = JSON.parse(body);
            const filePath = path.resolve(__dirname, 'src/compositions/SceneDirector/codedPaths.data.json');
            const existing = fs.existsSync(filePath)
              ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
              : {};

            if (!existing[compositionId]) existing[compositionId] = {};
            existing[compositionId][sceneName] = { gesture, animation, path: pathData };

            fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
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
