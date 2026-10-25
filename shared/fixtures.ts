// ============================================================================
// Fixtures de demostración — datos iniciales del portal.
// ----------------------------------------------------------------------------
// Estos datos se usan en dos escenarios:
//   1. Como fuente de respaldo de la API (/api/*) cuando Turso no está
//      disponible o la tabla está vacía (el sitio nunca se ve vacío en dev).
//   2. Como semilla de la base de datos (npm run db:seed).
//
// Reemplazalos por datos oficiales o editá directamente la base en Turso.
// Los enlaces externos (tienda, streaming, redes) viven en `siteLinks`.
// ============================================================================

import { DEFAULT_PRODUCT_CATEGORIES } from './types.js'
import type {
  Achievement,
  HistoryMilestone,
  Match,
  NewsItem,
  Product,
  Sponsor,
  SportMember,
} from './types.js'

// ───────────────────────────────────────────────────────────────────────────
// Enlaces externos del sitio — REEMPLAZAR con las URLs reales
// ───────────────────────────────────────────────────────────────────────────

export const siteLinks = {
  /** URL de la tienda oficial (catálogo externo de WhatsApp). */
  shop: 'https://www.whatsapp.com/catalog/5493537685333/?app_absent=0&utm_source=ig',
  /**
   * Número de WhatsApp para cerrar los pedidos de la tienda.
   * Formato internacional, solo dígitos (54 9 353 768 5333).
   */
  whatsapp: '5493537685333',
  /** Canal oficial de streaming en vivo. */
  streaming: '#',
  /** Formulario / correo para ser sponsor. */
  sponsorship: '#',
  /** Correo de contacto institucional. */
  email: 'lucasestudios2021@gmail.com',
  instagram: 'https://www.instagram.com/olimpo.laborde/',
  facebook: 'https://www.facebook.com/AoamLaborde',
  youtube: 'https://www.youtube.com/@L%C3%A9quipe11',
} as const

// ───────────────────────────────────────────────────────────────────────────
// Datos institucionales (usados directamente por el Hero)
// ───────────────────────────────────────────────────────────────────────────

export const club = {
  name: 'Club Atlético Olimpo',
  fullName: 'Club Atlético Olimpo Asociación Mutual',
  shortName: 'C.A. Olimpo',
  foundedAt: '1911-08-30',
  city: 'Laborde, Córdoba',
  address: 'San Martín 148, Laborde, Córdoba',
  stadium: 'Estadio Coco Bordi',
  stadiumCapacity: 3000,
  league: 'Liga Regional de Fútbol Dr. Adrián Beccar Varela',
  mutualId: 'Matrícula 469 — Asociación Mutual (Córdoba)',
  nicknames: ['El Chuchumengo', 'El Matador', 'AOAM'],
} as const

/** Cifras destacadas del Hero. */
export const clubStats = [
  { value: 1911, label: 'Año de fundación' },
  { value: 16, label: 'Títulos de liga' },
  { value: 1000, label: 'Socios activos' },
  { value: 3000, label: 'Capacidad del estadio' },
] as const

// ───────────────────────────────────────────────────────────────────────────
// Próximos partidos
// ----------------------------------------------------------------------------

export const matches: Match[] = [
  {
    id: 'fx-match-1',
    discipline: 'futbol',
    team: 'Primera División',
    opponent: 'Recreativo de Laborde',
    isHome: true,
    kickoff: '2026-10-25T18:30:00-03:00',
    competition: 'Apertura 2026 — Liga Beccar Varela',
    venue: 'Estadio Coco Bordi',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 'fx-match-2',
    discipline: 'futbol',
    team: 'Reserva',
    opponent: 'Independiente de Pascanas',
    isHome: true,
    kickoff: '2026-10-25T15:30:00-03:00',
    competition: 'Apertura 2026 — Reserva',
    venue: 'Estadio Coco Bordi',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 'fx-match-3',
    discipline: 'futbol',
    team: 'Sub-17',
    opponent: 'Sporting de Laboulaye',
    isHome: false,
    kickoff: '2026-10-24T16:00:00-03:00',
    competition: 'Apertura 2026 — Inferiores',
    venue: 'Estadio Sporting, Laboulaye',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 'fx-match-4',
    discipline: 'futbol',
    team: 'Primera División',
    opponent: 'Lambert de Monte Maíz',
    isHome: false,
    kickoff: '2026-11-01T17:00:00-03:00',
    competition: 'Apertura 2026 — Liga Beccar Varela',
    venue: 'Estadio Lambert, Monte Maíz',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 'fx-match-5',
    discipline: 'futbol-femenino',
    team: 'Femenino',
    opponent: 'Recreativo (Femenino)',
    isHome: true,
    kickoff: '2026-10-31T17:00:00-03:00',
    competition: 'Torneo Femenino 2026',
    venue: 'Estadio Coco Bordi',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 'fx-match-6',
    discipline: 'basquet',
    team: 'Básquet Primera',
    opponent: 'Alumni de Laboulaye',
    isHome: true,
    kickoff: '2026-10-31T21:00:00-03:00',
    competition: 'Liga Zonal de Básquet',
    venue: 'Gimnasio del Club',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 'fx-match-7',
    discipline: 'voley',
    team: 'Vóley Primera',
    opponent: 'Recreativo (Vóley)',
    isHome: false,
    kickoff: '2026-11-07T20:00:00-03:00',
    competition: 'Torneo Zonal de Vóley',
    venue: 'Cancha Recreativo, Laborde',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 'fx-match-8',
    discipline: 'hockey',
    team: 'Hockey',
    opponent: 'Sarmiento de Pueblo Italiano',
    isHome: true,
    kickoff: '2026-11-08T10:00:00-03:00',
    competition: 'Torneo Zonal de Hockey',
    venue: 'Cancha del Club',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  },
]

