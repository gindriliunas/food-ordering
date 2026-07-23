import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'amazon-cognito-identity-js'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
