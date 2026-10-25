// ============================================================================
// Rutas públicas simples (sin router): el hosting debe reescribir a index.html.
// ============================================================================

export function currentPathname(): string {
  return window.location.pathname.replace(/\/+$/, '') || '/'
}

export function isAdminRoute(): boolean {
  return currentPathname().endsWith('/admin')
}

export function isShopRoute(): boolean {
  return currentPathname().endsWith('/tienda')
}

export function getSportSlug(): string | null {
  const match = currentPathname().match(/^\/deportes\/([^/]+)$/)
  return match?.[1] ?? null
}

/** Enlaza a una sección del inicio, incluso desde una ruta pública dedicada. */
export function homeHref(hash: string): string {
  return isAdminRoute() || isShopRoute() || getSportSlug() !== null ? `/${hash}` : hash
}
