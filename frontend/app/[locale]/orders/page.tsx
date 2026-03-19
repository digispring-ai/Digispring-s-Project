import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  pending: 'warning',
  confirmed: 'default',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'muted',
}

export default async function OrdersPage() {
  const t = await getTranslations('order')
  let user = null
  let orders: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user ?? null
    if (user) {
      const { data: o } = await supabase
        .from('orders')
        .select('*, order_items(count)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
      orders = o ?? []
    }
  } catch {
    // Supabase unavailable
  }

  if (!user) redirect('/auth/login')

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-light text-ink tracking-wide mb-10">{t('title')}</h1>

        {orders.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl text-mist mb-4 select-none">無</p>
            <p className="text-sm font-light text-earth">{t('empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white border border-mist rounded p-5 hover:border-aged transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-light text-earth/60">
                      {t('orderNo')} {order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs font-light text-earth/40">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant[order.status] ?? 'default'}>
                    {t(`status.${order.status as 'pending'}`)}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-light text-earth">
                    {(order.order_items as any)?.[0]?.count ?? 0} {t('items')}
                  </p>
                  <p className="text-base font-light text-ink">
                    {t('total')} {formatPrice(order.total_cny)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
