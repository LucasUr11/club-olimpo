// Formateadores compartidos (fechas y precios) — locale es-AR.

const dayMonth = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })
const dayMonthYear = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
const time = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' })
const fullDate = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
const price = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export interface KickoffInfo {
  /** Ej.: "dom 25 oct" */
  dateLabel: string
  /** Ej.: "18:30" */
  timeLabel: string
  /** Ej.: "domingo 25 de octubre" */
  fullLabel: string
}

export function formatKickoff(iso: string): KickoffInfo {
  const date = new Date(iso)
  return {
    dateLabel: dayMonthYear.format(date),
    timeLabel: time.format(date),
    fullLabel: fullDate.format(date),
  }
}

/** Ej.: "18 oct" */
export function formatShortDate(iso: string): string {
  return dayMonth.format(new Date(iso))
}

/** Ej.: "$42.999" */
export function formatPrice(amount: number, currency: string = 'ARS'): string {
  if (currency !== 'ARS') {
    return `${amount.toLocaleString('es-AR')} ${currency}`
  }
  return price.format(amount)
}