// ───────────────────────────────────────────────────────────────────────────
// Noticias y novedades (Carrusel)
// ----------------------------------------------------------------------------

export const news: NewsItem[] = [
  {
    id: 'fx-news-1',
    title: 'Remontada del Chuchu: 2 a 1 ante Recreativo en el clásico',
    slug: 'remontada-clasico-laborde-2-1',
    excerpt:
      'Con dos goles en el segundo tiempo y el Coco Bordi lleno, Olimpo se quedó con el clásico de Laborde y suma tres puntos claves en el Apertura 2026.',
    category: 'primera',
    discipline: 'futbol',
    publishedAt: '2026-10-18T22:00:00-03:00',
    coverUrl: null,
  },
  {
    id: 'fx-news-2',
    title: 'Las inferiores volvieron a ganar: tres victorias en cuatro fechas',
    slug: 'inferiores-tres-victorias-cuatro-fechas',
    excerpt:
      'Sub-17, Sub-15 y Sub-13 sumaron triunfos en el fin de semana. La cantera sigue creciendo con más de 80 chicos en las categorías formativas.',
    category: 'inferiores',
    discipline: 'futbol',
    publishedAt: '2026-10-15T20:00:00-03:00',
    coverUrl: null,
  },
  {
    id: 'fx-news-3',
    title: 'Obras: avanza la iluminación LED del Estadio Coco Bordi',
    slug: 'obras-iluminacion-led-coco-bordi',
    excerpt:
      'La obra, financiada con aportes de socios y sponsors, permitirá jugar partidos nocturnos con estándares de la AFA y reducirá el consumo energético.',
    category: 'obras',
    discipline: null,
    publishedAt: '2026-10-10T18:00:00-03:00',
    coverUrl: null,
  },
  {
    id: 'fx-news-4',
    title: 'Se abrió la inscripción de socios para la temporada 2026',
    slug: 'inscripcion-socios-2026',
    excerpt:
      'La sede de San Martín 148 recibe de lunes a sábado. Socios activos, familiares y emprendedores del club pueden renovar su cuota anual.',
    category: 'institucional',
    discipline: null,
    publishedAt: '2026-10-05T12:00:00-03:00',
    coverUrl: null,
  },
  {
    id: 'fx-news-5',
    title: 'El femenino estrena en la Liga con victoria de visitante',
    slug: 'femenino-estrena-victoria-visitante',
    excerpt:
      'El equipo femenino del Olimpo se impuso en su debut y ya prepara el segundo encuentro de local en el Coco Bordi.',
    category: 'institucional',
    discipline: 'futbol-femenino',
    publishedAt: '2026-09-28T19:00:00-03:00',
    coverUrl: null,
  },
]

// ───────────────────────────────────────────────────────────────────────────
// Palmarés (Vitrina de trofeos)
// ----------------------------------------------------------------------------

