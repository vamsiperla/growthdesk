import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/growthdesk/',
  define: {
    __VITE_GIST_ID__: JSON.stringify(process.env.VITE_GIST_ID || ""),
    __VITE_GIST_TOKEN__: JSON.stringify(process.env.VITE_GIST_TOKEN || ""),
    __VITE_EDIT_SECRET__: JSON.stringify(process.env.VITE_EDIT_SECRET || ""),
  }
})