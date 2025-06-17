import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 根据环境确定API服务器地址
const isDev = process.env.NODE_ENV === 'development'
const API_TARGET = isDev ? 'http://localhost:3000' : 'http://149.88.88.161:8000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/v1': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/token': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/ping': {
        target: API_TARGET,
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../public/dream',
    emptyOutDir: true,
  }
}) 