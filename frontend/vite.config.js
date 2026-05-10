import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /excuse requests to the FastAPI backend during development.
    // This avoids CORS issues in dev — the browser sees localhost:5173 for all traffic.
    proxy: {
      '/excuse': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    }
  }
})
