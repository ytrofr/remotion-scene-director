import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/*.test.ts'],
    // SceneDirector has many side-effect-heavy modules (Player, Vite middleware
    // runtime, etc.) we don't want to import in tests. Tests stick to
    // pure-function modules (state, persistence, save-all logic).
    exclude: ['node_modules', 'dist', 'out', '.git'],
  },
});
