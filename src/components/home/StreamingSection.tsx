import { Check, Play } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import ButtonLink from '../ui/ButtonLink'
import { useApi } from '../../hooks/useApi'
import { fixtures, siteLinks } from '../../../shared/fixtures'
import type { Match } from '../../../shared/types'
import { homeHref } from '../../lib/routes'

const HIGHLIGHTS = ['Partidos en vivo', 'Resúmenes semanales', 'Contenido exclusivo'] as const

/** CTA del canal de streaming oficial con vista previa de reproductor. */
export default function StreamingSection() {
  const { data: matches } = useApi<Match[]>('/api/matches', fixtures.matches)
  const nextMatch = matches[0]

  return (
    <section
      id="streaming"
      className="relative scroll-mt-28 overflow-hidden bg-azul-950 py-16 text-white md:py-24"
    >
      <div className="pattern-stripes absolute inset-0 opacity-60" aria-hidden />
      <div
        className="absolute -right-40 -top-40 h-[26rem] w-[26rem] rounded-full bg-amarillo/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        {/* Copy + CTAs */}
        <div>
          <SectionHeading
            tone="dark"
            eyebrow="Olimpo TV"
            title="Viví cada partido en vivo"
            description="El canal de streaming oficial del club transmite los partidos del primer equipo, las finales de inferiores y resúmenes semanales de todas las disciplinas."
          />

          <ul className="mt-6 flex flex-wrap gap-2.5">
            {HIGHLIGHTS.map((highlight) => (
              <li
                key={highlight}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85"
              >
                <Check className="h-4 w-4 text-amarillo" aria-hidden />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href={siteLinks.streaming}
              variant="accent"
              size="lg"
              icon={<Play className="h-5 w-5" aria-hidden />}
            >
              Ir al canal oficial
            </ButtonLink>
            <ButtonLink href={homeHref('#disciplinas')} variant="outline-light" size="lg">
              Ver disciplinas
            </ButtonLink>
          </div>
        </div>

        {/* Vista previa del reproductor */}
        <div className="animate-fade-in-up overflow-hidden rounded-3xl border border-white/10 bg-azul-900/70 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75">
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              En vivo
            </span>
            <span className="text-[11px] uppercase tracking-widest text-white/40">
              Olimpo TV · Canal oficial
            </span>
          </div>

          <div className="pattern-stripes relative grid aspect-video place-items-center bg-gradient-to-br from-azul to-azul-950">
            <a
              href={siteLinks.streaming}
              aria-label="Reproducir la transmisión en vivo"
              className="grid h-20 w-20 place-items-center rounded-full bg-amarillo text-azul shadow-xl shadow-black/40 transition duration-200 hover:scale-105 hover:bg-amarillo-dark"
            >
              <Play className="h-9 w-9 translate-x-0.5" aria-hidden />
            </a>

            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-azul-950/70 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amarillo">
                Próxima transmisión
              </p>
              <p className="mt-0.5 font-display text-lg font-bold uppercase leading-tight text-white">
                {nextMatch ? `Olimpo vs ${nextMatch.opponent}` : 'Calendario de transmisiones'}
              </p>
            </div>
          </div>

          <div className="h-1.5 bg-white/10" aria-hidden>
            <div className="h-full w-1/3 bg-amarillo" />
          </div>
        </div>
      </div>
    </section>
  )
}
