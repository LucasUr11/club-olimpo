import type { ApiSource } from '../../shared/types'

/** Envoltorio estándar de la API: { data, source }. */
interface ApiEnvelope<T> {
  data: T
  source: ApiSource
}

/**
 * Cliente liviano de la API interna (/api/*).
 * - Cachea promesas por path (evita pedidos duplicados entre secciones).
 * - Ante cualquier error responde con el fixture de respaldo: el portal
 *   nunca queda en pantalla vacía.
 */
export function getJson<T>(path: string, fallback: T): Promise<T> {
  const cached = cache.get(path) as Promise<T> | undefined
  if (cached) {
    return cached
  }

  const request = (async (): Promise<T> => {
    try {
      const response = await fetch(path, { headers: { Accept: 'application/json' } })
      if (!response.ok) {
        return fallback
      }

      const payload: unknown = await response.json()
      if (payload !== null && typeof payload === 'object' && 'data' in payload) {
        return (payload as ApiEnvelope<T>).data
      }
      return payload as T
    } catch {
      return fallback
    }
  })()

  cache.set(path, request)
  return request
}

const cache = new Map<string, Promise<unknown>>()
