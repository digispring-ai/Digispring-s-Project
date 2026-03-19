'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'

interface Props {
  product: Product
}

export function AddToCartButton({ product }: Props) {
  const t = useTranslations('product')
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)

  if (product.stock === 0) {
    return (
      <Button variant="secondary" disabled className="w-full">
        {t('outOfStock')}
      </Button>
    )
  }

  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-light text-earth">数量</span>
        <div className="flex items-center border border-mist rounded">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center text-earth hover:text-ink"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-light">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="w-8 h-8 flex items-center justify-center text-earth hover:text-ink"
          >
            +
          </button>
        </div>
      </div>

      <Button onClick={handleAdd} className="w-full gap-2" size="lg">
        {added ? (
          <>
            <Check className="w-4 h-4" />
            已加入
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            {t('addToCart')}
          </>
        )}
      </Button>
    </div>
  )
}
