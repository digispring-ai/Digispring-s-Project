import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function Footer() {
  const t = useTranslations('site')
  const tn = useTranslations('nav')

  return (
    <footer className="border-t border-mist mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-light text-ink tracking-widest mb-3">{t('name')}</h3>
            <p className="text-sm font-light text-earth leading-relaxed">{t('description')}</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-light text-earth tracking-widest uppercase mb-4 border-b border-mist pb-2">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: '/products', label: tn('products') },
                { href: '/merchants', label: tn('merchants') },
                { href: '/apply', label: tn('applyMerchant') },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-light text-earth hover:text-ink transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Japanese decoration */}
          <div className="flex flex-col items-start md:items-end">
            <p className="text-4xl font-light text-mist tracking-widest leading-none select-none">
              和
            </p>
            <p className="text-xs font-light text-earth/50 mt-2 tracking-wider">
              Japan × China
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-mist flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-light text-earth/60 tracking-wide">
            © {new Date().getFullYear()} {t('name')} · 和市
          </p>
          <p className="text-xs font-light text-earth/40">
            日本 → 中国 Cross-border Commerce
          </p>
        </div>
      </div>
    </footer>
  )
}
