// ============================================================================
// Sección Noticias: listado, alta, edición y borrado de novedades.
// ============================================================================

import { useState, type FormEvent } from 'react'
import { Newspaper, Pencil, Sparkles, Trash2 } from 'lucide-react'
import {
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABELS,
  type NewsAdminItem,
  type NewsCategory,
} from '../../../shared/types'
import { parseNewsCreate } from '../../../shared/validation'
import { adminApi } from '../../lib/adminApi'
import { cn } from '../../lib/cn'
import { formatShortDate } from '../../lib/format'
import { applyApiError, fromDateTimeLocal, slugify, toDateTimeLocal } from '../formUtils'
import { useAdminResource } from '../useAdminResource'
import { useFeedback } from '../feedback'
import AdminModal from '../components/AdminModal'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageField from '../components/ImageField'
import ImagePreview from '../components/ImagePreview'
import SectionHeader from '../components/SectionHeader'
import { EmptyState, ListError, ListSkeleton } from '../components/ListStates'
import { CheckboxField, SelectField, TextAreaField, TextField } from '../components/Field'
import FormFooter from '../components/FormFooter'

interface NewsFormState {
  title: string
  slug: string
  excerpt: string
  body: string
  category: NewsCategory
  coverUrl: string | null
  published: boolean
  publishedAt: string
}

function emptyForm(): NewsFormState {
  return {
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    category: 'institucional',
    coverUrl: null,
    published: true,
    publishedAt: toDateTimeLocal(new Date().toISOString()),
  }
}

function newsToForm(item: NewsAdminItem): NewsFormState {
  return {
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    body: item.body ?? '',
    category: item.category,
    coverUrl: item.coverUrl,
    published: item.published,
    publishedAt: toDateTimeLocal(item.publishedAt),
  }
}

function buildPayload(form: NewsFormState) {
  return {
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    body: form.body.trim() === '' ? null : form.body,
    category: form.category,
    coverUrl: form.coverUrl,
    published: form.published,
    publishedAt: fromDateTimeLocal(form.publishedAt),
  }
}

