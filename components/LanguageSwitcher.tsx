import { useEffect, useRef } from 'react'
import NavMenu from './NavMenu'
import { useLocale } from 'hooks/useLocale'
import type { Locale } from 'hooks/useLocale'
import { useTranslate } from 'hooks/useTranslate'

const LanguageSwitcher = () => {
  const { locale, switchLocale } = useLocale()
  const { t } = useTranslate()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  const switchLocaleRefAr = useRef<HTMLButtonElement>(null)
  const switchLocaleRefEn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('dir', direction)
  }, [direction])

  const switchLocaleHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const selectedLocale = e.currentTarget.value as Locale
    switchLocale(selectedLocale)
  }

  return (
    <NavMenu
      label={locale === 'ar' ? t('app.lang.ar') : t('app.lang.en')}
      className={`dark:text-white ltr gap-y-3`}
    >
      {locale === 'ar' ? (
        <button
          className='inline-block p-1 rounded-lg hover:bg-gray-900 hover:bg-opacity-30'
          onClick={switchLocaleHandler}
          value={`en`}
          ref={switchLocaleRefEn}
        >
          {t('app.lang.en')}
        </button>
      ) : (
        <button
          className='inline-block p-1 rounded-lg hover:bg-gray-900 hover:bg-opacity-30'
          onClick={switchLocaleHandler}
          value={`ar`}
          ref={switchLocaleRefAr}
        >
          {t('app.lang.ar')}
        </button>
      )}
    </NavMenu>
  )
}

export default LanguageSwitcher
