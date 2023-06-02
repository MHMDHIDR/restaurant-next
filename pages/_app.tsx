import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import FileUploadContextProvider from 'contexts/FileUploadContext'
import ToppingsContextProvider from 'contexts/ToppingsContext'
import CartContextProvider from 'contexts/CartContext'
import TagsContextProvider from 'contexts/TagsContext'
import SearchContextProvider from 'contexts/SearchContext'
import DashboardOrderContextProvider from 'contexts/DashboardOrderContext'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useLocale } from 'hooks/useLocale'
import { IntlProvider } from 'react-intl'
import Cookies from 'js-cookie'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { locale } = useLocale() // Use the useLocale hook to get the locale

  const storedLocale = Cookies.get('locale')

  useEffect(() => {
    if (!storedLocale) {
      // Language is not set in the cookie, so set it based on the app locale
      const currentLocale = locale
      const dir = currentLocale === 'ar' ? 'rtl' : 'ltr'

      Cookies.set('locale', currentLocale ?? 'ar')
      document.documentElement.setAttribute('dir', dir)

      if (router.defaultLocale !== currentLocale) {
        // Redirect to the correct language path if it's not the default locale
        const href = router.pathname
        const as = `/${currentLocale}${router.asPath}`

        router.replace(href, as)
      }
    } else {
      // Language is already set in the cookie, so set the `dir` attribute
      const dir = storedLocale === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.setAttribute('dir', dir)
    }
  }, [storedLocale, locale, router])

  const { messages } = useLocale()

  return (
    <IntlProvider locale={locale as string} messages={messages}>
      <SessionProvider session={pageProps.session}>
        <ThemeProvider attribute='class'>
          <PayPalScriptProvider
            options={{
              'client-id':
                'AYJHPBtF1WJl8Hh6hDGouvXVcyO6e2sBrAIfp3ghvIX6EZJMAci75L_gB2kCGLhZWIU3pw8KeaHiipc1'
            }}
          >
            <FileUploadContextProvider>
              <ToppingsContextProvider>
                <CartContextProvider>
                  <TagsContextProvider>
                    <SearchContextProvider>
                      <DashboardOrderContextProvider>
                        <Component {...pageProps} />
                      </DashboardOrderContextProvider>
                    </SearchContextProvider>
                  </TagsContextProvider>
                </CartContextProvider>
              </ToppingsContextProvider>
            </FileUploadContextProvider>
          </PayPalScriptProvider>
        </ThemeProvider>
      </SessionProvider>
    </IntlProvider>
  )
}
