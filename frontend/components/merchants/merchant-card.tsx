import Image from 'next/image'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { MapPin } from 'lucide-react'
import { getLocalizedName } from '@/lib/utils'
import type { Merchant } from '@/types'
import type { Locale } from '@/types'

interface MerchantCardProps {
  merchant: Merchant
  productCount?: number
}

export function MerchantCard({ merchant, productCount }: MerchantCardProps) {
  const locale = useLocale() as Locale
  const name = getLocalizedName(merchant, locale)

  return (
    <Link href={`/merchants/${merchant.id}`} className="group block">
      {/* Banner — wide cinematic ratio */}
      <div className="relative overflow-hidden bg-mist/20 aspect-[16/7]">
        {merchant.banner_url ? (
          <Image
            src={merchant.banner_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-mist to-washi flex items-center justify-center">
            <span className="text-5xl text-ink/10 select-none font-serif font-light tracking-widest">
              {merchant.store_name_ja.charAt(0)}
            </span>
          </div>
        )}

        {/* Subtle dark gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />

        {/* Logo overlay — bottom-left with white bg */}
        {merchant.logo_url && (
          <div className="absolute bottom-3 left-3 w-9 h-9 bg-white border border-mist/50 overflow-hidden">
            <Image src={merchant.logo_url} alt={name} fill className="object-cover" />
          </div>
        )}

        {/* Prefecture badge — top right */}
        {merchant.prefecture && (
          <div className="absolute top-3 right-3 bg-washi/90 px-2 py-0.5 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-earth" />
            <span className="text-[10px] font-light text-earth tracking-wide">
              {merchant.prefecture}
            </span>
          </div>
        )}
      </div>

      {/* Merchant info */}
      <div className="mt-3 flex items-start justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-light text-ink group-hover:text-earth transition-colors duration-200 tracking-wide">
            {name}
          </h3>
          {/* Japanese store name always shown if locale isn't ja */}
          {locale !== 'ja' && merchant.store_name_ja && merchant.store_name_ja !== name && (
            <p className="text-[10px] font-light text-earth/50 tracking-wide">
              {merchant.store_name_ja}
            </p>
          )}
        </div>
        {productCount !== undefined && (
          <p className="text-[10px] text-earth/40 font-light tracking-wide shrink-0 ml-2 mt-0.5">
            {productCount} 件
          </p>
        )}
      </div>
    </Link>
  )
}
