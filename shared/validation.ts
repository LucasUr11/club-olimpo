// ============================================================================
// Validación de payloads del panel de administración.
// ----------------------------------------------------------------------------
// Funciones puras y compartidas: no lanzan excepciones, devuelven un resultado
// discriminado con los errores por campo. El frontend puede reutilizarlas para
// validar antes de enviar y la API las usa como única fuente de verdad.
//
// Convención para URLs de imágenes: el archivo se sube a un proveedor de
// almacenamiento en la nube y aquí solo viaja/valida el string de la URL
// (absoluta http/https) o una ruta local que empiece con "/".
// ============================================================================

import {
  DISCIPLINES,
  MATCH_STATUSES,
  NEWS_CATEGORIES,
  SPONSOR_TIERS,
  SPORT_MEMBER_ROLES,
  type MatchInput,
  type MatchPatch,
  type NewsInput,
  type NewsPatch,
  type ProductInput,
  type ProductPatch,
  type SponsorInput,
  type SponsorPatch,
  type SportMemberInput,
  type SportMemberPatch,
} from './types.js'

export type ValidationErrors = Record<string, string>

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ValidationErrors }

type Body = Record<string, unknown>

interface Context {
  body: Body
  errors: ValidationErrors
}

// ── Infraestructura ────────────────────────────────────────────────────────

function createContext(input: unknown): Context | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null
  return { body: input as Body, errors: {} }
}

function createInvalidBody<T>(): ValidationResult<T> {
  return { ok: false, errors: { body: 'Se esperaba un objeto JSON.' } }
}

function finish<T>(ctx: Context, value: T): ValidationResult<T> {
  return Object.keys(ctx.errors).length > 0 ? { ok: false, errors: ctx.errors } : { ok: true, value }
}

function addError(ctx: Context, field: string, message: string): void {
  if (!(field in ctx.errors)) ctx.errors[field] = message
}

function has(ctx: Context, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(ctx.body, key)
}

// ── Lectores de campos ─────────────────────────────────────────────────────

function requiredString(ctx: Context, key: string, label: string, max: number): string | undefined {
  const raw = ctx.body[key]
  if (typeof raw !== 'string' || raw.trim() === '') {
    addError(ctx, key, `${label} es obligatorio.`)
    return undefined
  }
  const value = raw.trim()
  if (value.length > max) {
    addError(ctx, key, `${label} no puede superar los ${max} caracteres.`)
    return undefined
  }
  return value
}

function optionalString(ctx: Context, key: string, label: string, max: number): string | null {
  if (!has(ctx, key)) return null
  const raw = ctx.body[key]
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'string') {
    addError(ctx, key, `${label} debe ser texto.`)
    return null
  }
  const value = raw.trim()
  if (value === '') return null
  if (value.length > max) {
    addError(ctx, key, `${label} no puede superar los ${max} caracteres.`)
    return null
  }
  return value
}

function optionalBoolean(ctx: Context, key: string, label: string): boolean | undefined {
  const raw = ctx.body[key]
  if (raw === undefined) return undefined
  if (typeof raw !== 'boolean') {
    addError(ctx, key, `${label} debe ser true o false.`)
    return undefined
  }
  return raw
}

function booleanOrDefault(ctx: Context, key: string, label: string, fallback: boolean): boolean {
  return optionalBoolean(ctx, key, label) ?? fallback
}

function optionalInteger(
  ctx: Context,
  key: string,
  label: string,
  min: number,
  max: number,
): number | undefined {
  const raw = ctx.body[key]
  if (raw === undefined) return undefined
  if (typeof raw !== 'number' || !Number.isInteger(raw)) {
    addError(ctx, key, `${label} debe ser un número entero.`)
    return undefined
  }
  if (raw < min || raw > max) {
    addError(ctx, key, `${label} debe estar entre ${min} y ${max}.`)
    return undefined
  }
  return raw
}

function requiredInteger(
  ctx: Context,
  key: string,
  label: string,
  min: number,
  max: number,
  fallback: number,
): number {
  const value = optionalInteger(ctx, key, label, min, max)
  if (value === undefined && !(key in ctx.errors)) {
    addError(ctx, key, `${label} es obligatorio.`)
    return fallback
  }
  return value ?? fallback
}

function nullableInteger(ctx: Context, key: string, label: string, min: number, max: number): number | null {
  const raw = ctx.body[key]
  if (raw === undefined || raw === null || raw === '') return null
  if (typeof raw !== 'number' || !Number.isInteger(raw)) {
    addError(ctx, key, `${label} debe ser un número entero.`)
    return null
  }
  if (raw < min || raw > max) {
    addError(ctx, key, `${label} debe estar entre ${min} y ${max}.`)
    return null
  }
  return raw
}

