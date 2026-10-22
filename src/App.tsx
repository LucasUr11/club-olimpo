import { lazy, Suspense } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HeroSection from './components/home/HeroSection'
import NextMatches from './components/home/NextMatches'
import NewsCarousel from './components/home/NewsCarousel'
import HistorySection from './components/home/HistorySection'
import PalmaresSection from './components/home/PalmaresSection'
import SponsorsSection from './components/home/SponsorsSection'
import ShopSection from './components/home/ShopSection'
import StreamingSection from './components/home/StreamingSection'

// El panel se carga bajo demanda: el bundle público no lo descarga.
const AdminPage = lazy(() => import('./admin/AdminPage'))

function isAdminRoute(): boolean {
  return window.location.pathname.replace(/\/+$/, '').endsWith('/admin')
}

function HomePage() {
  return (
    <div className="min-h-screen bg-hueso">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-amarillo focus:px-4 focus:py-2 focus:font-semibold focus:text-azul"
      >
        Saltar al contenido
      </a>

      <Header />

      <main id="contenido">
        <HeroSection />
        <NextMatches />
        <NewsCarousel />
        <HistorySection />
        <PalmaresSection />
        <SponsorsSection />
        <ShopSection />
        <StreamingSection />
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

  return <HomePage />
}
