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
      <div className="relative overflow-hidden bg-mist/30 aspect-[3/1] rounded">
        {merchant.banner_url ? (
          <Image
            src={merchant.banner_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-103"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-mist to-washi flex items-center justify-center">
            <span className="text-4xl text-white/20 select-none font-light tracking-widest">
              {merchant.store_name_ja.charAt(0)}
            </span>
          </div>
        )}
        {/* Logo overlay */}
        {merchant.logo_url && (
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded bg-white border border-mist overflow-hidden">
            <Image src={merchant.logo_url} alt={name} fill className="object-cover" />
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-light text-ink group-hover:text-earth transition-colors">
          {name}
        </h3>
        {merchant.prefecture && (
          <p className="flex items-center gap-1 text-xs text-earth/60 font-light">
            <MapPin className="w-3 h-3" />
            {merchant.prefecture}
          </p>
        )}
        {productCount !== undefined && (
          <p className="text-xs text-earth/50 font-light">{productCount} 件商品</p>
        )}
      </div>
    </Link>
  )
}
