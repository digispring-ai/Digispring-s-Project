import { Header } from './header'
import { Footer } from './footer'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen flex flex-col bg-washi">
      <Header user={user} userRole={profile?.role} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
