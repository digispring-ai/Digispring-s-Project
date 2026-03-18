import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag, Clock, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const t = await getTranslations('merchant.dashboard')
  const tp = await getTranslations('merchant.products')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/apply')
  if (merchant.status !== 'approved') {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
          <p className="text-4xl text-mist mb-4">審</p>
          <h2 className="text-xl font-light text-ink mb-2">申请审核中</h2>
          <p className="text-sm font-light text-earth">
            {merchant.status === 'pending' ? '我们将在3个工作日内完成审核' : '您的申请已暂停，请联系客服'}
          </p>
        </div>
      </MainLayout>
    )
  }

  const [productsRes, ordersRes] = await Promise.all([
    supabase.from('products').select('id, status').eq('merchant_id', merchant.id),
    supabase
      .from('order_items')
      .select('orders(id, status, total_cny, created_at)')
      .eq('merchant_id', merchant.id)
      .limit(5),
  ])

  const products = productsRes.data ?? []
  const recentOrders = ordersRes.data ?? []
  const activeProducts = products.filter((p) => p.status === 'active').length
  const pendingOrders = recentOrders.filter((o) => (o.orders as any)?.status === 'pending').length

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-light text-ink tracking-wide">{t('title')}</h1>
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-ink text-washi text-sm font-light hover:bg-earth transition-colors rounded"
          >
            <Plus className="w-4 h-4" />
            {tp('add')}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-mist rounded p-5">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-earth" />
              <span className="text-sm font-light text-earth">{t('totalProducts')}</span>
            </div>
            <p className="text-2xl font-light text-ink">{activeProducts}</p>
          </div>
          <div className="bg-white border border-mist rounded p-5">
            <div className="flex items-center gap-3 mb-3">
              <ShoppingBag className="w-5 h-5 text-earth" />
              <span className="text-sm font-light text-earth">{t('totalOrders')}</span>
            </div>
            <p className="text-2xl font-light text-ink">{recentOrders.length}</p>
          </div>
          <div className="bg-white border border-mist rounded p-5">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-earth" />
              <span className="text-sm font-light text-earth">{t('pendingOrders')}</span>
            </div>
            <p className="text-2xl font-light text-ink">{pendingOrders}</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-mist rounded overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-mist">
            <h2 className="text-base font-light text-ink">{t('recentOrders')}</h2>
            <Link href="/dashboard/orders" className="text-sm font-light text-earth hover:text-ink transition-colors">
              全部 →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-8 text-sm font-light text-earth/60 text-center">暂无订单</p>
          ) : (
            <div className="divide-y divide-mist">
              {recentOrders.map((item, i) => {
                const order = item.orders as any
                if (!order) return null
                return (
                  <Link key={i} href={`/dashboard/orders`} className="flex items-center justify-between p-5 hover:bg-washi transition-colors">
                    <div>
                      <p className="text-sm font-light text-ink">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-earth/60">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={order.status === 'pending' ? 'warning' : 'success'}>
                        {order.status}
                      </Badge>
                      <p className="text-sm font-light text-ink">{formatPrice(order.total_cny)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
