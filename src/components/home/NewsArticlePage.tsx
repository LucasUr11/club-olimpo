import Header from '../layout/Header'
import Footer from '../layout/Footer'
import { useApi } from '../../hooks/useApi'
import { fixtures } from '../../../shared/fixtures'
import {
  DISCIPLINE_LABELS,
  NEWS_CATEGORY_LABELS,
  type NewsArticle,
} from '../../../shared/types'
import { formatShortDate } from '../../lib/format'
import AppLink from '../ui/AppLink'

const FALLBACK_ARTICLES: NewsArticle[] = fixtures.news.map((item) => ({
  ...item,
  body: null,
}))

export default function NewsArticlePage({
  slug,
  onOpenSponsorInquiry,
}: {
  slug: string
  onOpenSponsorInquiry: () => void
}) {
  const fallback = FALLBACK_ARTICLES.find((item) => item.slug === slug) ?? null
  const { data: article, loading } = useApi<NewsArticle | null>(
    `/api/news/${encodeURIComponent(slug)}`,
    fallback,
  )

  return (
    <div className="min-h-screen bg-hueso">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-amarillo focus:px-4 focus:py-2 focus:font-semibold focus:text-azul"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        {loading && !article ? (
          <div className="grid min-h-[60vh] place-items-center px-4 text-center">
            <p className="text-sm font-medium text-slate-500" role="status">Cargando noticia…</p>
          </div>
        ) : article ? (
          <article className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
            <AppLink
              href="/"
              state={{ scrollTo: 'noticias' }}
              className="text-sm font-semibold text-azul transition hover:text-azul-700"
            >
              ← Volver a las novedades
            </AppLink>
            {article.coverUrl ? (
              <img
                src={article.coverUrl}
                alt=""
                className="mt-6 max-h-112 w-full rounded-3xl object-cover"
              />
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amarillo px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-azul">
                {NEWS_CATEGORY_LABELS[article.category]}
              </span>
              {article.discipline ? (
                <span className="text-xs font-medium text-slate-500">
                  {DISCIPLINE_LABELS[article.discipline]}
                </span>
              ) : null}
              <time dateTime={article.publishedAt} className="text-xs text-slate-400">
                {formatShortDate(article.publishedAt)}
              </time>
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.95] text-azul sm:text-5xl md:text-6xl">
              {article.title}
            </h1>
            <p className="mt-5 border-l-4 border-amarillo pl-4 text-lg leading-relaxed text-slate-600">
              {article.excerpt}
            </p>
            {article.body ? (
              <div className="mt-8 whitespace-pre-line text-base leading-8 text-slate-700">
                {article.body}
              </div>
            ) : null}
          </article>
        ) : (
          <section className="grid min-h-[60vh] place-items-center px-4 py-16 text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-amarillo-dark">
                Novedades
              </p>
              <h1 className="mt-3 font-display text-4xl font-extrabold uppercase text-azul">
                Noticia no encontrada
              </h1>
              <p className="mt-3 text-slate-600">El enlace puede estar desactualizado.</p>
              <AppLink
                href="/"
                state={{ scrollTo: 'noticias' }}
                className="mt-6 inline-flex rounded-full bg-azul px-5 py-3 text-sm font-semibold text-white transition hover:bg-azul-700"
              >
                Ver novedades
              </AppLink>
            </div>
          </section>
        )}
      </main>
      <Footer onOpenSponsorInquiry={onOpenSponsorInquiry} />
    </div>
  )
}
