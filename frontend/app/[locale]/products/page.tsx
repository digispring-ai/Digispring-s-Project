import { getTranslations, getLocale } from 'next-intl/server'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/products/product-card'
import { createClient } from '@/lib/supabase/server'
import { getCategoryName } from '@/lib/utils'
import type { Locale } from '@/types'

interface Props {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const t = await getTranslations('product')
  const tc = await getTranslations('common')
  const locale = (await getLocale()) as Locale
  const { category, q, sort } = await searchParams
  const supabase = await createClient()

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    (() => {
      let query = supabase
        .from('products')
        .select('*, merchants(*), categories(*)')
        .eq('status', 'active')

      if (category) query = query.eq('categories.slug', category)
      if (q) query = query.ilike('name_zh', `%${q}%`)
      if (sort === 'price_asc') query = query.order('price_cny', { ascending: true })
      else if (sort === 'price_desc') query = query.order('price_cny', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      return query.limit(48)
    })(),
  ])

  const categories = categoriesRes.data ?? []
  const products = productsRes.data ?? []

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-ink tracking-wide">
            {category
              ? getCategoryName(
                  categories.find((c) => c.slug === category) ?? categories[0],
                  locale
                )
              : tc('viewAll')}
          </h1>
          <p className="text-sm font-light text-earth mt-1">{products.length} 件商品</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="md:w-48 shrink-0">
            <div className="space-y-1">
              <p className="text-xs font-light text-earth/60 tracking-widest uppercase mb-3">
                Categories
              </p>
              <a
                href="?"
                className={`block py-2 text-sm font-light transition-colors ${
                  !category ? 'text-ink' : 'text-earth hover:text-ink'
                }`}
              >
                {tc('viewAll')}
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`?category=${cat.slug}${q ? `&q=${q}` : ''}`}
                  className={`flex items-center gap-2 py-2 text-sm font-light transition-colors ${
                    category === cat.slug ? 'text-ink' : 'text-earth hover:text-ink'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  {getCategoryName(cat, locale)}
                </a>
              ))}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-4xl text-mist mb-4 select-none">空</p>
                <p className="text-sm font-light text-earth">{tc('noResults')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
