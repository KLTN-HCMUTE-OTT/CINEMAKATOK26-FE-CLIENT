import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'mock-id'
    },
    css: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    coverage: {
      provider: 'v8',
      include: [
        'src/store/**/*.ts',
        'src/hooks/**/*.ts',
        'src/components/**/*.{ts,tsx}',
        'src/lib/**/*.ts',
        'src/middleware.ts',
      ],
      exclude: [
        'src/apis/**',
        'src/components/ui/**',
        'src/types/**',
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/tests/**',
        'src/e2e/**',
      ],
      thresholds: {
        lines: 60,
      },
    },
  }
});
