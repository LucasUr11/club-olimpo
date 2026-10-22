// ============================================================================
// Cliente del panel de administración.
// ----------------------------------------------------------------------------
// - Guarda el token en sessionStorage (se borra al cerrar la pestaña).
// - Inyecta `Authorization: Bearer` en cada request autenticada.
// - Ante un 401 limpia la sesión y avisa a la vista para volver al login.
// - Normaliza los errores de la API ({ error: { code, message, details } })
//   en una AdminApiError con status, código y errores por campo.
// ============================================================================

import type { AdminSession } from '../../shared/types'

export type AdminResource = 'matches' | 'news' | 'sponsors' | 'products'

const TOKEN_KEY = 'olimpo.admin.token'

export class AdminApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: Record<string, string> | undefined

  constructor(status: number, code: string, message: string, details?: Record<string, string>) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// ── Sesión ─────────────────────────────────────────────────────────────────

export function getAdminToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token)
    else window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // sessionStorage puede estar bloqueado (modo privado): la sesión vive solo en memoria.
  }
}

let unauthorizedHandler: (() => void) | null = null

/** Registra el callback que vuelve al login cuando el token deja de ser válido. */
export function onUnauthorized(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

// ── HTTP ───────────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** false para el login (no envía ni exige token). */
  auth?: boolean
}

function extractError(payload: unknown): {
  code: string
  message: string
  details: Record<string, string> | undefined
} {
  if (payload !== null && typeof payload === 'object' && 'error' in payload) {
    const error = (payload as { error?: unknown }).error
    if (error !== null && typeof error === 'object') {
      const record = error as Record<string, unknown>
      const code = typeof record['code'] === 'string' ? record['code'] : 'api_error'
      const message = typeof record['message'] === 'string' ? record['message'] : 'La operación falló.'
      let details: Record<string, string> | undefined
      if (record['details'] !== null && typeof record['details'] === 'object') {
        details = {}
        for (const [key, value] of Object.entries(record['details'])) {
          if (typeof value === 'string') details[key] = value
        }
      }
      return { code, message, details }
    }
  }
  return { code: 'api_error', message: 'La operación falló.', details: undefined }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  const token = options.auth === false ? null : getAdminToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new AdminApiError(
      0,
      'network_error',
      'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.',
    )
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = extractError(payload)
    if (response.status === 401) {
      setAdminToken(null)
      unauthorizedHandler?.()
    }
    throw new AdminApiError(response.status, error.code, error.message, error.details)
  }

  if (payload !== null && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

export const adminApi = {
  login(password: string): Promise<AdminSession> {
    return request<AdminSession>('/api/auth/login', {
      method: 'POST',
      body: { password },
      auth: false,
    })
  },

  session(): Promise<{ valid: boolean; expiresAt: string }> {
    return request<{ valid: boolean; expiresAt: string }>('/api/auth/session')
  },

  logout(): Promise<{ revoked: boolean }> {
    return request<{ revoked: boolean }>('/api/auth/logout', { method: 'POST' })
  },

  list<T>(resource: AdminResource): Promise<T[]> {
    return request<T[]>(`/api/admin/${resource}`)
  },

  create<T>(resource: AdminResource, payload: unknown): Promise<T> {
    return request<T>(`/api/admin/${resource}`, { method: 'POST', body: payload })
  },

  update<T>(resource: AdminResource, id: string, payload: unknown): Promise<T> {
    return request<T>(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: payload,
    })
  },

  remove(resource: AdminResource, id: string): Promise<{ id: string }> {
    return request<{ id: string }>(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}
