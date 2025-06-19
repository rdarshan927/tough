import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' && process.env.VITE_DEPLOY_TARGET === 'github' 
    ? '/tough/' 
    : '/', // Use root path for Docker
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
