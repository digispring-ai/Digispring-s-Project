import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/products/product-card'
import { createClient } from '@/lib/supabase/server'
import { getLocalizedName } from '@/lib/utils'
import { MapPin } from 'lucide-react'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MerchantStorePage({ params }: Props) {
  const { id } = await params
  const locale = (await getLocale()) as Locale
  let merchant: any = null
  let products: any[] = []

  try {
    const supabase = await createClient()
    const [merchantRes, productsRes] = await Promise.all([
      supabase.from('merchants').select('*').eq('id', id).eq('status', 'approved').single(),
      supabase
        .from('products')
        .select('*, merchants(*), categories(*)')
        .eq('merchant_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
    ])
    merchant = merchantRes.data
    products = productsRes.data ?? []
  } catch {
    // Supabase unavailable
  }

  if (!merchant) notFound()
  const name = getLocalizedName(merchant as any, locale)
  const description =
    locale === 'ja'
      ? merchant.description_ja
      : locale === 'en'
      ? merchant.description_en ?? merchant.description_zh
      : merchant.description_zh

  return (
    <MainLayout>
      {/* Banner */}
      <div className="relative h-48 sm:h-64 bg-mist/30 overflow-hidden">
        {merchant.banner_url ? (
          <Image src={merchant.banner_url} alt={name} fill className="object-cover" sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-mist to-washi flex items-center justify-center">
            <span className="text-7xl font-light text-white/20 select-none">
              {merchant.store_name_ja.charAt(0)}
            </span>
          </div>
        )}
        {/* Logo */}
        {merchant.logo_url && (
          <div className="absolute bottom-4 left-6 w-16 h-16 rounded bg-white border-2 border-white overflow-hidden shadow-sm">
            <Image src={merchant.logo_url} alt={name} fill className="object-cover" />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Merchant Info */}
        <div className="mb-10 space-y-2">
          <h1 className="text-2xl font-light text-ink">{name}</h1>
          <p className="text-sm font-light text-earth/70">{merchant.store_name_ja}</p>
          {merchant.prefecture && (
            <p className="flex items-center gap-1 text-sm font-light text-earth">
              <MapPin className="w-3.5 h-3.5" />
              {merchant.prefecture}
            </p>
          )}
          {description && (
            <p className="text-sm font-light text-earth leading-relaxed max-w-xl mt-3">
              {description}
            </p>
          )}
        </div>

        {/* Products */}
        <div className="border-t border-mist pt-8">
          <p className="text-sm font-light text-earth mb-6">{products.length} 件商品</p>
          {products.length === 0 ? (
            <p className="text-sm font-light text-earth/60 py-8">暂无商品</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
