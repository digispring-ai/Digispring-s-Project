'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
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
  const totalItems = useCartStore((s) => s.totalItems())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/products', label: t('products') },
    { href: '/merchants', label: t('merchants') },
  ]

  return (
    <header className="sticky top-0 z-40">
      {/* Vermillion accent stripe — signature Japanese premium brand mark */}
      <div className="h-[2px] bg-beni" />

      <div className="bg-washi/96 backdrop-blur-sm border-b border-mist">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-15">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {/* Hanko-style seal mark */}
              <span className="jp-seal w-7 h-7 text-xs rounded-[1px] select-none shrink-0 group-hover:bg-beni group-hover:text-washi transition-colors duration-300">
                和
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-base font-light text-ink tracking-[0.22em] font-serif">
                  {ts('name')}
                </span>
                <span className="text-[10px] text-earth font-light tracking-[0.18em] mt-0.5">
                  {locale === 'ja' ? '日本から中国へ' : '日本 → 中国'}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative text-sm font-light tracking-wider transition-colors pb-0.5 ${
                      isActive ? 'text-ink' : 'text-earth hover:text-ink'
                    }`}
                  >
                    {link.label}
                    {/* Active underline in beni */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-beni" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-earth hover:text-ink transition-colors"
                  aria-label="Switch language"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:block text-xs font-light tracking-wide">
                    {LOCALES.find((l) => l.value === locale)?.label}
                  </span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-2 w-36 bg-washi border border-mist shadow-sm z-50">
                    {LOCALES.map((loc, i) => (
                      <Link
                        key={loc.value}
                        href={pathname}
                        locale={loc.value}
                        onClick={() => setLangOpen(false)}
                        className={`block w-full px-4 py-2.5 text-xs font-light tracking-wide transition-colors ${
                          i > 0 ? 'border-t border-mist/50' : ''
                        } ${
                          locale === loc.value
                            ? 'text-ink bg-mist/40'
                            : 'text-earth hover:bg-mist/30 hover:text-ink'
                        }`}
                      >
                        {loc.label}
                      </Link>
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
                <ShoppingCart className="w-4.5 h-4.5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] bg-beni text-washi flex items-center justify-center font-light leading-none">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center p-2 text-earth hover:text-ink transition-colors">
                    <User className="w-4.5 h-4.5" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-44 bg-washi border border-mist shadow-sm z-50 hidden group-hover:block">
                    {(userRole === 'merchant' || userRole === 'admin') && (
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2.5 text-xs font-light text-earth hover:bg-mist/40 hover:text-ink transition-colors tracking-wide border-b border-mist/50"
                      >
                        {t('dashboard')}
                      </Link>
                    )}
                    {userRole === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2.5 text-xs font-light text-earth hover:bg-mist/40 hover:text-ink transition-colors tracking-wide border-b border-mist/50"
                      >
                        {t('admin')}
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      className="block px-4 py-2.5 text-xs font-light text-earth hover:bg-mist/40 hover:text-ink transition-colors tracking-wide border-b border-mist/50"
                    >
                      {t('orders')}
                    </Link>
                    <Link
                      href="/account"
                      className="block px-4 py-2.5 text-xs font-light text-earth hover:bg-mist/40 hover:text-ink transition-colors tracking-wide border-b border-mist"
                    >
                      {t('account')}
                    </Link>
                    <form action="/auth/signout" method="post">
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2.5 text-xs font-light text-earth hover:bg-mist/40 hover:text-ink transition-colors tracking-wide"
                      >
                        {t('logout')}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:flex items-center px-3 py-1.5 text-xs font-light text-earth border border-mist hover:border-ink hover:text-ink transition-colors tracking-wider"
                >
                  {t('login')}
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-earth hover:text-ink transition-colors"
              >
                {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-mist bg-washi">
          <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm font-light text-earth hover:text-ink border-b border-mist/40 last:border-0 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-light text-earth hover:text-ink border-b border-mist/40 tracking-wide"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-light text-earth hover:text-ink tracking-wide"
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
