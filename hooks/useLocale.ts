import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import ar from 'lang/ar.json'
import en from 'lang/en.json'
import { flattenMessages, INestedMessages } from 'lang/flattenMessages'
import type { NextRouter } from 'next/router'

const messages: Record<Locale, INestedMessages> = { ar, en }

export type Locale = 'ar' | 'en'

const getInitialLocale = (router: NextRouter): Locale => {
  const storedLocale = Cookies.get('locale')
  if (storedLocale && router.locales?.includes(storedLocale)) {
    return storedLocale as Locale
  } else if (router.locales) {
    return router.locales[0] as Locale
  }
  return router.defaultLocale as Locale
}

export const useLocale = () => {
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>(getInitialLocale(router))

  const flattenedMessages = useMemo(() => flattenMessages(messages[locale]), [locale])

  const switchLocale = useCallback(
    (selectedLocale: Locale) => {
      if (router.locales?.includes(selectedLocale)) {
        Cookies.set('locale', selectedLocale, { expires: 365 })
        setLocale(selectedLocale)
        router.push(router.pathname, router.asPath, { locale: selectedLocale })
      }
    },
    [router.locales, router.pathname, router.asPath]
  )

  useEffect(() => {
    setLocale(getInitialLocale(router))
  }, [router.locale])

  return { locale, switchLocale, messages: flattenedMessages }
}
