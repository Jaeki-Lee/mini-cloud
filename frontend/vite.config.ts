import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 모든 IP에서 접근 허용
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
