import { Header } from './header'
import { Footer } from './footer'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export async function MainLayout({ children }: { children: React.ReactNode }) {
  let user = null
  let profile: Profile | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user ?? null

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = profileData
    }
  } catch {
    // Supabase unavailable — render layout without auth state
  }

  return (
    <div className="min-h-screen flex flex-col bg-washi">
      <Header user={user} userRole={profile?.role} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
