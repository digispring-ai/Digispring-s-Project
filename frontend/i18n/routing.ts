import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['zh-hans', 'ja', 'zh-hant', 'en'],
  defaultLocale: 'zh-hans',
  localePrefix: 'always',
})
