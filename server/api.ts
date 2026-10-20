// ============================================================================
// API liviana del portal — plugin de Vite (sin Express ni servidores paralelos)
// ----------------------------------------------------------------------------
// Registra middlewares en el mismo proceso de Vite (dev y preview) para
// servir /api/* con datos de Turso (Prisma) o fixtures de demostración.
//
//   GET /api/health        → estado de la conexión con Turso
//   GET /api/matches       → próximos partidos
//   GET /api/news          → noticias / novedades
//   GET /api/achievements  → palmarés
//   GET /api/sponsors      → patrocinadores
//   GET /api/history       → hitos históricos
//   GET /api/products      → productos de la tienda
//
// Todas las respuestas de contenido tienen la forma: { data, source }
// y el header `x-data-source: database | fixtures`.
// ============================================================================

import type { ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import {
  getAchievements,
  getHealth,
  getHistory,
  getMatches,
  getNews,
  getProducts,
  getSponsors,
  type RepositoryResult,
} from './repositories'
import type { Env } from './db'

type RouteHandler = (env: Env) => Promise<RepositoryResult<unknown>>

const routes: Record<string, RouteHandler> = {
  '/api/health': (env) => getHealth(env),
  '/api/matches': (env) => getMatches(env),
  '/api/news': (env) => getNews(env),
  '/api/achievements': (env) => getAchievements(env),
  '/api/sponsors': (env) => getSponsors(env),
  '/api/history': (env) => getHistory(env),
  '/api/products': (env) => getProducts(env),
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function registerApi(middlewares: Connect.Server, env: Env): void {
  middlewares.use((req, res, next) => {
    const path = (req.url ?? '').split('?')[0] ?? ''

    if (!path.startsWith('/api/')) {
      next()
      return
    }

    void (async () => {
      try {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          sendJson(res, 405, { error: 'Método no permitido' })
          return
        }

        const handler = routes[path]
        if (!handler) {
          sendJson(res, 404, { error: `Ruta no encontrada: ${path}` })
          return
        }

        const result = await handler(env)
        res.setHeader('x-data-source', result.source)
        sendJson(res, 200, result)
      } catch (error) {
        console.error('[club-olimpo/api] error:', error)
        if (!res.headersSent) {
          sendJson(res, 500, { error: 'Error interno de la API' })
        } else {
          res.end()
        }
      }
    })()
  })
}

/** Plugin principal: inyecta la API en dev y preview. */
export function createApiPlugin(env: Env): Plugin {
  return {
    name: 'club-olimpo:api',
    configureServer(server) {
      registerApi(server.middlewares, env)
    },
    configurePreviewServer(server) {
      registerApi(server.middlewares, env)
    },
  }
}
