import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/forms/product-form'

export default async function NewProductPage() {
  let user = null
  let merchantData = null
  let categoriesData: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user ?? null
    if (user) {
      const [merchantRes, categoriesRes] = await Promise.all([
        supabase.from('merchants').select('id').eq('user_id', user.id).single(),
        supabase.from('categories').select('*').order('sort_order'),
      ])
      merchantData = merchantRes.data
      categoriesData = categoriesRes.data ?? []
    }
  } catch {
    // Supabase unavailable
  }

  if (!user) redirect('/auth/login')
  if (!merchantData) redirect('/apply')

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-light text-ink tracking-wide mb-10">添加商品</h1>
        <ProductForm
          merchantId={merchantData.id}
          categories={categoriesData as any}
        />
      </div>
    </MainLayout>
  )
}
