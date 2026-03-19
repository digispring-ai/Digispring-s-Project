import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    const { error } = await supabase.from('profiles').select('*').limit(1)
    return Response.json({ api: 'ok', supabase: error ? 'error' : 'connected' })
  } catch {
    return Response.json({ api: 'ok', supabase: 'not configured' })
  }
}
