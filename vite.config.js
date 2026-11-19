import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const aiProxy = {
  '/api': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
  },
}

export default defineConfig({
  // This repository is published at https://mdzubair4g-art.github.io/Ai-notes-simplifier/
  base: '/Ai-notes-simplifier/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: aiProxy,
  },
  preview: {
    proxy: aiProxy,
  },
})
