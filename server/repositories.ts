// ============================================================================
// Repositorios: cada endpoint tiene su función de lectura.
// ----------------------------------------------------------------------------
// Estrategia defensiva (MVP sin estados de error en la UI):
//   1. ¿Hay base configurada? → consultar Turso.
//   2. ¿La consulta falló / está vacía? → responder con fixtures de demo.
// El origen real se expone en el header `x-data-source` y en `source`.
// ============================================================================

import { fixtures } from '../shared/fixtures'
import {
  asDiscipline,
  asMatchStatus,
  asNewsCategory,
  asSponsorTier,
  type Achievement,
  type ApiSource,
  type HistoryMilestone,
  type Match,
  type MatchInput,
  type MatchPatch,
  type NewsAdminItem,
  type NewsInput,
  type NewsItem,
  type NewsPatch,
  type Product,
  type ProductAdminItem,
  type ProductInput,
  type ProductPatch,
  type Sponsor,
  type SponsorAdminItem,
  type SponsorInput,
  type SponsorPatch,
} from '../shared/types'
import { getPrisma, type Env } from './db'
import { ApiError } from './errors'

/** Respuesta estandarizada de la API. */
export interface RepositoryResult<T> {
  data: T
  source: ApiSource
}

/** Timeout defensivo: nunca dejar colgada una request por la base. */
const DB_TIMEOUT_MS = 4000

function withTimeout<T>(promise: Promise<T>, ms: number = DB_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout consultando la base de datos')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function fromFixtures<T>(data: T): RepositoryResult<T> {
  return { data, source: 'fixtures' }
}

// ── Filas de BD (tipado estructural: no acopla a los tipos generados) ──────

interface MatchRow {
  id: string
  discipline: string
  team: string
  opponent: string
  isHome: boolean
  kickoff: Date
  competition: string
  venue: string | null
  status: string
  homeScore: number | null
  awayScore: number | null
}

interface NewsRow {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string | null
  category: string
  coverUrl: string | null
  published: boolean
  publishedAt: Date
}

interface AchievementRow {
  id: string
  discipline: string
  title: string
  count: number
  years: string | null
}

interface SponsorRow {
  id: string
  name: string
  tier: string
  url: string | null
  logoUrl: string | null
  order: number
}

interface HistoryRow {
  id: string
  year: number
  title: string
  description: string
}

interface ProductRow {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  category: string
  imageUrl: string | null
  featured: boolean
  available: boolean
}

// ── Mappers BD → DTO ───────────────────────────────────────────────────────

const mapMatch = (row: MatchRow): Match => ({
  id: row.id,
  discipline: asDiscipline(row.discipline),
  team: row.team,
  opponent: row.opponent,
  isHome: row.isHome,
  kickoff: row.kickoff.toISOString(),
  competition: row.competition,
  venue: row.venue,
  status: asMatchStatus(row.status),
  homeScore: row.homeScore,
  awayScore: row.awayScore,
})

const mapNews = (row: NewsRow): NewsItem => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  category: asNewsCategory(row.category),
  publishedAt: row.publishedAt.toISOString(),
  coverUrl: row.coverUrl,
})

const mapNewsAdmin = (row: NewsRow): NewsAdminItem => ({
  ...mapNews(row),
  body: row.body,
  published: row.published,
})

const mapAchievement = (row: AchievementRow): Achievement => ({
  id: row.id,
  discipline: asDiscipline(row.discipline),
  title: row.title,
  count: row.count,
  years: row.years,
})

const mapSponsor = (row: SponsorRow): Sponsor => ({
  id: row.id,
  name: row.name,
  tier: asSponsorTier(row.tier),
  url: row.url,
  logoUrl: row.logoUrl,
})

const mapSponsorAdmin = (row: SponsorRow): SponsorAdminItem => ({
  ...mapSponsor(row),
  order: row.order,
})

const mapHistory = (row: HistoryRow): HistoryMilestone => ({
  id: row.id,
  year: row.year,
  title: row.title,
  description: row.description,
})

const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  price: row.price,
  currency: row.currency,
  category: row.category,
  imageUrl: row.imageUrl,
  featured: row.featured,
})

