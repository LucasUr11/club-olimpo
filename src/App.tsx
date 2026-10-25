import { lazy, Suspense } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HeroSection from './components/home/HeroSection'
import NextMatches from './components/home/NextMatches'
import SportsSection from './components/home/SportsSection'
import NewsCarousel from './components/home/NewsCarousel'
import FeaturedProducts from './components/home/FeaturedProducts'
import HistorySection from './components/home/HistorySection'
import PalmaresSection from './components/home/PalmaresSection'
import SponsorsSection from './components/home/SponsorsSection'
import StreamingSection from './components/home/StreamingSection'
import { isAdminRoute, isShopRoute } from './lib/routes'

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
        <NextMatches />
        <SportsSection />
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

  return <HomePage />
}
