'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice, getLocalizedName } from '@/lib/utils'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import type { Locale } from '@/types'

export default function CartPage() {
  const t = useTranslations('cart')
  const locale = useLocale() as Locale
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()

  return (
    <div className="min-h-screen bg-washi">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-light text-ink tracking-wide mb-10">{t('title')}</h1>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <ShoppingBag className="w-12 h-12 text-mist mx-auto mb-4" />
            <p className="text-lg font-light text-earth mb-2">{t('empty')}</p>
            <p className="text-sm font-light text-earth/60 mb-8">{t('emptyHint')}</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-washi text-sm font-light tracking-wide hover:bg-earth transition-colors"
            >
              {t('continueShopping')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-0 divide-y divide-mist">
              {items.map((item) => {
                const name = getLocalizedName(item, locale)
                return (
                  <div key={item.id} className="py-6 flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 bg-mist/30 rounded overflow-hidden shrink-0">
                      {item.images[0] ? (
                        <Image src={item.images[0]} alt={name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-mist text-xl select-none">
                          和
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.id}`}
                        className="text-sm font-light text-ink hover:text-earth transition-colors line-clamp-2"
                      >
                        {name}
                      </Link>
                      <p className="text-sm font-light text-earth mt-1">
                        {formatPrice(item.price_cny)}
                      </p>

                      {/* Quantity */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-mist rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-earth hover:text-ink text-sm"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-light">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                            className="w-7 h-7 flex items-center justify-center text-earth hover:text-ink text-sm"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-earth/50 hover:text-red-400 transition-colors"
                          aria-label={t('remove')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-light text-ink">
                        {formatPrice(item.price_cny * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-mist rounded p-6 sticky top-24">
                <h2 className="text-base font-light text-ink tracking-wide mb-6">
                  {t('total')}
                </h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm font-light">
                      <span className="text-earth truncate max-w-[150px]">
                        {getLocalizedName(item, locale)} ×{item.quantity}
                      </span>
                      <span className="text-ink shrink-0">
                        {formatPrice(item.price_cny * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-mist pt-4 flex justify-between mb-6">
                  <span className="text-base font-light text-ink">{t('total')}</span>
                  <span className="text-base font-light text-ink">
                    {formatPrice(totalPrice())}
                  </span>
                </div>
                <Link href="/checkout">
                  <Button className="w-full" size="lg">
                    {t('checkout')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link
                  href="/products"
                  className="block text-center mt-3 text-sm font-light text-earth hover:text-ink transition-colors"
                >
                  {t('continueShopping')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