const mapProductAdmin = (row: ProductRow): ProductAdminItem => ({
  ...mapProduct(row),
  available: row.available,
})

// ── Endpoints de lectura ───────────────────────────────────────────────────

/** Próximos partidos del club (todas las disciplinas). */
export async function getMatches(env: Env): Promise<RepositoryResult<Match[]>> {
  try {
    const prisma = await getPrisma(env)
    if (!prisma) return fromFixtures(fixtures.matches)

    const rows = await withTimeout(
      prisma.match.findMany({
        where: { status: 'scheduled', kickoff: { gte: new Date() } },
        orderBy: { kickoff: 'asc' },
        take: 10,
      }),
    )
    if (rows.length === 0) return fromFixtures(fixtures.matches)
    return { data: rows.map(mapMatch), source: 'db' }
  } catch {
    return fromFixtures(fixtures.matches)
  }
}

/** Últimas noticias y novedades (ordenadas por fecha de publicación). */
export async function getNews(env: Env): Promise<RepositoryResult<NewsItem[]>> {
  try {
    const prisma = await getPrisma(env)
    if (!prisma) return fromFixtures(fixtures.news)

    const rows = await withTimeout(
      prisma.news.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 8,
      }),
    )
    if (rows.length === 0) return fromFixtures(fixtures.news)
    return { data: rows.map(mapNews), source: 'db' }
  } catch {
    return fromFixtures(fixtures.news)
  }
}

/** Palmarés agrupado por disciplina. */
export async function getAchievements(env: Env): Promise<RepositoryResult<Achievement[]>> {
  try {
    const prisma = await getPrisma(env)
    if (!prisma) return fromFixtures(fixtures.achievements)

    const rows = await withTimeout(
      prisma.achievement.findMany({ orderBy: [{ discipline: 'asc' }, { order: 'asc' }] }),
    )
    if (rows.length === 0) return fromFixtures(fixtures.achievements)
    return { data: rows.map(mapAchievement), source: 'db' }
  } catch {
    return fromFixtures(fixtures.achievements)
  }
}

/** Sponsors oficiales. */
export async function getSponsors(env: Env): Promise<RepositoryResult<Sponsor[]>> {
  try {
    const prisma = await getPrisma(env)
    if (!prisma) return fromFixtures(fixtures.sponsors)

    const rows = await withTimeout(
      prisma.sponsor.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] }),
    )
    if (rows.length === 0) return fromFixtures(fixtures.sponsors)
    return { data: rows.map(mapSponsor), source: 'db' }
  } catch {
    return fromFixtures(fixtures.sponsors)
  }
}

/** Línea de tiempo histórica. */
export async function getHistory(env: Env): Promise<RepositoryResult<HistoryMilestone[]>> {
  try {
    const prisma = await getPrisma(env)
    if (!prisma) return fromFixtures(fixtures.history)

    const rows = await withTimeout(prisma.historyMilestone.findMany({ orderBy: { year: 'asc' } }))
    if (rows.length === 0) return fromFixtures(fixtures.history)
    return { data: rows.map(mapHistory), source: 'db' }
  } catch {
    return fromFixtures(fixtures.history)
  }
}

/** Productos destacados de la tienda. */
export async function getProducts(env: Env): Promise<RepositoryResult<Product[]>> {
  try {
    const prisma = await getPrisma(env)
    if (!prisma) return fromFixtures(fixtures.products)

    const rows = await withTimeout(
      prisma.product.findMany({
        where: { available: true },
        orderBy: [{ featured: 'desc' }, { name: 'asc' }],
        take: 8,
      }),
    )
    if (rows.length === 0) return fromFixtures(fixtures.products)
    return { data: rows.map(mapProduct), source: 'db' }
  } catch {
    return fromFixtures(fixtures.products)
  }
}

/** Estado del backend y de la conexión con Turso (para debug/monitoreo). */
export interface HealthData {
  status: 'ok'
  database: {
    configured: boolean
    hasToken: boolean
    reachable: boolean
  }
}