export const achievements: Achievement[] = [
  {
    id: 'fx-ach-1',
    discipline: 'futbol',
    title: 'Liga Regional Dr. Adrián Beccar Varela',
    count: 16,
    years: '1938, 1960, 1965, 1966, 2016',
  },
  {
    id: 'fx-ach-2',
    discipline: 'futbol',
    title: 'Campeón Provincial de Clubes',
    count: 1,
    years: '2020',
  },
  {
    id: 'fx-ach-3',
    discipline: 'futbol',
    title: 'Participación en el Torneo Regional (AFA)',
    count: 1,
    years: '2021',
  },
  {
    id: 'fx-ach-4',
    discipline: 'futbol',
    title: 'Subcampeón Provincial',
    count: 1,
    years: '2014',
  },
  {
    id: 'fx-ach-5',
    discipline: 'futbol-femenino',
    title: 'Torneo Amistad Femenino',
    count: 1,
    years: '2024',
  },
  {
    id: 'fx-ach-6',
    discipline: 'basquet',
    title: 'Liga Local de Básquet',
    count: 3,
    years: '2018, 2021, 2023',
  },
  {
    id: 'fx-ach-7',
    discipline: 'voley',
    title: 'Circuitos Zonales de Vóley',
    count: 2,
    years: '2022, 2024',
  },
  {
    id: 'fx-ach-8',
    discipline: 'hockey',
    title: 'Torneo Zonal de Hockey',
    count: 1,
    years: '2025',
  },
]

// ───────────────────────────────────────────────────────────────────────────
// Sponsors
// ----------------------------------------------------------------------------

export const sponsors: Sponsor[] = [
  { id: 'fx-spon-1', name: 'Supermercado Del Sur', tier: 'principal', url: null, logoUrl: null },
  { id: 'fx-spon-2', name: 'Metalúrgica Bracamonte', tier: 'principal', url: null, logoUrl: null },
  { id: 'fx-spon-3', name: 'Farmacia Central', tier: 'oficial', url: null, logoUrl: null },
  { id: 'fx-spon-4', name: 'Transporte San Martín', tier: 'oficial', url: null, logoUrl: null },
  { id: 'fx-spon-5', name: 'Granos del Oeste', tier: 'oficial', url: null, logoUrl: null },
  { id: 'fx-spon-6', name: 'Agropecuaria Galli', tier: 'colaborador', url: null, logoUrl: null },
  { id: 'fx-spon-7', name: 'Bazar Cavia', tier: 'colaborador', url: null, logoUrl: null },
  { id: 'fx-spon-8', name: 'Peluquería Suárez', tier: 'colaborador', url: null, logoUrl: null },
]

// ───────────────────────────────────────────────────────────────────────────
// Historia — línea de tiempo (datos basados en la historia real del club)
// ----------------------------------------------------------------------------

export const history: HistoryMilestone[] = [
  {
    id: 'fx-hist-1',
    year: 1911,
    title: 'Nace Olimpo Foot Ball Club',
    description:
      'El 30 de agosto de 1911, los hermanos Francisco y Luis Bracamonte, oriundos de Bahía Blanca, junto a un grupo de vecinos fundan el club. El nombre y los colores azul y amarillo toman como modelo al Club Olimpo de su ciudad de origen.',
  },
  {
    id: 'fx-hist-2',
    year: 1917,
    title: 'Primer estadio',
    description:
      'Se inaugura la primera cancha en terrenos donados por Eugenio Galassi (Manzana 30), con alambrado, cancha de fútbol, de básquet y dos de bochas.',
  },
  {
    id: 'fx-hist-3',
    year: 1934,
    title: 'Club Atlético Olimpo',
    description:
      'Por Acta N.º 617 la institución cambia su denominación a “Club Atlético Olimpo” para obtener la Personería Jurídica ante la Provincia de Córdoba.',
  },
  {
    id: 'fx-hist-4',
    year: 1938,
    title: 'Primer título oficial',
    description:
      'Olimpo se consagra campeón del primer torneo organizado por la Liga Regional de Fútbol Dr. Adrián Beccar Varela, con Guido Rossi como director técnico.',
  },
  {
    id: 'fx-hist-5',
    year: 1940,
    title: 'Personería Jurídica',
    description:
      'El Decreto N.º 48800 reconoce oficialmente a la institución, coronando años de gestión y crecimiento institucional.',
  },
  {
    id: 'fx-hist-6',
    year: 1946,
    title: 'Nuevo estadio',
    description:
      'El 1º de diciembre se inaugura el nuevo estadio construido sobre el terreno adquirido en 1942 en calles Lamadrid y Alvear.',
  },
  {
    id: 'fx-hist-7',
    year: 1959,
    title: 'La pileta de natación',
    description:
      'El 20 de diciembre se inaugura el natatorio del club, fruto de años de esfuerzo, accionistas y rifas organizadas por los socios.',
  },
  {
    id: 'fx-hist-8',
    year: 1961,
    title: 'Sede social en San Martín 148',
    description:
      'El 23 de noviembre se inaugura la sede social en pleno centro de Laborde, casa que sigue siendo el corazón administrativo del club.',
  },
  {
    id: 'fx-hist-9',
    year: 1988,
    title: 'Atlético Olimpo Asociación Mutual',
    description:
      'El 28 de julio, por Resolución INAM N.º 416, la institución se transforma en Asociación Mutual (Matrícula 469) y adopta su nombre actual.',
  },
  {
    id: 'fx-hist-10',
    year: 2021,
    title: 'Coco Bordi y el debut nacional',
    description:
      'Se inaugura el Estadio Coco Bordi y, tras ser Campeón Provincial 2020, Olimpo disputa por primera vez en su historia un torneo nacional de la AFA (Torneo Regional).',
  },
  {
    id: 'fx-hist-11',
    year: 2026,
    title: '115 años de historia',
    description:
      'El club sigue creciendo: más de 1000 socios, inferiores en expansión, nuevas obras y el mismo jersey azul y amarillo que eligieron sus fundadores.',
  },
]

