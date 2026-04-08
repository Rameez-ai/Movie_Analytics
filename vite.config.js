import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public',
    emptyOutDir: false, // Don't empty public, keep server files
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})