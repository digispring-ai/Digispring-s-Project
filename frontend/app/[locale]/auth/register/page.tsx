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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (role === 'merchant') {
      router.push('/apply')
    } else {
      router.push('/')
    }
    router.refresh()
  }

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