function requiredEnum<T extends string>(
  ctx: Context,
  key: string,
  label: string,
  options: readonly T[],
  fallback: T,
): T {
  const raw = ctx.body[key]
  if (raw === undefined) return fallback
  if (typeof raw !== 'string' || !(options as readonly string[]).includes(raw)) {
    addError(ctx, key, `${label} debe ser uno de: ${options.join(', ')}.`)
    return fallback
  }
  return raw as T
}

function nullableDiscipline(ctx: Context, key: string): SportMemberInput['sport'] | null {
  if (!has(ctx, key) || ctx.body[key] === null || ctx.body[key] === '') return null
  return requiredEnum(ctx, key, 'La disciplina', DISCIPLINES, 'futbol')
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function requiredSlug(ctx: Context, key: string, label: string, max = 120): string | undefined {
  const value = requiredString(ctx, key, label, max)
  if (value !== undefined && !SLUG_PATTERN.test(value)) {
    addError(ctx, key, `${label} solo admite minúsculas, números y guiones (ej.: mi-noticia-2026).`)
    return undefined
  }
  return value
}

function requiredDate(ctx: Context, key: string, label: string): string | undefined {
  const raw = ctx.body[key]
  if (typeof raw !== 'string' || raw.trim() === '') {
    addError(ctx, key, `${label} es obligatorio (formato ISO-8601).`)
    return undefined
  }
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) {
    addError(ctx, key, `${label} no es una fecha válida (usá formato ISO-8601).`)
    return undefined
  }
  return date.toISOString()
}

function optionalDate(ctx: Context, key: string, label: string): string | null {
  if (!has(ctx, key)) return null
  const raw = ctx.body[key]
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw !== 'string') {
    addError(ctx, key, `${label} debe ser una fecha ISO-8601.`)
    return null
  }
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) {
    addError(ctx, key, `${label} no es una fecha válida (usá formato ISO-8601).`)
    return null
  }
  return date.toISOString()
}

const MAX_URL_LENGTH = 2048

/**
 * URL de imagen: absoluta http/https (proveedor de almacenamiento en la nube)
 * o ruta local que empiece con "/". Rechaza esquemas peligrosos como
 * `javascript:` o `data:`.
 */
function parseUrl(ctx: Context, raw: unknown, key: string, label: string): string | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'string') {
    addError(ctx, key, `${label} debe ser una URL de texto.`)
    return null
  }
  const value = raw.trim()
  if (value === '') return null
  if (value.length > MAX_URL_LENGTH) {
    addError(ctx, key, `${label} no puede superar los ${MAX_URL_LENGTH} caracteres.`)
    return null
  }
  // Ruta servida por el propio sitio (útil en desarrollo).
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      addError(ctx, key, `${label} debe usar http:// o https://.`)
      return null
    }
    return url.toString()
  } catch {
    addError(ctx, key, `${label} debe ser una URL http(s) válida o una ruta local que empiece con "/".`)
    return null
  }
}

function optionalUrl(ctx: Context, key: string, label: string): string | null {
  if (!has(ctx, key)) return null
  return parseUrl(ctx, ctx.body[key], key, label)
}

const MAX_PRODUCT_IMAGES = 10

function optionalUrlArray(ctx: Context, key: string, label: string): string[] {
  if (!has(ctx, key)) return []
  const raw = ctx.body[key]
  if (!Array.isArray(raw)) {
    addError(ctx, key, `${label} debe ser una lista de URLs.`)
    return []
  }
  if (raw.length > MAX_PRODUCT_IMAGES) {
    addError(ctx, key, `${label} no puede tener más de ${MAX_PRODUCT_IMAGES} imágenes.`)
  }

  const urls = raw.slice(0, MAX_PRODUCT_IMAGES).map((value, index) =>
    parseUrl(ctx, value, key, `${label} (${index + 1})`),
  )
  return [...new Set(urls.filter((url): url is string => url !== null))]
}

const CURRENCY_PATTERN = /^[A-Z]{3}$/

// ── Partidos ───────────────────────────────────────────────────────────────

