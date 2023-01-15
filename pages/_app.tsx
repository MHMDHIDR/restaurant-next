import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
// import FileUploadContextProvider from '../contexts/FileUploadContext'
// import ToppingsContextProvider from '../contexts/ToppingsContext'
// import CartContextProvider from '../contexts/CartContext'
// import TagsContextProvider from '../contexts/TagsContext'
// import SearchContextProvider from '../contexts/SearchContext'
// import DashboardOrderContextProvider from '../contexts/DashboardOrderContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute='class'>
      {/* <FileUploadContextProvider> */}
      {/* <ToppingsContextProvider> */}
      {/* <CartContextProvider> */}
      {/* <TagsContextProvider> */}
      {/* <SearchContextProvider> */}
      {/* <DashboardOrderContextProvider> */}
      <Component {...pageProps} />
      {/* </DashboardOrderContextProvider> */}
      {/* </SearchContextProvider> */}
      {/* </TagsContextProvider> */}
      {/* </CartContextProvider> */}
      {/* </ToppingsContextProvider> */}
      {/* </FileUploadContextProvider> */}
    </ThemeProvider>
  )
}
