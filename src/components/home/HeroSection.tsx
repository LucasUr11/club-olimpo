import { CalendarDays, MapPin, Play, Radio, Trophy } from 'lucide-react'
import ButtonLink from '../ui/ButtonLink'
import { useApi } from '../../hooks/useApi'
import { club, clubStats, fixtures, siteLinks } from '../../../shared/fixtures'
import { DISCIPLINE_LABELS, type Match } from '../../../shared/types'
import { formatKickoff } from '../../lib/format'

/** Banner principal con identidad + tarjeta del próximo partido. */
export default function HeroSection() {
  const { data: matches } = useApi<Match[]>('/api/matches', fixtures.matches)
  const nextMatch = matches[0]

  return (
    <section id="inicio" className="relative isolate scroll-mt-28 overflow-hidden bg-azul-950 text-white">
      {/* Fondo decorativo */}
      <div className="pattern-stripes absolute inset-0 opacity-60" aria-hidden />
      <div
        className="absolute -left-40 -top-40 h-104 w-104 rounded-full bg-amarillo/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-52 -right-32 h-120 w-120 rounded-full bg-azul-700/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* Columna principal */}
        <div className="animate-fade-in-up">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-amarillo/40 bg-amarillo/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amarillo">
            <span className="h-1.5 w-1.5 rounded-full bg-amarillo" aria-hidden />
            Temporada 2026 · Laborde, Córdoba
          </p>

          <h1 className="mt-6 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-6xl md:text-7xl">
            Historia <span className="text-amarillo">azul y amarilla</span>
            <br />
            desde 1911
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 md:text-lg">
            {club.fullName}. Fútbol, inferiores, otras disciplinas y vida social en el corazón del
            sur cordobés. Seguí al Chuchumengo partido a partido.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="/"
              state={{ scrollTo: 'disciplinas' }}
              variant="accent"
              size="lg"
              icon={<Trophy className="h-5 w-5" aria-hidden />}
            >
              Explorar disciplinas
            </ButtonLink>
            <ButtonLink
              href="/"
              state={{ scrollTo: 'streaming' }}
              variant="outline-light"
              size="lg"
              icon={<Play className="h-5 w-5" aria-hidden />}
            >
              Canal en vivo
            </ButtonLink>
          </div>

          {/* Cifras institucionales */}
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {clubStats.map((stat) => (
              <div key={stat.label} className="bg-azul-950/85 px-3 py-4 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="font-display text-3xl font-extrabold leading-none text-amarillo">
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

        {/* Tarjeta del próximo partido */}
        {nextMatch ? <FeaturedMatchCard match={nextMatch} /> : null}
      </div>
    </section>
  )
}

function FeaturedMatchCard({ match }: { match: Match }) {
  const kickoff = formatKickoff(match.kickoff)

  return (
    <article
      className="animate-fade-in-up overflow-hidden rounded-3xl bg-white text-slate-800 shadow-2xl shadow-black/40 ring-1 ring-white/15"
      aria-label="Próximo partido"
    >
      <div className="flex items-center justify-between gap-3 bg-amarillo px-5 py-3">
        <span className="inline-flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-[0.2em] text-azul">
          <Radio className="h-4 w-4" aria-hidden />
          Próximo partido
        </span>
        <span className="rounded-full bg-azul px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {DISCIPLINE_LABELS[match.discipline]}
        </span>
      </div>

      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {match.competition}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-display text-xl font-extrabold uppercase text-azul">
              Olimpo
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
              {match.team}
            </p>
          </div>

          <span className="shrink-0 font-display text-3xl font-extrabold italic text-slate-300">
            vs
          </span>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-display text-xl font-extrabold uppercase text-slate-800">
              {match.opponent}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
              {match.isHome ? 'Olimpo recibe' : 'Olimpo visita'}
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-2.5 rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center gap-2.5 text-slate-600">
            <CalendarDays className="h-4 w-4 shrink-0 text-azul" aria-hidden />
            <dd>
              <span className="font-medium capitalize">{kickoff.fullLabel}</span>
              <span className="text-slate-400"> · {kickoff.timeLabel} hs</span>
            </dd>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <MapPin className="h-4 w-4 shrink-0 text-azul" aria-hidden />
            <dd className="truncate">{match.venue ?? club.stadium}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">
            {club.stadium} · Laborde
          </span>
          <a
            href={siteLinks.streaming}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-azul transition hover:text-amarillo-dark"
          >
            <Play className="h-4 w-4" aria-hidden />
            Ver en vivo
          </a>
        </div>
      </div>
    </article>
  )
}