export function parseMatchCreate(input: unknown): ValidationResult<MatchInput> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()

  const value: MatchInput = {
    discipline: requiredEnum(ctx, 'discipline', 'La disciplina', DISCIPLINES, 'futbol'),
    team: requiredString(ctx, 'team', 'El equipo', 100) ?? '',
    opponent: requiredString(ctx, 'opponent', 'El rival', 120) ?? '',
    isHome: booleanOrDefault(ctx, 'isHome', 'La localía', true),
    kickoff: requiredDate(ctx, 'kickoff', 'La fecha del partido') ?? new Date().toISOString(),
    competition: requiredString(ctx, 'competition', 'La competencia', 160) ?? '',
    venue: optionalString(ctx, 'venue', 'El estadio', 160),
    status: requiredEnum(ctx, 'status', 'El estado', MATCH_STATUSES, 'scheduled'),
    homeScore: nullableInteger(ctx, 'homeScore', 'Los goles propios', 0, 999),
    awayScore: nullableInteger(ctx, 'awayScore', 'Los goles del rival', 0, 999),
  }
  return finish(ctx, value)
}

export function parseMatchPatch(input: unknown): ValidationResult<MatchPatch> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()
  const patch: MatchPatch = {}

  if (has(ctx, 'discipline')) patch.discipline = requiredEnum(ctx, 'discipline', 'La disciplina', DISCIPLINES, 'futbol')
  if (has(ctx, 'team')) {
    const team = requiredString(ctx, 'team', 'El equipo', 100)
    if (team !== undefined) patch.team = team
  }
  if (has(ctx, 'opponent')) {
    const opponent = requiredString(ctx, 'opponent', 'El rival', 120)
    if (opponent !== undefined) patch.opponent = opponent
  }
  if (has(ctx, 'isHome')) {
    const isHome = optionalBoolean(ctx, 'isHome', 'La localía')
    if (isHome !== undefined) patch.isHome = isHome
  }
  if (has(ctx, 'kickoff')) {
    const kickoff = requiredDate(ctx, 'kickoff', 'La fecha del partido')
    if (kickoff !== undefined) patch.kickoff = kickoff
  }
  if (has(ctx, 'competition')) {
    const competition = requiredString(ctx, 'competition', 'La competencia', 160)
    if (competition !== undefined) patch.competition = competition
  }
  if (has(ctx, 'venue')) patch.venue = optionalString(ctx, 'venue', 'El estadio', 160)
  if (has(ctx, 'status')) patch.status = requiredEnum(ctx, 'status', 'El estado', MATCH_STATUSES, 'scheduled')
  if (has(ctx, 'homeScore')) patch.homeScore = nullableInteger(ctx, 'homeScore', 'Los goles propios', 0, 999)
  if (has(ctx, 'awayScore')) patch.awayScore = nullableInteger(ctx, 'awayScore', 'Los goles del rival', 0, 999)

  return finishPatch(ctx, patch)
}

// ── Noticias ───────────────────────────────────────────────────────────────

export function parseNewsCreate(input: unknown): ValidationResult<NewsInput> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()

  const value: NewsInput = {
    title: requiredString(ctx, 'title', 'El título', 160) ?? '',
    slug: requiredSlug(ctx, 'slug', 'El slug') ?? '',
    excerpt: requiredString(ctx, 'excerpt', 'La bajada', 500) ?? '',
    body: optionalString(ctx, 'body', 'El cuerpo', 20_000),
    category: requiredEnum(ctx, 'category', 'La categoría', NEWS_CATEGORIES, 'institucional'),
    discipline: nullableDiscipline(ctx, 'discipline'),
    coverUrl: optionalUrl(ctx, 'coverUrl', 'La imagen de portada'),
    published: booleanOrDefault(ctx, 'published', 'La publicación', true),
    publishedAt: optionalDate(ctx, 'publishedAt', 'La fecha de publicación'),
  }
  return finish(ctx, value)
}

export function parseNewsPatch(input: unknown): ValidationResult<NewsPatch> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()
  const patch: NewsPatch = {}

  if (has(ctx, 'title')) {
    const title = requiredString(ctx, 'title', 'El título', 160)
    if (title !== undefined) patch.title = title
  }
  if (has(ctx, 'slug')) {
    const slug = requiredSlug(ctx, 'slug', 'El slug')
    if (slug !== undefined) patch.slug = slug
  }
  if (has(ctx, 'excerpt')) {
    const excerpt = requiredString(ctx, 'excerpt', 'La bajada', 500)
    if (excerpt !== undefined) patch.excerpt = excerpt
  }
  if (has(ctx, 'body')) patch.body = optionalString(ctx, 'body', 'El cuerpo', 20_000)
  if (has(ctx, 'category')) patch.category = requiredEnum(ctx, 'category', 'La categoría', NEWS_CATEGORIES, 'institucional')
  if (has(ctx, 'discipline')) patch.discipline = nullableDiscipline(ctx, 'discipline')
  if (has(ctx, 'coverUrl')) patch.coverUrl = optionalUrl(ctx, 'coverUrl', 'La imagen de portada')
  if (has(ctx, 'published')) {
    const published = optionalBoolean(ctx, 'published', 'La publicación')
    if (published !== undefined) patch.published = published
  }
  if (has(ctx, 'publishedAt')) patch.publishedAt = optionalDate(ctx, 'publishedAt', 'La fecha de publicación')

  return finishPatch(ctx, patch)
}

