// vitest.config.mts
import { defineConfig } from "file:///E:/KLTN/CINEMAKATOK26-FE-CLIENT/node_modules/.pnpm/vitest@2.1.8_@types+node@20_06b53de35f90570653403bbf385922f2/node_modules/vitest/dist/config.js";
import path from "path";
var __vite_injected_original_dirname = "E:\\KLTN\\CINEMAKATOK26-FE-CLIENT";
var vitest_config_default = defineConfig({
  test: {
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:3000",
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "mock-id"
    },
    css: false,
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    },
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 60
      }
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy5tdHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxLTFROXFxcXENJTkVNQUtBVE9LMjYtRkUtQ0xJRU5UXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxLTFROXFxcXENJTkVNQUtBVE9LMjYtRkUtQ0xJRU5UXFxcXHZpdGVzdC5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9LTFROL0NJTkVNQUtBVE9LMjYtRkUtQ0xJRU5UL3ZpdGVzdC5jb25maWcubXRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgdGVzdDoge1xuICAgIGVudjoge1xuICAgICAgTkVYVF9QVUJMSUNfQVBJX1VSTDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICBORVhUX1BVQkxJQ19HT09HTEVfQ0xJRU5UX0lEOiAnbW9jay1pZCdcbiAgICB9LFxuICAgIGNzczogZmFsc2UsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBzZXR1cEZpbGVzOiBbJy4vc3JjL3Rlc3RzL3NldHVwLnRzJ10sXG4gICAgaW5jbHVkZTogWydzcmMvKiovKi50ZXN0Lnt0cyx0c3h9J10sXG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJylcbiAgICB9LFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICBwcm92aWRlcjogJ3Y4JyxcbiAgICAgIHRocmVzaG9sZHM6IHtcbiAgICAgICAgbGluZXM6IDYwLFxuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJSLFNBQVMsb0JBQW9CO0FBQ3hULE9BQU8sVUFBVTtBQURqQixJQUFNLG1DQUFtQztBQUd6QyxJQUFPLHdCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsSUFDSixLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxNQUNyQiw4QkFBOEI7QUFBQSxJQUNoQztBQUFBLElBQ0EsS0FBSztBQUFBLElBQ0wsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsWUFBWSxDQUFDLHNCQUFzQjtBQUFBLElBQ25DLFNBQVMsQ0FBQyx3QkFBd0I7QUFBQSxJQUNsQyxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxJQUNBLFVBQVU7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQSxRQUNWLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
