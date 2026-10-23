// ============================================================================
// Sección Próximos partidos: listado, alta, edición y borrado.
// ============================================================================

import { useState, type FormEvent } from 'react'
import { CalendarDays, Clock, MapPin, Pencil, Trash2 } from 'lucide-react'
import {
  DISCIPLINES,
  DISCIPLINE_LABELS,
  MATCH_STATUSES,
  MATCH_STATUS_LABELS,
  type Discipline,
  type Match,
  type MatchStatus,
} from '../../../shared/types'
import { parseMatchCreate } from '../../../shared/validation'
import { adminApi } from '../../lib/adminApi'
import { cn } from '../../lib/cn'
import { formatKickoff } from '../../lib/format'
import { applyApiError, fromDateTimeLocal, toDateTimeLocal } from '../formUtils'
import { useAdminResource } from '../useAdminResource'
import { useFeedback } from '../feedback'
import AdminModal from '../components/AdminModal'
import ConfirmDialog from '../components/ConfirmDialog'
import FormFooter from '../components/FormFooter'
import SectionHeader from '../components/SectionHeader'
import { EmptyState, ListError, ListSkeleton } from '../components/ListStates'
import { CheckboxField, SelectField, TextField } from '../components/Field'

interface MatchFormState {
  discipline: Discipline
  team: string
  opponent: string
  isHome: boolean
  kickoff: string
  competition: string
  venue: string
  status: MatchStatus
  homeScore: string
  awayScore: string
}

const EMPTY_FORM: MatchFormState = {
  discipline: 'futbol',
  team: '',
  opponent: '',
  isHome: true,
  kickoff: '',
  competition: '',
  venue: '',
  status: 'scheduled',
  homeScore: '',
  awayScore: '',
}

function matchToForm(match: Match): MatchFormState {
  return {
    discipline: match.discipline,
    team: match.team,
    opponent: match.opponent,
    isHome: match.isHome,
    kickoff: toDateTimeLocal(match.kickoff),
    competition: match.competition,
    venue: match.venue ?? '',
    status: match.status,
    homeScore: match.homeScore === null ? '' : String(match.homeScore),
    awayScore: match.awayScore === null ? '' : String(match.awayScore),
  }
}

function scoreOrNull(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  return Number(trimmed)
}

function buildPayload(form: MatchFormState) {
  return {
    discipline: form.discipline,
    team: form.team,
    opponent: form.opponent,
    isHome: form.isHome,
    kickoff: fromDateTimeLocal(form.kickoff) ?? '',
    competition: form.competition,
    venue: form.venue.trim() === '' ? null : form.venue,
    status: form.status,
    homeScore: scoreOrNull(form.homeScore),
    awayScore: scoreOrNull(form.awayScore),
  }
}

