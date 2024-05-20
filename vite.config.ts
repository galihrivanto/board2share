import { defineConfig } from 'vite';

export default defineConfig({
    build: {
      lib: {
        entry: ['src/index.ts'],
        formats: ['es']
      },
      rollupOptions: {
        external: /^lit/
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          includePaths: ['node_modules', 'src']
        }
      }
    }
});