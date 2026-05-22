import type { CartItem, PromoCode } from '@/types'
import { PROMO_CODES, SHIPPING_COSTS } from './constants'

export function getDiscountedPrice(basePrice: number, discountRate: number): number {
  return Math.round(basePrice * (1 - discountRate))
}

export function calculateLineTotal(pricePerKg: number, kg: number): number {
  return pricePerKg * kg
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0)
}

export function validatePromoCode(code: string): PromoCode | null {
  if (!code) return null
  const normalized = code.toUpperCase()
  return PROMO_CODES[normalized] ?? null
}

export function calculatePromoDiscount(
  subtotal: number,
  promo: PromoCode | null
): number {
  if (!promo) return 0
  if (promo.type === 'flat') return Math.min(promo.value, subtotal)
  return Math.round(subtotal * (promo.value / 100))
}

export function calculateShipping(
  items: CartItem[],
  location: 'inside_dhaka' | 'outside_dhaka'
): number {
  const hasFreeShipping = items.some((i) => i.freeShipping)
  if (hasFreeShipping || items.length === 0) return 0
  return SHIPPING_COSTS[location]
}

export function calculateTotal(
  subtotal: number,
  promoDiscount: number,
  shippingCost: number
): number {
  return Math.max(0, subtotal - promoDiscount + shippingCost)
}

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
