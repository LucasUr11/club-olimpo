import { Trophy } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { useApi } from '../../hooks/useApi'
import { useCountUp } from '../../hooks/useCountUp'
import { fixtures } from '../../../shared/fixtures'
import {
  DISCIPLINES,
  DISCIPLINE_LABELS,
  type Achievement,
  type Discipline,
} from '../../../shared/types'

interface DisciplineGroup {
  discipline: Discipline
  total: number
  items: Achievement[]
}

/** Agrupa los logros por disciplina y calcula el total de títulos. */
function groupByDiscipline(achievements: Achievement[]): DisciplineGroup[] {
  const groups = new Map<Discipline, DisciplineGroup>()

  for (const achievement of achievements) {
    const existing = groups.get(achievement.discipline)
    if (existing) {
      existing.total += achievement.count
      existing.items.push(achievement)
    } else {
      groups.set(achievement.discipline, {
        discipline: achievement.discipline,
        total: achievement.count,
        items: [achievement],
      })
    }
  }

  // Orden estable según DISCIPLINES.
  return DISCIPLINES.flatMap((discipline) => {
    const group = groups.get(discipline)
    return group ? [group] : []
  })
}

/** Vitrina de trofeos: contadores animados organizados por disciplina. */
export default function PalmaresSection() {
  const { data: achievements } = useApi<Achievement[]>('/api/achievements', fixtures.achievements)
  const groups = groupByDiscipline(achievements)
  const totalTitles = achievements.reduce((sum, item) => sum + item.count, 0)
  const { ref: totalRef, value: totalValue } = useCountUp<HTMLSpanElement>(totalTitles)

  return (
    <section id="palmares" className="relative scroll-mt-28 overflow-hidden bg-azul py-16 md:py-24">
      <div className="pattern-stripes absolute inset-0 opacity-50" aria-hidden />
      <div
        className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-amarillo/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            tone="dark"
            eyebrow="Vitrina de trofeos"
            title="Palmarés"
            description="Títulos y logros obtenidos a lo largo de la historia por todas las disciplinas del club."
          />

          <div className="text-right">
            <span
              ref={totalRef}
              className="block font-display text-6xl font-extrabold leading-none text-amarillo md:text-7xl"
            >
              {totalValue}
            </span>
            <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-white/60">
              títulos y logros
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <DisciplineCard key={group.discipline} group={group} />
          ))}
        </div>
      </div>
    </section>
  )
}

function DisciplineCard({ group }: { group: DisciplineGroup }) {
  const { ref, value } = useCountUp<HTMLDivElement>(group.total)

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:border-amarillo/50 hover:bg-white/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
            {DISCIPLINE_LABELS[group.discipline]}
          </p>
          <p className="mt-2 font-display text-6xl font-extrabold leading-none text-amarillo">
            {value}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">
            {group.total === 1 ? 'título obtenido' : 'títulos obtenidos'}
          </p>
        </div>
        <span className="rounded-2xl bg-amarillo/15 p-3 text-amarillo">
          <Trophy className="h-6 w-6" aria-hidden />
        </span>
      </div>

      <ul className="mt-5 space-y-3 border-t border-white/10 pt-4">
        {group.items.map((achievement) => (
          <li key={achievement.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug text-white/90">{achievement.title}</p>
              {achievement.years ? (
                <p className="mt-0.5 text-xs text-white/45">Años: {achievement.years}</p>
              ) : null}
            </div>
            <span className="shrink-0 rounded-lg bg-white/10 px-2 py-1 font-display text-sm font-bold text-white">
              ×{achievement.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
