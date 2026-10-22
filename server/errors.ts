// ============================================================================
// Error de API tipado: permite que repositorios y handlers señalen un status
// HTTP y un código estable para el cliente sin acoplarse a la respuesta HTTP.
// ============================================================================

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: Record<string, unknown> | undefined

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}
