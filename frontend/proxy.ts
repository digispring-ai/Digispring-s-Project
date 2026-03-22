import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    // Set a cookie to remember the previous locale for all requests that have a locale prefix
    '/(zh-hans|ja|zh-hant|en)/:path*',
    // Enable redirects that add missing locales (e.g. `/products` -> `/zh-hans/products`)
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
