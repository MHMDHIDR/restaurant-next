import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import FileUploadContextProvider from '@contexts/FileUploadContext'
import ToppingsContextProvider from '@contexts/ToppingsContext'
import CartContextProvider from '@contexts/CartContext'
import TagsContextProvider from '@contexts/TagsContext'
import SearchContextProvider from '@contexts/SearchContext'
import DashboardOrderContextProvider from '@contexts/DashboardOrderContext'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

export default function App({ Component, pageProps }: AppProps) {
  return (
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
  )
}
