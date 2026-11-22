import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /excuse requests to the FastAPI backend during development on dedicated port 8008.
    // This avoids port collisions with other local projects on port 8000.
    proxy: {
      '/excuse': 'http://localhost:8008',
      '/health': 'http://localhost:8008',
    }
  }
})
