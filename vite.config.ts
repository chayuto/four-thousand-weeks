import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages (repo name)
  base: process.env.GITHUB_ACTIONS ? '/four-thousand-weeks/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/store': resolve(__dirname, './src/store'),
      '@/components': resolve(__dirname, './src/components'),
      '@/types': resolve(__dirname, './src/types'),
    },
  },
})
