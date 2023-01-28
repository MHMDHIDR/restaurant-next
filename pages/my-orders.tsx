import { useState, useEffect } from 'react'
import useAxios from '../hooks/useAxios'
import useDocumentTitle from '../hooks/useDocumentTitle'
import logoutUser from '../utils/functions/logoutUser'
import { LoadingPage } from '../components/Loading'
import Header from '../components/Header'
import Footer from '../components/Footer'
import OrdersTable from '../components/dashboard/OrdersTable'
import ModalNotFound from '../components/Modal/ModalNotFound'
import Layout from '../components/Layout'
import { USER } from '../constants'

const MyOrders = () => {
  useDocumentTitle('My Orders')

  //getting user id from local storage
  const USER_ID = USER._id || ''
  const [userStatus, setUserStatus] = useState<any>('')

  const currentUser = useAxios({ url: `/users/all?page=1&limit=1&itemId=${USER_ID}` })

  useEffect(() => {
    if (currentUser?.response !== null) {
      setUserStatus(currentUser?.response?.response)
    }
  }, [currentUser?.response])

  return !userStatus.userAccountStatus ? (
    <LoadingPage />
  ) : !USER_ID ? (
    <ModalNotFound />
  ) : !USER_ID || userStatus.userAccountStatus === 'block' ? (
    logoutUser(USER_ID)
  ) : (
    <Layout>
      <section className='container py-12 mx-auto my-8 xl:max-w-full'>
        <div className='h-screen overflow-x-auto 2xl:flex 2xl:flex-col 2xl:items-center 2xl:w-full'>
          <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>طلباتي</h3>
          <OrdersTable ordersByUserEmail={true} />
        </div>
      </section>
    </Layout>
  )
}

export default MyOrders
