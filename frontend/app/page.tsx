import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Digispring</h1>
      <p>Services connected: GitHub · Supabase · Vercel · Render</p>
      {user ? (
        <p>Logged in as: {user.email}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </main>
  )
}
