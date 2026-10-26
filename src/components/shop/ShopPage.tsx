import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  MapPin,
  MessageCircle,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
} from 'lucide-react'
import { club, fixtures } from '../../../shared/fixtures'
import { DEFAULT_PRODUCT_CATEGORIES, type Product } from '../../../shared/types'
import { useApi } from '../../hooks/useApi'
import { cn } from '../../lib/cn'
import CartPanel from './CartPanel'
import AppLink from '../ui/AppLink'
import ProductCard from './ProductCard'
import ProductDetailModal from './ProductDetailModal'
import {
  ALL_CATEGORIES,
  MAX_QUANTITY,
  buildCheckoutUrl,
  calculateTotals,
  type CartLine,
} from './cart'

interface CategoryOption {
  key: string
  label: string
  count: number
}

function normalizeCategory(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
}

const defaultCategoryLabels = new Map(
  DEFAULT_PRODUCT_CATEGORIES.map((label) => [normalizeCategory(label), label]),
)

/** Vista dedicada de la tienda oficial (`/tienda`). */
export default function ShopPage() {
  const navigate = useNavigate()
  const { data: products } = useApi<Product[]>('/api/products', fixtures.products)
  const [isMember, setIsMember] = useState(false)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Tienda oficial · Club Atlético Olimpo'
    return () => {
      document.title = previousTitle
    }
  }, [])

  useEffect(() => {
    const productSlug = new URLSearchParams(window.location.search).get('producto')
    if (!productSlug) return

    const product = products.find((item) => item.slug === productSlug)
    if (product) setSelectedProduct(product)
  }, [products])

  const categories = useMemo<CategoryOption[]>(() => {
    const byKey = new Map<string, CategoryOption>()
    for (const product of products) {
      const sourceLabel = product.category.trim().replace(/\s+/g, ' ')
      const key = normalizeCategory(sourceLabel)
      const label = defaultCategoryLabels.get(key) ?? sourceLabel
      if (label === '') continue
      const existing = byKey.get(key)
      if (existing) existing.count += 1
      else byKey.set(key, { key, label, count: 1 })
    }
    return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label, 'es'))
  }, [products])

  useEffect(() => {
    if (activeCategory === ALL_CATEGORIES) return
    if (!categories.some((category) => category.key === activeCategory)) {
      setActiveCategory(ALL_CATEGORIES)
    }
  }, [activeCategory, categories])

  const filteredProducts = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) return products
    return products.filter(
      (product) => normalizeCategory(product.category) === activeCategory,
    )
  }, [activeCategory, products])

  const cartLines = useMemo<CartLine[]>(() => {
    const lines: CartLine[] = []
    for (const product of products) {
      const quantity = cart[product.slug] ?? 0
      if (quantity > 0) lines.push({ product, quantity })
    }
    return lines
  }, [cart, products])

  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0)
  const totals = useMemo(() => calculateTotals(cartLines, isMember), [cartLines, isMember])
  const checkoutUrl = useMemo(
    () => buildCheckoutUrl(cartLines, isMember),
    [cartLines, isMember],
  )

  function addToCart(product: Product, quantity: number = 1): void {
    setCart((current) => ({
      ...current,
      [product.slug]: Math.min(MAX_QUANTITY, (current[product.slug] ?? 0) + quantity),
    }))
    setStatusMessage(
      `${quantity} ${quantity === 1 ? 'unidad agregada' : 'unidades agregadas'} de ${product.name} al carrito.`,
    )
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

  function clearCart(): void {
    setCart({})
    setStatusMessage('Carrito vaciado.')
  }

  function closeProductDetail(): void {
    setSelectedProduct(null)

    const url = new URL(window.location.href)
    if (url.searchParams.has('producto')) {
      url.searchParams.delete('producto')
      navigate(`${url.pathname}${url.search}${url.hash}`, { replace: true })
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-azul text-white">
        <div className="pattern-stripes absolute inset-0 opacity-60" aria-hidden />
        <div
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amarillo/15 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-azul-700/40 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-7 md:px-6 md:pb-16 md:pt-10">
          <div className="flex items-center justify-between gap-4">
            <AppLink
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-amarillo hover:text-amarillo"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Volver al inicio
            </AppLink>
            <span className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 sm:inline-flex">
              <Store className="h-4 w-4 text-amarillo" aria-hidden />
              Tienda oficial · Desde 1911
            </span>
          </div>

          <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-12">
            <div>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-amarillo">
                <span aria-hidden className="h-0.5 w-8 bg-amarillo" />
                Tienda oficial
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl md:text-7xl">
                Llevá el azul y amarillo puesto
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
                Camisetas, indumentaria y accesorios oficiales del club. Elegí tus productos,
                revisá el detalle y cerrá el pedido directamente por WhatsApp.
              </p>

              <div className="mt-5 hidden flex-wrap gap-2 sm:flex">
                <HeroBadge icon={<Sparkles className="h-4 w-4" aria-hidden />}>
                  Precios para socios
                </HeroBadge>
                <HeroBadge icon={<MapPin className="h-4 w-4" aria-hidden />}>
                  Retiro en la sede
                </HeroBadge>
                <HeroBadge icon={<MessageCircle className="h-4 w-4" aria-hidden />}>
                  Pedido por WhatsApp
                </HeroBadge>
              </div>
            </div>

            <MemberSelector
              isMember={isMember}
              cartCount={cartCount}
              onChange={setIsMember}
            />
          </div>
        </div>
      </section>

      <section id="catalogo" className="scroll-mt-28 bg-hueso py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-azul/50">Catálogo</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold uppercase text-azul md:text-4xl">
                Elegí tu categoría
              </h2>
            </div>
            <p className="text-sm text-slate-500" aria-live="polite">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'producto' : 'productos'}
              {activeCategory !== ALL_CATEGORIES ? ' en esta categoría' : ' disponibles'}
            </p>
          </div>

          <div
            role="group"
            aria-label="Filtrar productos por categoría"
            className="mt-5 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <CategoryTab
              active={activeCategory === ALL_CATEGORIES}
              label="Todos"
              count={products.length}
              onClick={() => setActiveCategory(ALL_CATEGORIES)}
            />
            {categories.map((category) => (
              <CategoryTab
                key={category.key}
                active={activeCategory === category.key}
                label={category.label}
                count={category.count}
                onClick={() => setActiveCategory(category.key)}
              />
            ))}
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div>
              {products.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-azul/20 bg-white px-6 py-16 text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-azul/25" aria-hidden />
                  <p className="mt-3 font-display text-xl font-bold uppercase text-azul">
                    Tienda sin productos por ahora
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Volvé a intentarlo en unos minutos o consultanos por WhatsApp.
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-azul/20 bg-white px-6 py-16 text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-azul/25" aria-hidden />
                  <p className="mt-3 font-display text-xl font-bold uppercase text-azul">
                    No hay productos en esta categoría
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(ALL_CATEGORIES)}
                    className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-azul px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-azul-700"
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    Ver todos los productos
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isMember={isMember}
                      quantity={cart[product.slug] ?? 0}
                      onOpen={() => setSelectedProduct(product)}
                      onAdd={() => addToCart(product)}
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
              onClear={clearCart}
            />
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-azul/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amarillo-dark" aria-hidden />
              Retiro sin cargo en la sede del club: {club.address}
            </p>
            <p className="text-xs text-slate-400">
              Los precios se actualizan según tu condición de socio. No se realizan cobros online.
            </p>
          </div>
        </div>
      </section>

      <p className="sr-only" aria-live="polite">
        {statusMessage}
      </p>

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

      {selectedProduct ? (
        <ProductDetailModal
          key={selectedProduct.id}
          product={selectedProduct}
          isMember={isMember}
          onClose={closeProductDetail}
          onAdd={(quantity) => {
            addToCart(selectedProduct, quantity)
            closeProductDetail()
          }}
        />
      ) : null}
    </>
  )
}

