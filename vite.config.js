import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // No backend proxy needed for frontend-only deployment
  },
  build: {
    outDir: 'dist'
  }
})