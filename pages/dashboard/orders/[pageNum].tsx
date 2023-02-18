import useDocumentTitle from 'hooks/useDocumentTitle'
import OrdersTable from 'components/dashboard/OrdersTable'
import Layout from 'components/dashboard/Layout'

const DashboardOrders = () => {
  useDocumentTitle('Orders')

  return (
    <Layout>
      <section className='container py-12 mx-auto my-8 xl:max-w-full'>
        <div className='h-screen overflow-x-auto 2xl:flex 2xl:flex-col 2xl:items-center 2xl:w-full'>
          <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
            آخر الطلبات
          </h3>
          <OrdersTable />
        </div>
      </section>
    </Layout>
  )
}

export default DashboardOrders
