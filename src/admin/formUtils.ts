// ============================================================================
// Utilidades de formulario del panel.
// ============================================================================

import { AdminApiError } from '../lib/adminApi'

/** ISO-8601 → valor para <input type="datetime-local"> (hora local del navegador). */
export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Valor de datetime-local → ISO UTC (o null si está vacío/ inválido). */
export function fromDateTimeLocal(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** Genera un slug compatible con la validación del backend. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/** Aplica los errores de la API a un formulario (campos + mensaje general). */
export function applyApiError(
  error: unknown,
  setGeneralError: (message: string) => void,
  setFieldErrors: (errors: Record<string, string>) => void,
): void {
  if (error instanceof AdminApiError) {
    if (error.details && Object.keys(error.details).length > 0) {
      setFieldErrors(error.details)
    }
    setGeneralError(error.message)
    return
  }
  setGeneralError(error instanceof Error ? error.message : 'Ocurrió un error inesperado.')
}
