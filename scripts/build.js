#!/usr/bin/env node

import { build } from 'vite'
import { resolve } from 'path'

async function buildApp() {
  try {
    console.log('🚀 Démarrage de la construction...')
    
    await build({
      root: resolve(__dirname, '..'),
      build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              leaflet: ['leaflet'],
              utils: ['tailwindcss']
            }
          }
        }
      }
    })
    
    console.log('✅ Construction terminée avec succès !')
  } catch (error) {
    console.error('❌ Erreur lors de la construction:', error)
    process.exit(1)
  }
}

buildApp()
