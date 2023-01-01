import '../styles/globals.css'
import type { AppProps } from 'next/app'
import FileUploadContextProvider from '../Contexts/FileUploadContext'
import ThemeContextProvider from '../Contexts/ThemeContext'
import ToppingsContextProvider from '../Contexts/ToppingsContext'
import CartContextProvider from '../Contexts/CartContext'
import TagsContextProvider from '../Contexts/TagsContext'
import SearchContextProvider from '../Contexts/SearchContext'
import DashboardOrderContextProvider from '../Contexts/DashboardOrderContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
    // <FileUploadContextProvider>
    //   <ThemeContextProvider>
    //     <ToppingsContextProvider>
    //       <CartContextProvider>
    //         <TagsContextProvider>
    //           <SearchContextProvider>
    //             <DashboardOrderContextProvider></DashboardOrderContextProvider>
    //           </SearchContextProvider>
    //         </TagsContextProvider>
    //       </CartContextProvider>
    //     </ToppingsContextProvider>
    //   </ThemeContextProvider>
    // </FileUploadContextProvider>
  )
}
