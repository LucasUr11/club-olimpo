// ============================================================================
// API del portal — router compartido (Vite plugin + Vercel Function)
// ----------------------------------------------------------------------------
// Público:
//   GET  /api/health | matches | news | sport-members | achievements | sponsors | history | products
//
// Autenticación del panel:
//   POST /api/auth/login    { password } → { data: { token, tokenType, expiresAt } }
//   GET  /api/auth/session  (Bearer)     → valida la sesión
//   POST /api/auth/logout   (Bearer)     → revoca la sesión
//
// Administración (todas requieren Authorization: Bearer <token>):
//   GET    /api/admin/matches|news|sport-members|sponsors|products
//   POST   /api/admin/matches|news|sport-members|sponsors|products
//   PATCH  /api/admin/matches|news|sport-members|sponsors|products/:id
//   DELETE /api/admin/matches|news|sport-members|sponsors|products/:id
//
// Formato de éxito: { data, source?, } · Formato de error: { error: { code, message, details? } }
// Las lecturas públicas y los listados del panel siguen cayendo a fixtures;
// las escrituras responden 503/504 si Turso no está disponible.
// ============================================================================

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import { ApiError } from './errors.js'
import {
  clearLoginFailures,
  createAdminSession,
  isAdminConfigured,
  loginBlockedForMs,
  recordLoginFailure,
  revokeAdminSession,
  verifyAdminPassword,
  verifyAdminSession,
  type VerifiedAdminSession,
} from './auth.js'
import {
  createSponsorInquiry,
  createMatch,
  createNews,
  createProduct,
  createSponsor,
  createSportMember,
  deleteMatch,
  deleteNews,
  deleteProduct,
  deleteSponsor,
  deleteSportMember,
  getAchievements,
  getHealth,
  getHistory,
  getMatches,
  getNews,
  getNewsBySlug,
  getProducts,
  getSponsors,
  getSportMembers,
  listAdminMatches,
  listAdminNews,
  listAdminProducts,
  listAdminSponsors,
  listAdminSportMembers,
  updateMatch,
  updateNews,
  updateProduct,
  updateSponsor,
  updateSportMember,
  type RepositoryResult,
} from './repositories.js'
import type { Env } from './db.js'
import type { ValidationErrors } from '../shared/validation.js'
import { isDiscipline } from '../shared/types.js'
import {
  parseMatchCreate,
  parseMatchPatch,
  parseNewsCreate,
  parseNewsPatch,
  parseProductCreate,
  parseProductPatch,
  parseSponsorCreate,
  parseSponsorInquiry,
  parseSponsorPatch,
  parseSportMemberCreate,
  parseSportMemberPatch,
} from '../shared/validation.js'

type ContentHandler = (env: Env, url: URL) => Promise<RepositoryResult<unknown>>

const contentRoutes: Record<string, ContentHandler> = {
  '/api/health': (env) => getHealth(env),
  '/api/matches': (env, url) => {
    const discipline = url.searchParams.get('discipline')
    if (discipline === null) return getMatches(env)
    if (!isDiscipline(discipline)) {
      throw new ApiError(400, 'invalid_query', 'La disciplina indicada no es válida.')
    }
    return getMatches(env, discipline)
  },
  '/api/news': (env, url) => {
    const discipline = url.searchParams.get('discipline')
    if (discipline === null) return getNews(env)
    if (!isDiscipline(discipline)) {
      throw new ApiError(400, 'invalid_query', 'La disciplina indicada no es válida.')
    }
    return getNews(env, discipline)
  },
  '/api/sport-members': (env) => getSportMembers(env),
  '/api/achievements': (env) => getAchievements(env),
  '/api/sponsors': (env) => getSponsors(env),
  '/api/history': (env) => getHistory(env),
  '/api/products': (env) => getProducts(env),
}

const ADMIN_RESOURCES = new Set(['matches', 'news', 'sport-members', 'sponsors', 'products'])
const ADMIN_ROUTE = /^\/api\/admin\/([a-z-]+)(?:\/([^/]+))?$/
const MAX_BODY_BYTES = 256 * 1024

