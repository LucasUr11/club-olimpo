import { Mail, MapPin, Handshake } from 'lucide-react'
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../icons/SocialIcons'
import ButtonLink from '../ui/ButtonLink'
import { club, siteLinks } from '../../../shared/fixtures'

const FOOTER_LINKS = [
  { href: '#partidos', label: 'Próximos partidos' },
  { href: '#noticias', label: 'Noticias' },
  { href: '#historia', label: 'Historia' },
  { href: '#palmares', label: 'Palmarés' },
  { href: '#sponsors', label: 'Sponsors' },
  { href: '#shop', label: 'Tienda oficial' },
] as const

const SOCIAL_LINKS = [
  { href: siteLinks.instagram, label: 'Instagram', Icon: InstagramIcon },
  { href: siteLinks.facebook, label: 'Facebook', Icon: FacebookIcon },
  { href: siteLinks.youtube, label: 'YouTube', Icon: YoutubeIcon },
] as const

/** Pie de página institucional. */
export default function Footer() {
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
        </div>

        {/* Enlaces */}
        <nav aria-label="Enlaces del pie">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amarillo">El club</p>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-white/65 transition hover:text-amarillo"
                >
                  {link.label}
                </a>
              </li>
            ))}
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
              >
                <Icon className="h-5 w-5" aria-hidden />
              </a>
            ))}
          </div>

          <div className="mt-6">
            <ButtonLink
              href={siteLinks.sponsorship}
              variant="accent"
              size="sm"
              icon={<Handshake className="h-4 w-4" aria-hidden />}
            >
              Sumate como sponsor
            </ButtonLink>
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
