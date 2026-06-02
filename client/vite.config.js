import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Pre-bundle zustand so HMR does not re-initialize the store module,
    // which would cause a brief user=null flash and trigger redirect loops.
    include: ["zustand"],
  },
})