// ── Integrantes de disciplinas ────────────────────────────────────────────

export function parseSportMemberCreate(input: unknown): ValidationResult<SportMemberInput> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()

  const value: SportMemberInput = {
    name: requiredString(ctx, 'name', 'El nombre', 120) ?? '',
    role: requiredEnum(ctx, 'role', 'El rol', SPORT_MEMBER_ROLES, 'STUDENT'),
    sport: requiredEnum(ctx, 'sport', 'La disciplina', DISCIPLINES, 'futbol'),
    imageUrl: optionalUrl(ctx, 'imageUrl', 'La imagen'),
    details: optionalString(ctx, 'details', 'Los detalles', 1000),
  }
  return finish(ctx, value)
}

export function parseSportMemberPatch(input: unknown): ValidationResult<SportMemberPatch> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()
  const patch: SportMemberPatch = {}

  if (has(ctx, 'name')) {
    const name = requiredString(ctx, 'name', 'El nombre', 120)
    if (name !== undefined) patch.name = name
  }
  if (has(ctx, 'role')) patch.role = requiredEnum(ctx, 'role', 'El rol', SPORT_MEMBER_ROLES, 'STUDENT')
  if (has(ctx, 'sport')) patch.sport = requiredEnum(ctx, 'sport', 'La disciplina', DISCIPLINES, 'futbol')
  if (has(ctx, 'imageUrl')) patch.imageUrl = optionalUrl(ctx, 'imageUrl', 'La imagen')
  if (has(ctx, 'details')) patch.details = optionalString(ctx, 'details', 'Los detalles', 1000)

  return finishPatch(ctx, patch)
}

// ── Sponsors ───────────────────────────────────────────────────────────────

export function parseSponsorCreate(input: unknown): ValidationResult<SponsorInput> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()

  const value: SponsorInput = {
    name: requiredString(ctx, 'name', 'El nombre', 120) ?? '',
    tier: requiredEnum(ctx, 'tier', 'El nivel', SPONSOR_TIERS, 'oficial'),
    url: optionalUrl(ctx, 'url', 'El sitio web'),
    logoUrl: optionalUrl(ctx, 'logoUrl', 'El logotipo'),
    order: requiredInteger(ctx, 'order', 'El orden', 0, 9_999, 0),
  }
  return finish(ctx, value)
}

export function parseSponsorPatch(input: unknown): ValidationResult<SponsorPatch> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()
  const patch: SponsorPatch = {}

  if (has(ctx, 'name')) {
    const name = requiredString(ctx, 'name', 'El nombre', 120)
    if (name !== undefined) patch.name = name
  }
  if (has(ctx, 'tier')) patch.tier = requiredEnum(ctx, 'tier', 'El nivel', SPONSOR_TIERS, 'oficial')
  if (has(ctx, 'url')) patch.url = optionalUrl(ctx, 'url', 'El sitio web')
  if (has(ctx, 'logoUrl')) patch.logoUrl = optionalUrl(ctx, 'logoUrl', 'El logotipo')
  if (has(ctx, 'order')) {
    const order = optionalInteger(ctx, 'order', 'El orden', 0, 9_999)
    if (order !== undefined) patch.order = order
  }

  return finishPatch(ctx, patch)
}

// ── Productos ──────────────────────────────────────────────────────────────

const PRODUCT_PRICE_MAX = 100_000_000

/** El precio socio no debería superar el precio general. */
function validateProductPrices(
  ctx: Context,
  memberPrice: number | undefined,
  nonMemberPrice: number | undefined,
): void {
  if (memberPrice === undefined || nonMemberPrice === undefined) return
  if (ctx.errors['memberPrice'] || ctx.errors['nonMemberPrice']) return
  if (memberPrice > nonMemberPrice) {
    addError(ctx, 'memberPrice', 'El precio para socios no puede ser mayor que el precio para no socios.')
  }
}

