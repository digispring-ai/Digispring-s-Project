import { getTranslations } from 'next-intl/server'
import { notFound, redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ShippingAddress } from '@/types'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  pending: 'warning',
  confirmed: 'default',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'muted',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const t = await getTranslations('order')
  let user = null
  let order: any = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user ?? null
    if (user) {
      const { data: o } = await supabase
        .from('orders')
        .select('*, order_items(*, merchants(store_name_zh))')
        .eq('id', id)
        .eq('buyer_id', user.id)
        .single()
      order = o
    }
  } catch {
    // Supabase unavailable
  }

  if (!user) redirect('/auth/login')
  if (!order) notFound()

  const addr = order.shipping_address as ShippingAddress

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-light text-earth/60 mb-1">
              {t('orderNo')} {order.id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="text-xl font-light text-ink">{t('detail')}</h1>
          </div>
          <Badge variant={statusVariant[order.status] ?? 'default'} className="text-sm px-3 py-1">
            {t(`status.${order.status as 'pending'}`)}
          </Badge>
        </div>

        {/* Shipping Address */}
        <div className="bg-white border border-mist rounded p-5 mb-4">
          <h2 className="text-sm font-light text-earth/60 tracking-widest uppercase mb-3">收货信息</h2>
          <p className="text-sm font-light text-ink">{addr.name} · {addr.phone}</p>
          <p className="text-sm font-light text-earth mt-1">
            {addr.province} {addr.city} {addr.district} {addr.address}
          </p>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-mist rounded overflow-hidden mb-4">
          <h2 className="text-sm font-light text-earth/60 tracking-widest uppercase p-5 border-b border-mist">
            商品明细
          </h2>
          <div className="divide-y divide-mist">
            {(order.order_items as any[]).map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 bg-mist/30 rounded overflow-hidden shrink-0">
                  {item.product_image && (
                    <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light text-ink truncate">{item.product_name_zh}</p>
                  {item.merchants && (
                    <p className="text-xs text-earth/60">{item.merchants.store_name_zh}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-light text-ink">{formatPrice(item.price_cny)} × {item.quantity}</p>
                  <p className="text-xs text-earth/60">{formatPrice(item.price_cny * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center p-5 border-t border-mist">
            <span className="text-sm font-light text-ink">{t('total')}</span>
            <span className="text-base font-light text-ink">{formatPrice(order.total_cny)}</span>
          </div>
        </div>

        {/* Note */}
        {order.note && (
          <div className="bg-white border border-mist rounded p-5">
            <h2 className="text-sm font-light text-earth/60 tracking-widest uppercase mb-2">备注</h2>
            <p className="text-sm font-light text-earth">{order.note}</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
