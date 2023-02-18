import Header from './Header'
import Footer from './Footer'

const Layout = ({ children }: any) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
)

export default Layout
