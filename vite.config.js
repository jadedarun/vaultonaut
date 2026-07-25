import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'geist/font/sans': path.resolve(__dirname, 'src/fonts/geist-sans.js'),
      'geist/font/mono': path.resolve(__dirname, 'src/fonts/geist-mono.js'),
      'geist/font/pixel': path.resolve(__dirname, 'src/fonts/geist-pixel.js'),
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
