// ============================================================================
// Autenticación del panel de administración.
// ----------------------------------------------------------------------------
// Modelo simple y sin dependencias externas:
//   • La contraseña vive en ADMIN_PASSWORD (.env) y se compara en tiempo
//     constante (hash + timingSafeEqual).
//   • La sesión es un token firmado con HMAC-SHA256 (stateless), con formato
//     v1.<expiración>.<nonce>.<firma>. La firma usa SESSION_SECRET; si no está
//     definido se deriva de ADMIN_PASSWORD (cambiarla invalida las sesiones).
//   • El logout revoca el token en memoria hasta su expiración (best-effort:
//     un reinicio del proceso limpia la lista, pero el token sigue firmado).
//   • Los intentos fallidos de login se limitan por IP en memoria.
//
// Para producción con múltiples instancias conviene reemplazar la lista de
// revocación por una tabla en Turso o Redis. El resto del flujo no cambia.
// ============================================================================

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { AdminSession } from '../shared/types'
import type { Env } from './db'

const TOKEN_VERSION = 'v1'
const DEFAULT_TTL_HOURS = 12
const MIN_TTL_HOURS = 1
const MAX_TTL_HOURS = 24 * 30

// ── Configuración ──────────────────────────────────────────────────────────

function adminPassword(env: Env): string | null {
  const value = env['ADMIN_PASSWORD']?.trim()
  return value && value.length > 0 ? value : null
}

export function isAdminConfigured(env: Env): boolean {
  return adminPassword(env) !== null
}

function sessionSecret(env: Env): string {
  const explicit = env['SESSION_SECRET']?.trim()
  if (explicit && explicit.length > 0) return explicit
  return createHash('sha256')
    .update(`club-olimpo:admin:${adminPassword(env) ?? ''}`)
    .digest('hex')
}

function sessionTtlMs(env: Env): number {
  const raw = Number(env['ADMIN_SESSION_HOURS'])
  const hours = Number.isFinite(raw) ? Math.min(Math.max(raw, MIN_TTL_HOURS), MAX_TTL_HOURS) : DEFAULT_TTL_HOURS
  return hours * 60 * 60 * 1000
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

/** Comparación en tiempo constante (hashear iguala longitudes). */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b))
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

// ── Contraseña ─────────────────────────────────────────────────────────────

export function verifyAdminPassword(env: Env, candidate: unknown): boolean {
  const expected = adminPassword(env)
  if (!expected || typeof candidate !== 'string' || candidate.length === 0) return false
  return safeEqual(candidate, expected)
}

// ── Sesiones ───────────────────────────────────────────────────────────────

/** Tokens revocados (logout) hasta su expiración. */
const revokedTokens = new Map<string, number>()

function pruneRevoked(now: number): void {
  for (const [token, expiresAt] of revokedTokens) {
    if (expiresAt <= now) revokedTokens.delete(token)
  }
}

/** Crea una sesión nueva. Devuelve null si el panel no está configurado. */
export function createAdminSession(env: Env): AdminSession | null {
  if (!isAdminConfigured(env)) return null

  const expiresAtMs = Date.now() + sessionTtlMs(env)
  const nonce = randomBytes(16).toString('base64url')
  const payload = `${TOKEN_VERSION}.${Math.floor(expiresAtMs / 1000)}.${nonce}`
  const token = `${payload}.${sign(payload, sessionSecret(env))}`

  return {
    token,
    tokenType: 'Bearer',
    expiresAt: new Date(expiresAtMs).toISOString(),
  }
}

export interface VerifiedAdminSession {
  expiresAt: string
}

/** Valida firma, expiración y revocación. Devuelve null si no es válida. */
export function verifyAdminSession(env: Env, token: string): VerifiedAdminSession | null {
  if (!isAdminConfigured(env)) return null

  const parts = token.split('.')
  if (parts.length !== 4) return null

  const [version, expiresRaw, nonce, signature] = parts
  if (version !== TOKEN_VERSION || !expiresRaw || !nonce || !signature) return null

  const expiresAtSeconds = Number(expiresRaw)
  if (!Number.isSafeInteger(expiresAtSeconds)) return null

  const now = Date.now()
  if (expiresAtSeconds * 1000 <= now) return null

  pruneRevoked(now)
  if (revokedTokens.has(token)) return null

  const expected = sign(`${version}.${expiresRaw}.${nonce}`, sessionSecret(env))
  if (!safeEqual(signature, expected)) return null

  return { expiresAt: new Date(expiresAtSeconds * 1000).toISOString() }
}

/** Revoca un token hasta su expiración (logout). */
export function revokeAdminSession(token: string): void {
  const parts = token.split('.')
  if (parts.length !== 4) return
  const expiresAtSeconds = Number(parts[1])
  if (!Number.isSafeInteger(expiresAtSeconds)) return
  const now = Date.now()
  if (expiresAtSeconds * 1000 <= now) return
  revokedTokens.set(token, expiresAtSeconds * 1000)
  pruneRevoked(now)
}

// ── Límite de intentos de login (por IP, en memoria) ───────────────────────

const LOGIN_WINDOW_MS = 10 * 60 * 1000
const LOGIN_MAX_FAILURES = 5
const MAX_TRACKED_IPS = 1_000

interface LoginAttempts {
  failures: number
  resetAt: number
}

const loginAttempts = new Map<string, LoginAttempts>()

function pruneAttempts(now: number): void {
  if (loginAttempts.size < MAX_TRACKED_IPS) return
  for (const [key, entry] of loginAttempts) {
    if (entry.resetAt <= now) loginAttempts.delete(key)
  }
}

/** Milisegundos de bloqueo restantes para esa IP (0 = puede intentar). */
export function loginBlockedForMs(key: string): number {
  const now = Date.now()
  const entry = loginAttempts.get(key)
  if (!entry) return 0
  if (entry.resetAt <= now) {
    loginAttempts.delete(key)
    return 0
  }
  return entry.failures >= LOGIN_MAX_FAILURES ? entry.resetAt - now : 0
}

export function recordLoginFailure(key: string): void {
  const now = Date.now()
  pruneAttempts(now)
  const entry = loginAttempts.get(key)
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { failures: 1, resetAt: now + LOGIN_WINDOW_MS })
    return
  }
  entry.failures += 1
}

export function clearLoginFailures(key: string): void {
  loginAttempts.delete(key)
}
