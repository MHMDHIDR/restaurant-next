import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import ar from 'lang/ar.json'
import en from 'lang/en.json'
import { flattenMessages, INestedMessages } from 'lang/flattenMessages'

export type Locale = 'ar' | 'en'
const messages: Record<Locale, INestedMessages> = { ar, en }

export const useLocale = () => {
  const router = useRouter()

  const flattenedMessages = useMemo(
    () => flattenMessages(messages[router.locale as keyof typeof messages]),
    [router]
  )

  const direction = useMemo(() => {
    return router.locale === 'ar' ? 'rtl' : 'ltr'
  }, [router])

  const switchLocale = useCallback(
    (locale: Locale) => {
      if (locale === router.locale) return
      const path = router.asPath
      return router.push(path, path === '/' ? path + locale : path, { locale })
    },
    [router]
  )

  return { locale: router.locale, switchLocale, messages: flattenedMessages, direction }
}
