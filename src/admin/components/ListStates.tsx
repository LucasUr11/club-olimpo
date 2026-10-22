// ============================================================================
// Estados de lista: cargando, error y vacío.
// ============================================================================

import type { ReactNode } from 'react'
import { Inbox, RefreshCw } from 'lucide-react'

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="mt-6 grid gap-3 lg:grid-cols-2" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-red-800">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:border-red-400"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Reintentar
      </button>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden />}
      </span>
      <p className="font-display text-xl font-bold uppercase text-azul">{title}</p>
      <p className="max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 rounded-full bg-amarillo px-5 py-2.5 text-sm font-bold text-azul transition hover:bg-amarillo-dark"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
