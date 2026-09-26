import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackStart(),
    tsconfigPaths(),
  ],
  server: {
    port: 8080,
    strictPort: true,
    host: true,
  },
})

