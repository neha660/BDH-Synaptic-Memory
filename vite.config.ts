import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://<user>.github.io/BDH-Synaptic-Memory/ — every asset
  // path needs this prefix, or the deployed page loads a blank white screen.
  base: '/BDH-Synaptic-Memory/',
})
