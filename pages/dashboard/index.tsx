import { useState, useEffect } from 'react'
import Link from 'next/link'
import useAxios from '@hooks/useAxios'
import useDocumentTitle from '@hooks/useDocumentTitle'
import useEventListener from '@hooks/useEventListener'
import ModalNotFound from '@components/Modal/ModalNotFound'
import { LoadingPage } from '@components/Loading'
import Layout from '@components/dashboard/Layout'
import { API_URL, USER } from '@constants'
import { DashboardHomeProps } from '@types'
import goTo from '@functions/goTo'
import logoutUser from '@functions/logoutUser'
import menuToggler from '@functions/menuToggler'
import { toJson } from '@utils/functions/jsonTools'
import Image from 'next/image'

const DashboardHome = ({ orderItemsCount, menuItemsCount }: DashboardHomeProps) => {
  useDocumentTitle('Home')
  const [userStatus, setUserStatus] = useState<string>('')
  const [userType, setUserType] = useState<string>('')
  const [userID, setUserID] = useState<string>('')

  const { loading, response } = useAxios({
    url: `/users/all?page=1&limit=1&itemId=${USER?._id}`
  })

  useEffect(() => {
    if (response) {
      setUserStatus(response?.response?.userAccountStatus)
      setUserType(response?.response?.userAccountType)
      setUserID(response?.response?._id)
    }
  }, [response])

  typeof window !== 'undefined' && document.body.classList.add('dashboard')

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
        <h1 className='mx-0 mt-32 mb-20 text-2xl text-center'>لوحة التحكم</h1>
        <div
          className={`flex justify-center gap-4 flex-wrap${
            userType === 'cashier' ? ' md:justify-center' : ' md:justify-between'
          }`}
        >
          {(userType === 'admin' || userType === 'cashier') && (
            <Link
              href={goTo('orders')}
              className='inline-flex flex-col items-center justify-center p-4 space-y-4 text-white bg-orange-800 hover:bg-orange-700 rounded-xl'
            >
              <Image
                loading='lazy'
                width={160}
                height={96}
                src='/assets/img/icons/orders.svg'
                alt='menu slider img'
                className='w-40 h-24'
              />
              <h3>الطلبات</h3>
              <span className='text-lg font-bold'>عدد الطلبات {orderItemsCount}</span>
            </Link>
          )}

          {userType === 'admin' && (
            <>
              <Link
                href={goTo('menu')}
                className='inline-flex flex-col items-center justify-center px-2 py-4 space-y-4 text-white bg-orange-800 hover:bg-orange-700 rounded-xl'
              >
                <Image
                  loading='lazy'
                  width={160}
                  height={96}
                  src='/assets/img/icons/menu.svg'
                  alt='menu slider img'
                  className='w-40 h-24'
                />
                <h3>القائمة</h3>
                <span className='text-lg font-bold'>عدد الوجبات {menuItemsCount}</span>
              </Link>

              <Link
                href={goTo('food/add')}
                className='inline-flex flex-col items-center justify-center px-2 py-4 space-y-4 text-white bg-orange-800 hover:bg-orange-700 rounded-xl'
              >
                <Image
                  loading='lazy'
                  width={160}
                  height={96}
                  src='/assets/img/icons/add_food.svg'
                  alt='menu slider img'
                  className='w-40 h-24'
                />
                <h3>إضافة وجبة أو مشروب</h3>
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const fetchOrdersCount = `${API_URL}/orders?page=1&limit=0`
  const fetchMenuCount = `${API_URL}/foods?page=1&limit=0`

  const orderItemsCount = await fetch(fetchOrdersCount)
    .then(item => toJson(item))
    .then(({ itemsCount }) => itemsCount)
  const menuItemsCount = await fetch(fetchMenuCount)
    .then(item => toJson(item))
    .then(({ itemsCount }) => itemsCount)

  return { props: { orderItemsCount, menuItemsCount } }
}

export default DashboardHome
