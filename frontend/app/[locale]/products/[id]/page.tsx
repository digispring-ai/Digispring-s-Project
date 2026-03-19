import { getTranslations, getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { getLocalizedName, getLocalizedDescription, formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/products/add-to-cart-button'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import type { Locale, Product } from '@/types'
import { Star } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const t = await getTranslations('product')
  const locale = (await getLocale()) as Locale
  let product: (Product & { merchants: any; categories: any }) | null = null
  let reviews: any[] = []

  try {
    const supabase = await createClient()
    const [productRes, reviewsRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, merchants(*), categories(*)')
        .eq('id', id)
        .eq('status', 'active')
        .single(),
      supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])
    product = productRes.data as Product & { merchants: any; categories: any }
    reviews = reviewsRes.data ?? []
  } catch {
    // Supabase unavailable
  }

  if (!product) notFound()
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  const name = getLocalizedName(product, locale)
  const description = getLocalizedDescription(product, locale)

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-mist/30 rounded overflow-hidden">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl text-mist select-none">和</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="relative aspect-square bg-mist/30 rounded overflow-hidden">
                    <Image src={img} alt={`${name} ${i + 2}`} fill className="object-cover" sizes="100px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.categories && (
              <Link
                href={`/products?category=${product.categories.slug}`}
                className="text-xs font-light text-earth/60 tracking-widest hover:text-earth transition-colors"
              >
                {product.categories.icon} {product.categories.name_zh}
              </Link>
            )}

            <div>
              <h1 className="text-2xl font-light text-ink leading-snug">{name}</h1>
              {product.merchants && (
                <Link
                  href={`/merchants/${product.merchants.id}`}
                  className="inline-block mt-2 text-sm font-light text-earth hover:text-ink transition-colors"
                >
                  {t('fromMerchant')} {getLocalizedName(product.merchants, locale)}
                </Link>
              )}
            </div>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-aged text-aged' : 'text-mist'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-light text-earth">
                  {avgRating.toFixed(1)} ({reviews.length})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="py-4 border-y border-mist space-y-1">
              <p className="text-2xl font-light text-ink">
                {formatPrice(product.price_cny)} <span className="text-sm">元</span>
              </p>
              <p className="text-sm font-light text-earth/60">
                {t('priceJpy')}: {formatPrice(product.price_jpy, 'jpy')}
              </p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <Badge variant={product.stock > 0 ? 'success' : 'danger'}>
                {product.stock > 0 ? `${t('stock')}: ${product.stock}` : t('outOfStock')}
              </Badge>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="muted">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartButton product={product as any} />
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mt-16 pt-8 border-t border-mist">
            <h2 className="text-lg font-light text-ink tracking-wide mb-4">{t('description')}</h2>
            <p className="text-sm font-light text-earth leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16 pt-8 border-t border-mist">
          <h2 className="text-lg font-light text-ink tracking-wide mb-6">
            {t('reviews')} ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm font-light text-earth/60">{t('noReviews')}</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-mist last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-aged text-aged' : 'text-mist'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-light text-earth">
                      {(review.profiles as any)?.full_name ?? 'Anonymous'}
                    </span>
                    <span className="text-xs text-earth/40">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.content && (
                    <p className="text-sm font-light text-ink leading-relaxed">{review.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
