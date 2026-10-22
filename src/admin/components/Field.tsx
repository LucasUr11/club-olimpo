// ============================================================================
// Campos de formulario del panel (label + error + hint consistentes).
// ============================================================================

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'

const CONTROL_CLASSES =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'

interface FieldChromeProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

function FieldChrome({ id, label, error, hint, required, className, children }: FieldChromeProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-600">
        {label}
        {required ? (
          <span className="ml-1 text-red-500" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

// ── Text ───────────────────────────────────────────────────────────────────

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  containerClassName?: string
}

export function TextField({
  label,
  error,
  hint,
  containerClassName,
  id,
  required,
  className,
  ...input
}: TextFieldProps) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <FieldChrome
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <input
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(CONTROL_CLASSES, error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20', className)}
        {...input}
      />
    </FieldChrome>
  )
}

// ── Textarea ───────────────────────────────────────────────────────────────

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
  containerClassName?: string
}

export function TextAreaField({
  label,
  error,
  hint,
  containerClassName,
  id,
  required,
  className,
  ...textarea
}: TextAreaFieldProps) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <FieldChrome
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(CONTROL_CLASSES, 'min-h-24 resize-y', error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20', className)}
        {...textarea}
      />
    </FieldChrome>
  )
}

// ── Select ─────────────────────────────────────────────────────────────────

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  hint?: string
  containerClassName?: string
  children: ReactNode
}

export function SelectField({
  label,
  error,
  hint,
  containerClassName,
  id,
  required,
  className,
  children,
  ...select
}: SelectFieldProps) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <FieldChrome
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <select
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(CONTROL_CLASSES, 'cursor-pointer appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9', error && 'border-red-400', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...select}
      >
        {children}
      </select>
    </FieldChrome>
  )
}

// ── Checkbox ───────────────────────────────────────────────────────────────

interface CheckboxFieldProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  disabled?: boolean
}

export function CheckboxField({
  label,
  description,
  checked,
  onChange,
  error,
  disabled,
}: CheckboxFieldProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 transition hover:border-azul/30"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-azul"
        />
        <span className="leading-snug">
          <span className="block text-sm font-medium text-slate-700">{label}</span>
          {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
        </span>
      </label>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
