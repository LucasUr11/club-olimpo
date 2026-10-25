import { useCallback, useEffect, useRef, useState } from 'react'
import { UserRound, X } from 'lucide-react'
import type { SportMember } from '../../../shared/types'
import { DISCIPLINE_LABELS } from '../../../shared/types'

interface SportMemberModalProps {
  member: SportMember
  onClose: () => void
}

export default function SportMemberModal({ member, onClose }: SportMemberModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const isClosingRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return

    isClosingRef.current = true
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(onClose, 180)
  }, [onClose])

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    }
  }, [handleClose])

  const roleLabel = member.role === 'PROFESSOR' ? 'Profesor/a' : 'Jugador/a'

  return (
    <div
      className={`sport-member-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-azul-950/75 p-4 backdrop-blur-sm sm:p-6${isClosing ? ' sport-member-modal-backdrop--closing' : ''}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sport-member-modal-title"
        aria-describedby="sport-member-modal-details"
        className={`sport-member-modal-panel relative my-auto grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-azul-950/40 sm:grid-cols-2${isClosing ? ' sport-member-modal-panel--closing' : ''}`}
      >
        <div className="relative min-h-56 overflow-hidden bg-azul/5 sm:min-h-80">
          {member.imageUrl ? (
            <img src={member.imageUrl} alt={member.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-azul/30" aria-hidden>
              <UserRound className="h-24 w-24" />
            </div>
          )}
        </div>

        <div className="relative flex min-h-64 flex-col p-6 pt-14 sm:p-8 sm:pt-14">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 cursor-pointer rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-azul focus-visible:outline-azul"
            aria-label="Cerrar detalle del integrante"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amarillo px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-azul">
              {roleLabel}
            </span>
            <span className="rounded-full bg-azul/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-azul">
              {DISCIPLINE_LABELS[member.sport]}
            </span>
          </div>
          <h2 id="sport-member-modal-title" className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-azul">
            {member.name}
          </h2>
          <div
            id="sport-member-modal-details"
            className="mt-5 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600"
          >
            {member.details || 'No hay información adicional disponible.'}
          </div>
        </div>
      </section>
    </div>
  )
}
