import { notFound, redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/forms/product-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [merchantRes, categoriesRes, productRes] = await Promise.all([
    supabase.from('merchants').select('id').eq('user_id', user.id).single(),
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('products').select('*').eq('id', id).single(),
  ])

  if (!merchantRes.data) redirect('/apply')
  if (!productRes.data || productRes.data.merchant_id !== merchantRes.data.id) notFound()

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-light text-ink tracking-wide mb-10">编辑商品</h1>
        <ProductForm
          merchantId={merchantRes.data.id}
          categories={(categoriesRes.data ?? []) as any}
          product={productRes.data as any}
        />
      </div>
    </MainLayout>
  )
}