// ── Utilidades HTTP ────────────────────────────────────────────────────────

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function methodNotAllowed(allowed: string): ApiError {
  return new ApiError(405, 'method_not_allowed', `Método no permitido. Métodos aceptados: ${allowed}.`)
}

function validationError(errors: ValidationErrors): ApiError {
  return new ApiError(400, 'validation_error', 'Los datos enviados no son válidos.', errors)
}

function clientKey(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for']
  const header = Array.isArray(forwarded) ? forwarded[0] : forwarded
  if (typeof header === 'string') {
    const first = header.split(',')[0]?.trim()
    if (first) return first
  }
  return req.socket.remoteAddress ?? 'desconocido'
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  // Vercel puede entregar el cuerpo ya parseado en `req.body`. Vite no lo hace,
  // así que primero revisamos esa vía y si no existe leemos el stream node:http.
  const preParsed = (req as IncomingMessage & { body?: unknown }).body
  if (preParsed !== undefined) {
    if (Buffer.isBuffer(preParsed)) {
      if (preParsed.length === 0) {
        throw new ApiError(400, 'invalid_json', 'El cuerpo de la solicitud está vacío.')
      }
      try {
        return JSON.parse(preParsed.toString('utf8')) as unknown
      } catch {
        throw new ApiError(400, 'invalid_json', 'El cuerpo de la solicitud no es JSON válido.')
      }
    }
    if (typeof preParsed === 'string') {
      if (preParsed.length === 0) {
        throw new ApiError(400, 'invalid_json', 'El cuerpo de la solicitud está vacío.')
      }
      try {
        return JSON.parse(preParsed) as unknown
      } catch {
        throw new ApiError(400, 'invalid_json', 'El cuerpo de la solicitud no es JSON válido.')
      }
    }
    return preParsed
  }

  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    size += buffer.length
    if (size > MAX_BODY_BYTES) {
      throw new ApiError(413, 'payload_too_large', 'El cuerpo de la solicitud supera el límite de 256 KB.')
    }
    chunks.push(buffer)
  }

  if (size === 0) {
    throw new ApiError(400, 'invalid_json', 'El cuerpo de la solicitud está vacío.')
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
  } catch {
    throw new ApiError(400, 'invalid_json', 'El cuerpo de la solicitud no es JSON válido.')
  }
}

function bearerToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization
  if (!header) return null
  const [scheme, token] = header.split(' ')
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null
  return token.trim() || null
}

function requireSession(req: IncomingMessage, env: Env): VerifiedAdminSession {
  const token = bearerToken(req)
  if (!token) {
    throw new ApiError(401, 'unauthorized', 'Falta el token de sesión (Authorization: Bearer <token>).')
  }
  const session = verifyAdminSession(env, token)
  if (!session) {
    throw new ApiError(401, 'unauthorized', 'La sesión es inválida o expiró. Volvé a iniciar sesión.')
  }
  return session
}

function decodeId(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    throw new ApiError(400, 'invalid_id', 'El identificador del recurso es inválido.')
  }
}

// ── Autenticación ──────────────────────────────────────────────────────────

async function handleLogin(req: IncomingMessage, res: ServerResponse, env: Env): Promise<void> {
  if (!isAdminConfigured(env)) {
    throw new ApiError(
      503,
      'admin_not_configured',
      'El panel no está configurado: definí ADMIN_PASSWORD en el entorno.',
    )
  }

  const key = clientKey(req)
  const blockedMs = loginBlockedForMs(key)
  if (blockedMs > 0) {
    res.setHeader('Retry-After', String(Math.ceil(blockedMs / 1000)))
    throw new ApiError(
      429,
      'too_many_attempts',
      'Demasiados intentos fallidos. Esperá unos minutos antes de volver a intentar.',
    )
  }

  const body = await readJsonBody(req)
  const password =
    typeof body === 'object' && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)['password']
      : undefined

  if (typeof password !== 'string' || password.length === 0) {
    throw new ApiError(400, 'invalid_payload', 'Enviá { "password": "..." } en el cuerpo JSON.')
  }

  if (!verifyAdminPassword(env, password)) {
    recordLoginFailure(key)
    throw new ApiError(401, 'invalid_credentials', 'Contraseña incorrecta.')
  }

  clearLoginFailures(key)
  const session = createAdminSession(env)
  if (!session) {
    throw new ApiError(503, 'admin_not_configured', 'No se pudo crear la sesión: falta ADMIN_PASSWORD.')
  }

  sendJson(res, 200, { data: session })
}