export async function getHealth(env: Env): Promise<RepositoryResult<HealthData>> {
  const configured = Boolean(env['DATABASE_URL'])
  const hasToken = Boolean(env['TURSO_AUTH_TOKEN'])
  const data: HealthData = { status: 'ok', database: { configured, hasToken, reachable: false } }

  if (!configured) {
    return { data, source: 'fixtures' }
  }
  try {
    const prisma = await getPrisma(env)
    if (!prisma) return { data, source: 'fixtures' }
    await withTimeout(prisma.$queryRaw`SELECT 1`)
    data.database.reachable = true
    return { data, source: 'db' }
  } catch {
    return { data, source: 'fixtures' }
  }
}

// ── Escrituras del panel de administración ────────────────────────────────
// A diferencia de las lecturas, las escrituras NO caen a fixtures: si Turso
// no está disponible responden 503/504 para no simular un guardado exitoso.

async function requirePrisma(env: Env) {
  const prisma = await getPrisma(env)
  if (!prisma) {
    throw new ApiError(
      503,
      'db_unavailable',
      'La base de datos no está configurada. Definí DATABASE_URL y TURSO_AUTH_TOKEN para administrar el contenido.',
    )
  }
  return prisma
}

/** Extrae el mensaje original del driver libSQL (los códigos de Prisma cambian con adapters). */
function driverMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) return ''
  const meta = (error as { meta?: unknown }).meta
  if (typeof meta !== 'object' || meta === null) return ''
  const adapterError = (meta as { driverAdapterError?: unknown }).driverAdapterError
  if (typeof adapterError !== 'object' || adapterError === null) return ''
  const cause = (adapterError as { cause?: unknown }).cause
  if (typeof cause !== 'object' || cause === null) return ''
  const original = (cause as { originalMessage?: unknown }).originalMessage
  if (typeof original === 'string') return original
  const message = (cause as { message?: unknown }).message
  return typeof message === 'string' ? message : ''
}

/** Traduce errores de Prisma / red a errores de API estables. */
function dbFailure(error: unknown): never {
  if (error instanceof ApiError) throw error

  if (error instanceof Error && error.message.includes('Timeout')) {
    throw new ApiError(504, 'db_timeout', 'La base de datos tardó demasiado en responder. Intentá de nuevo.')
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : ''
  const driver = driverMessage(error).toLowerCase()

  const isUniqueViolation =
    code === 'P2002' || (code === 'P2039' && driver.includes('unique constraint'))
  const isForeignKeyViolation =
    code === 'P2003' || (code === 'P2039' && driver.includes('foreign key'))

  if (isUniqueViolation) {
    throw new ApiError(409, 'conflict', 'Ya existe un registro con ese slug (u otro valor único).')
  }
  if (code === 'P2025') {
    throw new ApiError(404, 'not_found', 'El registro solicitado no existe.')
  }
  if (isForeignKeyViolation) {
    throw new ApiError(409, 'conflict', 'La operación viola una relación existente.')
  }

  throw new ApiError(503, 'db_unavailable', 'No se pudo completar la operación en la base de datos.')
}

// ── Listados completos (incluyen borradores y no disponibles) ──────────────

export async function listAdminMatches(env: Env): Promise<RepositoryResult<Match[]>> {
  const prisma = await requirePrisma(env)
  try {
    const rows = await withTimeout(prisma.match.findMany({ orderBy: { kickoff: 'asc' } }))
    return { data: rows.map(mapMatch), source: 'db' }
  } catch (error) {
    return dbFailure(error)
  }
}

export async function listAdminNews(env: Env): Promise<RepositoryResult<NewsAdminItem[]>> {
  const prisma = await requirePrisma(env)
  try {
    const rows = await withTimeout(prisma.news.findMany({ orderBy: { publishedAt: 'desc' } }))
    return { data: rows.map(mapNewsAdmin), source: 'db' }
  } catch (error) {
    return dbFailure(error)
  }
}

export async function listAdminSponsors(env: Env): Promise<RepositoryResult<SponsorAdminItem[]>> {
  const prisma = await requirePrisma(env)
  try {
    const rows = await withTimeout(
      prisma.sponsor.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] }),
    )
    return { data: rows.map(mapSponsorAdmin), source: 'db' }
  } catch (error) {
    return dbFailure(error)
  }
}

