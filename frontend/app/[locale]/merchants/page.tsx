import { getTranslations, getLocale } from 'next-intl/server'
import { MainLayout } from '@/components/layout/main-layout'
import { MerchantCard } from '@/components/merchants/merchant-card'
import { createClient } from '@/lib/supabase/server'
import type { Locale } from '@/types'

export default async function MerchantsPage() {
  const t = await getTranslations('nav')
  const tc = await getTranslations('common')
  const locale = (await getLocale()) as Locale
  const supabase = await createClient()

  const { data: merchants } = await supabase
    .from('merchants')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-light text-ink tracking-wide">{t('merchants')}</h1>
          <p className="text-sm font-light text-earth mt-1">
            {(merchants ?? []).length} 家商家
          </p>
        </div>

        {(!merchants || merchants.length === 0) ? (
          <div className="py-24 text-center">
            <p className="text-4xl text-mist mb-4 select-none">空</p>
            <p className="text-sm font-light text-earth">{tc('noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant as any} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
