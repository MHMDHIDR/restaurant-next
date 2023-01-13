import { useState, useEffect, Suspense, lazy } from 'react'
import { Outlet } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
ChartJS.register(ArcElement, Tooltip, Legend)

import useAxios from '../../hooks/useAxios'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import useEventListener from '../../hooks/useEventListener'

import logoutUser from '../../utils/logoutUser'
import menuToggler from '../../utils/menuToggler'

import ModalNotFound from '../../components/Modal/ModalNotFound'
import { LoadingPage } from '../../components/Loading'
import { cCategory } from '../../types'
const DashboardNav = lazy(() => import('../../components/dashboard/DashboardNav'))

const DashboardHome = () => {
  useDocumentTitle('Home')

  //getting user id from local storage
  const USER = JSON.parse(localStorage.getItem('user'))

  const [userStatus, setUserStatus] = useState<string>('')
  const [userType, setUserType] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([''])
  const [ordersBycCategory, setOrdersBycCategory] = useState<cCategory>()

  //if there's food id then fetch with food id, otherwise fetch everything
  const currentUser = useAxios({ method: 'get', url: `/users/all/1/1/${USER?._id}` })
  const getCategories = useAxios({ url: `/settings` })
  const menu = useAxios({ method: 'get', url: `/foods/0/0` })
  const orders = useAxios({
    url: `/orders/0/0`,
    headers: USER ? JSON.stringify({ Authorization: `Bearer ${USER.token}` }) : null
  })

  useEffect(() => {
    if (currentUser?.response !== null || menu.response !== null) {
      setUserStatus(currentUser?.response?.response?.userAccountStatus)
      setUserType(currentUser?.response?.response?.userAccountType)
      //Statistics
      setCategories(getCategories?.response?.CategoryList)
      setOrdersBycCategory(
        orders?.response?.response
          ?.map(({ orderItems }) => orderItems[0])
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
    orders?.response?.response
  ])

  useEventListener('keydown', (e: any) => e.key === 'Escape' && menuToggler())

  //check if userStatus is active and the userType is admin
  return !USER?._id ? (
    <ModalNotFound />
  ) : !USER?._id || userStatus === 'block' || userType === 'user' ? (
    logoutUser(USER?._id)
  ) : !userStatus || !userType ? (
    <LoadingPage />
  ) : (
    <Suspense fallback={<LoadingPage />}>
      <section className='overflow-x-auto h-screen'>
        <div className='container mx-auto'>
          <h1 className='mx-0 mt-32 mb-20 text-2xl text-center'>
            عدد الطلبات حسب التصنيف
          </h1>

          <Doughnut
            width={100}
            height={50}
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
          />
        </div>
        <Outlet />
      </section>
    </Suspense>
  )
}

export default DashboardHome
