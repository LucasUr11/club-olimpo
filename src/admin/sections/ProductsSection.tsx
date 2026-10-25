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
import ImageGalleryField from '../components/ImageGalleryField'
import ImagePreview from '../components/ImagePreview'
import SectionHeader from '../components/SectionHeader'
import { EmptyState, ListError, ListSkeleton } from '../components/ListStates'
import { CheckboxField, SelectField, TextAreaField, TextField } from '../components/Field'
import FormFooter from '../components/FormFooter'

interface ProductFormState {
  name: string
  slug: string
  description: string
  memberPrice: string
  nonMemberPrice: string
  currency: string
  category: string
  imageUrls: string[]
  featured: boolean
  available: boolean
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  slug: '',
  description: '',
  memberPrice: '',
  nonMemberPrice: '',
  currency: 'ARS',
  category: '',
  imageUrls: [],
  featured: false,
  available: true,
}

const NEW_CATEGORY = '__new__'

function productToForm(product: ProductAdminItem): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    memberPrice: String(product.memberPrice),
    nonMemberPrice: String(product.nonMemberPrice),
    currency: product.currency,
    category: product.category,
    imageUrls: product.imageUrls.length > 0 ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [],
    featured: product.featured,
    available: product.available,
  }
}

function buildPayload(form: ProductFormState) {
  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    memberPrice: form.memberPrice.trim() === '' ? Number.NaN : Number(form.memberPrice),
    nonMemberPrice: form.nonMemberPrice.trim() === '' ? Number.NaN : Number(form.nonMemberPrice),
    currency: form.currency,
    category: form.category,
    imageUrl: form.imageUrls[0] ?? null,
    imageUrls: form.imageUrls,
    featured: form.featured,
    available: form.available,
  }
}

/** Categorías existentes, sin duplicados por mayúsculas/minúsculas. */
function collectCategories(products: ProductAdminItem[]): string[] {
  const categories = new Map<string, string>()
  for (const product of products) {
    const value = product.category.trim()
    if (value === '') continue
    const key = value.toLocaleLowerCase('es')
    if (!categories.has(key)) categories.set(key, value)
  }
  return [...categories.values()].sort((a, b) => a.localeCompare(b, 'es'))
}

/** Reutiliza la categoría existente si el texto coincide (aunque cambie el caso). */
function resolveCategory(value: string, categories: string[]): string {
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (normalized === '') return ''
  const existing = categories.find(
    (category) => category.toLocaleLowerCase('es') === normalized.toLocaleLowerCase('es'),
  )
  return existing ?? normalized
}

export default function ProductsSection() {
  const { notify } = useFeedback()
  const { data: products, status, error, reload } = useAdminResource<ProductAdminItem>('products')
  const [editor, setEditor] = useState<{ item: ProductAdminItem | null } | null>(null)
  const [toDelete, setToDelete] = useState<ProductAdminItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const categories = collectCategories(products)

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
        description="Indumentaria y artículos oficiales. Los productos disponibles se muestran en la página Tienda del sitio."
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
          categories={categories}
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
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-display text-base font-extrabold text-azul">
              {formatPrice(product.memberPrice, product.currency)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">socio</span>
            <span className="text-xs text-slate-400">
              / {formatPrice(product.nonMemberPrice, product.currency)} no socio
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">{product.category}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="truncate text-xs text-slate-400">{product.slug}</span>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-azul/5 hover:text-azul"
            aria-label={`Editar ${product.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
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
  categories,
  onClose,
  onSaved,
}: {
  item: ProductAdminItem | null
  categories: string[]
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const [form, setForm] = useState<ProductFormState>(() => (item ? productToForm(item) : EMPTY_FORM))
  const [newCategory, setNewCategory] = useState(() => {
    if (!item) return categories.length === 0
    return !categories.some(
      (category) => category.toLocaleLowerCase('es') === item.category.toLocaleLowerCase('es'),
    )
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const categoryOptions = [...categories]
  if (
    item &&
    item.category.trim() !== '' &&
    !categoryOptions.some(
      (category) => category.toLocaleLowerCase('es') === item.category.toLocaleLowerCase('es'),
    )
  ) {
    categoryOptions.push(item.category)
  }
  categoryOptions.sort((a, b) => a.localeCompare(b, 'es'))

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

    const parsed = parseProductCreate(
      buildPayload({ ...form, category: resolveCategory(form.category, categoryOptions) }),
    )
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
      description="La galería y la descripción se publican en la página Tienda del sitio."
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

          <div className="flex flex-col gap-4">
            <SelectField
              label="Categoría"
              required
              value={newCategory ? NEW_CATEGORY : form.category}
              onChange={(event) => {
                const value = event.target.value
                if (value === NEW_CATEGORY) {
                  setNewCategory(true)
                  update('category', '')
                  return
                }
                setNewCategory(false)
                update('category', value)
              }}
              error={newCategory ? undefined : fieldErrors['category']}
              hint="Se cargan las categorías existentes en la base."
            >
              <option value="" disabled>
                Seleccioná una categoría…
              </option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value={NEW_CATEGORY}>＋ Nueva categoría…</option>
            </SelectField>

            {newCategory ? (
              <TextField
                label="Nueva categoría"
                required
                maxLength={60}
                placeholder="Indumentaria"
                value={form.category}
                onChange={(event) => update('category', event.target.value)}
                error={fieldErrors['category']}
                hint="Se agrega a las categorías disponibles para los próximos productos."
              />
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_5.5rem]">
          <TextField
            label="Precio socio"
            type="number"
            inputMode="numeric"
            min={0}
            max={100_000_000}
            required
            placeholder="37999"
            value={form.memberPrice}
            onChange={(event) => update('memberPrice', event.target.value)}
            error={fieldErrors['memberPrice']}
            hint="Con credencial de socio vigente."
          />
          <TextField
            label="Precio no socio"
            type="number"
            inputMode="numeric"
            min={0}
            max={100_000_000}
            required
            placeholder="42999"
            value={form.nonMemberPrice}
            onChange={(event) => update('nonMemberPrice', event.target.value)}
            error={fieldErrors['nonMemberPrice']}
            hint="Precio general de la tienda."
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

        <button
          type="button"
          onClick={() => update('slug', slugify(form.name))}
          disabled={form.name.trim() === ''}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-azul/20 px-3 py-1 text-xs font-semibold text-azul transition hover:border-azul hover:bg-azul hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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

        <ImageGalleryField
          values={form.imageUrls}
          onChange={(values) => update('imageUrls', values)}
          error={fieldErrors['imageUrls']}
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
