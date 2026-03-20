import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function Footer() {
  const t = useTranslations('site')
  const tn = useTranslations('nav')

  return (
    <footer className="mt-24">
      {/* Top rule with beni accent */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-mist" />
          <span className="text-beni text-xs select-none">◆</span>
          <div className="flex-1 h-px bg-mist" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Brand — col 1-5 */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              {/* Mini hanko mark */}
              <span className="jp-seal w-8 h-8 text-sm rounded-[1px] select-none shrink-0">
                和
              </span>
              <h3 className="text-lg font-light text-ink tracking-[0.22em] font-serif">
                {t('name')}
              </h3>
            </div>
            <p className="text-sm font-light text-earth leading-relaxed max-w-xs">
              {t('description')}
            </p>
            {/* Seasonal phrase */}
            <p className="mt-5 text-xs font-light text-earth tracking-[0.2em] italic">
              一期一会 — Cherish every encounter
            </p>
          </div>

          {/* Navigation — col 6-8 */}
          <div className="md:col-span-3">
            <h4 className="jp-section-label mb-5">Navigation</h4>
            <nav className="flex flex-col gap-3">
              {[
                { href: '/products', label: tn('products') },
                { href: '/merchants', label: tn('merchants') },
                { href: '/apply', label: tn('applyMerchant') },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-light text-earth hover:text-ink transition-colors tracking-wide group flex items-center gap-2"
                >
                  <span className="w-2 h-px bg-earth/30 group-hover:bg-beni group-hover:w-4 transition-all duration-200" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Japanese Decorative Column — col 9-12 */}
          <div className="md:col-span-4 flex flex-col items-start md:items-end justify-between">
            {/* Vertical kanji decoration */}
            <div className="flex gap-4 md:gap-3">
              <div className="jp-vertical text-5xl font-light text-mist/60 select-none leading-none tracking-widest font-serif">
                和
              </div>
              <div className="jp-vertical text-3xl font-light text-mist/40 select-none leading-none tracking-widest font-serif mt-4">
                市
              </div>
              <div className="jp-vertical text-2xl font-light text-mist/25 select-none leading-none tracking-widest font-serif mt-8">
                美
              </div>
            </div>
            {/* Tagline */}
            <p className="text-[10px] font-light text-earth tracking-[0.25em] mt-6">
              JAPAN × CHINA
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-mist/60 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] font-light text-earth tracking-wide">
            © {new Date().getFullYear()} {t('name')} · 和市
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-light text-earth/70 tracking-wider">
              日本 → 中国 Cross-border Commerce
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
