'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import type { Product, Category } from '@/types'

interface Props {
  merchantId: string
  categories: Category[]
  product?: Product
}

export function ProductForm({ merchantId, categories, product }: Props) {
  const t = useTranslations('merchant.products')
  const tc = useTranslations('common')
  const router = useRouter()

  const [form, setForm] = useState({
    name_ja: product?.name_ja ?? '',
    name_zh: product?.name_zh ?? '',
    name_en: product?.name_en ?? '',
    description_ja: product?.description_ja ?? '',
    description_zh: product?.description_zh ?? '',
    description_en: product?.description_en ?? '',
    price_jpy: product?.price_jpy?.toString() ?? '',
    price_cny: product?.price_cny?.toString() ?? '',
    stock: product?.stock?.toString() ?? '0',
    category_id: product?.category_id?.toString() ?? '',
    status: product?.status ?? 'draft',
    tags: product?.tags?.join(', ') ?? '',
    images: product?.images?.join('\n') ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const payload = {
      merchant_id: merchantId,
      name_ja: form.name_ja,
      name_zh: form.name_zh,
      name_en: form.name_en || null,
      description_ja: form.description_ja || null,
      description_zh: form.description_zh || null,
      description_en: form.description_en || null,
      price_jpy: parseFloat(form.price_jpy),
      price_cny: parseFloat(form.price_cny),
      stock: parseInt(form.stock),
      category_id: form.category_id ? parseInt(form.category_id) : null,
      status: form.status as 'draft' | 'active' | 'inactive',
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      images: form.images ? form.images.split('\n').map((u) => u.trim()).filter(Boolean) : [],
    }

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push('/dashboard/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Names */}
      <div className="bg-white border border-mist rounded p-6 space-y-4">
        <h3 className="text-sm font-light text-earth tracking-widest uppercase">商品名称</h3>
        <Input label="商品名称（日文）" value={form.name_ja} onChange={set('name_ja')} required />
        <Input label="商品名称（中文）" value={form.name_zh} onChange={set('name_zh')} required />
        <Input label="Product Name (English)" value={form.name_en} onChange={set('name_en')} />
      </div>

      {/* Descriptions */}
      <div className="bg-white border border-mist rounded p-6 space-y-4">
        <h3 className="text-sm font-light text-earth tracking-widest uppercase">商品描述</h3>
        <Textarea label="描述（日文）" value={form.description_ja} onChange={set('description_ja')} rows={3} />
        <Textarea label="描述（中文）" value={form.description_zh} onChange={set('description_zh')} rows={3} />
      </div>

      {/* Pricing */}
      <div className="bg-white border border-mist rounded p-6 space-y-4">
        <h3 className="text-sm font-light text-earth tracking-widest uppercase">价格与库存</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="价格（日元 ¥）" type="number" value={form.price_jpy} onChange={set('price_jpy')} required min="0" step="1" />
          <Input label="价格（人民币 ¥）" type="number" value={form.price_cny} onChange={set('price_cny')} required min="0" step="0.01" />
        </div>
        <Input label="库存数量" type="number" value={form.stock} onChange={set('stock')} required min="0" step="1" />
      </div>

      {/* Category & Tags */}
      <div className="bg-white border border-mist rounded p-6 space-y-4">
        <h3 className="text-sm font-light text-earth tracking-widest uppercase">分类与标签</h3>
        <div>
          <label className="text-sm font-light text-earth tracking-wide block mb-1">分类</label>
          <select
            value={form.category_id}
            onChange={set('category_id')}
            className="w-full h-10 border-b border-mist bg-transparent text-sm text-ink outline-none focus:border-aged"
          >
            <option value="">不限</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name_zh}
              </option>
            ))}
          </select>
        </div>
        <Input label="标签（逗号分隔）" value={form.tags} onChange={set('tags')} placeholder="手工, 限量, 京都" />
      </div>

      {/* Images */}
      <div className="bg-white border border-mist rounded p-6 space-y-4">
        <h3 className="text-sm font-light text-earth tracking-widest uppercase">商品图片</h3>
        <Textarea
          label="图片URL（每行一个）"
          value={form.images}
          onChange={set('images')}
          rows={4}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
        />
        <p className="text-xs text-earth/50">可使用 Supabase Storage 上传图片后填入URL</p>
      </div>

      {/* Status */}
      <div className="bg-white border border-mist rounded p-6">
        <h3 className="text-sm font-light text-earth tracking-widest uppercase mb-4">发布状态</h3>
        <div className="flex gap-4">
          {['draft', 'active', 'inactive'].map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={s}
                checked={form.status === s}
                onChange={set('status')}
                className="accent-ink"
              />
              <span className="text-sm font-light text-earth capitalize">{t(`status.${s as 'draft'}`)}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {tc('cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {tc('save')}
        </Button>
      </div>
    </form>
  )
}
