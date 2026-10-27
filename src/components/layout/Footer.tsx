import { Mail, MapPin, Handshake } from 'lucide-react'
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../icons/SocialIcons'
import AppLink from '../ui/AppLink'
import { club, siteLinks } from '../../../shared/fixtures'

interface FooterProps {
  onOpenSponsorInquiry: () => void
}

const FOOTER_LINKS = [
  { href: '/', label: 'Disciplinas', section: 'disciplinas' },
  { href: '/', label: 'Noticias', section: 'noticias' },
  { href: '/', label: 'Historia', section: 'historia' },
  { href: '/', label: 'Palmarés', section: 'palmares' },
  { href: '/', label: 'Sponsors', section: 'sponsors' },
] as const

const SOCIAL_LINKS = [
  { href: siteLinks.instagram, label: 'Instagram', Icon: InstagramIcon },
  { href: siteLinks.facebook, label: 'Facebook', Icon: FacebookIcon },
  { href: siteLinks.youtube, label: 'YouTube', Icon: YoutubeIcon },
] as const

/** Pie de página institucional. */
export default function Footer({ onOpenSponsorInquiry }: FooterProps) {
  return (
    <footer className="border-t-4 border-amarillo bg-azul-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        {/* Marca */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/olimpo-logo.png"
              alt="Escudo del Club Atlético Olimpo Asociación Mutual"
              className="h-14 w-auto object-contain"
            />
            <div>
              <p className="font-display text-xl font-extrabold uppercase leading-none">
                Atlético Olimpo
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/50">
                Asociación Mutual
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Más que un club: {new Date().getFullYear() - 1911} años de historia azul y amarilla en
            el sur cordobés.
          </p>
          <AppLink
            href="/admin"
            className="mt-3 inline-block text-xs text-white/35 transition hover:text-white/70"
            target='_blank'
          >
            <span>🔒</span> Admin
          </AppLink>
        </div>

        {/* Enlaces */}
        <nav aria-label="Enlaces del pie">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amarillo">El club</p>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_LINKS.map((link) => (
              <li key={link.section}>
                <AppLink
                  href={link.href}
                  state={{ scrollTo: link.section }}
                  className="text-sm text-white/65 transition hover:text-amarillo"
                >
                  {link.label}
                </AppLink>
              </li>
            ))}
            <li>
              <AppLink href="/tienda" className="text-sm text-white/65 transition hover:text-amarillo">
                Tienda oficial
              </AppLink>
            </li>
          </ul>
        </nav>

        {/* Contacto */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amarillo">Contacto</p>
          <ul className="mt-4 space-y-3 text-sm text-white/65">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amarillo" aria-hidden />
              <span>
                {club.address}
                <br />
                Sede del club
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amarillo" aria-hidden />
              <span>
                {club.stadium} — Barrio Los Médicos
                <br />
                Capacidad: {club.stadiumCapacity.toLocaleString('es-AR')} espectadores
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-amarillo" aria-hidden />
              <a href={siteLinks.email} className="transition hover:text-amarillo">
                contacto@caolimpo.com.ar
              </a>
            </li>
          </ul>
        </div>

        {/* Redes + sponsor CTA */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amarillo">Seguinos</p>
          <div className="mt-4 flex gap-3">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-amarillo hover:bg-amarillo hover:text-azul"
                target="_blank"
              >
                <Icon className="h-5 w-5" aria-hidden />
              </a>
            ))}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={onOpenSponsorInquiry}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-amarillo px-4 py-2 text-xs font-semibold text-azul shadow-lg shadow-amarillo/20 transition-all duration-200 hover:bg-amarillo-dark active:scale-[0.98]"
            >
              <Handshake className="h-4 w-4" aria-hidden />
              Sumate como sponsor
            </button>
          </div>
        </div>
      </div>

      {/* Línea legal */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/45 md:flex-row md:items-center md:justify-between md:px-6">
          <p>
            © {new Date().getFullYear()} {club.fullName} — {club.mutualId}
          </p>
          <p>Portal institucional · Laborde, Córdoba, Argentina</p>
        </div>
      </div>
    </footer>
  )
}
