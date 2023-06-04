import useDocumentTitle from 'hooks/useDocumentTitle'
import OrdersTable from 'components/dashboard/OrdersTable'
import Layout from 'components/dashboard/Layout'
import { useTranslate } from 'hooks/useTranslate'

const DashboardOrders = () => {
  useDocumentTitle('Orders')

  const { t } = useTranslate()

  return (
    <Layout>
      <section className='container py-12 mx-auto my-8 xl:fit'>
        <div className='2xl:flex 2xl:flex-col 2xl:items-center 2xl:w-full'>
          <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
            {t('app.dashboard.orders.title')}
          </h3>
          <OrdersTable />
        </div>
      </section>
    </Layout>
  )
}

export default DashboardOrders
