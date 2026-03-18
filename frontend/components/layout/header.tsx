'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { ShoppingCart, Menu, X, Globe, User } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useState } from 'react'
import type { Locale } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HeaderProps {
  user?: SupabaseUser | null
  userRole?: string | null
}

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'zh-hans', label: '简体中文' },
  { value: 'ja', label: '日本語' },
  { value: 'zh-hant', label: '繁體中文' },
  { value: 'en', label: 'English' },
]

export function Header({ user, userRole }: HeaderProps) {
  const t = useTranslations('nav')
  const ts = useTranslations('site')
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const totalItems = useCartStore((s) => s.totalItems())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const switchLocale = (next: Locale) => {
    router.replace(pathname, { locale: next })
    setLangOpen(false)
  }

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/products', label: t('products') },
    { href: '/merchants', label: t('merchants') },
  ]

  return (
    <header className="sticky top-0 z-40 bg-washi/95 backdrop-blur border-b border-mist">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-light text-ink tracking-widest">{ts('name')}</span>
            <span className="hidden sm:block text-xs text-earth font-light tracking-wider border-l border-mist pl-2">
              {locale === 'ja' ? '日本から中国へ' : '日本→中国'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-light text-earth hover:text-ink transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 p-2 text-earth hover:text-ink transition-colors"
                aria-label="Switch language"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:block text-xs font-light">
                  {LOCALES.find((l) => l.value === locale)?.label}
                </span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-mist rounded shadow-sm z-50">
                  {LOCALES.map((loc) => (
                    <button
                      key={loc.value}
                      onClick={() => switchLocale(loc.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-light hover:bg-mist transition-colors ${
                        locale === loc.value ? 'text-ink' : 'text-earth'
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-earth hover:text-ink transition-colors"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] bg-ink text-washi rounded-full flex items-center justify-center font-light">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1 p-2 text-earth hover:text-ink transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-mist rounded shadow-sm z-50 hidden group-hover:block">
                  {(userRole === 'merchant' || userRole === 'admin') && (
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2.5 text-sm font-light text-earth hover:bg-mist hover:text-ink transition-colors"
                    >
                      {t('dashboard')}
                    </Link>
                  )}
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2.5 text-sm font-light text-earth hover:bg-mist hover:text-ink transition-colors"
                    >
                      {t('admin')}
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="block px-4 py-2.5 text-sm font-light text-earth hover:bg-mist hover:text-ink transition-colors"
                  >
                    {t('orders')}
                  </Link>
                  <Link
                    href="/account"
                    className="block px-4 py-2.5 text-sm font-light text-earth hover:bg-mist hover:text-ink transition-colors"
                  >
                    {t('account')}
                  </Link>
                  <div className="border-t border-mist">
                    <form action="/auth/signout" method="post">
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2.5 text-sm font-light text-earth hover:bg-mist hover:text-ink transition-colors"
                      >
                        {t('logout')}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:flex items-center gap-1 text-sm font-light text-earth hover:text-ink transition-colors"
              >
                {t('login')}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-earth hover:text-ink transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-mist bg-washi">
          <nav className="px-4 py-3 flex flex-col gap-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm font-light text-earth hover:text-ink border-b border-mist/50 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-light text-earth hover:text-ink border-b border-mist/50"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-light text-earth hover:text-ink"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Backdrop for language dropdown */}
      {langOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setLangOpen(false)}
        />
      )}
    </header>
  )
}
