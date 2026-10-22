// ============================================================================
// Encabezado de cada sección del panel (título, conteo y acción "Nuevo").
// ============================================================================

import { Plus } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  description: string
  count: number
  countLabel: string
  onNew: () => void
  newLabel: string
}

export default function SectionHeader({
  title,
  description,
  count,
  countLabel,
  onNew,
  newLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase leading-none tracking-wide text-azul sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
          {count} {countLabel}
        </span>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-azul px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-azul/20 transition hover:bg-azul-700 active:scale-[0.98] sm:flex-none"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {newLabel}
        </button>
      </div>
    </div>
  )
}
