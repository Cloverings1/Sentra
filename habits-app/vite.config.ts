import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow importing repo-root files like ../PRAYERS.MD via `?raw`
      allow: ['..'],
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
