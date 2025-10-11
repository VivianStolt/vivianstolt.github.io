import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vivianstolt.github.io/', // GitHub Pages repository path
  server: {
    port: 5173,
    // No backend proxy needed for frontend-only deployment
  },
  build: {
    outDir: 'dist'
  },
  publicDir: 'public' // Ensure posts folder is copied to dist
})