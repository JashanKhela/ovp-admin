import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"



// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@fullcalendar/core'], // Ensure this module is externalized
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
