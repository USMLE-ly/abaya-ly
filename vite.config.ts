import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor — rarely changes, benefits from long-term caching
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // Animation library — large, split separately
          animation: ['framer-motion'],

          // Icons — large but tree-shakable; keep separate
          icons: ['lucide-react'],

          // Charts — very heavy, only used in admin
          charts: ['recharts'],

          // Data fetching — used by admin
          query: ['@tanstack/react-query'],
        },
      },
    },
    // Chunk size warning threshold raised since manual chunks are reasonable
    chunkSizeWarningLimit: 400,
  },
})