// ───────────────────────────────────────────────────────────────────────────
// Tienda oficial (fallback y seed)
// ----------------------------------------------------------------------------

export const products: Product[] = [
  {
    id: 'fx-prod-1',
    name: 'Camiseta Titular 2026',
    slug: 'camiseta-titular-2026',
    description: 'Modelo oficial de juego con tecnología dry. Azul profundo con franjas amarillas.',
    memberPrice: 37999,
    nonMemberPrice: 42999,
    currency: 'ARS',
    category: DEFAULT_PRODUCT_CATEGORIES[1],
    imageUrl: '/fotos-olimpo/Camiseta-Primera-2026-1.png',
    imageUrls: ['/fotos-olimpo/Camiseta-Primera-2026-1.png', '/fotos-olimpo/Camiseta-Primera-2026-2.png'],
    featured: true,
  },
  {
    id: 'fx-prod-2',
    name: 'Camiseta Alternativa 2026',
    slug: 'camiseta-alternativa-2026',
    description: 'Segundo modelo oficial en amarillo con detalles azules. Edición limitada.',
    memberPrice: 37999,
    nonMemberPrice: 42999,
    currency: 'ARS',
    category: DEFAULT_PRODUCT_CATEGORIES[1],
    imageUrl: null,
    imageUrls: [],
    featured: true,
  },
  {
    id: 'fx-prod-3',
    name: 'Bufanda Azul y Amarilla',
    slug: 'bufanda-azul-y-amarilla',
    description: 'Bufanda tejida bicolor con bordado “AOAM”. Imprescindible para la hinchada.',
    memberPrice: 11999,
    nonMemberPrice: 13999,
    currency: 'ARS',
    category: DEFAULT_PRODUCT_CATEGORIES[0],
    imageUrl: null,
    imageUrls: [],
    featured: true,
  },
  {
    id: 'fx-prod-4',
    name: 'Musculosa de Entrenamiento',
    slug: 'musculosa-entrenamiento',
    description: 'Musculosa técnica del cuerpo técnico y plantel profesional.',
    memberPrice: 21999,
    nonMemberPrice: 24999,
    currency: 'ARS',
    category: DEFAULT_PRODUCT_CATEGORIES[1],
    imageUrl: null,
    imageUrls: [],
    featured: true,
  },
  {
    id: 'fx-prod-5',
    name: 'Short de Entrenamiento',
    slug: 'short-entrenamiento',
    description: 'Short liviano con logo bordado, ideal para entrenar como el primer equipo.',
    memberPrice: 15999,
    nonMemberPrice: 17999,
    currency: 'ARS',
    category: DEFAULT_PRODUCT_CATEGORIES[1],
    imageUrl: '/fotos-olimpo/Short-2026.png',
    imageUrls: ['/fotos-olimpo/Short-2026.png'],
    featured: false,
  },
]

// ───────────────────────────────────────────────────────────────────────────
// Agrupación para la API / seed
// ----------------------------------------------------------------------------

export interface FixtureSet {
  matches: Match[]
  news: NewsItem[]
  achievements: Achievement[]
  sponsors: Sponsor[]
  history: HistoryMilestone[]
  products: Product[]
  sportMembers: SportMember[]
}

export const sportMembers: SportMember[] = []

export const fixtures: FixtureSet = {
  matches,
  news,
  achievements,
  sponsors,
  history,
  products,
  sportMembers,
}
