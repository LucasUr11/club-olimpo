import { lazy, Suspense } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HeroSection from './components/home/HeroSection'
import DisciplinesSection from './components/home/DisciplinesSection'
import SportsSection from './components/home/SportsSection'
import NewsCarousel from './components/home/NewsCarousel'
import FeaturedProducts from './components/home/FeaturedProducts'
import HistorySection from './components/home/HistorySection'
import PalmaresSection from './components/home/PalmaresSection'
import SponsorsSection from './components/home/SponsorsSection'
import StreamingSection from './components/home/StreamingSection'
import { isAdminRoute, isShopRoute, getSportSlug } from './lib/routes'
import { DISCIPLINE_LABELS, isDiscipline } from '../shared/types'
import ButtonLink from './components/ui/ButtonLink'

// El panel y la tienda se cargan bajo demanda: la landing no descarga sus bundles.
const AdminPage = lazy(() => import('./admin/AdminPage'))
const ShopPage = lazy(() => import('./components/shop/ShopPage'))

function HomePage() {
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
        <HeroSection />
        <DisciplinesSection />
        <NewsCarousel />
        <FeaturedProducts />
        <HistorySection />
        <PalmaresSection />
        <SponsorsSection />
        <StreamingSection />
      </main>

      <Footer />
    </div>
  )
}

function ShopRoutePage() {
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
        <Suspense
          fallback={
            <div className="grid min-h-[70vh] place-items-center bg-hueso">
              <div className="flex flex-col items-center gap-4 text-azul">
                <img src="/olimpo-logo.png" alt="" className="h-16 w-auto animate-pulse" />
                <p className="text-sm font-medium text-slate-500">Cargando tienda…</p>
              </div>
            </div>
          }
        >
          <ShopPage />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

function SportRoutePage({ slug }: { slug: string }) {
  const discipline = isDiscipline(slug) ? slug : null

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
        {discipline ? (
          <>
            <div className="bg-azul px-4 py-5 text-white md:px-6">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
                <p className="font-display text-2xl font-bold uppercase">
                  {DISCIPLINE_LABELS[discipline]}
                </p>
                <ButtonLink href="/#disciplinas" variant="accent">
                  Todas las disciplinas
                </ButtonLink>
              </div>
            </div>
            <SportsSection discipline={discipline} />
          </>
        ) : (
          <section className="grid min-h-[60vh] place-items-center px-4 py-16 text-center">
            <div>
              <h1 className="font-display text-4xl font-extrabold uppercase text-azul">
                Disciplina no encontrada
              </h1>
              <p className="mt-3 text-slate-600">El enlace puede estar desactualizado.</p>
              <ButtonLink href="/#disciplinas" variant="primary" className="mt-6">
                Ver disciplinas
              </ButtonLink>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function App() {
  if (isAdminRoute()) {
    return (
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-azul">
            <div className="flex flex-col items-center gap-4 text-white">
              <img src="/olimpo-logo.png" alt="" className="h-16 w-auto animate-pulse" />
              <p className="text-sm font-medium text-white/70">Cargando panel…</p>
            </div>
          </div>
        }
      >
        <AdminPage />
      </Suspense>
    )
  }

  if (isShopRoute()) return <ShopRoutePage />

  const sportSlug = getSportSlug()
  if (sportSlug) return <SportRoutePage slug={sportSlug} />

  return <HomePage />
}
