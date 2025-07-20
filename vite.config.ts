import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React dependencies
          react: ['react', 'react-dom', 'react-router-dom'],
          // Separate utility libraries
          utils: ['html2canvas']
        }
      }
    },
    // Increase chunk size warning limit to 1MB for cleaner output
    chunkSizeWarningLimit: 1000
  }
})
