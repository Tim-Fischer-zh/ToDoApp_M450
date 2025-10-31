import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for Docker builds - outputs to dist instead of wwwroot
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})