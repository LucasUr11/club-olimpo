import { useEffect, useState, type FocusEvent } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import AppLink from '../ui/AppLink'
import { useApi } from '../../hooks/useApi'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { fixtures } from '../../../shared/fixtures'
import { cn } from '../../lib/cn'
import { NEWS_CATEGORY_LABELS, type NewsItem } from '../../../shared/types'
import { formatShortDate } from '../../lib/format'

/** Rotación automática (ms) — 3 segundos, pausable al pasar el cursor. */
const AUTOPLAY_MS = 3000

/**
 * Slider de novedades:
 * • rota automáticamente cada 3s,
 * • se pausa con el cursor / foco o con el botón dedicado,
 * • respeta `prefers-reduced-motion`,
 * • navegable con flechas, puntos y teclado (botones semánticos).
 */
export default function NewsCarousel() {
  const { data: items } = useApi<NewsItem[]>('/api/news', fixtures.news)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  const count = items.length
  const autoplayPaused = paused || prefersReducedMotion

  // Reinicia si el índice quedó fuera de rango.
  useEffect(() => {
    if (index >= count && count > 0) {
      setIndex(0)
    }
  }, [count, index])

  // Rotación automática.
  useEffect(() => {
    if (autoplayPaused || count < 2) {
      return
    }
    const timer = window.setInterval(() => {
      setIndex((previous) => (previous + 1) % count)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [autoplayPaused, count, index])

  if (count === 0) {
    return null
  }

  const goTo = (nextIndex: number): void => {
    setIndex(((nextIndex % count) + count) % count)
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setPaused(false)
    }
  }

  return (
    <section id="noticias" className="relative scroll-mt-28 overflow-hidden bg-azul-950 py-16 text-white md:py-24">
      <div className="pattern-stripes absolute inset-0 opacity-70" aria-hidden />
      <div
        className="absolute -right-40 top-1/3 h-96 w-[24rem] rounded-full bg-azul-700/30 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            tone="dark"
            eyebrow="Novedades"
            title="Lo último del club"
            description="Resultados de inferiores, avances de obras y vida institucional, actualizados toda la semana."
          />
          <p className="hidden text-xs uppercase tracking-widest text-white/40 md:block">
            Pasa el cursor para pausar
          </p>
        </div>

        <div
          className="mt-10"
          role="group"
          aria-roledescription="carrusel"
          aria-label="Novedades del club"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={handleBlur}
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-azul-900/70 shadow-2xl shadow-black/40">
            {/* Pista de slides */}
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {items.map((item, itemIndex) => (
                <article
                  key={item.id}
                  aria-hidden={itemIndex !== index}
                  inert={itemIndex !== index}
                  className="min-w-full"
                >
                  <div className={cn('grid', item.coverUrl && 'md:grid-cols-[1.1fr_0.9fr]')}>
                    <div className="relative min-h-88 p-6 md:min-h-80 md:p-12">
                      <div className="pattern-stripes absolute inset-0 opacity-50" aria-hidden />
                      <div
                        className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amarillo/10 blur-3xl"
                        aria-hidden
                      />

                      <div className="relative flex h-full flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-amarillo px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-azul">
                            {NEWS_CATEGORY_LABELS[item.category]}
                          </span>
                          <time
                            dateTime={item.publishedAt}
                            className="text-[11px] uppercase tracking-widest text-white/50"
                          >
                            {formatShortDate(item.publishedAt)}
                          </time>
                        </div>

                        <AppLink
                          href={`/noticias/${encodeURIComponent(item.slug)}`}
                          className="group/title mt-5 block w-fit max-w-3xl rounded-sm focus-visible:outline-amarillo"
                          aria-label={`Leer noticia: ${item.title}`}
                        >
                          <h3 className="font-display text-3xl font-extrabold uppercase leading-[0.95] transition-colors group-hover/title:text-amarillo md:text-5xl">
                            {item.title}
                          </h3>
                        </AppLink>

                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
                          {item.excerpt}
                        </p>
                        <AppLink
                          href={`/noticias/${encodeURIComponent(item.slug)}`}
                          className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-amarillo px-5 py-3 text-sm font-bold text-azul transition hover:bg-amarillo-dark focus-visible:outline-white"
                          aria-label={`Leer noticia: ${item.title}`}
                        >
                          Leer noticia
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </AppLink>
                      </div>
                    </div>

                    {item.coverUrl ? (
                      <div className="relative min-h-56 overflow-hidden bg-azul-900 md:min-h-full">
                        <img
                          src={item.coverUrl}
                          alt=""
                          loading={itemIndex === 0 ? 'eager' : 'lazy'}
                          className="h-full w-full object-cover"
                        />
                        <div
                          className="absolute inset-0 bg-linear-to-t from-azul-950/60 via-transparent to-transparent md:bg-linear-to-r md:from-azul-900/40 md:to-transparent"
                          aria-hidden
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            {/* Flechas */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Noticia anterior"
                  className="absolute left-3 top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-azul-950/70 p-2.5 text-white/80 backdrop-blur transition hover:border-amarillo hover:bg-amarillo hover:text-azul sm:block"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Noticia siguiente"
                  className="absolute right-3 top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-azul-950/70 p-2.5 text-white/80 backdrop-blur transition hover:border-amarillo hover:bg-amarillo hover:text-azul sm:block"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </>
            )}
          </div>

          {/* Barra de control: puntos + contador + pausa */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {items.map((item, itemIndex) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(itemIndex)}
                  aria-label={`Ir a la noticia ${itemIndex + 1}: ${item.title}`}
                  aria-current={itemIndex === index}
                  className={cn(
                    'h-2 cursor-pointer rounded-full transition-all',
                    itemIndex === index ? 'w-8 bg-amarillo' : 'w-2 bg-white/30 hover:bg-white/60',
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-display text-sm tracking-widest text-white/50" aria-live="polite">
                {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? 'Reanudar carrusel' : 'Pausar carrusel'}
                className="cursor-pointer rounded-full border border-white/20 p-2 text-white/70 transition hover:border-amarillo hover:text-amarillo"
              >
                {paused ? (
                  <Play className="h-4 w-4" aria-hidden />
                ) : (
                  <Pause className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
