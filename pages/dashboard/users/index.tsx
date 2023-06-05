import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useEventListener from 'hooks/useEventListener'
import useAxios from 'hooks/useAxios'
import useAuth from 'hooks/useAuth'
import goTo from 'functions/goTo'
import logoutUser from 'functions/logoutUser'
import { isNumber } from 'functions/isNumber'
import { API_URL, ITEMS_PER_PAGE } from '@constants'
import Modal from 'components/Modal/Modal'
import { Success, Error, Loading } from 'components/Icons/Status'
import { LoadingPage } from 'components/Loading'
import Pagination from 'components/Pagination'
import NavMenu from 'components/NavMenu'
import ModalNotFound from 'components/Modal/ModalNotFound'
import Layout from 'components/dashboard/Layout'
import { useTranslate } from 'hooks/useTranslate'
import { useLocale } from 'hooks/useLocale'

const DashboardUsers = () => {
  useDocumentTitle('Users')

  const { query } = useRouter()
  const { pageNum }: any = query
  const pageNumber = !pageNum || !isNumber(pageNum) || pageNum < 1 ? 1 : parseInt(pageNum)

  const [userId, setUserId] = useState('')
  const [userAccountAction, setUserAccountAction] = useState('')
  const [userName, setUserName] = useState('')
  const [deleteUserStatus, setDeleteUserStatus] = useState()
  const [userUpdated, setUserUpdated] = useState()
  const [users, setUsers] = useState<any>('')
  const [modalLoading, setModalLoading] = useState(false)
  const { userType } = useAuth()
  const { t } = useTranslate()
  const { locale } = useLocale()

  const { loading, ...response } = useAxios({
    url: `/users/all?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`
  })

  useEffect(() => {
    if (response?.response !== null) {
      setUsers(response?.response)
    }
  }, [response.response])

  useEventListener('click', (e: any) => {
    switch (e.target.id) {
      case 'deleteUser':
      case 'blockUser':
      case 'activateUser':
      case 'admin':
      case 'cashier':
      case 'user': {
        setUserId(e.target.dataset.id)
        setUserName(e.target.dataset.name)
        setUserAccountAction(e.target.dataset.action)
        //show modal
        setModalLoading(true)
        break
      }

      case 'confirm': {
        handleUser(userId, userAccountAction)
        break
      }

      case 'cancel': {
        setModalLoading(false)
        break
      }

      default: {
        setModalLoading(false)
        break
      }
    }
  })

  const handleUser = async (userId: string, userAccountAction: string) => {
    if (userAccountAction === 'delete') {
      try {
        //You need to name the body {data} so it can be recognized in (.delete) method
        //I passed empty data value because delete method needs data object with any
        //value and in this case we don't have any value
        const response = await axios.delete(`${API_URL}/users/${userId}`, { data: '' })
        const { userDeleted } = response.data
        setDeleteUserStatus(userDeleted)

        setTimeout(() => {
          setModalLoading(false)
        }, 300)

        logoutUser(userId)
      } catch (err) {
        console.error(err)
      }
    } else {
      const formData = new FormData()
      formData.append('userAccountAction', userAccountAction)

      try {
        const response = await axios.patch(`${API_URL}/users/${userId}`, formData)
        const { userUpdated } = response.data
        setUserUpdated(userUpdated)

        setTimeout(() => {
          setModalLoading(false)
        }, 300)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return loading || !userType ? (
    <LoadingPage />
  ) : userType !== 'admin' ? (
    <ModalNotFound btnLink='/dashboard' btnName='لوحة التحكم' />
  ) : (
    <>
      {deleteUserStatus === 1 ? (
        <Modal
          status={Success}
          msg={`تم حذف ${userName} بنجاح 😄 الرجاء الانتظار ليتم تحويلك لقائمة المستخدمين`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : deleteUserStatus === 0 ? (
        <Modal
          status={Error}
          msg={`حدث خطأ ما أثناء حذف ${userName}!`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : userUpdated === 1 ? (
        <Modal
          status={Success}
          msg={`تم${
            userAccountAction === 'block'
              ? `❗️ حظر 😔 ${userName} `
              : userAccountAction === 'active'
              ? `🎉 تفعيل 😄 ${userName}`
              : userAccountAction === 'admin'
              ? `🎉 تحويل ${userName} إلى مدير 😎`
              : userAccountAction === 'cashier'
              ? `🎉 تحويل ${userName} إلى كاشير 😎`
              : userAccountAction === 'user'
              ? `❗️ تحويل ${userName}  إلى مستخدم 😎`
              : null
          } بنجاح الرجاء الانتظار ليتم تحويلك لقائمة المستخدمين`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : userUpdated === 0 ? (
        <Modal
          status={Error}
          msg={`حدث خطأ ما أثناء تحديث ${userName}!`}
          redirectLink={goTo('users')}
          redirectTime={3000}
        />
      ) : null}

      {/* Confirm Box */}
      {modalLoading && (
        <Modal
          status={Loading}
          classes='txt-blue text-center'
          msg={`هل أنت متأكد من ${
            userAccountAction === 'block'
              ? `حظر ${userName}`
              : userAccountAction === 'active'
              ? `تفعيل ${userName}`
              : userAccountAction === 'admin'
              ? `تحويل ${userName} الى مدير`
              : userAccountAction === 'cashier'
              ? `تحويل ${userName} الى كاشير`
              : userAccountAction === 'user'
              ? `تحويل ${userName} الى مستخدم`
              : 'الحذف'
          } لا يمكن التراجع عن هذا القرار`}
          ctaConfirmBtns={[
            userAccountAction === 'block'
              ? 'حظر'
              : userAccountAction === 'active'
              ? 'تفعيل'
              : userAccountAction === 'admin'
              ? 'تحويل الى مدير'
              : userAccountAction === 'cashier'
              ? 'تحويل الى كاشير'
              : userAccountAction === 'user'
              ? 'تحويل الى مستخدم'
              : 'حذف',
            'الغاء'
          ]}
        />
      )}
      <Layout>
        <section className='py-12 my-8 dashboard'>
          <div className='container mx-auto'>
            <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
              {t('app.dashboard.users.title')}
            </h3>

            <table className='table w-full text-center'>
              <thead className='text-white bg-orange-800'>
                <tr>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.users.itemsTable.columns.name')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.users.itemsTable.columns.email')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.users.itemsTable.columns.type')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.users.itemsTable.columns.status')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.users.itemsTable.columns.actions')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {users?.response?.length > 0 ? (
                  <>
                    {users?.response?.map((item: any, idx: number) => (
                      <tr
                        key={item._id}
                        className='transition-colors even:bg-gray-200 odd:bg-gray-300 dark:even:bg-gray-600 dark:odd:bg-gray-700'
                      >
                        <td className='px-1 py-2'>{item.userFullName}</td>
                        <td className='px-1 py-2'>
                          <p>{item.userEmail}</p>
                        </td>
                        <td
                          className={`px-1 py-2 font-bold${
                            item.userAccountType === 'admin'
                              ? ' text-red-700 dark:text-red-400 font-bold'
                              : item.userAccountType === 'cashier'
                              ? ' text-orange-500 dark:text-orange-400 font-bold'
                              : ' text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          <span
                            data-tooltip={
                              item.userAccountType === 'admin'
                                ? 'المدير يملك صلاحية الدخول على لوحة التحكم، فعليه يستطيع إدارة الموقع من خلالها'
                                : item.userAccountType === 'cashier'
                                ? 'الكاشير يملك صلاحية الدخول للوحة التحكم والوصول لصفحة الطلبات مع إمكانية الموافقة أو رفض الطلب'
                                : 'المستخدم العادي يملك صلاحية الدخول على حسابه ورؤية الطلبات الخاصة به فقط'
                            }
                            className='w-40'
                          >
                            {item.userAccountType === 'admin'
                              ? t('app.dashboard.users.itemsTable.rows.admin')
                              : item.userAccountType === 'cashier'
                              ? t('app.dashboard.users.itemsTable.rows.cashier')
                              : t('app.dashboard.users.itemsTable.rows.user')}
                          </span>
                        </td>
                        <td
                          className={`px-1 py-2 font-bold${
                            item.userAccountStatus === 'block'
                              ? ' text-red-600 dark:text-red-400'
                              : ' text-green-600 dark:text-green-500'
                          }`}
                        >
                          <span
                            data-tooltip={
                              item.userAccountStatus === 'block'
                                ? t('app.dashboard.users.itemsTable.rows.blockedTooltip')
                                : t('app.dashboard.users.itemsTable.rows.activeTooltip')
                            }
                          >
                            {item.userAccountStatus === 'block'
                              ? `❌\u00A0\u00A0\u00A0${t(
                                  'app.dashboard.users.itemsTable.rows.blocked'
                                )}`
                              : `✅\u00A0\u00A0\u00A0${t(
                                  'app.dashboard.users.itemsTable.rows.active'
                                )}`}
                          </span>
                        </td>
                        <td className='px-1 py-2'>
                          {idx === 0 ? (
                            //first admin account doesn't have to get deleted or blocked from others hence no action provided
                            <span className='text-gray-600 select-none dark:text-gray-200'>
                              {t('app.dashboard.users.itemsTable.rows.noAction')}
                            </span>
                          ) : (
                            <NavMenu label={`${locale === 'ar' ? 'الإجراء' : 'Actions'}`}>
                              {/* UserStatus Buttons */}
                              {item.userAccountStatus === 'block' ? (
                                <button
                                  id='activateUser'
                                  data-id={item._id}
                                  data-name={item.userFullName}
                                  data-action='active'
                                  className='py-1 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[4rem]'
                                  data-tooltip={t(
                                    'app.dashboard.users.itemsTable.rows.activate'
                                  )}
                                >
                                  {t('app.dashboard.users.itemsTable.rows.activate')}
                                </button>
                              ) : (
                                <button
                                  id='blockUser'
                                  data-id={item._id}
                                  data-name={item.userFullName}
                                  data-action='block'
                                  className='py-1 px-2 text-white border-2 rounded-md bg-neutral-600 hover:bg-neutral-700 min-w-[6.5rem]'
                                  data-tooltip={t(
                                    'app.dashboard.users.itemsTable.rows.block'
                                  )}
                                >
                                  {t('app.dashboard.users.itemsTable.rows.block')}
                                </button>
                              )}

                              {/* UserType Buttons */}
                              {item.userAccountType === 'admin' ? (
                                <>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='user'
                                    className='py-1 px-2 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[6.5rem]'
                                    data-tooltip={t(
                                      'app.dashboard.users.itemsTable.rows.makeUser'
                                    )}
                                  >
                                    {t('app.dashboard.users.itemsTable.rows.makeUser')}
                                  </button>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='cashier'
                                    className='py-1 px-2 text-white bg-orange-600 border-2 rounded-md hover:bg-orange-700 min-w-[6.5rem]'
                                    data-tooltip={t(
                                      'app.dashboard.users.itemsTable.rows.makeCashier'
                                    )}
                                  >
                                    {t('app.dashboard.users.itemsTable.rows.makeCashier')}
                                  </button>
                                </>
                              ) : item.userAccountType === 'cashier' ? (
                                <>
                                  <button
                                    id='admin'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='admin'
                                    className='py-1 px-2 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[6.5rem]'
                                    data-tooltip={t(
                                      'app.dashboard.users.itemsTable.rows.makeAdmin'
                                    )}
                                  >
                                    {t('app.dashboard.users.itemsTable.rows.makeAdmin')}
                                  </button>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='user'
                                    className='py-1 px-2 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[6.5rem]'
                                    data-tooltip={t(
                                      'app.dashboard.users.itemsTable.rows.makeUser'
                                    )}
                                  >
                                    {t('app.dashboard.users.itemsTable.rows.makeUser')}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    id='admin'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='admin'
                                    className='py-1 px-2 text-white bg-green-600 border-2 rounded-md hover:bg-green-700 min-w-[6.5rem]'
                                    data-tooltip={t(
                                      'app.dashboard.users.itemsTable.rows.makeAdmin'
                                    )}
                                  >
                                    {t('app.dashboard.users.itemsTable.rows.makeAdmin')}
                                  </button>
                                  <button
                                    id='user'
                                    data-id={item._id}
                                    data-name={item.userFullName}
                                    data-action='cashier'
                                    className='py-1 px-2 text-white bg-orange-600 border-2 rounded-md hover:bg-orange-700 min-w-[6.5rem]'
                                    data-tooltip={t(
                                      'app.dashboard.users.itemsTable.rows.makeCashier'
                                    )}
                                  >
                                    {t('app.dashboard.users.itemsTable.rows.makeCashier')}
                                  </button>
                                </>
                              )}

                              {/* Delete Button */}
                              <button
                                id='deleteUser'
                                data-id={item._id}
                                data-name={item.userFullName}
                                data-action='delete'
                                className='py-1 px-2 text-white bg-red-600 rounded-md hover:bg-red-700 min-w-[6.5rem]'
                                data-tooltip={t(
                                  'app.dashboard.users.itemsTable.rows.deleteUser'
                                )}
                              >
                                {t('app.dashboard.users.itemsTable.rows.deleteUser')}
                              </button>
                            </NavMenu>
                          )}
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td colSpan={100}>
                        <Pagination
                          routeName={`dashboard/users`}
                          pageNum={pageNumber}
                          numberOfPages={users?.numberOfPages}
                          count={users?.itemsCount}
                          foodId={users?.response?._id}
                          itemsPerPage={ITEMS_PER_PAGE}
                        />
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td />
                    <td />
                    <td className='flex flex-col px-1 py-2'>
                      <p className='my-2 md:text-2xl text-red-600 dark:text-red-400 font-[600] py-2 px-1'>
                        عفواً، لم يتم العثور على مستخدمين
                      </p>
                      <Link
                        href='dashboard'
                        className='w-fit mx-auto bg-orange-700 hover:bg-orange-800 text-white py-1.5 text-lg px-6 rounded-md'
                      >
                        العودة للوحة التحكم
                      </Link>
                    </td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </Layout>
    </>
  )
}

export default DashboardUsers
