import { useMemo, useState } from 'react'
import {
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Shirt,
  ShoppingCart,
  Star,
  Trash2,
} from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { useApi } from '../../hooks/useApi'
import { club, fixtures, siteLinks } from '../../../shared/fixtures'
import type { Product } from '../../../shared/types'
import { cn } from '../../lib/cn'
import { formatPrice } from '../../lib/format'

interface CartLine {
  product: Product
  quantity: number
}

const MAX_QUANTITY = 99

function unitPrice(product: Product, isMember: boolean): number {
  return isMember ? product.memberPrice : product.nonMemberPrice
}

function buildOrderMessage(cartLines: CartLine[], isMember: boolean): string {
  const lines: string[] = ['Hola Club Atlético Olimpo! Quiero hacer este pedido:', '']

  for (const { product, quantity } of cartLines) {
    const unit = unitPrice(product, isMember)
    lines.push(
      `• ${quantity} × ${product.name} — ${formatPrice(unit, product.currency)} c/u = ${formatPrice(
        unit * quantity,
        product.currency,
      )}`,
    )
  }

  const totals = new Map<string, number>()
  for (const { product, quantity } of cartLines) {
    const currency = product.currency
    totals.set(currency, (totals.get(currency) ?? 0) + unitPrice(product, isMember) * quantity)
  }

  lines.push('')
  for (const [currency, total] of totals) {
    const label = totals.size > 1 ? `Total ${currency}` : 'Total'
    lines.push(`${label}: ${formatPrice(total, currency)}`)
  }
  lines.push(`Condición: ${isMember ? 'Socio' : 'No socio'}`)
  lines.push('', 'Por favor confirmen disponibilidad y forma de pago. ¡Gracias!')

  return lines.join('\n')
}

/** Tienda oficial: precios socio/no socio, carrito y cierre del pedido por WhatsApp. */
export default function ShopSection() {
  const { data: products } = useApi<Product[]>('/api/products', fixtures.products)
  const [isMember, setIsMember] = useState(false)
  const [cart, setCart] = useState<Record<string, number>>({})

  const cartLines = useMemo<CartLine[]>(() => {
    const lines: CartLine[] = []
    for (const product of products) {
      const quantity = cart[product.slug] ?? 0
      if (quantity > 0) lines.push({ product, quantity })
    }
    return lines
  }, [cart, products])

  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0)

  const totals = useMemo(() => {
    const byCurrency = new Map<string, number>()
    for (const { product, quantity } of cartLines) {
      const currency = product.currency
      byCurrency.set(
        currency,
        (byCurrency.get(currency) ?? 0) + unitPrice(product, isMember) * quantity,
      )
    }
    return [...byCurrency.entries()]
  }, [cartLines, isMember])

  const checkoutUrl =
    cartLines.length > 0
      ? `https://wa.me/${siteLinks.whatsapp}?text=${encodeURIComponent(
          buildOrderMessage(cartLines, isMember),
        )}`
      : null

  function addToCart(slug: string): void {
    setCart((current) => ({
      ...current,
      [slug]: Math.min(MAX_QUANTITY, (current[slug] ?? 0) + 1),
    }))
  }

  function changeQuantity(slug: string, delta: number): void {
    setCart((current) => {
      const next = { ...current }
      const quantity = Math.min(MAX_QUANTITY, (next[slug] ?? 0) + delta)
      if (quantity <= 0) delete next[slug]
      else next[slug] = quantity
      return next
    })
  }

  function removeFromCart(slug: string): void {
    setCart((current) => {
      const next = { ...current }
      delete next[slug]
      return next
    })
  }

  return (
    <section id="shop" className="scroll-mt-28 bg-hueso py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Tienda oficial"
            title="Llevá el azul y amarillo puesto"
            description="Camisetas, bufandas e indumentaria oficial del club. Elegí tus productos, armá el pedido y cerralo por WhatsApp."
          />

          <MemberSelector isMember={isMember} onChange={setIsMember} />
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-azul/20 bg-white px-6 py-12 text-center">
                <Shirt className="mx-auto h-10 w-10 text-azul/30" aria-hidden />
                <p className="mt-3 font-display text-lg font-bold uppercase text-azul">
                  Tienda sin productos por ahora
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Volvé a intentarlo en unos minutos o consultanos por WhatsApp.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isMember={isMember}
                    quantity={cart[product.slug] ?? 0}
                    onAdd={() => addToCart(product.slug)}
                  />
                ))}
              </div>
            )}
          </div>

          <CartPanel
            cartLines={cartLines}
            cartCount={cartCount}
            isMember={isMember}
            totals={totals}
            checkoutUrl={checkoutUrl}
            onDecrease={(slug) => changeQuantity(slug, -1)}
            onIncrease={(slug) => changeQuantity(slug, 1)}
            onRemove={removeFromCart}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-azul/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amarillo-dark" aria-hidden />
            Retiro sin cargo en la sede del club: {club.address}
          </p>
          <p className="text-xs text-slate-400">
            El pedido se confirma por WhatsApp. No se realizan cobros online.
          </p>
        </div>
      </div>

      {cartCount > 0 ? (
        <a
          href="#carrito-tienda"
          className="fixed bottom-4 right-4 z-40 inline-flex cursor-pointer items-center gap-2 rounded-full bg-azul px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-azul-950/30 transition hover:bg-azul-700 lg:hidden"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden />
          Ver pedido
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-amarillo px-1.5 text-xs text-azul">
            {cartCount}
          </span>
        </a>
      ) : null}
    </section>
  )
}

