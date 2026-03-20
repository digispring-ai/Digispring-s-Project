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
      {/* Image container — sharp corners, no radius */}
      <div className="relative overflow-hidden bg-mist/25 aspect-square">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl text-mist select-none font-serif">和</span>
          </div>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-washi/75 flex items-center justify-center">
            <span className="text-[10px] font-light text-earth tracking-[0.25em]">
              {t('outOfStock')}
            </span>
          </div>
        )}

        {/* Quick add — bottom-left, appears on hover */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 h-8 bg-ink/85 text-washi text-[10px] font-light tracking-[0.2em] flex items-center justify-center gap-1.5 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-sumi"
            aria-label={t('addToCart')}
          >
            <ShoppingCart className="w-3 h-3" />
            {t('addToCart')}
          </button>
        )}

        {/* Top-right: Japanese-style label if new */}
        {/* Could add "新着" badge here based on created_at logic */}
      </div>

      {/* Product info */}
      <div className="mt-3 space-y-1">
        {product.merchants && (
          <p className="text-[10px] font-light text-earth tracking-[0.15em] truncate uppercase">
            {getLocalizedName(product.merchants, locale)}
          </p>
        )}
        <h3 className="text-sm font-light text-ink leading-snug line-clamp-2 group-hover:text-earth transition-colors duration-200 tracking-wide">
          {name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-light text-ink tracking-wide">
            {formatPrice(product.price_cny)}
          </span>
          <span className="text-[10px] text-earth/70 font-light">
            {formatPrice(product.price_jpy, 'jpy')}
          </span>
        </div>
      </div>
    </Link>
  )
}