export async function listAdminProducts(env: Env): Promise<RepositoryResult<ProductAdminItem[]>> {
  const prisma = await requirePrisma(env)
  try {
    const rows = await withTimeout(
      prisma.product.findMany({ orderBy: [{ featured: 'desc' }, { name: 'asc' }] }),
    )
    return { data: rows.map(mapProductAdmin), source: 'db' }
  } catch (error) {
    return dbFailure(error)
  }
}

// ── Partidos ───────────────────────────────────────────────────────────────

export async function createMatch(env: Env, input: MatchInput): Promise<Match> {
  const prisma = await requirePrisma(env)
  try {
    const row = await withTimeout(
      prisma.match.create({
        data: {
          discipline: input.discipline,
          team: input.team,
          opponent: input.opponent,
          isHome: input.isHome,
          kickoff: new Date(input.kickoff),
          competition: input.competition,
          venue: input.venue,
          status: input.status,
          homeScore: input.homeScore,
          awayScore: input.awayScore,
        },
      }),
    )
    return mapMatch(row)
  } catch (error) {
    return dbFailure(error)
  }
}

export async function updateMatch(env: Env, id: string, patch: MatchPatch): Promise<Match> {
  const prisma = await requirePrisma(env)
  try {
    const data: {
      discipline?: string
      team?: string
      opponent?: string
      isHome?: boolean
      kickoff?: Date
      competition?: string
      venue?: string | null
      status?: string
      homeScore?: number | null
      awayScore?: number | null
    } = {}

    if (patch.discipline !== undefined) data.discipline = patch.discipline
    if (patch.team !== undefined) data.team = patch.team
    if (patch.opponent !== undefined) data.opponent = patch.opponent
    if (patch.isHome !== undefined) data.isHome = patch.isHome
    if (patch.kickoff !== undefined) data.kickoff = new Date(patch.kickoff)
    if (patch.competition !== undefined) data.competition = patch.competition
    if (patch.venue !== undefined) data.venue = patch.venue
    if (patch.status !== undefined) data.status = patch.status
    if (patch.homeScore !== undefined) data.homeScore = patch.homeScore
    if (patch.awayScore !== undefined) data.awayScore = patch.awayScore

    const row = await withTimeout(prisma.match.update({ where: { id }, data }))
    return mapMatch(row)
  } catch (error) {
    return dbFailure(error)
  }
}

export async function deleteMatch(env: Env, id: string): Promise<{ id: string }> {
  const prisma = await requirePrisma(env)
  try {
    await withTimeout(prisma.match.delete({ where: { id } }))
    return { id }
  } catch (error) {
    return dbFailure(error)
  }
}

// ── Noticias ───────────────────────────────────────────────────────────────

export async function createNews(env: Env, input: NewsInput): Promise<NewsAdminItem> {
  const prisma = await requirePrisma(env)
  try {
    const row = await withTimeout(
      prisma.news.create({
        data: {
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          body: input.body,
          category: input.category,
          coverUrl: input.coverUrl,
          published: input.published,
          ...(input.publishedAt ? { publishedAt: new Date(input.publishedAt) } : {}),
        },
      }),
    )
    return mapNewsAdmin(row)
  } catch (error) {
    return dbFailure(error)
  }
}

export async function updateNews(env: Env, id: string, patch: NewsPatch): Promise<NewsAdminItem> {
  const prisma = await requirePrisma(env)
  try {
    const data: {
      title?: string
      slug?: string
      excerpt?: string
      body?: string | null
      category?: string
      coverUrl?: string | null
      published?: boolean
      publishedAt?: Date
    } = {}

    if (patch.title !== undefined) data.title = patch.title
    if (patch.slug !== undefined) data.slug = patch.slug
    if (patch.excerpt !== undefined) data.excerpt = patch.excerpt
    if (patch.body !== undefined) data.body = patch.body
    if (patch.category !== undefined) data.category = patch.category
    if (patch.coverUrl !== undefined) data.coverUrl = patch.coverUrl
    if (patch.published !== undefined) data.published = patch.published
    if (patch.publishedAt) data.publishedAt = new Date(patch.publishedAt)

    const row = await withTimeout(prisma.news.update({ where: { id }, data }))
    return mapNewsAdmin(row)
  } catch (error) {
    return dbFailure(error)
  }
}

