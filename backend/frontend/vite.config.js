import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sitemap.xml': {
        target: 'https://pbt-liart.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sitemap.xml/, '/sitemap.xml')
      }
    }
  }
})
