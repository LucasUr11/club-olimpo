// ============================================================================
// Capa de acceso a datos — Prisma ORM + Turso (libSQL)
// ----------------------------------------------------------------------------
// Conexión DIRECTA a la nube con @prisma/adapter-libsql.
// No hay bases de datos locales: si DATABASE_URL falta o la conexión falla,
// `getPrisma` devuelve null y los repositorios responden con fixtures.
// ============================================================================

import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../generated/prisma/client.js'

/** Variables de entorno (provenientes de .env vía loadEnv en vite.config.ts). */
export type Env = Record<string, string>

/** Singleton perezoso del cliente Prisma. */
let clientPromise: Promise<PrismaClient | null> | null = null

async function createClient(url: string, authToken: string | undefined): Promise<PrismaClient | null> {
  try {
    const adapter = new PrismaLibSql({ url, authToken })
    return new PrismaClient({ adapter })
  } catch {
    // Configuración inválida: el sitio sigue funcionando con fixtures.
    return null
  }
}

/**
 * Devuelve el cliente Prisma conectado a Turso, o `null` si la base no está
 * configurada. La creación es perezosa y se cachea por proceso.
 */
export function getPrisma(env: Env): Promise<PrismaClient | null> {
  const url = env['DATABASE_URL']
  if (!url) {
    return Promise.resolve(null)
  }
  if (!clientPromise) {
    clientPromise = createClient(url, env['TURSO_AUTH_TOKEN'])
  }
  return clientPromise
}
