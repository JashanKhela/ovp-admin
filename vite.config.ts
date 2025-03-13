import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"



// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: [], // Ensure this module is externalized
    },
  },
  optimizeDeps: {
    include: ['@fullcalendar/react', '@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/interaction'],
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
