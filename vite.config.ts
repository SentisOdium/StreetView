import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],

  server: {
    port: 5173,
    open: true,
    host: "0.0.0.0",
    proxy: {
      '/cloudfront': {
        target: 'https://d1ljb2x8181qxp.cloudfront.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cloudfront/, '')
      }
    }
  },
})
