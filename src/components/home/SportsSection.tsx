import { useMemo, type ReactNode } from 'react'
import { CalendarDays, CalendarX, GraduationCap, MapPin, Newspaper, UserRound } from 'lucide-react'
import { fixtures } from '../../../shared/fixtures'
import {
  DISCIPLINE_LABELS,
  NEWS_CATEGORY_LABELS,
  type Discipline,
  type Match,
  type NewsItem,
  type SportMember,
} from '../../../shared/types'
import { useApi } from '../../hooks/useApi'
import { formatKickoff, formatShortDate } from '../../lib/format'
import { cn } from '../../lib/cn'
import SectionHeading from '../ui/SectionHeading'

/** Integrantes, agenda y novedades asociadas a cada disciplina. */
export default function SportsSection({ discipline }: { discipline: Discipline }) {
  const { data: members } = useApi<SportMember[]>('/api/sport-members', fixtures.sportMembers)
  const fallbackMatches = useMemo(
    () => fixtures.matches.filter((match) => match.discipline === discipline),
    [discipline],
  )
  const fallbackNews = useMemo(
    () => fixtures.news.filter((item) => item.discipline === null || item.discipline === discipline),
    [discipline],
  )
  const { data: matches } = useApi<Match[]>(
    `/api/matches?discipline=${discipline}`,
    fallbackMatches,
  )
  const { data: news } = useApi<NewsItem[]>(
    `/api/news?discipline=${discipline}`,
    fallbackNews,
  )

  const sportMembers = members.filter((member) => member.sport === discipline)
  const sportMatches = matches.filter(
    (match) => match.discipline === discipline && match.status === 'scheduled',
  )
  const sportNews = news
    .filter((item) => item.discipline === null || item.discipline === discipline)
    .slice(0, 3)

  return (
    <section className="bg-hueso py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Deporte y comunidad"
          title={DISCIPLINE_LABELS[discipline]}
          description={`Conocé a quienes forman ${DISCIPLINE_LABELS[discipline]} y encontrá su agenda y novedades.`}
        />

        <div className="mt-8">
          <section aria-labelledby="integrantes-titulo">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amarillo text-azul">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 id="integrantes-titulo" className="font-display text-2xl font-bold uppercase text-azul">
                  Profesores y alumnos
                </h3>
                <p className="text-sm text-slate-500">{DISCIPLINE_LABELS[discipline]}</p>
              </div>
            </div>

            {sportMembers.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sportMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-500">
                Pronto compartiremos quiénes integran esta disciplina.
              </p>
            )}
          </section>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <section aria-labelledby="agenda-disciplina-titulo">
              <PanelHeading
                icon={<CalendarDays className="h-5 w-5" aria-hidden />}
                title="Próximos encuentros"
                id="agenda-disciplina-titulo"
              />
              {sportMatches.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {sportMatches.slice(0, 3).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                  <CalendarX className="h-5 w-5 shrink-0 text-azul/50" aria-hidden />
                  No hay encuentros programados para esta disciplina.
                </p>
              )}
            </section>

            <section aria-labelledby="novedades-disciplina-titulo">
              <PanelHeading
                icon={<Newspaper className="h-5 w-5" aria-hidden />}
                title="Novedades"
                id="novedades-disciplina-titulo"
              />
              {sportNews.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {sportNews.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                  Todavía no hay novedades publicadas para esta disciplina.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

function PanelHeading({ icon, title, id }: { icon: ReactNode; title: string; id: string }) {
  return (
    <h3 id={id} className="flex items-center gap-2 font-display text-2xl font-bold uppercase text-azul">
      <span className="text-azul">{icon}</span>
      {title}
    </h3>
  )
}

function MemberCard({ member }: { member: SportMember }) {
  const isProfessor = member.role === 'PROFESSOR'

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amarillo hover:shadow-lg hover:shadow-azul/10">
      <div className="relative aspect-4/3 overflow-hidden bg-azul/5">
        {member.imageUrl ? (
          <img src={member.imageUrl} alt={member.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-azul/30" aria-hidden>
            <UserRound className="h-16 w-16" />
          </div>
        )}
        <span
          className={cn(
            'absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider',
            isProfessor ? 'bg-amarillo text-azul' : 'bg-azul text-white',
          )}
        >
          {isProfessor ? 'Profesor/a' : 'Alumno/a'}
        </span>
      </div>
      <div className="p-4">
        <h4 className="font-display text-xl font-bold uppercase leading-tight text-azul">{member.name}</h4>
        {member.details ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{member.details}</p> : null}
      </div>
    </article>
  )
}

function MatchCard({ match }: { match: Match }) {
  const kickoff = formatKickoff(match.kickoff)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-azul" aria-hidden />
          {kickoff.dateLabel} · {kickoff.timeLabel} hs
        </span>
        <span>{match.team}</span>
      </p>
      <h4 className="mt-2 font-display text-xl font-bold uppercase leading-tight text-azul">
        Olimpo <span className="font-normal italic text-slate-400">vs</span> {match.opponent}
      </h4>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-azul" aria-hidden />
        {match.venue ?? 'Cancha a confirmar'}
      </p>
    </article>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amarillo px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-azul">
          {item.discipline ? DISCIPLINE_LABELS[item.discipline] : 'Club'}
        </span>
        <span className="text-xs text-slate-400">{formatShortDate(item.publishedAt)}</span>
      </div>
      <h4 className="mt-2 font-display text-xl font-bold uppercase leading-tight text-azul">{item.title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.excerpt}</p>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-azul/60">
        {NEWS_CATEGORY_LABELS[item.category]}
      </p>
    </article>
  )
}
