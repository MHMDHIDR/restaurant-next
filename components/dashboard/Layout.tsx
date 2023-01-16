import { Suspense } from 'react'
import { LoadingPage } from '../Loading'
import DashboardNav from './DashboardNav'
import DashboardSidebar from './DashboardSidebar'

const Layout = ({ children }: any) => (
  <Suspense fallback={<LoadingPage />}>
    <section className='h-screen overflow-x-auto'>
      <DashboardSidebar />
      <DashboardNav />
      {children}
    </section>
  </Suspense>
)

export default Layout
