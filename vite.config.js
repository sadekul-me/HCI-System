import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // এটি যোগ করলেই কেবল ফোন থেকে তোর সাইট দেখা যাবে
    port: 5173
  }
})