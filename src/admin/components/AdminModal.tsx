// ============================================================================
// Modal accesible del panel (overlay, Escape, foco inicial y bloqueo de scroll).
// ============================================================================

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface AdminModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  /** Ignora Escape y el clic en el fondo mientras se guarda. */
  closeDisabled?: boolean
  children: ReactNode
}

export default function AdminModal({
  open,
  title,
  description,
  onClose,
  closeDisabled = false,
  children,
}: AdminModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeDisabled) onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTarget =
      panelRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, textarea, [data-autofocus]',
      ) ?? panelRef.current?.querySelector<HTMLElement>('button')
    focusTarget?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, closeDisabled, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-azul-950/70 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl shadow-azul-950/40 sm:max-w-3xl sm:rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 id="admin-modal-title" className="font-display text-xl font-extrabold uppercase tracking-wide text-azul">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
