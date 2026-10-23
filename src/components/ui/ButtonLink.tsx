import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'accent' | 'primary' | 'outline-light' | 'outline-dark'
type Size = 'sm' | 'md' | 'lg'

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  size?: Size
  /** Icono opcional al inicio del texto. */
  icon?: ReactNode
}

const VARIANT_CLASSES: Record<Variant, string> = {
  /** Amarillo (CTA principal sobre fondos oscuros). */
  accent: 'bg-amarillo text-azul hover:bg-amarillo-dark shadow-lg shadow-amarillo/20',
  /** Azul profundo (CTA principal sobre fondos claros). */
  primary: 'bg-azul text-white hover:bg-azul-700 shadow-lg shadow-azul/25',
  'outline-light': 'border border-white/40 text-white hover:border-amarillo hover:text-amarillo',
  'outline-dark': 'border border-azul/30 text-azul hover:border-azul hover:bg-azul hover:text-white',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

/** CTA en formato píldora, consistente en todo el portal. */
export default function ButtonLink({
  variant = 'accent',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98]',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </a>
  )
}
