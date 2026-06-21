import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: '/growthdesk/',
    define: {
      __VITE_GIST_ID__: JSON.stringify(env.VITE_GIST_ID || ""),
      __VITE_GIST_TOKEN__: JSON.stringify(env.VITE_GIST_TOKEN || ""),
      __VITE_EDIT_SECRET__: JSON.stringify(env.VITE_EDIT_SECRET || ""),
    }
  }
})