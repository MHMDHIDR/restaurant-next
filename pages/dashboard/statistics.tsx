import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
ChartJS.register(ArcElement, Tooltip, Legend)
import useAxios from 'hooks/useAxios'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useEventListener from 'hooks/useEventListener'
import useAuth from 'hooks/useAuth'
import ModalNotFound from 'components/Modal/ModalNotFound'
import { LoadingPage } from 'components/Loading'
import { cCategory } from '@types'
import Layout from 'components/dashboard/Layout'
import logoutUser from 'functions/logoutUser'
import menuToggler from 'functions/menuToggler'
import { useTranslate } from 'hooks/useTranslate'

const DashboardStatistics = () => {
  useDocumentTitle('Home')
  const { userType, userStatus, userId, loading } = useAuth()

  const [categories, setCategories] = useState<string[]>([''])
  const [ordersBycCategory, setOrdersBycCategory] = useState<cCategory>()

  const { t } = useTranslate()

  //if there's food id then fetch with food id, otherwise fetch everything
  const getCategories = useAxios({ url: `/settings` })
  const menu = useAxios({ url: `/foods?page=1&limit=0` })
  const orders = useAxios({ url: `/orders?page=1&limit=0` })

  useEffect(() => {
    if (menu.response !== null) {
      //Statistics
      setCategories(getCategories?.response?.CategoryList || [])
      setOrdersBycCategory(
        orders?.response?.response
          ?.map(({ orderItems }: any) => orderItems[0])
          ?.reduce((acc: { [x: string]: any }, cur: { cCategory: string | number }) => {
            acc[cur.cCategory] = (acc[cur.cCategory] || 0) + 1
            return acc
          }, {})
      )
    }
  }, [
    menu?.response,
    orders?.response,
    orders?.response?.response,
    getCategories?.response?.CategoryList
  ])

  useEventListener('keydown', (e: any) => e.key === 'Escape' && menuToggler())

  //check if userStatus is active and the userType is admin
  return loading ? (
    <LoadingPage />
  ) : userType === 'user' ? (
    <ModalNotFound />
  ) : userStatus === 'block' ? (
    logoutUser(userId)
  ) : (
    <Layout>
      <div className='container mx-auto'>
        <h1 className='mx-0 mt-32 mb-20 text-2xl text-center'>
          {t('app.dashboard.statistics.title')}
        </h1>

        <Doughnut
          width={200}
          height={200}
          data={{
            labels: categories?.map(category => category[1]), //ordersBycCategory && Object.keys(ordersBycCategory)
            datasets: [
              {
                label: t('app.dashboard.statistics.title'),
                data: ordersBycCategory && Object.values(ordersBycCategory),
                backgroundColor: [
                  'rgba(155, 52, 18, 0.7)',
                  'rgba(171, 0, 87, 0.2)',
                  'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                  'rgba(155, 52, 18, 0.95)',
                  'rgba(171, 0, 87, 1)',
                  'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 0.5
              }
            ]
          }}
          className='max-w-sm mx-auto max-h-96'
        />
      </div>
    </Layout>
  )
}

export default DashboardStatistics
