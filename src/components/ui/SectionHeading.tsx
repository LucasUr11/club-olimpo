import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: string
  align?: 'left' | 'center'
  /** `dark` = sobre fondo oscuro (texto claro). `light` = sobre fondo claro. */
  tone?: 'light' | 'dark'
}

/** Encabezado estándar de secciones: eyebrow + título display + bajada. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
}: SectionHeadingProps) {
  const onDark = tone === 'dark'

  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p
        className={cn(
          'mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em]',
          align === 'center' && 'justify-center',
          onDark ? 'text-amarillo' : 'text-azul',
        )}
      >
        <span aria-hidden className="h-0.5 w-8 bg-amarillo" />
        {eyebrow}
      </p>

      <h2
        className={cn(
          'font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl',
          onDark ? 'text-white' : 'text-azul',
        )}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            'mt-4 text-sm leading-relaxed md:text-base',
            onDark ? 'text-white/65' : 'text-slate-600',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
