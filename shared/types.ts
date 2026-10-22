// ============================================================================
// Capa de dominio compartida entre frontend (src/) y backend (server/).
// Tipado estricto: toda la data que circula por la API está declarada acá.
// ============================================================================

/** Disciplinas deportivas del club. */
export const DISCIPLINES = [
  'futbol',
  'futbol-femenino',
  'basquet',
  'voley',
  'hockey',
] as const
export type Discipline = (typeof DISCIPLINES)[number]

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  futbol: 'Fútbol',
  'futbol-femenino': 'Fútbol Femenino',
  basquet: 'Básquet',
  voley: 'Vóley',
  hockey: 'Hockey',
}

/** Categorías editoriales de las noticias. */
export const NEWS_CATEGORIES = ['primera', 'inferiores', 'obras', 'institucional'] as const
export type NewsCategory = (typeof NEWS_CATEGORIES)[number]

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  primera: 'Primera',
  inferiores: 'Inferiores',
  obras: 'Obras',
  institucional: 'Institucional',
}

/** Estado de un partido. */
export const MATCH_STATUSES = ['scheduled', 'finished', 'postponed'] as const
export type MatchStatus = (typeof MATCH_STATUSES)[number]

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  scheduled: 'Próximo',
  finished: 'Finalizado',
  postponed: 'Aplazado',
}

/** Niveles de patrocinio. */
export const SPONSOR_TIERS = ['principal', 'oficial', 'colaborador'] as const
export type SponsorTier = (typeof SPONSOR_TIERS)[number]

export const SPONSOR_TIER_LABELS: Record<SponsorTier, string> = {
  principal: 'Sponsors Principales',
  oficial: 'Sponsors Oficiales',
  colaborador: 'Colaboradores',
}

// ───────────────────────────────────────────────────────────────────────────
// DTOs (contratos de la API /api/*)
// ───────────────────────────────────────────────────────────────────────────

/** Partido. Las fechas viajan serializadas en ISO-8601 (string). */
export interface Match {
  id: string
  discipline: Discipline
  team: string
  opponent: string
  isHome: boolean
  kickoff: string
  competition: string
  venue: string | null
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
}

/** Noticia / novedad. */
export interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string
  category: NewsCategory
  publishedAt: string
}

/** Logro del palmarés. */
export interface Achievement {
  id: string
  discipline: Discipline
  title: string
  count: number
  years: string | null
}

/** Patrocinador. */
export interface Sponsor {
  id: string
  name: string
  tier: SponsorTier
  url: string | null
}

/** Hito de la línea de tiempo histórica. */
export interface HistoryMilestone {
  id: string
  year: number
  title: string
  description: string
}

/** Producto de la tienda. */
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  category: string
  featured: boolean
}

/** Origen de los datos devueltos por la API. */
export type ApiSource = 'db' | 'fixtures'

// ───────────────────────────────────────────────────────────────────────────
// Validadores: convierten Strings de BD en uniones de tipos (o valores por defecto)
// ───────────────────────────────────────────────────────────────────────────

export function isDiscipline(value: unknown): value is Discipline {
  return typeof value === 'string' && (DISCIPLINES as readonly string[]).includes(value)
}

export function asDiscipline(value: unknown): Discipline {
  return isDiscipline(value) ? value : 'futbol'
}

export function isNewsCategory(value: unknown): value is NewsCategory {
  return typeof value === 'string' && (NEWS_CATEGORIES as readonly string[]).includes(value)
}

export function asNewsCategory(value: unknown): NewsCategory {
  return isNewsCategory(value) ? value : 'institucional'
}

export function isMatchStatus(value: unknown): value is MatchStatus {
  return typeof value === 'string' && (MATCH_STATUSES as readonly string[]).includes(value)
}

export function asMatchStatus(value: unknown): MatchStatus {
  return isMatchStatus(value) ? value : 'scheduled'
}

export function isSponsorTier(value: unknown): value is SponsorTier {
  return typeof value === 'string' && (SPONSOR_TIERS as readonly string[]).includes(value)
}

export function asSponsorTier(value: unknown): SponsorTier {
  return isSponsorTier(value) ? value : 'oficial'
}
