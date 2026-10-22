// ============================================================================
// Página /admin: puerta de autenticación + panel autenticado.
// ----------------------------------------------------------------------------
// - Valida el token guardado contra GET /api/auth/session al entrar.
// - Si cualquier request devuelve 401, cierra la sesión y vuelve al login.
// - El token vive en sessionStorage (se borra al cerrar la pestaña).
// ============================================================================

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { adminApi, getAdminToken, onUnauthorized, setAdminToken } from '../lib/adminApi'
import AdminLogin from './AdminLogin'
import AdminShell from './AdminShell'
import { FeedbackProvider } from './feedback'

type AuthStatus = 'checking' | 'anonymous' | 'authenticated'

export default function AdminPage() {
  const [status, setStatus] = useState<AuthStatus>('checking')

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Panel · Club Atlético Olimpo'
    return () => {
      document.title = previousTitle
    }
  }, [])

  // Un 401 en cualquier request (token vencido o revocado) vuelve al login.
  useEffect(() => {
    onUnauthorized(() => {
      setAdminToken(null)
      setStatus('anonymous')
    })
    return () => onUnauthorized(null)
  }, [])

  // Revalida la sesión existente al cargar /admin.
  useEffect(() => {
    let active = true

    if (!getAdminToken()) {
      setStatus('anonymous')
      return
    }

    adminApi
      .session()
      .then(() => {
        if (active) setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        setAdminToken(null)
        setStatus('anonymous')
      })

    return () => {
      active = false
    }
  }, [])

  async function handleLogout(): Promise<void> {
    try {
      await adminApi.logout()
    } catch {
      // Aunque falle la revocación en el servidor, descartamos el token local.
    }
    setAdminToken(null)
    setStatus('anonymous')
  }

  if (status === 'checking') {
    return (
      <div className="grid min-h-screen place-items-center bg-azul px-4">
        <div className="flex flex-col items-center gap-4 text-white">
          <img src="/olimpo-logo.png" alt="" className="h-16 w-auto animate-pulse" />
          <p className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Verificando sesión…
          </p>
        </div>
      </div>
    )
  }

  if (status === 'anonymous') {
    return <AdminLogin onSuccess={() => setStatus('authenticated')} />
  }

  return (
    <FeedbackProvider>
      <AdminShell onLogout={() => void handleLogout()} />
    </FeedbackProvider>
  )
}
