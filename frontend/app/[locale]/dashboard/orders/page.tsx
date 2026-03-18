import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { UpdateOrderStatusButton } from '@/components/forms/update-order-status'

const statusVariant: Record<string, 'warning' | 'default' | 'success' | 'muted'> = {
  pending: 'warning',
  confirmed: 'default',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'muted',
}

export default async function DashboardOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: merchant } = await supabase
    .from('merchants').select('id').eq('user_id', user.id).single()
  if (!merchant) redirect('/apply')

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, orders(*), products(name_zh)')
    .eq('merchant_id', merchant.id)
    .order('created_at', { referencedTable: 'orders', ascending: false })
    .limit(50)

  // Group by order
  const orderMap = new Map<string, { order: any; items: any[] }>()
  for (const item of orderItems ?? []) {
    const orderId = item.order_id
    if (!orderMap.has(orderId)) {
      orderMap.set(orderId, { order: item.orders, items: [] })
    }
    orderMap.get(orderId)!.items.push(item)
  }
  const orders = Array.from(orderMap.values())

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-light text-ink tracking-wide mb-10">订单管理</h1>

        {orders.length === 0 ? (
          <div className="py-16 text-center text-sm font-light text-earth/60">暂无订单</div>
        ) : (
          <div className="space-y-4">
            {orders.map(({ order, items }) => (
              <div key={order.id} className="bg-white border border-mist rounded overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-mist">
                  <div>
                    <p className="text-xs text-earth/60">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-earth/40">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[order.status]}>
                      {order.status}
                    </Badge>
                    <UpdateOrderStatusButton orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>
                <div className="divide-y divide-mist/50">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center px-5 py-3">
                      <p className="text-sm font-light text-ink">{item.product_name_zh}</p>
                      <p className="text-sm font-light text-earth">
                        {formatPrice(item.price_cny)} × {item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center px-5 py-3 bg-washi border-t border-mist">
                  <span className="text-xs text-earth/60">
                    收货: {(order.shipping_address as any)?.name} · {(order.shipping_address as any)?.phone}
                  </span>
                  <span className="text-sm font-light text-ink">
                    合计 {formatPrice(order.total_cny)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
