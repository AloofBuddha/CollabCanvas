import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    testTimeout: 10000,
  },
  build: {
    chunkSizeWarningLimit: 2000,
     rollupOptions: {
      output: {
        manualChunks: {
          // Core frameworks
          react: ['react', 'react-dom'],

          // Graphics / canvas
          konva: ['konva', 'react-konva'],

              // Firebase (split by used modules)
          firebase: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/database',
          ],

          // LangChain & OpenAI (explicit submodules)
          ai: [
            '@langchain/openai',
            '@langchain/core',
          ],

          // Utility / state management
          utils: ['zustand', 'zod', 'react-hot-toast', 'lucide-react'],
        },
      },
    },
  },
})

