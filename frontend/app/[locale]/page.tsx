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
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-washi">
        {/* Layered decorative kanji — varying opacity & size for depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Large background kanji */}
          <span className="absolute -top-4 right-8 text-[180px] font-light text-mist/20 leading-none font-serif">和</span>
          <span className="absolute bottom-16 -left-4 text-[120px] font-light text-mist/15 leading-none font-serif">美</span>
          <span className="absolute top-1/2 left-6 text-[80px] font-light text-mist/10 leading-none font-serif -translate-y-1/2">匠</span>
          {/* Small floating accent characters */}
          <span className="absolute top-20 left-1/4 text-[28px] font-light text-mist/20 leading-none font-serif">雅</span>
          <span className="absolute bottom-32 right-1/4 text-[22px] font-light text-mist/15 leading-none font-serif">粋</span>
          {/* Thin vertical lines — shoji screen reference */}
          <div className="absolute top-0 bottom-0 left-1/3 w-px bg-mist/30" />
          <div className="absolute top-0 bottom-0 right-1/3 w-px bg-mist/20" />
        </div>

        {/* Hanko seal — top right decorative element */}
        <div className="absolute top-12 right-12 select-none pointer-events-none">
          <div className="jp-seal w-14 h-14 text-2xl opacity-20 rounded-[2px] font-serif">
            市
          </div>
        </div>

        <div className="relative text-center px-4 max-w-2xl mx-auto">
          {/* Eyebrow label */}
          <div className="jp-section-label justify-center mb-8">
            Japan → China
          </div>
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-ink tracking-[0.08em] leading-tight mb-6 font-serif">
            {t('hero.title')}
          </h1>
          {/* Thin divider */}
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="w-12 h-px bg-mist" />
            <span className="text-beni text-xs select-none">◆</span>
            <div className="w-12 h-px bg-mist" />
          </div>
          <p className="text-sm sm:text-base font-light text-earth tracking-wide mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-9 py-3 bg-ink text-washi text-sm font-light tracking-[0.15em] hover:bg-sumi transition-colors duration-300"
            >
              {t('hero.cta')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-9 py-3 border border-earth text-earth text-sm font-light tracking-[0.15em] hover:border-ink hover:text-ink transition-colors duration-300"
            >
              {t('hero.merchantCta')}
            </Link>
          </div>
        </div>

        {/* Bottom fade to page */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-washi to-transparent pointer-events-none" />
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="mb-10">
            <div className="jp-section-label mb-2">{t('categories')}</div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2.5 p-4 border border-transparent hover:border-mist hover:bg-mist/20 transition-all duration-200"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[11px] font-light text-earth group-hover:text-ink transition-colors text-center leading-tight tracking-wide">
                  {isCatKey(cat.slug) ? tc(cat.slug) : cat.name_zh}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="jp-divider text-[10px]">精選</div>
      </div>

      {/* ── Featured Products ────────────────────────────── */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="jp-section-label mb-2">{t('featured')}</div>
              <p className="text-[11px] font-light text-earth/50 tracking-[0.2em]">精選商品</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-xs font-light text-earth hover:text-ink transition-colors group"
            >
              {t('viewAll')}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-7">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Merchants ───────────────────────────── */}
      {merchants.length > 0 && (
        <section className="bg-mist/15 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="jp-section-label mb-2">{t('merchants')}</div>
                <p className="text-[11px] font-light text-earth/50 tracking-[0.2em]">出店商家</p>
              </div>
              <Link
                href="/merchants"
                className="flex items-center gap-1.5 text-xs font-light text-earth hover:text-ink transition-colors group"
              >
                {t('viewAll')}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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

      {/* ── Merchant CTA ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="relative border border-mist p-12 sm:p-16 text-center overflow-hidden">
          {/* Background kanji decoration */}
          <div className="absolute top-0 right-0 bottom-0 w-32 overflow-hidden pointer-events-none select-none flex flex-col items-center justify-center gap-4 border-l border-mist/30">
            <span className="jp-vertical text-5xl font-light text-mist/30 leading-none font-serif">店</span>
            <span className="jp-vertical text-3xl font-light text-mist/20 leading-none font-serif">舗</span>
          </div>
          {/* Left accent line in beni */}
          <div className="absolute left-0 top-8 bottom-8 w-[2px] bg-beni/40" />

          <div className="jp-section-label justify-center mb-5">For Japanese Merchants</div>
          <h3 className="text-2xl sm:text-3xl font-light text-ink tracking-wider mb-4 font-serif">
            {locale === 'ja' ? '中国市場へ進出しませんか' : '让中国消费者发现您的好物'}
          </h3>
          <div className="flex items-center justify-center gap-4 my-5">
            <div className="w-8 h-px bg-mist" />
            <span className="text-beni text-[10px] select-none">◆</span>
            <div className="w-8 h-px bg-mist" />
          </div>
          <p className="text-sm font-light text-earth mb-8 max-w-sm mx-auto leading-relaxed">
            {locale === 'ja'
              ? '和市に出店して、あなたの商品を中国の消費者に届けましょう。申請から審査まで、丁寧にサポートします。'
              : '加入和市，零门槛将日本好物带给中国消费者。我们提供全程入驻支持。'}
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-9 py-3 bg-ink text-washi text-sm font-light tracking-[0.15em] hover:bg-sumi transition-colors duration-300"
          >
            {tn('applyMerchant')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </MainLayout>
  )
}
