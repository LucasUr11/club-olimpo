import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Handshake, MessageCircle, X } from 'lucide-react'
import { siteLinks } from '../../../shared/fixtures'

interface SponsorInquiryModalProps {
  onClose: () => void
}

interface SponsorInquiryForm {
  companyName: string
  message: string
  email: string
  phone: string
}

function getApiError(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null || !('error' in payload)) return null
  const error = payload.error
  if (typeof error !== 'object' || error === null || !('message' in error)) return null
  return typeof error.message === 'string' ? error.message : null
}

export default function SponsorInquiryModal({ onClose }: SponsorInquiryModalProps) {
  const [form, setForm] = useState<SponsorInquiryForm>({
    companyName: '',
    message: '',
    email: '',
    phone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const redirectTimerRef = useRef<number | null>(null)
  const isSubmittingRef = useRef(false)

  const handleClose = useCallback(() => {
    if (!isSubmittingRef.current) onClose()
  }, [onClose])

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
      if (redirectTimerRef.current !== null) window.clearTimeout(redirectTimerRef.current)
    }
  }, [handleClose])

  const updateForm = (field: keyof SponsorInquiryForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/sponsor-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      const payload: unknown = await response.json()

      if (!response.ok) {
        setError(getApiError(payload) ?? 'No se pudo enviar la solicitud. Intentá nuevamente.')
        return
      }

      setSubmitted(true)
      const whatsappMessage = [
        'Hola, Club Atlético Olimpo. Me comunico para conversar sobre una posible sponsorización.',
        '',
        `Empresa: ${form.companyName.trim()}`,
        `Consulta: ${form.message.trim()}`,
        `Correo: ${form.email.trim()}`,
        `Teléfono: ${form.phone.trim()}`,
        '',
        '¡Muchas gracias!',
      ].join('\n')
      const whatsappUrl = `https://wa.me/${siteLinks.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`
      redirectTimerRef.current = window.setTimeout(() => window.location.assign(whatsappUrl), 1500)
    } catch {
      setError('No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.')
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-end justify-center overflow-y-auto bg-azul-950/75 p-4 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sponsor-inquiry-title"
        aria-describedby="sponsor-inquiry-description"
        className="relative my-auto max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-azul-950/40"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-azul/55">Sponsors</p>
            <h2 id="sponsor-inquiry-title" className="mt-1 font-display text-2xl font-extrabold uppercase text-azul">
              Sumate al club
            </h2>
            <p id="sponsor-inquiry-description" className="mt-1 text-sm leading-relaxed text-slate-500">
              Contanos sobre tu empresa y cómo te gustaría acompañar a Olimpo.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-azul disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Cerrar formulario"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          {submitted ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900" role="status" aria-live="polite">
              <div className="flex items-center gap-2 font-semibold">
                <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
                ¡Solicitud enviada!
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                Guardamos tus datos. En unos segundos se abrirá WhatsApp con el mensaje listo para completar el contacto.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="sponsor-company" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Nombre de la empresa
                </label>
                <input
                  id="sponsor-company"
                  name="companyName"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="organization"
                  value={form.companyName}
                  onChange={(event) => updateForm('companyName', event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/20 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label htmlFor="sponsor-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Motivo de interés
                </label>
                <textarea
                  id="sponsor-message"
                  name="message"
                  required
                  maxLength={2000}
                  rows={4}
                  value={form.message}
                  onChange={(event) => updateForm('message', event.target.value)}
                  disabled={isSubmitting}
                  placeholder="Contanos qué tipo de acompañamiento tenés en mente."
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/20 disabled:bg-slate-100"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sponsor-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Correo electrónico
                  </label>
                  <input
                    id="sponsor-email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => updateForm('email', event.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/20 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="sponsor-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Teléfono
                  </label>
                  <input
                    id="sponsor-phone"
                    name="phone"
                    type="tel"
                    required
                    maxLength={25}
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => updateForm('phone', event.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/20 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-azul px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-azul/20 transition hover:bg-azul-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
              >
                <Handshake className="h-4 w-4" aria-hidden />
                {isSubmitting ? 'Enviando solicitud...' : 'Enviar solicitud'}
              </button>
              <p className="text-center text-xs leading-relaxed text-slate-500">
                Al enviar, guardaremos tu solicitud y se abrirá WhatsApp para continuar la conversación.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
