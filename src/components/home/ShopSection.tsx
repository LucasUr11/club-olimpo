import { MapPin, Shirt, ShoppingBag, Star } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import ButtonLink from '../ui/ButtonLink'
import { useApi } from '../../hooks/useApi'
import { club, fixtures, siteLinks } from '../../../shared/fixtures'
import type { Product } from '../../../shared/types'
import { formatPrice } from '../../lib/format'

/** Vista previa de la tienda oficial con CTA. */
export default function ShopSection() {
  const { data: products } = useApi<Product[]>('/api/products', fixtures.products)

  const featured = products.filter((product) => product.featured).slice(0, 3)
  const visible = featured.length > 0 ? featured : products.slice(0, 3)

  return (
    <section id="shop" className="scroll-mt-28 bg-hueso py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Texto + CTA */}
          <div>
            <SectionHeading
              eyebrow="Tienda oficial"
              title="Llevá el azul y amarillo puesto"
              description="Camisetas, bufandas e indumentaria oficial del primer equipo. Envíos a todo el país y retiro sin cargo en la sede del club."
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href={siteLinks.shop}
                variant="primary"
                size="lg"
                icon={<ShoppingBag className="h-5 w-5" aria-hidden />}
                target="_blank"
              >
                Ir a la tienda
              </ButtonLink>
            </div>

            <p className="mt-6 flex items-start gap-2 text-sm text-slate-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amarillo-dark" aria-hidden />
              Retiro sin cargo en la sede del club: {club.address}
            </p>
          </div>

          {/* Productos destacados */}
          <div className="grid gap-5 sm:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-amarillo hover:shadow-xl hover:shadow-azul/10">
      <div className="pattern-stripes relative grid h-40 place-items-center overflow-hidden bg-linear-to-br from-azul via-azul-800 to-azul-950">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <Shirt
            className="h-14 w-14 text-amarillo/80 transition duration-300 group-hover:scale-110"
            aria-hidden
          />
        )}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {product.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amarillo px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-azul">
              <Star className="h-3 w-3" aria-hidden />
              Destacado
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {product.category}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold uppercase leading-tight text-azul">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {product.description}
        </p>
        <p className="mt-3 font-display text-2xl font-extrabold text-azul">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </article>
  )
}