// ── Selector socio / no socio ──────────────────────────────────────────────

function MemberSelector({
  isMember,
  onChange,
}: {
  isMember: boolean
  onChange: (isMember: boolean) => void
}) {
  return (
    <div className="w-full rounded-2xl border border-azul/10 bg-white p-4 shadow-sm shadow-azul/5 sm:max-w-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-azul">¿Sos socio?</p>
      <div
        role="group"
        aria-label="¿Sos socio?"
        className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1"
      >
        <button
          type="button"
          aria-pressed={isMember}
          onClick={() => onChange(true)}
          className={cn(
            'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition',
            isMember
              ? 'bg-azul text-white shadow-sm'
              : 'text-slate-500 hover:bg-white hover:text-azul',
          )}
        >
          Sí
        </button>
        <button
          type="button"
          aria-pressed={!isMember}
          onClick={() => onChange(false)}
          className={cn(
            'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition',
            !isMember
              ? 'bg-azul text-white shadow-sm'
              : 'text-slate-500 hover:bg-white hover:text-azul',
          )}
        >
          No
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500" aria-live="polite">
        {isMember
          ? 'Mostrando precios con descuento para socios.'
          : 'Mostrando precios para no socios. Cambiá a “Sí” para ver el precio socio.'}
      </p>
    </div>
  )
}

// ── Tarjeta de producto ────────────────────────────────────────────────────

function ProductCard({
  product,
  isMember,
  quantity,
  onAdd,
}: {
  product: Product
  isMember: boolean
  quantity: number
  onAdd: () => void
}) {
  const price = unitPrice(product, isMember)
  const savings = product.nonMemberPrice - product.memberPrice

  return (
    <article className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-amarillo hover:shadow-xl hover:shadow-azul/10">
      <div className="flex w-full flex-col">
        <div className="pattern-stripes relative grid h-44 place-items-center overflow-hidden bg-linear-to-br from-azul via-azul-800 to-azul-950">
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
            {quantity > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-azul shadow-sm">
                <ShoppingCart className="h-3 w-3" aria-hidden />
                {quantity}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {product.category}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold uppercase leading-tight text-azul">
            {product.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {product.description}
          </p>

          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isMember ? 'Precio socio' : 'Precio no socio'}
            </p>
            <p className="font-display text-2xl font-extrabold text-azul">
              {formatPrice(price, product.currency)}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              {isMember ? (
                <>
                  {savings > 0 ? (
                    <>
                      No socio: {formatPrice(product.nonMemberPrice, product.currency)} ·{' '}
                      <span className="font-semibold text-emerald-600">
                        Ahorrás {formatPrice(savings, product.currency)}
                      </span>
                    </>
                  ) : (
                    <>Mismo precio para socios y no socios.</>
                  )}
                </>
              ) : (
                <>Precio socio: {formatPrice(product.memberPrice, product.currency)}</>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-azul px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-azul-700 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Agregar al pedido
            {quantity > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amarillo px-1 text-[10px] text-azul">
                {quantity}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </article>
  )
}

// ── Carrito ────────────────────────────────────────────────────────────────

function CartPanel({
  cartLines,
  cartCount,
  isMember,
  totals,
  checkoutUrl,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  cartLines: CartLine[]
  cartCount: number
  isMember: boolean
  totals: Array<[string, number]>
  checkoutUrl: string | null
  onDecrease: (slug: string) => void
  onIncrease: (slug: string) => void
  onRemove: (slug: string) => void
}) {
  return (
    <aside
      id="carrito-tienda"
      aria-labelledby="carrito-titulo"
      className="scroll-mt-28 rounded-3xl bg-azul p-5 text-white shadow-2xl shadow-azul/20 md:p-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amarillo">Pedido</p>
          <h3 id="carrito-titulo" className="mt-1 font-display text-2xl font-extrabold uppercase leading-none">
            Tu carrito
          </h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80" aria-live="polite">
          {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
        </span>
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
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/10">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <Shirt className="h-6 w-6 text-amarillo/70" aria-hidden />
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
                          <span className="min-w-7 text-center text-sm font-bold" aria-label={`Cantidad: ${quantity}`}>
                            {quantity}
                          </span>
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
