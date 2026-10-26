// ============================================================================
// Feedback del panel: toasts de éxito/error accesibles (aria-live).
// ============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { cn } from '../lib/cn'

export type ToastKind = 'success' | 'error'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface FeedbackApi {
  notify: (kind: ToastKind, message: string) => void
}

const FeedbackContext = createContext<FeedbackApi | null>(null)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    return () => {
      for (const timer of timers.current) window.clearTimeout(timer)
    }
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++nextId.current
      setToasts((current) => [...current.slice(-2), { id, kind, message }])
      timers.current.push(window.setTimeout(() => dismiss(id), 5000))
    },
    [dismiss],
  )

  const api = useMemo<FeedbackApi>(() => ({ notify }), [notify])

  return (
    <FeedbackContext.Provider value={api}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-3 top-3 z-120 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-full sm:max-w-sm"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-xl shadow-azul-950/15',
              toast.kind === 'success' ? 'border-emerald-200' : 'border-red-200',
            )}
          >
            {toast.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
            )}
            <p className="flex-1 leading-snug text-slate-700">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="-mr-1 cursor-pointer rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  )
}

export function useFeedback(): FeedbackApi {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback debe usarse dentro de <FeedbackProvider>.')
  }
  return context
}
