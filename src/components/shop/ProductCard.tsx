import { Eye, Plus, Shirt, ShoppingCart, Star } from 'lucide-react'
import type { Product } from '../../../shared/types'
import { formatPrice } from '../../lib/format'
import { cn } from '../../lib/cn'
import { unitPrice } from './cart'

interface ProductCardProps {
  product: Product
  isMember: boolean
  quantity: number
  onOpen: () => void
  onAdd: () => void
}

/** Tarjeta de catálogo: imagen limpia, precios y acceso rápido al detalle. */
export default function ProductCard({
  product,
  isMember,
  quantity,
  onOpen,
  onAdd,
}: ProductCardProps) {
  const price = unitPrice(product, isMember)
  const savings = product.nonMemberPrice - product.memberPrice

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-azul/10 bg-white shadow-sm shadow-azul/5 transition duration-300 hover:-translate-y-1 hover:border-amarillo hover:shadow-xl hover:shadow-azul/10">
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-square w-full cursor-pointer overflow-hidden bg-linear-to-br from-slate-50 via-white to-amarillo/10"
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

        <span className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {product.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amarillo px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-azul shadow-sm">
              <Star className="h-3 w-3" aria-hidden />
              Destacado
            </span>
          ) : null}
          {quantity > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-azul px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              <ShoppingCart className="h-3 w-3" aria-hidden />
              {quantity}
            </span>
          ) : null}
        </span>

        <span className="absolute inset-x-3 bottom-3 hidden items-center justify-center gap-1.5 rounded-full bg-azul/90 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white opacity-0 backdrop-blur transition group-hover:opacity-100 sm:inline-flex">
          <Eye className="h-3.5 w-3.5" aria-hidden />
          Ver detalle
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {product.category}
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-1 cursor-pointer text-left"
          aria-label={`Ver detalle de ${product.name}`}
        >
          <h3 className="line-clamp-2 font-display text-xl font-bold uppercase leading-tight text-azul transition group-hover:text-azul-700">
            {product.name}
          </h3>
        </button>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {product.description}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isMember ? 'Precio socio' : 'Precio no socio'}
              </p>
              <p className="font-display text-2xl font-extrabold leading-none text-azul">
                {formatPrice(price, product.currency)}
              </p>
            </div>
            {isMember && savings > 0 ? (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                Ahorrás {formatPrice(savings, product.currency)}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-[11px] text-slate-500">
            {isMember ? (
              <>No socio: {formatPrice(product.nonMemberPrice, product.currency)}</>
            ) : (
              <>Precio socio: {formatPrice(product.memberPrice, product.currency)}</>
            )}
          </p>

          <button
            type="button"
            onClick={onAdd}
            className={cn(
              'mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition active:scale-[0.98]',
              quantity > 0
                ? 'bg-amarillo text-azul hover:bg-amarillo-dark'
                : 'bg-azul text-white hover:bg-azul-700',
            )}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Agregar
            {quantity > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-azul px-1 text-[10px] text-white">
                {quantity}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </article>
  )
}
