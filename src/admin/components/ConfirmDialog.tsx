// ============================================================================
// Confirmación de borrado (acción destructiva).
// ============================================================================

import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import AdminModal from './AdminModal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AdminModal open={open} title={title} onClose={onCancel} closeDisabled={busy}>
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
        <p className="text-sm leading-relaxed text-red-900">{message}</p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          data-autofocus
          className="cursor-pointer rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
          {busy ? 'Eliminando…' : confirmLabel}
        </button>
      </div>
    </AdminModal>
  )
}
