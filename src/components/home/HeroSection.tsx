import { useEffect, useMemo, useState, type FocusEvent } from 'react'
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Newspaper,
  Pause,
  Play,
  Trophy,
  Users,
} from 'lucide-react'
import ButtonLink from '../ui/ButtonLink'
import { useApi } from '../../hooks/useApi'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { club, clubStats, fixtures, siteLinks } from '../../../shared/fixtures'
import {
  NEWS_CATEGORY_LABELS,
  type Match,
  type NewsItem,
} from '../../../shared/types'
import { formatKickoff, formatShortDate } from '../../lib/format'
import { cn } from '../../lib/cn'

const AUTOPLAY_MS = 7000
const MEMBERSHIP_LINK = `https://wa.me/${siteLinks.whatsapp}?text=${encodeURIComponent('Hola, quiero asociarme al Club Atlético Olimpo. ¿Me pueden informar cómo hacerlo?')}`

/** Carrusel principal con agenda, invitación a socios y la última novedad. */
export default function HeroSection() {
  const { data: matches } = useApi<Match[]>('/api/matches', fixtures.matches)
  const { data: news } = useApi<NewsItem[]>('/api/news', fixtures.news)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [interactionPaused, setInteractionPaused] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  const featuredMatch = useMemo(() => {
    const footballMatches = matches.filter((match) => match.discipline === 'futbol')
    const upcoming = footballMatches
      .filter((match) => match.status === 'scheduled' && new Date(match.kickoff).getTime() >= Date.now())
      .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))[0]
    const latestResult = footballMatches
      .filter((match) => match.status === 'finished' && match.homeScore !== null && match.awayScore !== null)
      .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff))[0]
    const latestMatch = [...footballMatches].sort(
      (a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff),
    )[0]

    return upcoming ?? latestResult ?? latestMatch
  }, [matches])
  const latestNews = useMemo(
    () => [...news].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0],
    [news],
  )
  const autoplayPaused = paused || interactionPaused || prefersReducedMotion

  useEffect(() => {
    if (autoplayPaused) return

    const timer = window.setInterval(() => {
      setIndex((previous) => (previous + 1) % 3)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [autoplayPaused, index])

  const goTo = (nextIndex: number): void => {
    setIndex(((nextIndex % 3) + 3) % 3)
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setInteractionPaused(false)
    }
  }

  return (
    <section id="inicio" className="relative isolate scroll-mt-28 overflow-hidden bg-azul-950 text-white">
      <div className="pattern-stripes absolute inset-0 opacity-60" aria-hidden />
      <div
        className="absolute -left-40 -top-40 h-104 w-104 rounded-full bg-amarillo/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-52 -right-32 h-120 w-120 rounded-full bg-azul-700/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 md:px-6 md:pb-16 md:pt-16">
        <div className="mb-8 max-w-3xl animate-fade-in-up">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-amarillo/40 bg-amarillo/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amarillo">
            <span className="h-1.5 w-1.5 rounded-full bg-amarillo" aria-hidden />
            Temporada 2026 · Laborde, Córdoba
          </p>
          <h1 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
            Historia <span className="text-amarillo">azul y amarilla</span> desde 1911
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
            {club.fullName}. Fútbol, inferiores, otras disciplinas y vida social en el corazón del
            sur cordobés.
          </p>
        </div>

        <div
          className="relative"
          role="group"
          aria-roledescription="carrusel"
          aria-label="Destacados del Club Atlético Olimpo"
          onMouseEnter={() => setInteractionPaused(true)}
          onMouseLeave={() => setInteractionPaused(false)}
          onFocusCapture={() => setInteractionPaused(true)}
          onBlurCapture={handleBlur}
        >
          <div
            className="relative min-h-[28rem] overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-800 shadow-2xl shadow-black/40 md:min-h-[25rem]"
            aria-live="polite"
            aria-atomic="true"
          >
            {index === 0 ? <MatchSlide match={featuredMatch} /> : null}
            {index === 1 ? <MembershipSlide /> : null}
            {index === 2 ? <NewsSlide item={latestNews} /> : null}
          </div>

          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Destacado anterior"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-white/30 bg-azul/90 p-2 text-white shadow-lg transition hover:border-amarillo hover:bg-amarillo hover:text-azul sm:left-5 sm:p-3"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente destacado"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-white/30 bg-azul/90 p-2 text-white shadow-lg transition hover:border-amarillo hover:bg-amarillo hover:text-azul sm:right-5 sm:p-3"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="group" aria-label="Elegir destacado">
            {['Deportes', 'Socios', 'Novedades'].map((label, slideIndex) => (
              <button
                key={label}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`Ver destacado de ${label.toLowerCase()}`}
                aria-current={slideIndex === index}
                className={cn(
                  'h-2.5 cursor-pointer rounded-full transition-all',
                  slideIndex === index
                    ? 'w-9 bg-amarillo'
                    : 'w-2.5 bg-white/35 hover:bg-white/70',
                )}
              />
            ))}
            <span className="sr-only" aria-live="polite">
              {`Destacado ${index + 1} de 3`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? 'Reanudar carrusel' : 'Pausar carrusel'}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-amarillo hover:text-amarillo"
          >
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
            <span className="hidden sm:inline">{paused ? 'Reanudar' : 'Pausar'}</span>
          </button>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
          {clubStats.map((stat) => (
            <div key={stat.label} className="bg-azul-950/85 px-3 py-4 text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="font-display text-2xl font-extrabold leading-none text-amarillo md:text-3xl">
                  {stat.value.toLocaleString('es-AR')}
                </span>
                <span className="mt-1.5 block text-[10px] uppercase tracking-wider text-white/55">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function MatchSlide({ match }: { match: Match | undefined }) {
  const hasResult = match?.status === 'finished' && match.homeScore !== null && match.awayScore !== null
  const isUpcoming = match?.status === 'scheduled' && Date.parse(match.kickoff) >= Date.now()
  const kickoff = match ? formatKickoff(match.kickoff) : null

  return (
    <article className="grid h-full min-h-[28rem] md:min-h-[25rem] md:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-center p-8 sm:p-12 md:p-14">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-amarillo px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-azul">
          <Trophy className="h-4 w-4" aria-hidden />
          Deportes · Fútbol masculino
        </p>
        <h2 className="mt-5 font-display text-3xl font-extrabold uppercase leading-[0.95] text-azul sm:text-4xl md:text-5xl">
          {hasResult ? 'Último resultado' : isUpcoming ? 'Próximo encuentro' : 'Encuentro destacado'}
        </h2>
        {match ? (
          <>
            <p className="mt-3 text-sm font-medium text-slate-500">{match.competition} · {match.team}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-2xl font-extrabold uppercase text-azul sm:text-3xl">
              <span>Olimpo</span>
              {hasResult ? (
                <span className="rounded-xl bg-azul px-3 py-1 text-amarillo">
                  {match.homeScore} – {match.awayScore}
                </span>
              ) : (
                <span className="text-slate-300">vs</span>
              )}
              <span className="text-slate-800">{match.opponent}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-azul" aria-hidden />
                <span className="capitalize">{kickoff?.fullLabel}</span> · {kickoff?.timeLabel} hs
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-azul" aria-hidden />
                {match.venue ?? club.stadium}
              </span>
            </div>
          </>
        ) : (
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-500">
            Todavía no hay encuentros destacados. Consultá la agenda del fútbol masculino.
          </p>
        )}
        <ButtonLink
          href="/deportes/futbol"
          variant="primary"
          size="md"
          className="mt-7 w-fit"
          icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        >
          Ver agenda de fútbol
        </ButtonLink>
      </div>
      <div className="relative hidden overflow-hidden bg-azul md:grid md:place-items-center">
        <div className="pattern-stripes absolute inset-0 opacity-80" aria-hidden />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amarillo/15 blur-3xl" aria-hidden />
        <img
          src="/olimpo-logo.png"
          alt=""
          className="relative h-48 w-48 object-contain drop-shadow-2xl lg:h-60 lg:w-60"
        />
        <p className="absolute bottom-8 font-display text-2xl font-extrabold uppercase tracking-widest text-white/80">
          Siempre Olimpo
        </p>
      </div>
    </article>
  )
}

function MembershipSlide() {
  return (
    <article className="relative grid h-full min-h-[28rem] overflow-hidden bg-azul text-white md:min-h-[25rem] md:grid-cols-[1.1fr_0.9fr]">
      <div className="pattern-stripes absolute inset-0 opacity-40" aria-hidden />
      <div className="relative flex flex-col justify-center p-8 sm:p-12 md:p-14">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-amarillo/40 bg-amarillo/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amarillo">
          <Users className="h-4 w-4" aria-hidden />
          Comunidad Olimpo
        </p>
        <h2 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl md:text-6xl">
          Ser parte <span className="text-amarillo">lo cambia todo</span>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
          Sumate a la familia azul y amarilla y acompañá el crecimiento del club, dentro y fuera de la cancha.
        </p>
        <ButtonLink
          href={MEMBERSHIP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          variant="accent"
          size="lg"
          className="mt-7 w-fit"
          icon={<ArrowRight className="h-5 w-5" aria-hidden />}
        >
          Quiero asociarme
        </ButtonLink>
        <p className="mt-3 text-xs text-white/55">Escribinos por WhatsApp y te contamos cómo sumarte.</p>
      </div>
      <div className="relative hidden min-h-64 items-center justify-center overflow-hidden bg-azul-950/40 md:flex">
        <div className="absolute h-64 w-64 rounded-full border border-amarillo/25 sm:h-72 sm:w-72" aria-hidden />
        <div className="absolute h-48 w-48 rounded-full border border-white/10 sm:h-56 sm:w-56" aria-hidden />
        <img
          src="/olimpo-logo.png"
          alt=""
          className="relative h-40 w-40 object-contain drop-shadow-2xl lg:h-52 lg:w-52"
        />
      </div>
    </article>
  )
}

function NewsSlide({ item }: { item: NewsItem | undefined }) {
  return (
    <article className="grid h-full min-h-[28rem] md:min-h-[25rem] md:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-center p-8 sm:p-12 md:p-14">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-amarillo px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-azul">
          <Newspaper className="h-4 w-4" aria-hidden />
          Novedades del club
        </p>
        {item ? (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-azul/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-azul">
                {NEWS_CATEGORY_LABELS[item.category]}
              </span>
              <time dateTime={item.publishedAt} className="text-xs font-medium text-slate-400">
                {formatShortDate(item.publishedAt)}
              </time>
            </div>
            <h2 className="mt-4 font-display text-3xl font-extrabold uppercase leading-[0.95] text-azul sm:text-4xl md:text-5xl">
              {item.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">{item.excerpt}</p>
            <ButtonLink
              href={`/noticias/${encodeURIComponent(item.slug)}`}
              variant="primary"
              size="md"
              className="mt-7 w-fit"
              icon={<ArrowRight className="h-4 w-4" aria-hidden />}
            >
              Leer la noticia
            </ButtonLink>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Pronto compartiremos nuevas noticias del club.</p>
        )}
      </div>
      <div className="relative hidden min-h-64 overflow-hidden bg-azul md:block">
        {item?.coverUrl ? (
          <>
            <img src={item.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-r from-azul/70 via-azul/10 to-transparent" aria-hidden />
          </>
        ) : (
          <>
            <div className="pattern-stripes absolute inset-0 opacity-80" aria-hidden />
            <div className="absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-amarillo/10 blur-3xl" aria-hidden />
            <div className="relative grid h-full place-items-center">
              <Newspaper className="h-32 w-32 text-amarillo/80" strokeWidth={1} aria-hidden />
            </div>
          </>
        )}
      </div>
    </article>
  )
}
