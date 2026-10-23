// ============================================================================
// Variables de entorno en runtime Node (Vercel Functions).
// En Vite las variables llegan por `loadEnv()`; en Vercel viven en process.env.
// ============================================================================

import type { Env } from './db'

/** Copia las variables definidas del proceso al formato que usa la API. */
export function envFromProcess(): Env {
  const env: Env = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string') env[key] = value
  }
  return env
}