function handleSession(req: IncomingMessage, res: ServerResponse, env: Env): void {
  const session = requireSession(req, env)
  sendJson(res, 200, { data: { valid: true, expiresAt: session.expiresAt } })
}

function handleLogout(req: IncomingMessage, res: ServerResponse): void {
  const token = bearerToken(req)
  if (token) revokeAdminSession(token)
  // Idempotente a propósito: el cliente puede limpiar su token aunque ya haya expirado.
  sendJson(res, 200, { data: { revoked: true } })
}

// ── CRUD del panel ─────────────────────────────────────────────────────────

async function adminList(resource: string, env: Env): Promise<RepositoryResult<unknown>> {
  switch (resource) {
    case 'matches':
      return listAdminMatches(env)
    case 'news':
      return listAdminNews(env)
    case 'sport-members':
      return listAdminSportMembers(env)
    case 'sponsors':
      return listAdminSponsors(env)
    case 'products':
      return listAdminProducts(env)
    default:
      throw new ApiError(404, 'not_found', `Recurso desconocido: ${resource}`)
  }
}

async function adminCreate(resource: string, env: Env, body: unknown): Promise<unknown> {
  switch (resource) {
    case 'matches': {
      const parsed = parseMatchCreate(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return createMatch(env, parsed.value)
    }
    case 'news': {
      const parsed = parseNewsCreate(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return createNews(env, parsed.value)
    }
    case 'sport-members': {
      const parsed = parseSportMemberCreate(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return createSportMember(env, parsed.value)
    }
    case 'sponsors': {
      const parsed = parseSponsorCreate(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return createSponsor(env, parsed.value)
    }
    case 'products': {
      const parsed = parseProductCreate(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return createProduct(env, parsed.value)
    }
    default:
      throw new ApiError(404, 'not_found', `Recurso desconocido: ${resource}`)
  }
}

async function adminUpdate(resource: string, env: Env, id: string, body: unknown): Promise<unknown> {
  switch (resource) {
    case 'matches': {
      const parsed = parseMatchPatch(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return updateMatch(env, id, parsed.value)
    }
    case 'news': {
      const parsed = parseNewsPatch(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return updateNews(env, id, parsed.value)
    }
    case 'sport-members': {
      const parsed = parseSportMemberPatch(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return updateSportMember(env, id, parsed.value)
    }
    case 'sponsors': {
      const parsed = parseSponsorPatch(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return updateSponsor(env, id, parsed.value)
    }
    case 'products': {
      const parsed = parseProductPatch(body)
      if (!parsed.ok) throw validationError(parsed.errors)
      return updateProduct(env, id, parsed.value)
    }
    default:
      throw new ApiError(404, 'not_found', `Recurso desconocido: ${resource}`)
  }
}

async function adminDelete(resource: string, env: Env, id: string): Promise<{ id: string }> {
  switch (resource) {
    case 'matches':
      return deleteMatch(env, id)
    case 'news':
      return deleteNews(env, id)
    case 'sport-members':
      return deleteSportMember(env, id)
    case 'sponsors':
      return deleteSponsor(env, id)
    case 'products':
      return deleteProduct(env, id)
    default:
      throw new ApiError(404, 'not_found', `Recurso desconocido: ${resource}`)
  }
}

function sendAdminResult(res: ServerResponse, status: number, data: unknown): void {
  res.setHeader('x-data-source', 'db')
  sendJson(res, status, { data, source: 'db' })
}

// ── Router ─────────────────────────────────────────────────────────────────

async function routeApiRequest(req: IncomingMessage, res: ServerResponse, env: Env): Promise<void> {
  const method = (req.method ?? 'GET').toUpperCase()
  const url = new URL(req.url ?? '/', 'http://localhost')
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname

  const newsArticleRoute = /^\/api\/news\/([^/]+)$/.exec(path)
  if (newsArticleRoute) {
    if (method !== 'GET' && method !== 'HEAD') throw methodNotAllowed('GET, HEAD')
    const slug = decodeId(newsArticleRoute[1] ?? '')
    const result = await getNewsBySlug(env, slug)
    res.setHeader('x-data-source', result.source)
    sendJson(res, 200, result)
    return
  }

  const contentHandler = contentRoutes[path]
  if (contentHandler) {
    if (method !== 'GET' && method !== 'HEAD') throw methodNotAllowed('GET, HEAD')
    const result = await contentHandler(env, url)
    res.setHeader('x-data-source', result.source)
    sendJson(res, 200, result)
    return
  }

  if (path === '/api/auth/login') {
    if (method !== 'POST') throw methodNotAllowed('POST')
    await handleLogin(req, res, env)
    return
  }

  if (path === '/api/sponsor-inquiries') {
    if (method !== 'POST') throw methodNotAllowed('POST')
    const parsed = parseSponsorInquiry(await readJsonBody(req))
    if (!parsed.ok) throw validationError(parsed.errors)
    const data = await createSponsorInquiry(env, parsed.value)
    res.setHeader('x-data-source', 'db')
    sendJson(res, 201, { data, source: 'db' })
    return
  }

  if (path === '/api/auth/session') {
    if (method !== 'GET') throw methodNotAllowed('GET')
    handleSession(req, res, env)
    return
  }

  if (path === '/api/auth/logout') {
    if (method !== 'POST') throw methodNotAllowed('POST')
    handleLogout(req, res)
    return
  }

  const adminRoute = ADMIN_ROUTE.exec(path)
  if (adminRoute) {
    const resource = adminRoute[1] ?? ''
    if (!ADMIN_RESOURCES.has(resource)) {
      throw new ApiError(404, 'not_found', `Recurso desconocido: ${resource}`)
    }

    requireSession(req, env)

    const rawId = adminRoute[2]
    if (rawId === undefined) {
      if (method === 'GET') {
        const result = await adminList(resource, env)
        res.setHeader('x-data-source', result.source)
        sendJson(res, 200, result)
        return
      }
      if (method === 'POST') {
        const body = await readJsonBody(req)
        const data = await adminCreate(resource, env, body)
        sendAdminResult(res, 201, data)
        return
      }
      throw methodNotAllowed('GET, POST')
    }

    const id = decodeId(rawId)
    if (method === 'PATCH') {
      const body = await readJsonBody(req)
      const data = await adminUpdate(resource, env, id, body)
      sendAdminResult(res, 200, data)
      return
    }
    if (method === 'DELETE') {
      const data = await adminDelete(resource, env, id)
      sendAdminResult(res, 200, data)
      return
    }
    throw methodNotAllowed('PATCH, DELETE')
  }

  throw new ApiError(404, 'not_found', `Ruta no encontrada: ${path}`)
}

/**
 * Punto de entrada de la API independiente del runtime.
 * Lo usan tanto el plugin de Vite (dev/preview) como la función de Vercel.
 */
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
): Promise<void> {
  try {
    await routeApiRequest(req, res, env)
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (!res.headersSent) {
        sendJson(res, error.status, {
          error: {
            code: error.code,
            message: error.message,
            ...(error.details ? { details: error.details } : {}),
          },
        })
      } else {
        res.end()
      }
      return
    }

    console.error('[club-olimpo/api] error:', error)
    if (!res.headersSent) {
      sendJson(res, 500, {
        error: { code: 'internal_error', message: 'Error interno de la API.' },
      })
    } else {
      res.end()
    }
  }
}

function registerApi(middlewares: Connect.Server, env: Env): void {
  middlewares.use((req, res, next) => {
    const path = (req.url ?? '').split('?')[0] ?? ''
    if (!path.startsWith('/api/')) {
      next()
      return
    }

    void handleApiRequest(req, res, env)
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
