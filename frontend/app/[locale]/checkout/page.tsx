'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useCartStore } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, getLocalizedName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { CheckCircle, Info } from 'lucide-react'
import type { Locale, ShippingAddress } from '@/types'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const ta = useTranslations('address')
  const locale = useLocale() as Locale
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()

  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    postal_code: '',
  })
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const total = totalPrice()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_cny: total,
        shipping_address: address,
        note: note || null,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      setError(orderError?.message ?? 'Failed to create order')
      setLoading(false)
      return
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      merchant_id: item.merchant_id,
      product_name_zh: item.name_zh,
      product_image: item.images[0] ?? null,
      quantity: item.quantity,
      price_cny: item.price_cny,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      setError(itemsError.message)
      setLoading(false)
      return
    }

    clearCart()
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle className="w-12 h-12 text-matcha mx-auto mb-6" />
          <h2 className="text-xl font-light text-ink tracking-wide mb-3">{t('success')}</h2>
          <p className="text-sm font-light text-earth mb-8">{t('successHint')}</p>
          <Button onClick={() => router.push('/orders')} variant="outline">
            查看订单
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-washi">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-light text-ink tracking-wide mb-10">{t('title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-mist rounded p-6">
              <h2 className="text-base font-light text-ink mb-6">{t('shippingAddress')}</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={ta('name')}
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    required
                  />
                  <Input
                    label={ta('phone')}
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label={ta('province')}
                    value={address.province}
                    onChange={(e) => setAddress({ ...address, province: e.target.value })}
                    required
                  />
                  <Input
                    label={ta('city')}
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    required
                  />
                  <Input
                    label={ta('district')}
                    value={address.district ?? ''}
                    onChange={(e) => setAddress({ ...address, district: e.target.value })}
                  />
                </div>
                <Input
                  label={ta('address')}
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  required
                />
                <Input
                  label={ta('postalCode')}
                  value={address.postal_code ?? ''}
                  onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-white border border-mist rounded p-6">
              <Textarea
                label={t('note')}
                placeholder={t('notePlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            {/* Payment Notice */}
            <div className="flex gap-3 p-4 bg-aged/10 rounded border border-aged/20">
              <Info className="w-4 h-4 text-earth shrink-0 mt-0.5" />
              <p className="text-sm font-light text-earth leading-relaxed">{t('paymentNotice')}</p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {t('submit')}
            </Button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-mist rounded p-6 sticky top-24">
              <h2 className="text-base font-light text-ink mb-6">{t('orderSummary')}</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-12 h-12 bg-mist/30 rounded overflow-hidden shrink-0">
                      {item.images[0] && (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-light text-ink truncate">
                        {getLocalizedName(item, locale)}
                      </p>
                      <p className="text-xs text-earth font-light">×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-light text-ink shrink-0">
                      {formatPrice(item.price_cny * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-mist pt-4 flex justify-between">
                <span className="font-light text-ink">合计</span>
                <span className="font-light text-ink">{formatPrice(totalPrice())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
