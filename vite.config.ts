import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createApiPlugin } from './server/api'

// Configuración central del portal.
// El plugin `createApiPlugin` agrega una API liviana (middleware de Vite,
// sin Express ni servidores paralelos) que consulta Turso vía Prisma ORM
// y responde con fixtures de demostración cuando la base no está disponible.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), createApiPlugin(env)],
  }
})
