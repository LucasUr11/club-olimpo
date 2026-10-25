import { useState, type FormEvent } from 'react'
import { GraduationCap, Pencil, Trash2 } from 'lucide-react'
import {
  DISCIPLINES,
  DISCIPLINE_LABELS,
  SPORT_MEMBER_ROLES,
  type Discipline,
  type SportMember,
  type SportMemberRole,
} from '../../../shared/types'
import { parseSportMemberCreate } from '../../../shared/validation'
import { adminApi } from '../../lib/adminApi'
import { cn } from '../../lib/cn'
import { applyApiError } from '../formUtils'
import { useAdminResource } from '../useAdminResource'
import { useFeedback } from '../feedback'
import AdminModal from '../components/AdminModal'
import ConfirmDialog from '../components/ConfirmDialog'
import FormFooter from '../components/FormFooter'
import ImageField from '../components/ImageField'
import ImagePreview from '../components/ImagePreview'
import SectionHeader from '../components/SectionHeader'
import { EmptyState, ListError, ListSkeleton } from '../components/ListStates'
import { SelectField, TextAreaField, TextField } from '../components/Field'

interface SportMemberFormState {
  name: string
  role: SportMemberRole
  sport: Discipline
  imageUrl: string | null
  details: string
}

const EMPTY_FORM: SportMemberFormState = {
  name: '',
  role: 'PROFESSOR',
  sport: 'futbol',
  imageUrl: null,
  details: '',
}

function memberToForm(member: SportMember): SportMemberFormState {
  return {
    name: member.name,
    role: member.role,
    sport: member.sport,
    imageUrl: member.imageUrl,
    details: member.details ?? '',
  }
}

function buildPayload(form: SportMemberFormState) {
  return {
    ...form,
    details: form.details.trim() === '' ? null : form.details,
  }
}

export default function SportMembersSection() {
  const { notify } = useFeedback()
  const { data: members, status, error, reload } = useAdminResource<SportMember>('sport-members')
  const [editor, setEditor] = useState<{ item: SportMember | null } | null>(null)
  const [toDelete, setToDelete] = useState<SportMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(): Promise<void> {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.remove('sport-members', toDelete.id)
      setToDelete(null)
      notify('success', 'Integrante eliminado. El sitio ya refleja el cambio.')
      await reload()
    } catch (deleteError) {
      notify('error', deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el integrante.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <SectionHeader
        title="Integrantes de disciplinas"
        description="Gestioná profesores y alumnos. Cada ficha aparece en la pestaña de su disciplina en el sitio."
        count={members.length}
        countLabel={members.length === 1 ? 'integrante' : 'integrantes'}
        onNew={() => setEditor({ item: null })}
        newLabel="Nuevo integrante"
      />

      {status === 'loading' ? (
        <ListSkeleton />
      ) : status === 'error' ? (
        <ListError
          message={error ?? 'No se pudieron cargar los integrantes.'}
          onRetry={() => void reload()}
        />
      ) : members.length === 0 ? (
        <EmptyState
          title="Sin integrantes cargados"
          description="Agregá profesores y alumnos para completar las fichas de las disciplinas."
          actionLabel="Cargar el primer integrante"
          onAction={() => setEditor({ item: null })}
          icon={<GraduationCap className="h-6 w-6" aria-hidden />}
        />
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {members.map((member) => (
            <MemberAdminCard
              key={member.id}
              member={member}
              onEdit={() => setEditor({ item: member })}
              onDelete={() => setToDelete(member)}
            />
          ))}
        </div>
      )}

      {editor ? (
        <SportMemberFormModal
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
        title="Eliminar integrante"
        message={`Se va a eliminar la ficha de ${toDelete?.name ?? ''}. Esta acción no se puede deshacer.`}
        busy={deleting}
        onCancel={() => {
          if (!deleting) setToDelete(null)
        }}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}

function MemberAdminCard({
  member,
  onEdit,
  onDelete,
}: {
  member: SportMember
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <ImagePreview src={member.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-azul px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {DISCIPLINE_LABELS[member.sport]}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              member.role === 'PROFESSOR' ? 'bg-amarillo text-azul' : 'bg-azul/10 text-azul',
            )}
          >
            {member.role === 'PROFESSOR' ? 'Profesor/a' : 'Alumno/a'}
          </span>
        </div>
        <h2 className="mt-1.5 truncate font-display text-xl font-bold uppercase text-azul">{member.name}</h2>
        {member.details ? <p className="mt-1 line-clamp-2 text-sm text-slate-500">{member.details}</p> : null}
        <div className="mt-2 flex items-center justify-end gap-1 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-azul/5 hover:text-azul"
            aria-label={`Editar integrante ${member.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar integrante ${member.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

function SportMemberFormModal({
  item,
  onClose,
  onSaved,
}: {
  item: SportMember | null
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const [form, setForm] = useState<SportMemberFormState>(() => (item ? memberToForm(item) : EMPTY_FORM))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof SportMemberFormState>(key: K, value: SportMemberFormState[K]): void {
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

    const parsed = parseSportMemberCreate(buildPayload(form))
    if (!parsed.ok) {
      setFieldErrors(parsed.errors)
      setGeneralError('Revisá los campos marcados.')
      return
    }

    setFieldErrors({})
    setSaving(true)
    try {
      if (item) await adminApi.update<SportMember>('sport-members', item.id, parsed.value)
      else await adminApi.create<SportMember>('sport-members', parsed.value)
      onSaved(item ? 'Integrante actualizado.' : 'Integrante creado.')
    } catch (saveError) {
      applyApiError(saveError, setGeneralError, setFieldErrors)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminModal
      open
      title={item ? 'Editar integrante' : 'Nuevo integrante'}
      description="Completá los datos que se mostrarán en la sección de disciplinas."
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
          label="Nombre"
          required
          maxLength={120}
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          error={fieldErrors['name']}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Rol"
            required
            value={form.role}
            onChange={(event) => update('role', event.target.value as SportMemberRole)}
            error={fieldErrors['role']}
          >
            {SPORT_MEMBER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role === 'PROFESSOR' ? 'Profesor/a' : 'Alumno/a'}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Disciplina"
            required
            value={form.sport}
            onChange={(event) => update('sport', event.target.value as Discipline)}
            error={fieldErrors['sport']}
          >
            {DISCIPLINES.map((sport) => (
              <option key={sport} value={sport}>
                {DISCIPLINE_LABELS[sport]}
              </option>
            ))}
          </SelectField>
        </div>

        <ImageField
          label="Foto (opcional)"
          value={form.imageUrl}
          onChange={(value) => update('imageUrl', value)}
          error={fieldErrors['imageUrl']}
        />

        <TextAreaField
          label="Detalles (opcional)"
          rows={3}
          maxLength={1000}
          value={form.details}
          onChange={(event) => update('details', event.target.value)}
          error={fieldErrors['details']}
          hint={`${form.details.length}/1000 caracteres`}
        />

        <FormFooter saving={saving} onCancel={onClose} />
      </form>
    </AdminModal>
  )
}
