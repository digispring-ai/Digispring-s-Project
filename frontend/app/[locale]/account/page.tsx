import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'

export default async function AccountPage() {
  const t = await getTranslations('auth')
  let user = null
  let profile = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user ?? null
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      profile = p
    }
  } catch {
    // Supabase unavailable
  }

  if (!user) redirect('/auth/login')

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-light text-ink tracking-wide mb-10">{t('register').replace('注册', '账户')}</h1>

        <div className="bg-white border border-mist rounded p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-mist">
            <span className="text-sm font-light text-earth">{t('email')}</span>
            <span className="text-sm font-light text-ink">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-mist">
            <span className="text-sm font-light text-earth">{t('fullName')}</span>
            <span className="text-sm font-light text-ink">{profile?.full_name ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-light text-earth">角色</span>
            <span className="text-sm font-light text-ink capitalize">{profile?.role}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
