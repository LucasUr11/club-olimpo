// ============================================================================
// Sección Patrocinadores: listado, alta, edición y borrado.
// ============================================================================

import { useState, type FormEvent } from 'react'
import { ExternalLink, Handshake, Pencil, Trash2 } from 'lucide-react'
import {
  SPONSOR_TIERS,
  SPONSOR_TIER_LABELS,
  type SponsorAdminItem,
  type SponsorTier,
} from '../../../shared/types'
import { parseSponsorCreate } from '../../../shared/validation'
import { adminApi } from '../../lib/adminApi'
import { cn } from '../../lib/cn'
import { applyApiError } from '../formUtils'
import { useAdminResource } from '../useAdminResource'
import { useFeedback } from '../feedback'
import AdminModal from '../components/AdminModal'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageField from '../components/ImageField'
import ImagePreview from '../components/ImagePreview'
import SectionHeader from '../components/SectionHeader'
import { EmptyState, ListError, ListSkeleton } from '../components/ListStates'
import { SelectField, TextField } from '../components/Field'
import FormFooter from '../components/FormFooter'

interface SponsorFormState {
  name: string
  tier: SponsorTier
  url: string
  logoUrl: string | null
  order: string
}

function emptyForm(nextOrder: number): SponsorFormState {
  return { name: '', tier: 'oficial', url: '', logoUrl: null, order: String(nextOrder) }
}

function sponsorToForm(sponsor: SponsorAdminItem): SponsorFormState {
  return {
    name: sponsor.name,
    tier: sponsor.tier,
    url: sponsor.url ?? '',
    logoUrl: sponsor.logoUrl,
    order: String(sponsor.order),
  }
}

function buildPayload(form: SponsorFormState) {
  return {
    name: form.name,
    tier: form.tier,
    url: form.url.trim() === '' ? null : form.url,
    logoUrl: form.logoUrl,
    order: form.order.trim() === '' ? Number.NaN : Number(form.order),
  }
}

