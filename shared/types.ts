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

/** Roles de los integrantes de una disciplina. */
export const SPORT_MEMBER_ROLES = ['PROFESSOR', 'STUDENT'] as const
export type SportMemberRole = (typeof SPORT_MEMBER_ROLES)[number]

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
  discipline: Discipline | null
  publishedAt: string
  /** URL de la imagen de portada (almacenamiento en la nube o ruta local). */
  coverUrl: string | null
}

/** Noticia con los campos editoriales que solo ve el panel de administración. */
export interface NewsAdminItem extends NewsItem {
  body: string | null
  published: boolean
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
  /** URL del logotipo (almacenamiento en la nube o ruta local). */
  logoUrl: string | null
}

/** Patrocinador con el orden de aparición que solo ve el panel. */
export interface SponsorAdminItem extends Sponsor {
  order: number
}

/** Hito de la línea de tiempo histórica. */
export interface HistoryMilestone {
  id: string
  year: number
  title: string
  description: string
}

/** Profesor o alumno de una disciplina deportiva. */
export interface SportMember {
  id: string
  name: string
  role: SportMemberRole
  sport: Discipline
  imageUrl: string | null
  details: string | null
}

/** Producto de la tienda. */
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  /** Precio para socios del club (entero, sin decimales). */
  memberPrice: number
  /** Precio para personas que no son socias (entero, sin decimales). */
  nonMemberPrice: number
  currency: string
  category: string
  /** URL de la imagen (almacenamiento en la nube o ruta local). */
  imageUrl: string | null
  featured: boolean
}

/** Producto con el campo de disponibilidad que solo ve el panel de administración. */
export interface ProductAdminItem extends Product {
  available: boolean
}

/** Origen de los datos devueltos por la API. */
export type ApiSource = 'db' | 'fixtures'

// ───────────────────────────────────────────────────────────────────────────
// Payloads de escritura del panel de administración
// ----------------------------------------------------------------------------
// Las URLs de imagen son strings: el proveedor de almacenamiento en la nube
// sube el archivo y entrega la URL final; la API solo valida y persiste el
// string (no recibe archivos binarios).
// ───────────────────────────────────────────────────────────────────────────

export interface MatchInput {
  discipline: Discipline
  team: string
  opponent: string
  isHome: boolean
  /** ISO-8601. */
  kickoff: string
  competition: string
  venue: string | null
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
}
export type MatchPatch = Partial<MatchInput>

export interface NewsInput {
  title: string
  slug: string
  excerpt: string
  body: string | null
  category: NewsCategory
  discipline: Discipline | null
  coverUrl: string | null
  published: boolean
  /** ISO-8601; si es null la base usa la fecha de creación. */
  publishedAt: string | null
}
export type NewsPatch = Partial<NewsInput>

export interface SponsorInput {
  name: string
  tier: SponsorTier
  url: string | null
  logoUrl: string | null
  order: number
}
export type SponsorPatch = Partial<SponsorInput>

export interface ProductInput {
  name: string
  slug: string
  description: string
  memberPrice: number
  nonMemberPrice: number
  currency: string
  category: string
  imageUrl: string | null
  featured: boolean
  available: boolean
}
export type ProductPatch = Partial<ProductInput>

export interface SportMemberInput {
  name: string
  role: SportMemberRole
  sport: Discipline
  imageUrl: string | null
  details: string | null
}
export type SportMemberPatch = Partial<SportMemberInput>

/** Respuesta del login del panel. */
export interface AdminSession {
  token: string
  tokenType: 'Bearer'
  expiresAt: string
}

// ───────────────────────────────────────────────────────────────────────────
// Validadores: convierten Strings de BD en uniones de tipos (o valores por defecto)
// ───────────────────────────────────────────────────────────────────────────

export function isDiscipline(value: unknown): value is Discipline {
  return typeof value === 'string' && (DISCIPLINES as readonly string[]).includes(value)
}

export function isSportMemberRole(value: unknown): value is SportMemberRole {
  return typeof value === 'string' && (SPORT_MEMBER_ROLES as readonly string[]).includes(value)
}

export function asSportMemberRole(value: unknown): SportMemberRole {
  return isSportMemberRole(value) ? value : 'STUDENT'
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
