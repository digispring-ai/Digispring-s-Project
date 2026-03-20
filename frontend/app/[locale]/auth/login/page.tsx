'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const t = useTranslations('auth')
  const ts = useTranslations('site')
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Map Supabase error messages to user-friendly text
      if (
        error.message.toLowerCase().includes('invalid login') ||
        error.message.toLowerCase().includes('invalid credentials') ||
        error.status === 400
      ) {
        setError(t('invalidCredentials') ?? '邮箱或密码错误，请重试。')
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        setError(t('emailNotConfirmed') ?? '请先确认邮箱，再进行登录。请检查您的收件箱。')
      } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed')) {
        setError('网络连接失败，请稍后重试。 / Network error, please try again.')
      } else if (error.status === 429) {
        setError('登录尝试过多，请稍等片刻。 / Too many attempts, please wait.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-washi flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-light text-ink tracking-widest">
            {ts('name')}
          </Link>
          <p className="mt-2 text-sm font-light text-earth">{ts('tagline')}</p>
        </div>

        <div className="bg-white border border-mist rounded p-8">
          <h1 className="text-lg font-light text-ink tracking-wide mb-8">{t('login')}</h1>

          <form onSubmit={handleLogin} className="space-y-6">
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
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-red-500 font-light">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {t('loginBtn')}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm font-light text-earth">
              {t('noAccount')}{' '}
              <Link href="/auth/register" className="text-ink hover:text-earth transition-colors underline-offset-2 underline">
                {t('register')}
              </Link>
            </p>
          </div>
        </div>

        {/* Supabase email confirmation note */}
        <p className="mt-6 text-center text-xs font-light text-earth/50 leading-relaxed">
          {t('emailConfirmNotice') ?? '注册后需验证邮箱方可登录'}
        </p>
      </div>
    </div>
  )
}
