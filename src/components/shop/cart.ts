import { formatPrice } from '../../lib/format'
import { siteLinks } from '../../../shared/fixtures'
import type { Product } from '../../../shared/types'

export interface CartLine {
  product: Product
  quantity: number
}

export const MAX_QUANTITY = 99
export const ALL_CATEGORIES = '__all__'

export function unitPrice(product: Product, isMember: boolean): number {
  return isMember ? product.memberPrice : product.nonMemberPrice
}

export function calculateTotals(
  cartLines: CartLine[],
  isMember: boolean,
): Array<[string, number]> {
  const byCurrency = new Map<string, number>()
  for (const { product, quantity } of cartLines) {
    const currency = product.currency
    byCurrency.set(
      currency,
      (byCurrency.get(currency) ?? 0) + unitPrice(product, isMember) * quantity,
    )
  }
  return [...byCurrency.entries()]
}

export function buildOrderMessage(cartLines: CartLine[], isMember: boolean): string {
  const lines: string[] = ['Hola Club Atlético Olimpo! Quiero hacer este pedido:', '']

  for (const { product, quantity } of cartLines) {
    const unit = unitPrice(product, isMember)
    lines.push(
      `• ${quantity} × ${product.name} — ${formatPrice(unit, product.currency)} c/u = ${formatPrice(
        unit * quantity,
        product.currency,
      )}`,
    )
  }

  const totals = calculateTotals(cartLines, isMember)
  lines.push('')
  for (const [currency, total] of totals) {
    const label = totals.length > 1 ? `Total ${currency}` : 'Total'
    lines.push(`${label}: ${formatPrice(total, currency)}`)
  }
  lines.push(`Condición: ${isMember ? 'Socio' : 'No socio'}`)
  lines.push('', 'Por favor confirmen disponibilidad y forma de pago. ¡Gracias!')

  return lines.join('\n')
}

export function buildCheckoutUrl(cartLines: CartLine[], isMember: boolean): string | null {
  if (cartLines.length === 0) return null
  return `https://wa.me/${siteLinks.whatsapp}?text=${encodeURIComponent(
    buildOrderMessage(cartLines, isMember),
  )}`
}
