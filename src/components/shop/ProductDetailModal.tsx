import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, Shirt, ShoppingCart, Star, X } from 'lucide-react'
import type { Product } from '../../../shared/types'
import { formatPrice } from '../../lib/format'
import { cn } from '../../lib/cn'
import { MAX_QUANTITY, unitPrice } from './cart'

interface ProductDetailModalProps {
  product: Product
  isMember: boolean
  onClose: () => void
  onAdd: (quantity: number) => void
}

/** Detalle de producto en dos columnas con selector de cantidad. */
export default function ProductDetailModal({
  product,
  isMember,
  onClose,
  onAdd,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [])

  const price = unitPrice(product, isMember)
  const total = price * quantity
  const images =
    product.imageUrls.length > 0
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : []
  const activeImage = images[Math.min(activeImageIndex, images.length - 1)]

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-azul-950/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="mx-auto flex min-h-full max-w-5xl items-center justify-center py-4 sm:py-8"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="producto-detalle-titulo"
          className="relative w-full overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/40"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/95 text-azul shadow-md transition hover:bg-amarillo"
            aria-label="Cerrar detalle del producto"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Imagen grande */}
            <div className="relative flex min-h-[300px] flex-col overflow-hidden bg-linear-to-br from-slate-50 via-white to-amarillo/10 p-6 sm:min-h-[420px] md:min-h-[560px]">
              <span className="pattern-stripes-dark absolute inset-0 opacity-60" aria-hidden />
              <div className="relative flex flex-1 items-center justify-center py-8">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={`${product.name} — imagen ${activeImageIndex + 1}`}
                    className="max-h-[320px] w-full object-contain sm:max-h-[440px] md:max-h-[500px]"
                  />
                ) : (
                  <Shirt className="h-32 w-32 text-azul/20" aria-hidden />
                )}
              </div>

              {images.length > 1 ? (
                <div className="relative mt-2 flex justify-center gap-2 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                      aria-pressed={activeImageIndex === index}
                      className={cn(
                        'h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-white p-1 transition sm:h-16 sm:w-16',
                        activeImageIndex === index
                          ? 'border-azul ring-2 ring-amarillo'
                          : 'border-white/70 hover:border-azul/40',
                      )}
                    >
                      <img src={image} alt="" className="h-full w-full object-contain" loading="lazy" />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
                <span className="rounded-full bg-azul px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  {product.category}
                </span>
                {product.featured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amarillo px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-azul shadow-sm">
                    <Star className="h-3 w-3" aria-hidden />
                    Destacado
                  </span>
                ) : null}
              </div>
            </div>

            {/* Información y compra */}
            <div className="flex flex-col p-5 sm:p-7 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-azul/50">
                Tienda oficial · Club Atlético Olimpo
              </p>
              <h2
                id="producto-detalle-titulo"
                className="mt-2 font-display text-3xl font-extrabold uppercase leading-none text-azul sm:text-4xl"
              >
                {product.name}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <div
                  className={cn(
                    'rounded-2xl border p-3 transition',
                    isMember
                      ? 'border-amarillo bg-amarillo/15 shadow-sm shadow-amarillo/20'
                      : 'border-slate-200 bg-white',
                  )}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Socio</p>
                  <p className="mt-1 font-display text-xl font-extrabold leading-none text-azul sm:text-2xl">
                    {formatPrice(product.memberPrice, product.currency)}
                  </p>
                </div>
                <div
                  className={cn(
                    'rounded-2xl border p-3 transition',
                    !isMember
                      ? 'border-azul bg-azul/[0.04] shadow-sm shadow-azul/10'
                      : 'border-slate-200 bg-white',
                  )}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    No socio
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold leading-none text-azul sm:text-2xl">
                    {formatPrice(product.nonMemberPrice, product.currency)}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-500">
                Estás comprando como{' '}
                <span className="font-semibold text-azul">{isMember ? 'socio' : 'no socio'}</span>. El
                precio se aplica según esa condición.
              </p>

              <div className="mt-auto pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Cantidad
                </p>
                <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
                  <div className="inline-flex items-center justify-between rounded-full border border-slate-200 bg-slate-50 p-1 sm:justify-start">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      disabled={quantity <= 1}
                      className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-azul transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Restar una unidad"
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="min-w-10 text-center text-sm font-bold text-azul" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) => Math.min(MAX_QUANTITY, current + 1))
                      }
                      disabled={quantity >= MAX_QUANTITY}
                      className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-azul transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Sumar una unidad"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAdd(quantity)}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-azul px-5 py-3 text-sm font-bold text-white shadow-lg shadow-azul/20 transition hover:bg-azul-700 active:scale-[0.98]"
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden />
                    Agregar · {formatPrice(total, product.currency)}
                  </button>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  El pedido se coordina por WhatsApp. Retiro sin cargo en la sede del club.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
