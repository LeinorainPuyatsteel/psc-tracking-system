import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.0.210:5000', // or http://192.168.0.210:5000 if accessed from mobile
        changeOrigin: true,
        secure: false,
      },
    },
    host: true,
    port: 5173, // You can specify a port or use the default
  },
})
