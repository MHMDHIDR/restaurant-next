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

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  const router = useRouter()
  const storedLocale = Cookies.get('locale')

  useEffect(() => {
    if (router.locale) {
      router.push(router.locale)
    }
    const dir = storedLocale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
  }, [storedLocale])

  // useLocale is a custom hook.
  const { locale, messages } = useLocale()

  return (
    <IntlProvider locale={locale as string} messages={messages}>
      <SessionProvider session={session}>
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
