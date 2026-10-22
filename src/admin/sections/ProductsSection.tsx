// ============================================================================
// Sección Productos: listado, alta, edición y borrado de la tienda.
// ============================================================================

import { useState, type FormEvent } from 'react'
import { Pencil, ShoppingBag, Sparkles, Star, Trash2 } from 'lucide-react'
import { type ProductAdminItem } from '../../../shared/types'
import { parseProductCreate } from '../../../shared/validation'
import { adminApi } from '../../lib/adminApi'
import { cn } from '../../lib/cn'
import { formatPrice } from '../../lib/format'
import { applyApiError, slugify } from '../formUtils'
import { useAdminResource } from '../useAdminResource'
import { useFeedback } from '../feedback'
import AdminModal from '../components/AdminModal'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageField from '../components/ImageField'
import ImagePreview from '../components/ImagePreview'
import SectionHeader from '../components/SectionHeader'
import { EmptyState, ListError, ListSkeleton } from '../components/ListStates'
import { CheckboxField, TextAreaField, TextField } from '../components/Field'
import FormFooter from '../components/FormFooter'

interface ProductFormState {
  name: string
  slug: string
  description: string
  price: string
  currency: string
  category: string
  imageUrl: string | null
  featured: boolean
  available: boolean
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  slug: '',
  description: '',
  price: '',
  currency: 'ARS',
  category: '',
  imageUrl: null,
  featured: false,
  available: true,
}

function productToForm(product: ProductAdminItem): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: String(product.price),
    currency: product.currency,
    category: product.category,
    imageUrl: product.imageUrl,
    featured: product.featured,
    available: product.available,
  }
}

function buildPayload(form: ProductFormState) {
  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    price: form.price.trim() === '' ? Number.NaN : Number(form.price),
    currency: form.currency,
    category: form.category,
    imageUrl: form.imageUrl,
    featured: form.featured,
    available: form.available,
  }
}

export default function ProductsSection() {
  const { notify } = useFeedback()
  const { data: products, status, error, reload } = useAdminResource<ProductAdminItem>('products')
  const [editor, setEditor] = useState<{ item: ProductAdminItem | null } | null>(null)
  const [toDelete, setToDelete] = useState<ProductAdminItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(): Promise<void> {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.remove('products', toDelete.id)
      setToDelete(null)
      notify('success', 'Producto eliminado. El sitio ya refleja el cambio.')
      await reload()
    } catch (deleteError) {
      notify('error', deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el producto.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <SectionHeader
        title="Productos de la tienda"
        description="Indumentaria y artículos oficiales. Los productos disponibles se muestran en la sección Tienda del portal."
        count={products.length}
        countLabel={products.length === 1 ? 'producto' : 'productos'}
        onNew={() => setEditor({ item: null })}
        newLabel="Nuevo producto"
      />

      {status === 'loading' ? (
        <ListSkeleton />
      ) : status === 'error' ? (
        <ListError message={error ?? 'No se pudieron cargar los productos.'} onRetry={() => void reload()} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Sin productos"
          description="Agregá el primer artículo para que aparezca en la tienda oficial."
          actionLabel="Agregar el primero"
          onAction={() => setEditor({ item: null })}
          icon={<ShoppingBag className="h-6 w-6" aria-hidden />}
        />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => setEditor({ item: product })}
              onDelete={() => setToDelete(product)}
            />
          ))}
        </div>
      )}

      {editor ? (
        <ProductFormModal
          item={editor.item}
          onClose={() => setEditor(null)}
          onSaved={(message) => {
            setEditor(null)
            notify('success', message)
            void reload()
          }}
        />
      ) : null}

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar producto"
        message={`Se va a eliminar “${toDelete?.name ?? ''}” de la tienda. Esta acción no se puede deshacer.`}
        busy={deleting}
        onCancel={() => {
          if (!deleting) setToDelete(null)
        }}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}

