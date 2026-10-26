// ============================================================================
// Login del panel: valida la contraseña contra POST /api/auth/login.
// ============================================================================

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { AdminApiError, adminApi, setAdminToken } from '../lib/adminApi'
import AppLink from '../components/ui/AppLink'

interface AdminLoginProps {
  onSuccess: () => void
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (password.trim() === '') {
      setError('Ingresá la contraseña de administrador.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const session = await adminApi.login(password)
      setAdminToken(session.token)
      setPassword('')
      onSuccess()
    } catch (loginError) {
      if (loginError instanceof AdminApiError && loginError.status === 429) {
        setError('Demasiados intentos fallidos. Esperá unos minutos antes de volver a probar.')
      } else {
        setError(loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesión.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-azul px-4 py-10">
      {/* Textura institucional de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, #fbd800 0, #fbd800 2px, transparent 2px, transparent 26px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-amarillo/15 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <img src="/olimpo-logo.png" alt="Escudo del Club Atlético Olimpo" className="h-20 w-auto drop-shadow-lg" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.32em] text-amarillo">
            Club Atlético Olimpo A.M.
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold uppercase tracking-wide text-white">
            Panel de administración
          </h1>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          noValidate
          className="mt-7 rounded-3xl bg-white p-6 shadow-2xl shadow-azul-950/50 sm:p-8"
        >
          <div className="flex items-center gap-2 text-azul">
            <ShieldCheck className="h-5 w-5 text-amarillo-dark" aria-hidden />
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">Acceso restringido</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Ingresá la contraseña institucional para gestionar partidos, noticias, sponsors y productos.
          </p>

          <div className="mt-5">
            <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Contraseña
            </label>
            <div className="relative mt-1.5">
              <LockKeyhole
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                ref={inputRef}
                id="admin-password"
                type={visible ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError(null)
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'admin-password-error' : undefined}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/20"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>

            {error ? (
              <p id="admin-password-error" role="alert" className="mt-2 text-xs font-medium text-red-600">
                {error}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-amarillo px-6 py-3 text-sm font-bold text-azul shadow-lg shadow-amarillo/25 transition hover:bg-amarillo-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {submitting ? 'Verificando…' : 'Ingresar al panel'}
          </button>

          <AppLink
            href="/"
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-azul"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Volver al sitio
          </AppLink>
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-white/45">
          La sesión se guarda solo en esta pestaña.
          <br />
          No compartas la contraseña ni el acceso al panel.
        </p>
      </div>
    </div>
  )
}
