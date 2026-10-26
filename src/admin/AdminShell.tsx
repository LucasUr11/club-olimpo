// ============================================================================
// Estructura del panel autenticado: cabecera, pestañas y secciones.
// ============================================================================

import { useState } from 'react'
import {
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Handshake,
  LogOut,
  Newspaper,
  ShoppingBag,
} from 'lucide-react'
import { cn } from '../lib/cn'
import AppLink from '../components/ui/AppLink'
import MatchesSection from './sections/MatchesSection'
import NewsSection from './sections/NewsSection'
import SportMembersSection from './sections/SportMembersSection'
import SponsorsSection from './sections/SponsorsSection'
import ProductsSection from './sections/ProductsSection'

const TABS = [
  { id: 'matches', label: 'Partidos', icon: CalendarDays },
  { id: 'news', label: 'Noticias', icon: Newspaper },
  { id: 'sport-members', label: 'Disciplinas', icon: GraduationCap },
  { id: 'sponsors', label: 'Sponsors', icon: Handshake },
  { id: 'products', label: 'Productos', icon: ShoppingBag },
] as const

type TabId = (typeof TABS)[number]['id']

interface AdminShellProps {
  onLogout: () => void
}

export default function AdminShell({ onLogout }: AdminShellProps) {
  const [tab, setTab] = useState<TabId>('matches')

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b-4 border-amarillo bg-azul text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <AppLink href="/" className="flex min-w-0 items-center gap-3" aria-label="Ir al sitio del club">
            <img src="/olimpo-logo.png" alt="" className="h-10 w-auto shrink-0 md:h-11" />
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-extrabold uppercase leading-tight tracking-wide md:text-xl">
                Panel de administración
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.2em] text-white/55 sm:block">
                C.A. Olimpo A.M. · Contenido del sitio
              </span>
            </span>
          </AppLink>

          <div className="flex shrink-0 items-center gap-2">
            <AppLink
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-amarillo hover:text-amarillo"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Ver sitio</span>
            </AppLink>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Salir
            </button>
          </div>
        </div>
      </header>

      <nav
        aria-label="Secciones del panel"
        className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 md:px-6">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition md:px-4',
                  active
                    ? 'border-azul text-azul'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-azul',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            )
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {tab === 'matches' ? <MatchesSection /> : null}
        {tab === 'news' ? <NewsSection /> : null}
        {tab === 'sport-members' ? <SportMembersSection /> : null}
        {tab === 'sponsors' ? <SponsorsSection /> : null}
        {tab === 'products' ? <ProductsSection /> : null}
      </main>

      <footer className="border-t border-slate-200 py-6">
        <p className="mx-auto max-w-6xl px-4 text-xs text-slate-400 md:px-6">
          Los cambios se guardan en Turso y se publican al instante en el sitio. Las imágenes se almacenan en la nube;
          la base solo guarda su URL.
        </p>
      </footer>
    </div>
  )
}
