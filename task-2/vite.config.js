import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Exclude three.js from pre-bundling so our dynamic import works correctly
    exclude: ['three'],
  },
})
