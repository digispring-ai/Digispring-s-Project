import { notFound, redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/forms/product-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  let user = null
  let merchantData = null
  let categoriesData: any[] = []
  let productData = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user ?? null
    if (user) {
      const [merchantRes, categoriesRes, productRes] = await Promise.all([
        supabase.from('merchants').select('id').eq('user_id', user.id).single(),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('*').eq('id', id).single(),
      ])
      merchantData = merchantRes.data
      categoriesData = categoriesRes.data ?? []
      productData = productRes.data
    }
  } catch {
    // Supabase unavailable
  }

  if (!user) redirect('/auth/login')
  if (!merchantData) redirect('/apply')
  if (!productData || productData.merchant_id !== merchantData.id) notFound()

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-light text-ink tracking-wide mb-10">编辑商品</h1>
        <ProductForm
          merchantId={merchantData.id}
          categories={categoriesData as any}
          product={productData as any}
        />
      </div>
    </MainLayout>
  )
}
