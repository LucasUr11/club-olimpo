import { ArrowUpRight } from 'lucide-react'
import { DISCIPLINES, DISCIPLINE_LABELS } from '../../../shared/types'
import SectionHeading from '../ui/SectionHeading'

/** Grilla de accesos a las páginas de cada disciplina. */
export default function DisciplinesSection() {
  return (
    <section id="disciplinas" className="scroll-mt-28 bg-hueso py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          align="center"
          eyebrow="Deporte y comunidad"
          title="Nuestras disciplinas"
          description="Elegí un deporte para conocer sus equipos, agenda y novedades."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {DISCIPLINES.map((discipline) => (
            <a
              key={discipline}
              href={`/deportes/${discipline}`}
              className="group relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-3xl border border-azul/10 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amarillo hover:shadow-xl hover:shadow-azul/10 focus-visible:outline-azul"
              aria-label={`Conocer la disciplina ${DISCIPLINE_LABELS[discipline]}`}
            >
              <span className="absolute inset-x-0 top-0 h-2 bg-azul transition-colors group-hover:bg-amarillo" />
              <span className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amarillo/10 transition-transform duration-300 group-hover:scale-125" />
              <span className="relative grid h-32 w-32 place-items-center rounded-full border border-amarillo/70 bg-azul p-5 shadow-lg shadow-azul/20 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/olimpo-logo.png"
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="relative mt-5 font-display text-2xl font-extrabold uppercase leading-tight text-azul">
                {DISCIPLINE_LABELS[discipline]}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-azul/60 transition-colors group-hover:text-azul">
                Conocer más
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