export default function SponsorsSection() {
  const { notify } = useFeedback()
  const { data: sponsors, status, error, reload } = useAdminResource<SponsorAdminItem>('sponsors')
  const [editor, setEditor] = useState<{ item: SponsorAdminItem | null } | null>(null)
  const [toDelete, setToDelete] = useState<SponsorAdminItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const nextOrder = sponsors.reduce((max, sponsor) => Math.max(max, sponsor.order), -1) + 1

  async function handleDelete(): Promise<void> {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.remove('sponsors', toDelete.id)
      setToDelete(null)
      notify('success', 'Patrocinador eliminado. El sitio ya refleja el cambio.')
      await reload()
    } catch (deleteError) {
      notify(
        'error',
        deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el patrocinador.',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <SectionHeader
        title="Patrocinadores"
        description="Empresas y comercios que acompañan al club. El orden define la posición dentro de cada categoría en la portada."
        count={sponsors.length}
        countLabel={sponsors.length === 1 ? 'patrocinador' : 'patrocinadores'}
        onNew={() => setEditor({ item: null })}
        newLabel="Nuevo patrocinador"
      />

      {status === 'loading' ? (
        <ListSkeleton />
      ) : status === 'error' ? (
        <ListError
          message={error ?? 'No se pudieron cargar los patrocinadores.'}
          onRetry={() => void reload()}
        />
      ) : sponsors.length === 0 ? (
        <EmptyState
          title="Sin patrocinadores"
          description="Sumá las marcas que apoyan al club para mostrarlas en la portada."
          actionLabel="Agregar el primero"
          onAction={() => setEditor({ item: null })}
          icon={<Handshake className="h-6 w-6" aria-hidden />}
        />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              onEdit={() => setEditor({ item: sponsor })}
              onDelete={() => setToDelete(sponsor)}
            />
          ))}
        </div>
      )}

      {editor ? (
        <SponsorFormModal
          item={editor.item}
          nextOrder={nextOrder}
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
        title="Eliminar patrocinador"
        message={`Se va a eliminar a “${toDelete?.name ?? ''}” del listado. Esta acción no se puede deshacer.`}
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

function SponsorCard({
  sponsor,
  onEdit,
  onDelete,
}: {
  sponsor: SponsorAdminItem
  onEdit: () => void
  onDelete: () => void
}) {
  const initials = sponsor.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-azul/25 hover:shadow-md">
      <div className="flex items-start gap-3">
        <ImagePreview
          src={sponsor.logoUrl}
          alt={`Logotipo de ${sponsor.name}`}
          className="h-16 w-20 shrink-0 rounded-lg bg-white p-1"
          icon={<span className="font-display text-xl font-extrabold text-slate-400">{initials}</span>}
        />

        <div className="min-w-0 flex-1">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              sponsor.tier === 'principal'
                ? 'bg-amarillo text-azul'
                : sponsor.tier === 'oficial'
                  ? 'bg-azul/5 text-azul'
                  : 'bg-slate-100 text-slate-500',
            )}
          >
            {SPONSOR_TIER_LABELS[sponsor.tier]}
          </span>
          <h3 className="mt-1.5 truncate font-display text-lg font-bold uppercase text-azul">
            {sponsor.name}
          </h3>
          <p className="text-xs text-slate-500">Orden #{sponsor.order}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        {sponsor.url ? (
          <a
            href={sponsor.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-azul hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{sponsor.url.replace(/^https?:\/\//, '')}</span>
          </a>
        ) : (
          <span className="text-xs text-slate-400">Sin sitio web</span>
        )}

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-azul/5 hover:text-azul"
            aria-label={`Editar ${sponsor.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar ${sponsor.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

// ── Formulario ─────────────────────────────────────────────────────────────

function SponsorFormModal({
  item,
  nextOrder,
  onClose,
  onSaved,
}: {
  item: SponsorAdminItem | null
  nextOrder: number
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const [form, setForm] = useState<SponsorFormState>(() =>
    item ? sponsorToForm(item) : emptyForm(nextOrder),
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof SponsorFormState>(key: K, value: SponsorFormState[K]): void {
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

    const parsed = parseSponsorCreate(buildPayload(form))
    if (!parsed.ok) {
      setFieldErrors(parsed.errors)
      setGeneralError('Revisá los campos marcados.')
      return
    }

    setFieldErrors({})
    setSaving(true)
    try {
      if (item) await adminApi.update<SponsorAdminItem>('sponsors', item.id, parsed.value)
      else await adminApi.create<SponsorAdminItem>('sponsors', parsed.value)
      onSaved(
        item
          ? 'Patrocinador actualizado. El sitio ya refleja los cambios.'
          : 'Patrocinador creado. El sitio ya refleja los cambios.',
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
      title={item ? 'Editar patrocinador' : 'Nuevo patrocinador'}
      description="Subí el logotipo o pegá su URL. El sitio lo muestra en la franja de sponsors."
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
            placeholder="Banco de Laborde"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            error={fieldErrors['name']}
          />

          <SelectField
            label="Categoría"
            value={form.tier}
            onChange={(event) => update('tier', event.target.value as SponsorTier)}
            error={fieldErrors['tier']}
          >
            {SPONSOR_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {SPONSOR_TIER_LABELS[tier]}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Sitio web"
            type="url"
            inputMode="url"
            placeholder="https://ejemplo.com"
            value={form.url}
            onChange={(event) => update('url', event.target.value)}
            error={fieldErrors['url']}
          />

          <TextField
            label="Orden"
            type="number"
            inputMode="numeric"
            min={0}
            max={9999}
            required
            value={form.order}
            onChange={(event) => update('order', event.target.value)}
            error={fieldErrors['order']}
            hint="Menor número aparece primero."
          />
        </div>

        <ImageField
          label="Logotipo"
          value={form.logoUrl}
          onChange={(value) => update('logoUrl', value)}
          error={fieldErrors['logoUrl']}
        />

        <FormFooter saving={saving} onCancel={onClose} />
      </form>
    </AdminModal>
  )
}
