import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — shared by all chunks, must be isolated to avoid cycles
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/three/')) {
            return 'three-vendor'
          }
          if (
            id.includes('@react-three/fiber') ||
            id.includes('@react-three/drei') ||
            id.includes('@react-three/a11y') ||
            id.includes('node_modules/zustand/')
          ) {
            return 'r3f-vendor'
          }
          if (
            id.includes('@react-three/postprocessing') ||
            id.includes('node_modules/postprocessing/')
          ) {
            return 'postprocessing-vendor'
          }
          if (
            id.includes('node_modules/motion/') ||
            id.includes('@react-spring/') ||
            id.includes('node_modules/gsap/')
          ) {
            return 'animation-vendor'
          }
          if (
            id.includes('@tanstack/') ||
            id.includes('node_modules/zod/') ||
            id.includes('node_modules/radix-ui/') ||
            id.includes('node_modules/lucide-react/')
          ) {
            return 'ui-vendor'
          }
        },
      },
    },
  },
})