export function parseProductCreate(input: unknown): ValidationResult<ProductInput> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()

  const memberPrice = requiredInteger(ctx, 'memberPrice', 'El precio para socios', 0, PRODUCT_PRICE_MAX, 0)
  const nonMemberPrice = requiredInteger(
    ctx,
    'nonMemberPrice',
    'El precio para no socios',
    0,
    PRODUCT_PRICE_MAX,
    0,
  )
  validateProductPrices(ctx, memberPrice, nonMemberPrice)
  const imageUrls = optionalUrlArray(ctx, 'imageUrls', 'Las imágenes')
  const imageUrl = has(ctx, 'imageUrls')
    ? imageUrls[0] ?? null
    : optionalUrl(ctx, 'imageUrl', 'La imagen')

  const value: ProductInput = {
    name: requiredString(ctx, 'name', 'El nombre', 120) ?? '',
    slug: requiredSlug(ctx, 'slug', 'El slug') ?? '',
    description: requiredString(ctx, 'description', 'La descripción', 3_000) ?? '',
    memberPrice,
    nonMemberPrice,
    currency: requiredCurrency(ctx),
    category: requiredString(ctx, 'category', 'La categoría', 60) ?? '',
    imageUrl,
    imageUrls: has(ctx, 'imageUrls') ? imageUrls : imageUrl ? [imageUrl] : [],
    featured: booleanOrDefault(ctx, 'featured', 'El destacado', false),
    available: booleanOrDefault(ctx, 'available', 'La disponibilidad', true),
  }
  return finish(ctx, value)
}

export function parseProductPatch(input: unknown): ValidationResult<ProductPatch> {
  const ctx = createContext(input)
  if (!ctx) return createInvalidBody()
  const patch: ProductPatch = {}

  if (has(ctx, 'name')) {
    const name = requiredString(ctx, 'name', 'El nombre', 120)
    if (name !== undefined) patch.name = name
  }
  if (has(ctx, 'slug')) {
    const slug = requiredSlug(ctx, 'slug', 'El slug')
    if (slug !== undefined) patch.slug = slug
  }
  if (has(ctx, 'description')) {
    const description = requiredString(ctx, 'description', 'La descripción', 3_000)
    if (description !== undefined) patch.description = description
  }
  const memberPrice = has(ctx, 'memberPrice')
    ? optionalInteger(ctx, 'memberPrice', 'El precio para socios', 0, PRODUCT_PRICE_MAX)
    : undefined
  if (memberPrice !== undefined) patch.memberPrice = memberPrice

  const nonMemberPrice = has(ctx, 'nonMemberPrice')
    ? optionalInteger(ctx, 'nonMemberPrice', 'El precio para no socios', 0, PRODUCT_PRICE_MAX)
    : undefined
  if (nonMemberPrice !== undefined) patch.nonMemberPrice = nonMemberPrice

  validateProductPrices(ctx, memberPrice, nonMemberPrice)

  if (has(ctx, 'currency')) patch.currency = requiredCurrency(ctx)
  if (has(ctx, 'category')) {
    const category = requiredString(ctx, 'category', 'La categoría', 60)
    if (category !== undefined) patch.category = category
  }
  if (has(ctx, 'imageUrls')) {
    const imageUrls = optionalUrlArray(ctx, 'imageUrls', 'Las imágenes')
    patch.imageUrls = imageUrls
    patch.imageUrl = imageUrls[0] ?? null
  } else if (has(ctx, 'imageUrl')) {
    const imageUrl = optionalUrl(ctx, 'imageUrl', 'La imagen')
    patch.imageUrl = imageUrl
    patch.imageUrls = imageUrl ? [imageUrl] : []
  }
  if (has(ctx, 'featured')) {
    const featured = optionalBoolean(ctx, 'featured', 'El destacado')
    if (featured !== undefined) patch.featured = featured
  }
  if (has(ctx, 'available')) {
    const available = optionalBoolean(ctx, 'available', 'La disponibilidad')
    if (available !== undefined) patch.available = available
  }

  return finishPatch(ctx, patch)
}

function requiredCurrency(ctx: Context): string {
  const raw = ctx.body['currency']
  if (raw === undefined) return 'ARS'
  if (typeof raw !== 'string' || !CURRENCY_PATTERN.test(raw.trim())) {
    addError(ctx, 'currency', 'La moneda debe ser un código ISO de 3 letras (ej.: ARS).')
    return 'ARS'
  }
  return raw.trim()
}

// ── Cierre de PATCH ────────────────────────────────────────────────────────

function finishPatch<T extends object>(ctx: Context, patch: T): ValidationResult<T> {
  if (Object.keys(ctx.errors).length === 0 && Object.keys(patch).length === 0) {
    addError(ctx, 'body', 'Enviá al menos un campo para actualizar.')
  }
  return finish(ctx, patch)
}
