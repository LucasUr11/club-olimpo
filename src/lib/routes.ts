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

/** Enlaza a una sección del inicio, incluso si estamos en `/tienda`. */
export function homeHref(hash: string): string {
  return isAdminRoute() || isShopRoute() ? `/${hash}` : hash
}
