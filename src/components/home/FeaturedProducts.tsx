import { ArrowUpRight, Eye, Shirt } from 'lucide-react'
import { fixtures } from '../../../shared/fixtures'
import type { Product } from '../../../shared/types'
import { useApi } from '../../hooks/useApi'
import { formatPrice } from '../../lib/format'
import ButtonLink from '../ui/ButtonLink'
import SectionHeading from '../ui/SectionHeading'

export default function FeaturedProducts() {
  const { data: products } = useApi<Product[]>('/api/products', fixtures.products)
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4)

  return (
    <section
      id="productos-destacados"
      className="scroll-mt-28 border-y border-azul/10 bg-hueso py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Tienda oficial"
            title="Productos Destacados"
            description="Llevá los colores del Chuchumengo con productos oficiales del Club Atlético Olimpo."
          />
          <ButtonLink
            href="/tienda"
            variant="primary"
            className="shrink-0"
            icon={<ArrowUpRight className="h-4 w-4" aria-hidden />}
          >
            Ver tienda completa
          </ButtonLink>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const detailHref = `/tienda?producto=${encodeURIComponent(product.slug)}#catalogo`

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-azul/10 bg-white shadow-sm shadow-azul/5 transition duration-300 hover:-translate-y-1 hover:border-amarillo hover:shadow-xl hover:shadow-azul/10"
                >
                  <a
                    href={detailHref}
                    className="relative block aspect-square overflow-hidden bg-linear-to-br from-slate-50 via-white to-amarillo/10"
                    aria-label={`Ver detalle de ${product.name}`}
                  >
                    <span className="pattern-stripes-dark absolute inset-0 opacity-50" aria-hidden />
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="relative h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="relative grid h-full w-full place-items-center">
                        <Shirt
                          className="h-20 w-20 text-azul/25 transition duration-500 group-hover:scale-110"
                          aria-hidden
                        />
                      </span>
                    )}
                    <span className="absolute right-3 top-3 rounded-full bg-amarillo px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-azul shadow-sm">
                      Destacado
                    </span>
                    <span className="absolute inset-x-3 bottom-3 hidden items-center justify-center gap-1.5 rounded-full bg-azul/90 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white opacity-0 backdrop-blur transition group-hover:opacity-100 sm:inline-flex">
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                      Ver detalle
                    </span>
                  </a>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {product.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 font-display text-xl font-bold uppercase leading-tight text-azul">
                      {product.name}
                    </h3>
                    <div className="mt-auto pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Precio no socio
                      </p>
                      <p className="font-display text-2xl font-extrabold leading-none text-azul">
                        {formatPrice(product.nonMemberPrice, product.currency)}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-azul/20 bg-white px-6 py-10 text-center text-sm text-slate-500">
            Pronto vas a encontrar productos destacados de la tienda oficial.
          </p>
        )}
      </div>
    </section>
  )
}
