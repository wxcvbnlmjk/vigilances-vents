import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Écouter sur toutes les interfaces réseau
    open: true
  },
  preview: {
    port: 4173,
    host: '0.0.0.0' // Écouter sur toutes les interfaces réseau
  }
})
