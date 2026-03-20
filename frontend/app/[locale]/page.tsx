import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/products/product-card'
import { MerchantCard } from '@/components/merchants/merchant-card'
import { createClient } from '@/lib/supabase/server'
import { getCategoryName } from '@/lib/utils'
import type { Locale } from '@/types'
import { ArrowRight } from 'lucide-react'

// ── Static fallback demo data (shown when DB is unavailable) ──────────────
const FALLBACK_MERCHANTS = [
  {
    id: '11111111-1111-4111-1111-111111111111',
    store_name_ja: '京都陶芸工房',
    store_name_zh: '京都陶艺工坊',
    store_name_en: 'Kyoto Ceramics Studio',
    description_ja: '京都の伝統的な陶芸技術を守り続ける工房。匠の手による一点物の器をお届けします。',
    description_zh: '传承京都传统陶艺技术的工坊，每件器皿均由匠人手工打造，独一无二。',
    description_en: 'A studio preserving traditional Kyoto ceramics. Each piece is handcrafted by skilled artisans.',
    prefecture: '京都府',
    banner_image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80&fit=crop',
    status: 'approved',
  },
  {
    id: '22222222-2222-4222-2222-222222222222',
    store_name_ja: '東京和傘堂',
    store_name_zh: '东京和伞堂',
    store_name_en: 'Tokyo Wagasa House',
    description_ja: '江戸時代から受け継がれる和傘・提灯の専門店。伝統の技法で一本一本仕上げています。',
    description_zh: '传承江户时代工艺的和伞、提灯专门店，以传统工法精心制作每一件作品。',
    description_en: 'Traditional Japanese umbrella & lantern shop with Edo-period heritage.',
    prefecture: '東京都',
    banner_image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&fit=crop',
    status: 'approved',
  },
  {
    id: '33333333-3333-4333-3333-333333333333',
    store_name_ja: '美肌本舗',
    store_name_zh: '美肌本铺',
    store_name_en: 'Bihada Honpo',
    description_ja: '日本の厳選された美容成分を使用したスキンケアブランド。自然の恵みで肌を育てます。',
    description_zh: '采用日本严选美容成分的护肤品牌，以自然之精华温和滋养肌肤。',
    description_en: 'Japanese skincare brand using carefully selected natural beauty ingredients.',
    prefecture: '大阪府',
    banner_image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80&fit=crop',
    status: 'approved',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    store_name_ja: '職人靴工房 田中',
    store_name_zh: '田中手工皮鞋工坊',
    store_name_en: 'Tanaka Artisan Footwear',
    description_ja: '奈良で三代続く革靴工房。国内産ヌバックレザーを手縫いで仕上げ、足に馴染む履き心地を追求。',
    description_zh: '奈良三代传承的手工皮鞋工坊。采用国产绒面皮革逐一手工缝制，兼顾舒适感与耐用性。',
    description_en: 'Three-generation artisan shoe workshop in Nara. Hand-stitched domestic nubuck leather.',
    prefecture: '奈良県',
    banner_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&fit=crop',
    status: 'approved',
  },
]

const FALLBACK_PRODUCTS = [
  {
    id: 'p1',
    name_ja: '桜絵付け 茶碗セット（2個）',
    name_zh: '樱花彩绘茶碗套装（2只）',
    name_en: 'Sakura Hand-painted Tea Cup Set',
    price_jpy: 4800, price_cny: 238,
    images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&fit=crop'],
    status: 'active',
    merchants: { store_name_ja: '京都陶芸工房', store_name_zh: '京都陶艺工坊' },
    categories: { name_ja: '茶器', slug: 'tea' },
  },
  {
    id: 'p2',
    name_ja: '草花文様 手轆轤 茶碗・茶托セット',
    name_zh: '草花纹手拉坯茶碗茶托套装',
    name_en: 'Botanical Hand-thrown Ceramic Cup & Saucer',
    price_jpy: 12000, price_cny: 596,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&fit=crop'],
    status: 'active',
    merchants: { store_name_ja: '京都陶芸工房', store_name_zh: '京都陶艺工坊' },
    categories: { name_ja: '手工芸', slug: 'handmade' },
  },
  {
    id: 'p3',
    name_ja: '菊花和傘 黒×赤',
    name_zh: '菊花和伞 黑×红',
    name_en: 'Chrysanthemum Wagasa — Black & Red',
    price_jpy: 18000, price_cny: 894,
    images: ['https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&fit=crop'],
    status: 'active',
    merchants: { store_name_ja: '東京和傘堂', store_name_zh: '东京和伞堂' },
    categories: { name_ja: '手工芸', slug: 'handmade' },
  },
  {
    id: 'p4',
    name_ja: '桜提灯 大（直径30cm）',
    name_zh: '樱花提灯 大号（直径30cm）',
    name_en: 'Sakura Paper Lantern — Large',
    price_jpy: 6800, price_cny: 338,
    images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80&fit=crop'],
    status: 'active',
    merchants: { store_name_ja: '東京和傘堂', store_name_zh: '东京和伞堂' },
    categories: { name_ja: 'インテリア', slug: 'home' },
  },
  {
    id: 'p5',
    name_ja: 'アクア モイスチャー 4点セット',
    name_zh: '水润保湿护肤四件套',
    name_en: 'Aqua Moisture 4-Piece Skincare Set',
    price_jpy: 9800, price_cny: 486,
    images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80&fit=crop'],
    status: 'active',
    merchants: { store_name_ja: '美肌本舗', store_name_zh: '美肌本铺' },
    categories: { name_ja: '美容', slug: 'beauty' },
  },
  {
    id: 'p6',
    name_ja: '手縫いスリッポン ナチュラルヌバック',
    name_zh: '手工缝制一脚蹬 天然绒面革',
    name_en: 'Hand-stitched Slip-on — Natural Nubuck',
    price_jpy: 32000, price_cny: 1588,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&fit=crop'],
    status: 'active',
    merchants: { store_name_ja: '職人靴工房 田中', store_name_zh: '田中手工皮鞋工坊' },
    categories: { name_ja: 'ファッション', slug: 'fashion' },
  },
  {
    id: 'p7',
    name_ja: '刺繍スリッポン 花柄（ベージュ）',
    name_zh: '刺绣一脚蹬 花卉图案（米色）',
    name_en: 'Embroidered Slip-on — Floral Beige',
    price_jpy: 42000, price_cny: 2085,
    images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80&fit=crop'],
    status: 'active',
    merchants: { store_name_ja: '職人靴工房 田中', store_name_zh: '田中手工皮鞋工坊' },
    categories: { name_ja: 'ファッション', slug: 'fashion' },
  },
  {
    id: 'p8',
    name_ja: 'シグネチャースリッポン ブラック',
    name_zh: '签名款一脚蹬 黑色',
    name_en: 'Signature Slip-on — Black',
    price_jpy: 38000, price_cny: 1886,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80&fit=crop'],
    status: 'active',
    merchants: { store_name_ja: '職人靴工房 田中', store_name_zh: '田中手工皮鞋工坊' },
    categories: { name_ja: 'ファッション', slug: 'fashion' },
  },
]

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

  // Fall back to static demo data when DB is unavailable
  if (products.length === 0) products = FALLBACK_PRODUCTS
  if (merchants.length === 0) merchants = FALLBACK_MERCHANTS

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
              <p className="text-[11px] font-light text-earth/70 tracking-[0.2em]">精選商品</p>
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
                <p className="text-[11px] font-light text-earth/70 tracking-[0.2em]">出店商家</p>
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
