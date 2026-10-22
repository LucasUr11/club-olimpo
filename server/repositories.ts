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
  type NewsItem,
  type Product,
  type Sponsor,
} from '../shared/types'
import { getPrisma, type Env } from './db'

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
  category: string
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
  featured: boolean
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
  featured: row.featured,
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
