// ============================================================================
// Pie de formulario compartido: cancelar + guardar (con estado de carga).
// ============================================================================

import { Loader2 } from 'lucide-react'

interface FormFooterProps {
  saving: boolean
  onCancel: () => void
}

export default function FormFooter({ saving, onCancel }: FormFooterProps) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-amarillo px-6 py-2.5 text-sm font-bold text-azul shadow-md shadow-amarillo/30 transition hover:bg-amarillo-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  )
}
