'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { CheckCircle } from 'lucide-react'

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

export default function ApplyPage() {
  const t = useTranslations('merchant.apply')
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    store_name_ja: '',
    store_name_zh: '',
    store_name_en: '',
    description_ja: '',
    description_zh: '',
    prefecture: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Update profile role
    await supabase.from('profiles').upsert({ id: user.id, role: 'merchant' })

    const { error } = await supabase.from('merchants').insert({
      user_id: user.id,
      ...form,
      status: 'pending',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle className="w-12 h-12 text-matcha mx-auto mb-6" />
          <h2 className="text-xl font-light text-ink tracking-wide mb-3">{t('pending')}</h2>
          <p className="text-sm font-light text-earth">{t('pendingHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-washi">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-light text-ink tracking-wide">{t('title')}</h1>
          <p className="mt-2 text-sm font-light text-earth">{t('subtitle')}</p>
        </div>

        {/* Steps */}
        <div className="flex items-center mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-light transition-colors ${
                step >= s ? 'bg-ink text-washi' : 'bg-mist text-earth'
              }`}>
                {s}
              </div>
              <p className={`ml-2 text-xs font-light ${step >= s ? 'text-ink' : 'text-earth/50'}`}>
                {s === 1 ? t('step1') : t('step2')}
              </p>
              {s < 2 && <div className={`flex-1 h-px mx-4 ${step > s ? 'bg-ink' : 'bg-mist'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit}>
          <div className="bg-white border border-mist rounded p-8 space-y-6">
            {step === 1 ? (
              <>
                <Input label={t('storeName')} value={form.store_name_ja} onChange={set('store_name_ja')} required />
                <Input label={t('storeNameZh')} value={form.store_name_zh} onChange={set('store_name_zh')} required />
                <Input label="Store Name (English)" value={form.store_name_en} onChange={set('store_name_en')} />
                <div>
                  <label className="text-sm font-light text-earth tracking-wide block mb-1">
                    {t('prefecture')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.prefecture}
                    onChange={set('prefecture')}
                    required
                    className="w-full h-10 border-b border-mist bg-transparent text-sm text-ink outline-none focus:border-aged"
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <Textarea label={t('description')} value={form.description_ja} onChange={set('description_ja')} rows={4} />
                <Textarea label={t('descriptionZh')} value={form.description_zh} onChange={set('description_zh')} rows={4} />
              </>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">
                  返回
                </Button>
              )}
              <Button type="submit" className="flex-1" loading={loading}>
                {step === 1 ? '下一步' : t('submit')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
