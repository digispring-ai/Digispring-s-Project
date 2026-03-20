'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Role = 'buyer' | 'merchant'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const ts = useTranslations('site')
  const router = useRouter()

  const [role, setRole] = useState<Role>('buyer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (error) {
      // Surface friendly messages for common cases
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed')) {
        setError('网络连接失败，请稍后重试。 / Network error, please try again.')
      } else if (error.status === 429) {
        setError('操作过于频繁，请稍等片刻。 / Too many requests, please wait.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // session is null → Supabase requires email confirmation before login
    if (!data.session) {
      setEmailSent(true)
      setLoading(false)
      return
    }

    // session exists → email confirmation disabled, user is already logged in
    if (role === 'merchant') {
      router.push('/apply')
    } else {
      router.push('/')
    }
    router.refresh()
  }

  // ── Email confirmation pending ────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="text-2xl font-light text-ink tracking-widest">
            {ts('name')}
          </Link>
          <div className="mt-10 bg-white border border-mist p-10">
            <div className="jp-seal w-12 h-12 text-xl mx-auto mb-6 font-serif">確</div>
            <h2 className="text-base font-light text-ink tracking-wide mb-3">
              {t('checkEmail') ?? '请查收确认邮件'}
            </h2>
            <p className="text-sm font-light text-earth leading-relaxed mb-6">
              {t('checkEmailHint') ?? `确认邮件已发送至 ${email}，点击邮件中的链接完成注册。`}
            </p>
            <p className="text-xs font-light text-earth/50">
              {t('checkSpam') ?? '如未收到，请检查垃圾邮件文件夹'}
            </p>
            <div className="mt-8 pt-6 border-t border-mist">
              <Link href="/auth/login" className="text-sm font-light text-ink underline underline-offset-2 hover:text-earth transition-colors">
                {t('goToLogin') ?? '前往登录'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-washi flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-light text-ink tracking-widest">
            {ts('name')}
          </Link>
        </div>

        <div className="bg-white border border-mist rounded p-8">
          <h1 className="text-lg font-light text-ink tracking-wide mb-8">{t('register')}</h1>

          {/* Role Selector */}
          <div className="flex border border-mist rounded mb-8 overflow-hidden">
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`flex-1 py-2.5 text-sm font-light transition-colors ${
                role === 'buyer' ? 'bg-ink text-washi' : 'text-earth hover:bg-mist'
              }`}
            >
              {t('asBuyer')}
            </button>
            <button
              type="button"
              onClick={() => setRole('merchant')}
              className={`flex-1 py-2.5 text-sm font-light transition-colors ${
                role === 'merchant' ? 'bg-ink text-washi' : 'text-earth hover:bg-mist'
              }`}
            >
              {t('asMerchant')}
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <Input
              label={t('fullName')}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              hint="至少8位字符"
              minLength={8}
            />

            {error && (
              <p className="text-sm text-red-500 font-light">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {t('registerBtn')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-light text-earth">
              {t('hasAccount')}{' '}
              <Link href="/auth/login" className="text-ink hover:text-earth transition-colors underline underline-offset-2">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
