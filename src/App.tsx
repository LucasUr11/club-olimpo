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

export default function App() {
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
