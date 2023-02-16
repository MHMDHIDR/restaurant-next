import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
ChartJS.register(ArcElement, Tooltip, Legend)
import useAxios from '@hooks/useAxios'
import useDocumentTitle from '@hooks/useDocumentTitle'
import useEventListener from '@hooks/useEventListener'
import logoutUser from '@functions/logoutUser'
import menuToggler from '@functions/menuToggler'
import ModalNotFound from '@components/Modal/ModalNotFound'
import { LoadingPage } from '@components/Loading'
import { cCategory } from '@types'
import { USER } from '@constants'
import Layout from '@components/dashboard/Layout'
import { stringJson } from '@functions/jsonTools'

const DashboardStatistics = () => {
  useDocumentTitle('Home')

  const [userStatus, setUserStatus] = useState<string>('')
  const [userType, setUserType] = useState<string>('')
  const [userID, setUserID] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([''])
  const [ordersBycCategory, setOrdersBycCategory] = useState<cCategory>()

  //if there's food id then fetch with food id, otherwise fetch everything
  const currentUser = useAxios({ url: `/users/all?page=1&limit=1&itemId${USER?._id}` })
  const getCategories = useAxios({ url: `/settings` })
  const menu = useAxios({ url: `/foods?page=0&limit=0` })
  const orders = useAxios({
    url: `/orders?page=1&limit=0`,
    headers: USER ? stringJson({ Authorization: `Bearer ${USER.token}` }) : null
  })
  const { loading } = orders

  useEffect(() => {
    if (currentUser?.response !== null || menu.response !== null) {
      setUserStatus(currentUser?.response?.response?.userAccountStatus)
      setUserType(currentUser?.response?.response?.userAccountType)
      setUserID(currentUser?.response?.response?._id)
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
    currentUser?.response,
    menu?.response,
    orders?.response,
    orders?.response?.response,
    getCategories?.response?.CategoryList
  ])

  useEventListener('keydown', (e: any) => e.key === 'Escape' && menuToggler())

  //check if userStatus is active and the userType is admin
  return loading ? (
    <LoadingPage />
  ) : USER?._id !== userID ? (
    <ModalNotFound />
  ) : userStatus === 'block' || userType === 'user' ? (
    logoutUser(USER?._id)
  ) : (
    <Layout>
      <div className='container mx-auto'>
        <h1 className='mx-0 mt-32 mb-20 text-2xl text-center'>عدد الطلبات حسب التصنيف</h1>

        <Doughnut
          width={200}
          height={200}
          data={{
            labels: categories?.map(category => category[1]), //ordersBycCategory && Object.keys(ordersBycCategory)
            datasets: [
              {
                label: 'عدد الطلبات حسب التصنيف',
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
