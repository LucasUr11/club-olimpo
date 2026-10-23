import { MessageCircle, Minus, Plus, Shirt, ShoppingCart, Trash2 } from 'lucide-react'
import { formatPrice } from '../../lib/format'
import { MAX_QUANTITY, unitPrice, type CartLine } from './cart'

interface CartPanelProps {
  cartLines: CartLine[]
  cartCount: number
  isMember: boolean
  totals: Array<[string, number]>
  checkoutUrl: string | null
  onDecrease: (slug: string) => void
  onIncrease: (slug: string) => void
  onRemove: (slug: string) => void
  onClear: () => void
}

/** Resumen del pedido y cierre por WhatsApp. */
export default function CartPanel({
  cartLines,
  cartCount,
  isMember,
  totals,
  checkoutUrl,
  onDecrease,
  onIncrease,
  onRemove,
  onClear,
}: CartPanelProps) {
  return (
    <aside
      id="carrito-tienda"
      aria-labelledby="carrito-titulo"
      className="scroll-mt-28 rounded-3xl bg-azul p-5 text-white shadow-2xl shadow-azul/20 md:p-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amarillo">Pedido</p>
          <h2 id="carrito-titulo" className="mt-1 font-display text-2xl font-extrabold uppercase leading-none">
            Tu carrito
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80"
            aria-live="polite"
          >
            {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
          </span>
          {cartLines.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-white/40 transition hover:text-amarillo"
            >
              Vaciar
            </button>
          ) : null}
        </div>
      </div>

      {cartLines.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/20 px-4 py-9 text-center">
          <ShoppingCart className="mx-auto h-9 w-9 text-white/25" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-white/85">Todavía no agregaste productos.</p>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            Elegí tus artículos y armá el pedido. Al finalizar, se abre WhatsApp con el detalle.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-5 space-y-3">
            {cartLines.map(({ product, quantity }) => {
              const unit = unitPrice(product, isMember)
              return (
                <li key={product.slug} className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="flex gap-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1.5">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Shirt className="h-6 w-6 text-azul/30" aria-hidden />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-snug">{product.name}</p>
                          <p className="mt-0.5 text-[11px] text-white/55">
                            {formatPrice(unit, product.currency)} c/u ·{' '}
                            {isMember ? 'socio' : 'no socio'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(product.slug)}
                          className="cursor-pointer rounded-lg p-1 text-white/45 transition hover:bg-white/10 hover:text-white"
                          aria-label={`Quitar ${product.name} del carrito`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-full bg-white/10">
                          <button
                            type="button"
                            onClick={() => onDecrease(product.slug)}
                            className="cursor-pointer rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                            aria-label={`Quitar una unidad de ${product.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <span className="min-w-7 text-center text-sm font-bold">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => onIncrease(product.slug)}
                            disabled={quantity >= MAX_QUANTITY}
                            className="cursor-pointer rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Agregar una unidad de ${product.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-amarillo">
                          {formatPrice(unit * quantity, product.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 border-t border-white/10 pt-4">
            {totals.map(([currency, total]) => (
              <div key={currency} className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-white/60">
                  {totals.length > 1 ? `Total ${currency}` : 'Total'}
                </span>
                <span className="font-display text-2xl font-extrabold text-white">
                  {formatPrice(total, currency)}
                </span>
              </div>
            ))}
            <p className="mt-1 text-[11px] text-white/50">
              Condición: {isMember ? 'Socio' : 'No socio'}
            </p>
          </div>

          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-amarillo px-5 py-3 text-sm font-bold text-azul shadow-lg shadow-black/10 transition hover:bg-amarillo-dark active:scale-[0.98]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Enviar pedido por WhatsApp
            </a>
          ) : null}

          <p className="mt-3 text-center text-[11px] leading-relaxed text-white/45">
            Se abre WhatsApp con el detalle del pedido. No se cobra online.
          </p>
        </>
      )}
    </aside>
  )
}