function HeroBadge({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white/80">
      <span className="text-amarillo">{icon}</span>
      {children}
    </span>
  )
}

function MemberSelector({
  isMember,
  cartCount,
  onChange,
}: {
  isMember: boolean
  cartCount: number
  onChange: (isMember: boolean) => void
}) {
  return (
    <div className="w-full rounded-3xl border border-white/15 bg-white p-4 text-azul shadow-2xl shadow-black/20 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em]">¿Sos socio?</p>
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
            'cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold transition',
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
            'cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold transition',
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
          ? 'Estás viendo los precios con descuento para socios.'
          : 'Estás viendo los precios para no socios.'}
      </p>

      <a
        href="#carrito-tienda"
        className="mt-3 hidden items-center justify-between gap-2 rounded-2xl bg-azul px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-azul-700 sm:flex"
      >
        <span className="inline-flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-amarillo" aria-hidden />
          Mi pedido
        </span>
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-amarillo px-1.5 text-xs text-azul">
          {cartCount}
        </span>
      </a>

      <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-400">
        El descuento socio se valida con credencial vigente al retirar.
      </p>
    </div>
  )
}

function CategoryTab({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label} (${count} ${count === 1 ? 'producto' : 'productos'})`}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition',
        active
          ? 'border-azul bg-azul text-white shadow-md shadow-azul/20'
          : 'border-slate-200 bg-white text-slate-600 hover:border-azul/40 hover:text-azul',
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          'grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px]',
          active ? 'bg-amarillo text-azul' : 'bg-slate-100 text-slate-500',
        )}
      >
        {count}
      </span>
    </button>
  )
}
