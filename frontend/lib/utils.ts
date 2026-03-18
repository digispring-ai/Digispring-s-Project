import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Category, Locale, Merchant, Product } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalizedName(
  item: Product | Merchant | Category,
  locale: Locale
): string {
  if ('name_zh' in item) {
    // Product or Category
    if (locale === 'ja') return (item as Product).name_ja || (item as Product).name_zh
    if (locale === 'zh-hant') return (item as Product).name_zh_hant || (item as Product).name_zh
    if (locale === 'en') return (item as Product).name_en || (item as Product).name_zh
    return (item as Product).name_zh
  }
  if ('store_name_zh' in item) {
    // Merchant
    const m = item as Merchant
    if (locale === 'ja') return m.store_name_ja
    if (locale === 'zh-hant') return m.store_name_zh
    if (locale === 'en') return m.store_name_en || m.store_name_zh
    return m.store_name_zh
  }
  return ''
}

export function getLocalizedDescription(
  item: Product | Merchant,
  locale: Locale
): string {
  if ('description_zh' in item) {
    const p = item as Product
    if (locale === 'ja') return p.description_ja || p.description_zh || ''
    if (locale === 'zh-hant') return p.description_zh_hant || p.description_zh || ''
    if (locale === 'en') return p.description_en || p.description_zh || ''
    return p.description_zh || ''
  }
  return ''
}

export function formatPrice(amount: number, currency: 'cny' | 'jpy' = 'cny'): string {
  if (currency === 'jpy') {
    return `¥${Math.round(amount).toLocaleString('ja-JP')}`
  }
  return `¥${amount.toFixed(2)}`
}

export function getCategoryName(category: Category, locale: Locale): string {
  if (locale === 'ja') return category.name_ja
  if (locale === 'zh-hant') return category.name_zh_hant || category.name_zh
  if (locale === 'en') return category.name_en || category.name_zh
  return category.name_zh
}
