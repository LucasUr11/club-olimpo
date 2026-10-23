import { useState } from 'react'
import { Menu, X, ShoppingBag, Play, MapPin } from 'lucide-react'
import ButtonLink from '../ui/ButtonLink'
import { siteLinks } from '../../../shared/fixtures'

const NAV_ITEMS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#partidos', label: 'Partidos' },
  { href: '#noticias', label: 'Noticias' },
  { href: '#historia', label: 'Historia' },
  { href: '#palmares', label: 'Palmarés' },
  { href: '#sponsors', label: 'Sponsors' },
] as const

/** Barra de navegación institucional (sticky) con accesos a Shop y Streaming. */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Franja superior institucional */}
      <div className="hidden bg-azul-950 text-white/60 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-amarillo" aria-hidden />
            Laborde, Córdoba · Argentina
          </span>
          <span>Desde 1911 · Asociación Mutual Matrícula 469</span>
        </div>
      </div>

      {/* Barra principal */}
      <div className="border-b-4 border-amarillo bg-azul text-white shadow-xl shadow-azul-950/25">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          {/* Logo + wordmark */}
          <a href="#inicio" className="flex shrink-0 items-center gap-3" aria-label="Ir al inicio">
            <img
              src="/olimpo-logo.png"
              alt="Escudo del Club Atlético Olimpo Asociación Mutual"
              className="h-11 w-auto object-contain md:h-12"
            />
            <span className="leading-none">
              <span className="block font-display text-xl font-extrabold uppercase tracking-wide md:text-2xl">
                A. Olimpo A. M.
              </span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.22em] text-white/55 md:text-[10px]">
                Asociación Mutual · 1911
              </span>
            </span>
          </a>

          {/* Navegación desktop */}
          <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-amarillo"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Accesos directos */}
          <div className="hidden items-center gap-2 md:flex">
            <ButtonLink href="#shop" variant="accent" size="sm" icon={<ShoppingBag className="h-4 w-4" aria-hidden />}>
              Shop
            </ButtonLink>
            <ButtonLink href={siteLinks.streaming} variant="outline-light" size="sm" icon={<Play className="h-4 w-4" aria-hidden />}>
              En vivo
            </ButtonLink>
          </div>

          {/* Menú móvil */}
          <button
            type="button"
            className="cursor-pointer rounded-lg p-2 text-white transition hover:bg-white/10 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>

        {/* Panel móvil */}
        <div
          id="menu-movil"
          hidden={!menuOpen}
          className="border-t border-white/10 bg-azul-950 lg:hidden"
        >
          <nav aria-label="Menú móvil" className="mx-auto flex max-w-7xl flex-col px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-white/85 transition hover:bg-white/10 hover:text-amarillo"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
              <ButtonLink
                href="#shop"
                variant="accent"
                icon={<ShoppingBag className="h-4 w-4" aria-hidden />}
                onClick={() => setMenuOpen(false)}
              >
                Shop
              </ButtonLink>
              <ButtonLink href={siteLinks.streaming} variant="outline-light" icon={<Play className="h-4 w-4" aria-hidden />}>
                En vivo
              </ButtonLink>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
