import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/products/product-card'
import { MerchantCard } from '@/components/merchants/merchant-card'
import { createClient } from '@/lib/supabase/server'
import { getCategoryName } from '@/lib/utils'
import type { Locale } from '@/types'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const t = await getTranslations('home')
  const tn = await getTranslations('nav')
  const tc = await getTranslations('categories')
  const locale = (await getLocale()) as Locale
  let categories: any[] = []
  let products: any[] = []
  let merchants: any[] = []

  try {
    const supabase = await createClient()
    const [categoriesRes, productsRes, merchantsRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase
        .from('products')
        .select('*, merchants(*), categories(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('merchants')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6),
    ])
    categories = categoriesRes.data ?? []
    products = productsRes.data ?? []
    merchants = merchantsRes.data ?? []
  } catch {
    // Database unavailable — render page without dynamic content
  }

  const validCatKeys = ['home', 'daily', 'handmade', 'sake', 'beauty', 'food', 'tea', 'stationery', 'fashion', 'health', 'garden', 'pet'] as const
  type CatKey = typeof validCatKeys[number]
  const isCatKey = (s: string): s is CatKey => validCatKeys.includes(s as CatKey)

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-washi to-mist/20">
        {/* Decorative Japanese characters */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <span className="absolute top-12 right-12 text-[120px] font-light text-mist/30 leading-none">和</span>
          <span className="absolute bottom-12 left-8 text-[80px] font-light text-mist/20 leading-none">美</span>
          <span className="absolute top-1/2 left-4 text-[60px] font-light text-mist/15 leading-none -translate-y-1/2">匠</span>
        </div>

        <div className="relative text-center px-4 max-w-2xl mx-auto">
          <p className="text-xs font-light text-earth tracking-[0.3em] uppercase mb-6">
            Japan → China
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-ink tracking-wider leading-tight mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-base sm:text-lg font-light text-earth tracking-wide mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-ink text-washi text-sm font-light tracking-wider hover:bg-earth transition-colors"
            >
              {t('hero.cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-8 py-3 border border-ink text-ink text-sm font-light tracking-wider hover:bg-ink hover:text-washi transition-colors"
            >
              {t('hero.merchantCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-lg font-light text-ink tracking-widest">{t('categories')}</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2 p-4 rounded hover:bg-mist/50 transition-colors"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-light text-earth group-hover:text-ink transition-colors text-center leading-tight">
                {isCatKey(cat.slug) ? tc(cat.slug) : cat.name_zh}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="border-t border-mist" />
      </div>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-lg font-light text-ink tracking-widest">{t('featured')}</h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-light text-earth hover:text-ink transition-colors"
            >
              {t('viewAll')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Merchants */}
      {merchants.length > 0 && (
        <section className="bg-mist/20 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-lg font-light text-ink tracking-widest">{t('merchants')}</h2>
              <Link
                href="/merchants"
                className="flex items-center gap-1 text-sm font-light text-earth hover:text-ink transition-colors"
              >
                {t('viewAll')}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {merchants.map((merchant) => (
                <MerchantCard key={merchant.id} merchant={merchant as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Merchant CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="border border-mist rounded p-12 text-center relative overflow-hidden">
          <div className="absolute top-4 right-6 text-[80px] font-light text-mist/20 select-none leading-none">
            店
          </div>
          <p className="text-xs font-light text-earth tracking-[0.3em] uppercase mb-4">
            For Japanese Merchants
          </p>
          <h3 className="text-2xl font-light text-ink tracking-wide mb-4">
            {locale === 'ja' ? '中国市場へ進出しませんか' : '让中国消费者发现您的好物'}
          </h3>
          <p className="text-sm font-light text-earth mb-8 max-w-md mx-auto leading-relaxed">
            {locale === 'ja'
              ? '和市に出店して、あなたの商品を中国の消費者に届けましょう。申請から審査まで、丁寧にサポートします。'
              : '加入和市，零门槛将日本好物带给中国消费者。我们提供全程入驻支持。'}
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-8 py-3 bg-ink text-washi text-sm font-light tracking-wider hover:bg-earth transition-colors"
          >
            {tn('applyMerchant')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </MainLayout>
  )
}
