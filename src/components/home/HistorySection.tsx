import { useState } from 'react'
import SectionHeading from '../ui/SectionHeading'
import { useApi } from '../../hooks/useApi'
import { fixtures } from '../../../shared/fixtures'
import type { HistoryMilestone } from '../../../shared/types'

/** Hitos visibles antes de expandir la línea de tiempo. */
const INITIAL_VISIBLE = 6

/** Historia y fundación: datos reales de la institución + línea de tiempo. */
export default function HistorySection() {
  const { data: milestones } = useApi<HistoryMilestone[]>('/api/history', fixtures.history)
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? milestones : milestones.slice(0, INITIAL_VISIBLE)
  const canExpand = milestones.length > INITIAL_VISIBLE

  return (
    <section id="historia" className="pattern-stripes-dark scroll-mt-28 bg-hueso py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Columna introductoria */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              eyebrow="Historia y fundación"
              title="Del primer equipo a un centenario"
              description="El 30 de agosto de 1911, un grupo de vecinos —encabezado por los hermanos Bracamonte, oriundos de Bahía Blanca— fundó Olimpo Foot Ball Club. Los colores azul y amarillo y el nombre tomaron como modelo al Club Olimpo de su ciudad de origen."
            />

            <div className="mt-8 overflow-hidden rounded-2xl bg-azul text-white shadow-xl shadow-azul/20">
              <p className="border-b border-white/10 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amarillo">
                Datos de la fundación
              </p>
              <dl className="divide-y divide-white/10 text-sm">
                <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                  <dt className="text-white/55">Fecha</dt>
                  <dd className="font-semibold">30 de agosto de 1911</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                  <dt className="text-white/55">Nombre original</dt>
                  <dd className="text-right font-semibold">Olimpo Foot Ball Club</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                  <dt className="text-white/55">Fundadores</dt>
                  <dd className="text-right font-semibold">Hermanos Bracamonte y vecinos</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                  <dt className="text-white/55">Apodos</dt>
                  <dd className="text-right font-semibold">El Chuchumengo · El Matador</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Línea de tiempo */}
          <div>
            <ol className="relative space-y-6 border-l-2 border-azul/15 pl-8">
              {visible.map((milestone) => (
                <li key={milestone.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[2.6rem] top-6 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-amarillo bg-azul"
                  />
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:border-amarillo hover:shadow-lg hover:shadow-azul/5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-azul px-2.5 py-1 font-display text-lg font-extrabold leading-none text-amarillo">
                        {milestone.year}
                      </span>
                      <h3 className="font-display text-xl font-bold uppercase leading-tight text-azul">
                        {milestone.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {milestone.description}
                    </p>
                  </article>
                </li>
              ))}
            </ol>

            {canExpand ? (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="cursor-pointer rounded-full border border-azul/30 px-6 py-3 text-sm font-semibold text-azul transition hover:bg-azul hover:text-white"
                  aria-expanded={expanded}
                >
                  {expanded
                    ? 'Mostrar menos hitos'
                    : `Ver los ${milestones.length} hitos de la historia`}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