export default function NewsSection() {
  const { notify } = useFeedback()
  const { data: news, status, error, reload } = useAdminResource<NewsAdminItem>('news')
  const [editor, setEditor] = useState<{ item: NewsAdminItem | null } | null>(null)
  const [toDelete, setToDelete] = useState<NewsAdminItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(): Promise<void> {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.remove('news', toDelete.id)
      setToDelete(null)
      notify('success', 'Noticia eliminada. El sitio ya refleja el cambio.')
      await reload()
    } catch (deleteError) {
      notify('error', deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la noticia.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <SectionHeader
        title="Noticias y eventos"
        description="Novedades institucionales, resultados y obras. Las noticias marcadas como publicadas aparecen en la portada del sitio."
        count={news.length}
        countLabel={news.length === 1 ? 'noticia' : 'noticias'}
        onNew={() => setEditor({ item: null })}
        newLabel="Nueva noticia"
      />

      {status === 'loading' ? (
        <ListSkeleton />
      ) : status === 'error' ? (
        <ListError message={error ?? 'No se pudieron cargar las noticias.'} onRetry={() => void reload()} />
      ) : news.length === 0 ? (
        <EmptyState
          title="Sin noticias publicadas"
          description="Creá la primera novedad para mantener informada a la comunidad."
          actionLabel="Crear la primera noticia"
          onAction={() => setEditor({ item: null })}
          icon={<Newspaper className="h-6 w-6" aria-hidden />}
        />
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onEdit={() => setEditor({ item })}
              onDelete={() => setToDelete(item)}
            />
          ))}
        </div>
      )}

      {editor ? (
        <NewsFormModal
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
        title="Eliminar noticia"
        message={`Se va a eliminar “${toDelete?.title ?? ''}”. Esta acción no se puede deshacer.`}
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

function NewsCard({
  item,
  onEdit,
  onDelete,
}: {
  item: NewsAdminItem
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-azul/25 hover:shadow-md">
      <div className="flex gap-3">
        <ImagePreview
          src={item.coverUrl}
          alt=""
          className="h-20 w-24 shrink-0 rounded-lg"
          icon={<Newspaper className="h-6 w-6" aria-hidden />}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-azul/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-azul">
              {NEWS_CATEGORY_LABELS[item.category]}
            </span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                item.published
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-100 text-slate-500',
              )}
            >
              {item.published ? 'Publicada' : 'Borrador'}
            </span>
          </div>

          <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-bold uppercase leading-tight text-azul">
            {item.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {formatShortDate(item.publishedAt)} · {item.slug}
          </p>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-slate-500">{item.excerpt}</p>

      <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-azul/5 hover:text-azul"
          aria-label={`Editar noticia ${item.title}`}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Eliminar noticia ${item.title}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </article>
  )
}

// ── Formulario ─────────────────────────────────────────────────────────────

function NewsFormModal({
  item,
  onClose,
  onSaved,
}: {
  item: NewsAdminItem | null
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const [form, setForm] = useState<NewsFormState>(() => (item ? newsToForm(item) : emptyForm()))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof NewsFormState>(key: K, value: NewsFormState[K]): void {
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

    const parsed = parseNewsCreate(buildPayload(form))
    if (!parsed.ok) {
      setFieldErrors(parsed.errors)
      setGeneralError('Revisá los campos marcados.')
      return
    }

    setFieldErrors({})
    setSaving(true)
    try {
      if (item) await adminApi.update<NewsAdminItem>('news', item.id, parsed.value)
      else await adminApi.create<NewsAdminItem>('news', parsed.value)
      onSaved(
        item
          ? 'Noticia actualizada. El sitio ya refleja los cambios.'
          : 'Noticia creada. El sitio ya refleja los cambios.',
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
      title={item ? 'Editar noticia' : 'Nueva noticia'}
      description="La bajada se muestra en la portada; el cuerpo completo queda disponible para el detalle."
      onClose={onClose}
      closeDisabled={saving}
    >
      <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
        {generalError ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {generalError}
          </div>
        ) : null}

        <TextField
          label="Título"
          required
          maxLength={160}
          placeholder="Olimpo inauguró la nueva cancha de hockey"
          value={form.title}
          onChange={(event) => update('title', event.target.value)}
          error={fieldErrors['title']}
        />

        <div>
          <TextField
            label="Slug (URL)"
            required
            maxLength={120}
            placeholder="olimpo-inauguro-cancha-hockey"
            value={form.slug}
            onChange={(event) => update('slug', event.target.value)}
            error={fieldErrors['slug']}
            hint="Minúsculas, números y guiones. Identifica la noticia en la URL."
          />
          <button
            type="button"
            onClick={() => update('slug', slugify(form.title))}
            disabled={form.title.trim() === ''}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-azul/20 px-3 py-1 text-xs font-semibold text-azul transition hover:border-azul hover:bg-azul hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Generar desde el título
          </button>
        </div>

        <TextAreaField
          label="Bajada"
          required
          rows={3}
          maxLength={500}
          placeholder="Resumen breve que se muestra en la portada."
          value={form.excerpt}
          onChange={(event) => update('excerpt', event.target.value)}
          error={fieldErrors['excerpt']}
          hint={`${form.excerpt.length}/500 caracteres`}
        />

        <TextAreaField
          label="Cuerpo (opcional)"
          rows={6}
          maxLength={20000}
          placeholder="Contenido completo de la noticia…"
          value={form.body}
          onChange={(event) => update('body', event.target.value)}
          error={fieldErrors['body']}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Categoría"
            value={form.category}
            onChange={(event) => update('category', event.target.value as NewsCategory)}
            error={fieldErrors['category']}
          >
            {NEWS_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {NEWS_CATEGORY_LABELS[category]}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Fecha de publicación"
            type="datetime-local"
            value={form.publishedAt}
            onChange={(event) => update('publishedAt', event.target.value)}
            error={fieldErrors['publishedAt']}
            hint="Al crear, si la dejás vacía se usa la fecha actual."
          />
        </div>

        <ImageField
          label="Imagen de portada"
          value={form.coverUrl}
          onChange={(value) => update('coverUrl', value)}
          error={fieldErrors['coverUrl']}
        />

        <CheckboxField
          label="Publicar en el sitio"
          description="Si está desmarcada, la noticia queda como borrador y no se muestra en la portada."
          checked={form.published}
          onChange={(checked) => update('published', checked)}
          error={fieldErrors['published']}
        />

        <FormFooter saving={saving} onCancel={onClose} />
      </form>
    </AdminModal>
  )
}
