import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ApproveMerchantButton } from '@/components/forms/approve-merchant-button'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: merchants } = await supabase
    .from('merchants')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  const pending = merchants?.filter((m) => m.status === 'pending') ?? []
  const others = merchants?.filter((m) => m.status !== 'pending') ?? []

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-light text-ink tracking-wide mb-10">管理后台</h1>

        {/* Pending */}
        <section className="mb-10">
          <h2 className="text-base font-light text-ink mb-4 flex items-center gap-2">
            待审核商家
            {pending.length > 0 && (
              <span className="w-5 h-5 bg-aged text-washi text-xs rounded-full flex items-center justify-center">
                {pending.length}
              </span>
            )}
          </h2>
          <div className="bg-white border border-mist rounded overflow-hidden">
            {pending.length === 0 ? (
              <p className="p-8 text-sm font-light text-earth/60 text-center">暂无待审核商家</p>
            ) : (
              <div className="divide-y divide-mist">
                {pending.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-light text-ink">{m.store_name_zh}</p>
                      <p className="text-xs text-earth/60">{m.store_name_ja} · {m.prefecture}</p>
                      <p className="text-xs text-earth/40">
                        申请人: {(m.profiles as any)?.full_name}
                      </p>
                    </div>
                    <Badge variant="warning">待审核</Badge>
                    <ApproveMerchantButton merchantId={m.id} action="approve" />
                    <ApproveMerchantButton merchantId={m.id} action="reject" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Others */}
        <section>
          <h2 className="text-base font-light text-ink mb-4">全部商家</h2>
          <div className="bg-white border border-mist rounded overflow-hidden">
            <div className="divide-y divide-mist">
              {others.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-ink">{m.store_name_zh}</p>
                    <p className="text-xs text-earth/60">{m.store_name_ja} · {m.prefecture}</p>
                  </div>
                  <Badge variant={m.status === 'approved' ? 'success' : 'muted'}>
                    {m.status}
                  </Badge>
                  {m.status === 'approved' && (
                    <ApproveMerchantButton merchantId={m.id} action="suspend" />
                  )}
                  {m.status === 'suspended' && (
                    <ApproveMerchantButton merchantId={m.id} action="approve" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
