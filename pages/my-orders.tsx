import useDocumentTitle from 'hooks/useDocumentTitle'
import logoutUser from 'functions/logoutUser'
import { LoadingPage } from 'components/Loading'
import OrdersTable from 'components/dashboard/OrdersTable'
import ModalNotFound from 'components/Modal/ModalNotFound'
import Layout from 'components/Layout'
import useAuth from 'hooks/useAuth'

const MyOrders = () => {
  useDocumentTitle('My Orders')

  const { userStatus, userId, loading } = useAuth()

  return loading ? (
    <LoadingPage />
  ) : userStatus === 'block' ? (
    <ModalNotFound />
  ) : !userStatus || userStatus === 'block' ? (
    logoutUser(userId)
  ) : (
    <Layout>
      <section className='container py-12 mx-auto my-8 xl:max-w-full'>
        <div className='2xl:flex 2xl:flex-col 2xl:items-center 2xl:w-full'>
          <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>طلباتي</h3>
          <OrdersTable ordersByUserEmail={true} />
        </div>
      </section>
    </Layout>
  )
}

export default MyOrders