// ── Tarjeta ────────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: ProductAdminItem
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-azul/25 hover:shadow-md">
      <div className="flex gap-3">
        <ImagePreview
          src={product.imageUrl}
          alt={product.name}
          className="h-20 w-20 shrink-0 rounded-lg"
          icon={<ShoppingBag className="h-6 w-6" aria-hidden />}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.featured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amarillo px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-azul">
                <Star className="h-3 w-3" aria-hidden />
                Destacado
              </span>
            ) : null}
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                product.available
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-100 text-slate-500',
              )}
            >
              {product.available ? 'Disponible' : 'Agotado'}
            </span>
          </div>

          <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-bold uppercase leading-tight text-azul">
            {product.name}
          </h3>
          <p className="font-display text-base font-extrabold text-azul">
            {formatPrice(product.price, product.currency)}
          </p>
          <p className="truncate text-xs text-slate-500">{product.category}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="truncate text-xs text-slate-400">{product.slug}</span>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-azul/5 hover:text-azul"
            aria-label={`Editar ${product.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar ${product.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

// ── Formulario ─────────────────────────────────────────────────────────────

function ProductFormModal({
  item,
  onClose,
  onSaved,
}: {
  item: ProductAdminItem | null
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const [form, setForm] = useState<ProductFormState>(() => (item ? productToForm(item) : EMPTY_FORM))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]): void {
    setForm((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => {
      if (!(key in current)) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setGeneralError(null)

    const parsed = parseProductCreate(buildPayload(form))
    if (!parsed.ok) {
      setFieldErrors(parsed.errors)
      setGeneralError('Revisá los campos marcados.')
      return
    }

    setFieldErrors({})
    setSaving(true)
    try {
      if (item) await adminApi.update<ProductAdminItem>('products', item.id, parsed.value)
      else await adminApi.create<ProductAdminItem>('products', parsed.value)
      onSaved(
        item
          ? 'Producto actualizado. El sitio ya refleja los cambios.'
          : 'Producto creado. El sitio ya refleja los cambios.',
      )
    } catch (error) {
      applyApiError(error, setGeneralError, setFieldErrors)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminModal
      open
      title={item ? 'Editar producto' : 'Nuevo producto'}
      description="La imagen y la descripción se publican en la sección Tienda del sitio."
      onClose={onClose}
      closeDisabled={saving}
    >
      <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
        {generalError ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {generalError}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nombre"
            required
            maxLength={120}
            placeholder="Camiseta titular 2026"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            error={fieldErrors['name']}
          />

          <TextField
            label="Slug (URL)"
            required
            maxLength={120}
            placeholder="camiseta-titular-2026"
            value={form.slug}
            onChange={(event) => update('slug', event.target.value)}
            error={fieldErrors['slug']}
            hint="Minúsculas, números y guiones."
          />

          <TextField
            label="Categoría"
            required
            maxLength={60}
            placeholder="Indumentaria"
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
            error={fieldErrors['category']}
          />

          <div className="grid grid-cols-[1fr_5.5rem] gap-2">
            <TextField
              label="Precio"
              type="number"
              inputMode="numeric"
              min={0}
              max={100_000_000}
              required
              placeholder="42999"
              value={form.price}
              onChange={(event) => update('price', event.target.value)}
              error={fieldErrors['price']}
            />
            <TextField
              label="Moneda"
              required
              maxLength={3}
              placeholder="ARS"
              value={form.currency}
              onChange={(event) => update('currency', event.target.value.toUpperCase())}
              error={fieldErrors['currency']}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => update('slug', slugify(form.name))}
          disabled={form.name.trim() === ''}
          className="inline-flex items-center gap-1.5 rounded-full border border-azul/20 px-3 py-1 text-xs font-semibold text-azul transition hover:border-azul hover:bg-azul hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Generar slug desde el nombre
        </button>

        <TextAreaField
          label="Descripción"
          required
          rows={3}
          maxLength={3000}
          placeholder="Descripción del producto…"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          error={fieldErrors['description']}
        />

        <ImageField
          label="Imagen del producto"
          value={form.imageUrl}
          onChange={(value) => update('imageUrl', value)}
          error={fieldErrors['imageUrl']}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxField
            label="Producto destacado"
            description="Se resalta en la tienda."
            checked={form.featured}
            onChange={(checked) => update('featured', checked)}
            error={fieldErrors['featured']}
          />
          <CheckboxField
            label="Disponible para la venta"
            description="Si está desmarcado se muestra como agotado."
            checked={form.available}
            onChange={(checked) => update('available', checked)}
            error={fieldErrors['available']}
          />
        </div>

        <FormFooter saving={saving} onCancel={onClose} />
      </form>
    </AdminModal>
  )
}
