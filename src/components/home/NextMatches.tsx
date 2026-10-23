import { useMemo, useState, type ReactNode } from 'react'
import { CalendarDays, MapPin, CalendarX } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { useApi } from '../../hooks/useApi'
import { fixtures } from '../../../shared/fixtures'
import { cn } from '../../lib/cn'
import {
  DISCIPLINES,
  DISCIPLINE_LABELS,
  type Discipline,
  type Match,
} from '../../../shared/types'
import { formatKickoff } from '../../lib/format'

type Filter = Discipline | 'all'

/** Agenda del primer equipo y otras disciplinas, con filtro por disciplina. */
export default function NextMatches() {
  const { data: matches } = useApi<Match[]>('/api/matches', fixtures.matches)
  const [filter, setFilter] = useState<Filter>('all')

  const availableDisciplines = useMemo<Discipline[]>(() => {
    const present = new Set(matches.map((match) => match.discipline))
    return DISCIPLINES.filter((discipline) => present.has(discipline))
  }, [matches])

  const visible = useMemo(
    () => (filter === 'all' ? matches : matches.filter((match) => match.discipline === filter)),
    [matches, filter],
  )

  return (
    <section id="partidos" className="pattern-stripes-dark scroll-mt-28 bg-hueso py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Agenda"
            title="Próximos partidos"
            description="El calendario del primer equipo, inferiores y demás disciplinas del club."
          />
          <p className="hidden text-right md:block">
            <span className="font-display text-5xl font-extrabold leading-none text-azul">
              {matches.length}
            </span>
            <span className="mt-1 block text-[11px] uppercase tracking-widest text-slate-500">
              encuentros programados
            </span>
          </p>
        </div>

        {/* Filtros por disciplina */}
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por disciplina">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            Todas
          </FilterChip>
          {availableDisciplines.map((discipline) => (
            <FilterChip
              key={discipline}
              active={filter === discipline}
              onClick={() => setFilter(discipline)}
            >
              {DISCIPLINE_LABELS[discipline]}
            </FilterChip>
          ))}
        </div>

        {/* Listado */}
        {visible.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <CalendarX className="h-8 w-8 text-slate-300" aria-hidden />
            <p className="font-display text-xl font-bold uppercase text-azul">
              Sin partidos en esta disciplina
            </p>
            <p className="max-w-sm text-sm text-slate-500">
              No hay encuentros programados por el momento. Volvé a consultar pronto.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition',
        active
          ? 'border-azul bg-azul text-white shadow-md shadow-azul/20'
          : 'border-slate-200 bg-white text-slate-600 hover:border-azul/40 hover:text-azul',
      )}
    >
      {children}
    </button>
  )
}

function MatchCard({ match }: { match: Match }) {
  const kickoff = formatKickoff(match.kickoff)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-amarillo hover:shadow-xl hover:shadow-azul/10">
      <div className="flex items-center justify-between gap-2 bg-azul px-4 py-2.5 text-white">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
          <CalendarDays className="h-3.5 w-3.5 text-amarillo" aria-hidden />
          {kickoff.dateLabel} · {kickoff.timeLabel} hs
        </span>
        <span className="shrink-0 rounded-full bg-amarillo px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-azul">
          {DISCIPLINE_LABELS[match.discipline]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {match.team}
        </p>

        <h3 className="mt-1.5 font-display text-2xl font-bold uppercase leading-tight text-azul">
          Olimpo <span className="font-normal italic text-slate-400">vs</span>{' '}
          <span className="text-slate-800">{match.opponent}</span>
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              match.isHome ? 'bg-amarillo text-azul' : 'bg-slate-100 text-slate-500',
            )}
          >
            {match.isHome ? 'Local' : 'Visitante'}
          </span>
          <span className="text-xs text-slate-500">{match.competition}</span>
        </div>

        <footer className="mt-auto flex items-center gap-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-azul" aria-hidden />
          <span className="truncate">{match.venue ?? 'Por confirmar'}</span>
        </footer>
      </div>
    </article>
  )
}
