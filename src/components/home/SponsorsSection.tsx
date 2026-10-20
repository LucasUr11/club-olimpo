import { Handshake } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import ButtonLink from '../ui/ButtonLink'
import { useApi } from '../../hooks/useApi'
import { siteLinks, fixtures } from '../../../shared/fixtures'
import { cn } from '../../lib/cn'
import { SPONSOR_TIER_LABELS, SPONSOR_TIERS, type Sponsor } from '../../../shared/types'

const TIER_BORDER: Record<Sponsor['tier'], string> = {
  principal: 'border-amarillo ring-1 ring-amarillo/40',
  oficial: 'border-slate-200',
  colaborador: 'border-dashed border-slate-300',
}

/** Franja de patrocinadores con marquesina animada (pausa al hover). */
export default function SponsorsSection() {
  const { data: sponsors } = useApi<Sponsor[]>('/api/sponsors', fixtures.sponsors)

  // Duplicamos la lista para lograr el loop continuo de la marquesina.
  const marqueeItems = [...sponsors, ...sponsors]

  return (
    <section
      id="sponsors"
      className="scroll-mt-28 border-y border-slate-200 bg-hueso py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          align="center"
          eyebrow="Espacio de sponsors"
          title="Ellos hacen posible al Chuchumengo"
          description="Agradecemos a los comercios y empresas de Laborde y la región que acompañan al club temporada a temporada."
        />
      </div>

      {/* Marquesina */}
      <div className="mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex w-max gap-4 pr-4">
          {marqueeItems.map((sponsor, position) => (
            <div
              key={`${sponsor.id}-${position}`}
              aria-hidden={position >= sponsors.length}
              className={cn(
                'flex h-24 w-60 shrink-0 flex-col items-center justify-center rounded-xl border bg-white px-5 text-center transition hover:-translate-y-1 hover:shadow-lg hover:shadow-azul/10',
                TIER_BORDER[sponsor.tier],
              )}
            >
              <span className="font-display text-lg font-bold uppercase leading-tight tracking-wide text-azul">
                {sponsor.name}
              </span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.2em] text-slate-400">
                {SPONSOR_TIER_LABELS[sponsor.tier]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda + CTA */}
      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center gap-5 px-4 md:px-6">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-widest text-slate-500">
          {SPONSOR_TIERS.map((tier) => (
            <li key={tier} className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  'h-3 w-3 rounded-full border',
                  tier === 'principal'
                    ? 'border-amarillo bg-amarillo'
                    : tier === 'oficial'
                      ? 'border-slate-300 bg-white'
                      : 'border-dashed border-slate-400 bg-white',
                )}
              />
              {SPONSOR_TIER_LABELS[tier]}
            </li>
          ))}
        </ul>

        <ButtonLink
          href={siteLinks.sponsorship}
          variant="outline-dark"
          icon={<Handshake className="h-4 w-4" aria-hidden />}
        >
          Sumate como sponsor del club
        </ButtonLink>
      </div>
    </section>
  )
}