export default function MatchesSection() {
  const { notify } = useFeedback()
  const { data: matches, status, error, reload } = useAdminResource<Match>('matches')
  const [editor, setEditor] = useState<{ item: Match | null } | null>(null)
  const [toDelete, setToDelete] = useState<Match | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(): Promise<void> {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminApi.remove('matches', toDelete.id)
      setToDelete(null)
      notify('success', 'Partido eliminado. El sitio ya refleja el cambio.')
      await reload()
    } catch (deleteError) {
      notify('error', deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el partido.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <SectionHeader
        title="Próximos partidos"
        description="Agenda del primer equipo, inferiores y demás disciplinas. Los partidos programados con fecha futura aparecen en el portal."
        count={matches.length}
        countLabel={matches.length === 1 ? 'partido' : 'partidos'}
        onNew={() => setEditor({ item: null })}
        newLabel="Nuevo partido"
      />

      {status === 'loading' ? (
        <ListSkeleton />
      ) : status === 'error' ? (
        <ListError message={error ?? 'No se pudieron cargar los partidos.'} onRetry={() => void reload()} />
      ) : matches.length === 0 ? (
        <EmptyState
          title="Sin partidos cargados"
          description="Cargá el próximo encuentro para que aparezca en la agenda del sitio."
          actionLabel="Cargar el primer partido"
          onAction={() => setEditor({ item: null })}
          icon={<CalendarDays className="h-6 w-6" aria-hidden />}
        />
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onEdit={() => setEditor({ item: match })}
              onDelete={() => setToDelete(match)}
            />
          ))}
        </div>
      )}

      {editor ? (
        <MatchFormModal
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
        title="Eliminar partido"
        message={`Se va a eliminar el partido de ${toDelete?.team ?? ''} contra ${toDelete?.opponent ?? ''}. Esta acción no se puede deshacer.`}
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

const STATUS_STYLES: Record<MatchStatus, string> = {
  scheduled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  finished: 'bg-slate-100 text-slate-600 border-slate-200',
  postponed: 'bg-amber-50 text-amber-800 border-amber-200',
}

function MatchCard({
  match,
  onEdit,
  onDelete,
}: {
  match: Match
  onEdit: () => void
  onDelete: () => void
}) {
  const kickoff = formatKickoff(match.kickoff)

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-azul/25 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-azul px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amarillo">
              {DISCIPLINE_LABELS[match.discipline]}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{match.team}</span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                STATUS_STYLES[match.status],
              )}
            >
              {MATCH_STATUS_LABELS[match.status]}
            </span>
          </div>

          <h3 className="mt-1.5 truncate font-display text-xl font-bold uppercase leading-tight text-azul">
            Olimpo <span className="font-normal italic text-slate-400">vs</span>{' '}
            <span className="text-slate-800">{match.opponent}</span>
          </h3>

          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-azul" aria-hidden />
              {kickoff.dateLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-azul" aria-hidden />
              {kickoff.timeLabel} hs
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-azul" aria-hidden />
              {match.venue ?? 'Por confirmar'}
            </span>
          </p>
        </div>

        {match.status === 'finished' && match.homeScore !== null && match.awayScore !== null ? (
          <span className="shrink-0 rounded-lg bg-azul px-3 py-1.5 font-display text-lg font-extrabold text-white">
            {match.homeScore}–{match.awayScore}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="min-w-0 truncate text-xs text-slate-500">
          {match.competition} · {match.isHome ? 'Local' : 'Visitante'}
        </span>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-azul/5 hover:text-azul"
            aria-label={`Editar partido contra ${match.opponent}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar partido contra ${match.opponent}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

// ── Formulario ─────────────────────────────────────────────────────────────

function MatchFormModal({
  item,
  onClose,
  onSaved,
}: {
  item: Match | null
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const [form, setForm] = useState<MatchFormState>(() => (item ? matchToForm(item) : EMPTY_FORM))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof MatchFormState>(key: K, value: MatchFormState[K]): void {
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

    const parsed = parseMatchCreate(buildPayload(form))
    if (!parsed.ok) {
      setFieldErrors(parsed.errors)
      setGeneralError('Revisá los campos marcados.')
      return
    }

    setFieldErrors({})
    setSaving(true)
    try {
      if (item) await adminApi.update<Match>('matches', item.id, parsed.value)
      else await adminApi.create<Match>('matches', parsed.value)
      onSaved(
        item
          ? 'Partido actualizado. El sitio ya refleja los cambios.'
          : 'Partido creado. El sitio ya refleja los cambios.',
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
      title={item ? 'Editar partido' : 'Nuevo partido'}
      description="Los datos se guardan en Turso y se publican en la agenda del sitio."
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
          <SelectField
            label="Disciplina"
            required
            value={form.discipline}
            onChange={(event) => update('discipline', event.target.value as Discipline)}
            error={fieldErrors['discipline']}
          >
            {DISCIPLINES.map((discipline) => (
              <option key={discipline} value={discipline}>
                {DISCIPLINE_LABELS[discipline]}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Equipo"
            required
            placeholder="Primera División"
            value={form.team}
            onChange={(event) => update('team', event.target.value)}
            error={fieldErrors['team']}
          />

          <TextField
            label="Rival"
            required
            placeholder="Recreativo de Laborde"
            value={form.opponent}
            onChange={(event) => update('opponent', event.target.value)}
            error={fieldErrors['opponent']}
          />

          <TextField
            label="Competencia"
            required
            placeholder="Apertura 2026 — Liga Beccar Varela"
            value={form.competition}
            onChange={(event) => update('competition', event.target.value)}
            error={fieldErrors['competition']}
          />

          <TextField
            label="Fecha y hora"
            type="datetime-local"
            required
            value={form.kickoff}
            onChange={(event) => update('kickoff', event.target.value)}
            error={fieldErrors['kickoff']}
          />

          <TextField
            label="Estadio / cancha"
            placeholder="Estadio Coco Bordi"
            value={form.venue}
            onChange={(event) => update('venue', event.target.value)}
            error={fieldErrors['venue']}
          />

          <SelectField
            label="Estado"
            value={form.status}
            onChange={(event) => update('status', event.target.value as MatchStatus)}
            error={fieldErrors['status']}
          >
            {MATCH_STATUSES.map((status) => (
              <option key={status} value={status}>
                {MATCH_STATUS_LABELS[status]}
              </option>
            ))}
          </SelectField>

          <div className="flex items-end">
            <CheckboxField
              label="Olimpo es local"
              description="Se muestra como “Local” en la agenda."
              checked={form.isHome}
              onChange={(checked) => update('isHome', checked)}
            />
          </div>

          <TextField
            label="Goles de Olimpo"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            placeholder="Solo partidos finalizados"
            value={form.homeScore}
            onChange={(event) => update('homeScore', event.target.value)}
            error={fieldErrors['homeScore']}
          />

          <TextField
            label="Goles del rival"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            placeholder="Solo partidos finalizados"
            value={form.awayScore}
            onChange={(event) => update('awayScore', event.target.value)}
            error={fieldErrors['awayScore']}
          />
        </div>

        <FormFooter saving={saving} onCancel={onClose} />
      </form>
    </AdminModal>
  )
}
