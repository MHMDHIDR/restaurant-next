import { useState, useEffect } from 'react'
import Link from 'next/link'
import useAxios from '../../hooks/useAxios'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import useEventListener from '../../hooks/useEventListener'
import goTo from '../../utils/functions/goTo'
import logoutUser from '../../utils/functions/logoutUser'
import menuToggler from '../../utils/functions/menuToggler'
import ModalNotFound from '../../components/Modal/ModalNotFound'
import { LoadingPage } from '../../components/Loading'
import { API_URL, USER } from '../../constants'
import Layout from '../../components/dashboard/Layout'

const DashboardHome = ({ menu }: any) => {
  useDocumentTitle('Home')

  const [userStatus, setUserStatus] = useState<string>('')
  const [userType, setUserType] = useState<string>('')
  const [menuCount, setMenuCount] = useState<number>()
  const [ordersCount, setOrdersCount] = useState<number>(0)

  //if there's food id then fetch with food id, otherwise fetch everything
  const currentUser = useAxios({ url: `/users/all?page=1&limit=1&itemId${USER?._id}` })
  const orders = useAxios({
    url: `/orders?page=0&limit=0`,
    headers: USER ? JSON.stringify({ Authorization: `Bearer ${USER.token}` }) : '{}'
  })

  useEffect(() => {
    if (currentUser?.response !== null || menu.response !== null) {
      setUserStatus(currentUser?.response?.response?.userAccountStatus)
      setUserType(currentUser?.response?.response?.userAccountType)
      setMenuCount(menu?.response?.itemsCount)
      setOrdersCount(orders?.response?.itemsCount || 0)
    }
  }, [currentUser?.response, menu?.response, orders?.response])

  typeof window !== 'undefined' && document.body.classList.add('dashboard')

  useEventListener('keydown', (e: any) => e.key === 'Escape' && menuToggler())

  //check if userStatus is active and the userType is admin
  // return !USER?._id ? (
  //   <ModalNotFound />
  // ) : !USER?._id || userStatus === 'block' || userType === 'user' ? (
  //   logoutUser(USER?._id)
  // ) : !userStatus || !userType ? (
  //   <LoadingPage />
  // ) :
  return (
    <Layout>
      <div className='container mx-auto'>
        <h1 className='mx-0 mt-32 mb-20 text-2xl text-center'>لوحة التحكم</h1>
        <div
          className={`flex justify-center gap-4 flex-wrap${
            userType === 'cashier' ? ' md:justify-center' : ' md:justify-between'
          }`}
        >
          {/* Orders */}
          {/* {(userType === 'admin' || userType === 'cashier') && ( */}
          <Link
            href={goTo('orders')}
            className='inline-flex flex-col items-center justify-center p-4 space-y-4 text-white bg-orange-800 hover:bg-orange-700 rounded-xl'
          >
            <img
              loading='lazy'
              src='/assets/img/icons/orders.svg'
              alt='menu slider img'
              className='w-40 h-24'
            />
            <h3>الطلبات</h3>
            <span className='text-lg font-bold'>عدد الطلبات {ordersCount}</span>
          </Link>
          {/* )} */}

          {/* Menu  &  Add Items*/}
          {/* {userType === 'admin' && ( */}
          <>
            <Link
              href={goTo('menu')}
              className='inline-flex flex-col items-center justify-center px-2 py-4 space-y-4 text-white bg-orange-800 hover:bg-orange-700 rounded-xl'
            >
              <img
                loading='lazy'
                src='/assets/img/icons/menu.svg'
                alt='menu slider img'
                className='w-40 h-24'
              />
              <h3>القائمة</h3>
              <span className='text-lg font-bold'>عدد الوجبات {menuCount}</span>
            </Link>

            <Link
              href={goTo('add-food')}
              className='inline-flex flex-col items-center justify-center px-2 py-4 space-y-4 text-white bg-orange-800 hover:bg-orange-700 rounded-xl'
            >
              <img
                loading='lazy'
                src='/assets/img/icons/add_food.svg'
                alt='menu slider img'
                className='w-40 h-24'
              />
              <h3>إضافة وجبة أو مشروب</h3>
            </Link>
          </>
          {/* )} */}
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const menu = await fetch(`${API_URL}/foods?page=0&limit=0`).then(menu => menu.json())

  return {
    props: { menu }
  }
}

export default DashboardHome