export async function deleteNews(env: Env, id: string): Promise<{ id: string }> {
  const prisma = await requirePrisma(env)
  try {
    await withTimeout(prisma.news.delete({ where: { id } }))
    return { id }
  } catch (error) {
    return dbFailure(error)
  }
}

// ── Sponsors ───────────────────────────────────────────────────────────────

export async function createSponsor(env: Env, input: SponsorInput): Promise<Sponsor> {
  const prisma = await requirePrisma(env)
  try {
    const row = await withTimeout(
      prisma.sponsor.create({
        data: {
          name: input.name,
          tier: input.tier,
          url: input.url,
          logoUrl: input.logoUrl,
          order: input.order,
        },
      }),
    )
    return mapSponsor(row)
  } catch (error) {
    return dbFailure(error)
  }
}

export async function updateSponsor(env: Env, id: string, patch: SponsorPatch): Promise<Sponsor> {
  const prisma = await requirePrisma(env)
  try {
    const data: {
      name?: string
      tier?: string
      url?: string | null
      logoUrl?: string | null
      order?: number
    } = {}

    if (patch.name !== undefined) data.name = patch.name
    if (patch.tier !== undefined) data.tier = patch.tier
    if (patch.url !== undefined) data.url = patch.url
    if (patch.logoUrl !== undefined) data.logoUrl = patch.logoUrl
    if (patch.order !== undefined) data.order = patch.order

    const row = await withTimeout(prisma.sponsor.update({ where: { id }, data }))
    return mapSponsor(row)
  } catch (error) {
    return dbFailure(error)
  }
}

export async function deleteSponsor(env: Env, id: string): Promise<{ id: string }> {
  const prisma = await requirePrisma(env)
  try {
    await withTimeout(prisma.sponsor.delete({ where: { id } }))
    return { id }
  } catch (error) {
    return dbFailure(error)
  }
}

// ── Productos ──────────────────────────────────────────────────────────────

export async function createProduct(env: Env, input: ProductInput): Promise<ProductAdminItem> {
  const prisma = await requirePrisma(env)
  try {
    const row = await withTimeout(
      prisma.product.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          price: input.price,
          currency: input.currency,
          category: input.category,
          imageUrl: input.imageUrl,
          featured: input.featured,
          available: input.available,
        },
      }),
    )
    return mapProductAdmin(row)
  } catch (error) {
    return dbFailure(error)
  }
}

export async function updateProduct(env: Env, id: string, patch: ProductPatch): Promise<ProductAdminItem> {
  const prisma = await requirePrisma(env)
  try {
    const data: {
      name?: string
      slug?: string
      description?: string
      price?: number
      currency?: string
      category?: string
      imageUrl?: string | null
      featured?: boolean
      available?: boolean
    } = {}

    if (patch.name !== undefined) data.name = patch.name
    if (patch.slug !== undefined) data.slug = patch.slug
    if (patch.description !== undefined) data.description = patch.description
    if (patch.price !== undefined) data.price = patch.price
    if (patch.currency !== undefined) data.currency = patch.currency
    if (patch.category !== undefined) data.category = patch.category
    if (patch.imageUrl !== undefined) data.imageUrl = patch.imageUrl
    if (patch.featured !== undefined) data.featured = patch.featured
    if (patch.available !== undefined) data.available = patch.available

    const row = await withTimeout(prisma.product.update({ where: { id }, data }))
    return mapProductAdmin(row)
  } catch (error) {
    return dbFailure(error)
  }
}

export async function deleteProduct(env: Env, id: string): Promise<{ id: string }> {
  const prisma = await requirePrisma(env)
  try {
    await withTimeout(prisma.product.delete({ where: { id } }))
    return { id }
  } catch (error) {
    return dbFailure(error)
  }
}
