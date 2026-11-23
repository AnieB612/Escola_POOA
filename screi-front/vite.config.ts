import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Repassa as chamadas /api para a API Java. Assim o navegador enxerga
    // front e API no mesmo endereço e não é preciso configurar CORS.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
