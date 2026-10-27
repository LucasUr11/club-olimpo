import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
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
import SponsorInquiryModal from './components/home/SponsorInquiryModal'
import StreamingSection from './components/home/StreamingSection'
import { isAdminRoute, isShopRoute, getSportSlug } from './lib/routes'
import { DISCIPLINE_LABELS, isDiscipline } from '../shared/types'
import ButtonLink from './components/ui/ButtonLink'
import type { AppRouteState } from './components/ui/AppLink'

// El panel y la tienda se cargan bajo demanda: la landing no descarga sus bundles.
const AdminPage = lazy(() => import('./admin/AdminPage'))
const ShopPage = lazy(() => import('./components/shop/ShopPage'))

function HomePage({ onOpenSponsorInquiry }: { onOpenSponsorInquiry: () => void }) {
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
        <SponsorsSection onOpenSponsorInquiry={onOpenSponsorInquiry} />
        <StreamingSection />
      </main>

      <Footer onOpenSponsorInquiry={onOpenSponsorInquiry} />
    </div>
  )
}

function ShopRoutePage({ onOpenSponsorInquiry }: { onOpenSponsorInquiry: () => void }) {
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

      <Footer onOpenSponsorInquiry={onOpenSponsorInquiry} />
    </div>
  )
}

function SportRoutePage({
  slug,
  onOpenSponsorInquiry,
}: {
  slug: string
  onOpenSponsorInquiry: () => void
}) {
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
                <ButtonLink
                  href="/"
                  state={{ scrollTo: 'disciplinas' }}
                  variant="accent"
                >
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
              <ButtonLink
                href="/"
                state={{ scrollTo: 'disciplinas' }}
                variant="primary"
                className="mt-6"
              >
                Ver disciplinas
              </ButtonLink>
            </div>
          </section>
        )}
      </main>

      <Footer onOpenSponsorInquiry={onOpenSponsorInquiry} />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const { pathname } = location
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const openSponsorInquiry = useCallback(() => setIsInquiryOpen(true), [])
  const closeSponsorInquiry = useCallback(() => setIsInquiryOpen(false), [])

  useEffect(() => {
    const state = location.state as AppRouteState | null
    const target = state?.scrollTo ? document.getElementById(state.scrollTo) : null
    if (target) {
      const frame = requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth' }))
      return () => cancelAnimationFrame(frame)
    }

    window.scrollTo(0, 0)
  }, [location.key, location.state, pathname])

  let page: ReactNode

  if (isAdminRoute(pathname)) {
    page = (
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
  } else if (isShopRoute(pathname)) {
    page = <ShopRoutePage onOpenSponsorInquiry={openSponsorInquiry} />
  } else {
    const sportSlug = getSportSlug(pathname)

    page = sportSlug
      ? <SportRoutePage slug={sportSlug} onOpenSponsorInquiry={openSponsorInquiry} />
      : <HomePage onOpenSponsorInquiry={openSponsorInquiry} />
  }

  return (
    <>
      {page}
      {isInquiryOpen ? <SponsorInquiryModal onClose={closeSponsorInquiry} /> : null}
    </>
  )
}
