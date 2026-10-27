// ============================================================================
// Rutas públicas simples (sin router): el hosting debe reescribir a index.html.
// ============================================================================

export function currentPathname(pathname = window.location.pathname): string {
  return pathname.replace(/\/+$/, '') || '/'
}

export function isAdminRoute(pathname?: string): boolean {
  return currentPathname(pathname).endsWith('/admin')
}

export function isShopRoute(pathname?: string): boolean {
  return currentPathname(pathname).endsWith('/tienda')
}

export function getSportSlug(pathname?: string): string | null {
  const match = currentPathname(pathname).match(/^\/deportes\/([^/]+)$/)
  return match?.[1] ?? null
}

export function getNewsSlug(pathname?: string): string | null {
  const match = currentPathname(pathname).match(/^\/noticias\/([^/]+)$/)
  return match?.[1] ?? null
}
