'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { getLocalizedName, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import type { Locale } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('product')
  const locale = useLocale() as Locale
  const addItem = useCartStore((s) => s.addItem)

  const name = getLocalizedName(product, locale)
  const coverImage = product.images[0]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product, 1)
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-mist/30 aspect-square rounded">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-103"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl text-mist select-none">和</span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-washi/70 flex items-center justify-center">
            <span className="text-xs font-light text-earth tracking-widest">{t('outOfStock')}</span>
          </div>
        )}
        {/* Quick add button */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-8 h-8 bg-ink text-washi rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-earth"
            aria-label={t('addToCart')}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="mt-3 space-y-1">
        {product.merchants && (
          <p className="text-xs font-light text-earth/60 tracking-wide truncate">
            {getLocalizedName(product.merchants, locale)}
          </p>
        )}
        <h3 className="text-sm font-light text-ink leading-snug line-clamp-2 group-hover:text-earth transition-colors">
          {name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-light text-ink">
            {formatPrice(product.price_cny)}
          </span>
          <span className="text-xs text-earth/50 font-light">
            {formatPrice(product.price_jpy, 'jpy')}
          </span>
        </div>
      </div>
    </Link>
  )
}
