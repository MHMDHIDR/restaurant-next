import '../styles/globals.css'
import type { AppProps } from 'next/app'
// import FileUploadContextProvider from '../contexts/FileUploadContext'
// import ThemeContextProvider from '../contexts/ThemeContext'
// import ToppingsContextProvider from '../contexts/ToppingsContext'
// import CartContextProvider from '../contexts/CartContext'
// import TagsContextProvider from '../contexts/TagsContext'
// import SearchContextProvider from '../contexts/SearchContext'
// import DashboardOrderContextProvider from '../contexts/DashboardOrderContext'

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
