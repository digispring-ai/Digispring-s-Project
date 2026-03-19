import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil } from 'lucide-react'

const statusVariant: Record<string, 'success' | 'muted' | 'warning'> = {
  active: 'success',
  draft: 'warning',
  inactive: 'muted',
}

export default async function DashboardProductsPage() {
  const t = await getTranslations('merchant.products')
  let user = null
  let merchant = null
  let products: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user ?? null
    if (user) {
      const { data: m } = await supabase.from('merchants').select('id').eq('user_id', user.id).single()
      merchant = m
      if (m) {
        const { data: p } = await supabase
          .from('products')
          .select('*, categories(name_zh, icon)')
          .eq('merchant_id', m.id)
          .order('created_at', { ascending: false })
        products = p ?? []
      }
    }
  } catch {
    // Supabase unavailable
  }

  if (!user) redirect('/auth/login')
  if (!merchant) redirect('/apply')

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
            {t('add')}
          </Link>
        </div>

        <div className="bg-white border border-mist rounded overflow-hidden">
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-light text-earth/60">还没有商品，点击右上角添加</p>
            </div>
          ) : (
            <div className="divide-y divide-mist">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-5">
                  {/* Image */}
                  <div className="w-12 h-12 bg-mist/30 rounded overflow-hidden shrink-0">
                    {product.images[0] && (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-ink truncate">{product.name_zh}</p>
                    <p className="text-xs text-earth/60">
                      {(product.categories as any)?.icon} {(product.categories as any)?.name_zh}
                    </p>
                  </div>
                  {/* Price */}
                  <p className="text-sm font-light text-ink shrink-0">
                    {formatPrice(product.price_cny)}
                  </p>
                  {/* Status */}
                  <Badge variant={statusVariant[product.status]}>
                    {t(`status.${product.status as 'active'}`)}
                  </Badge>
                  {/* Edit */}
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="p-2 text-earth hover:text-ink transition-colors"
                    aria-label={t('edit')}
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
