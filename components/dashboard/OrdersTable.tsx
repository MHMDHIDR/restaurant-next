import { useState, useEffect, useRef, useCallback } from 'react'
import { useReactToPrint } from 'react-to-print'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import useAxios from 'hooks/useAxios'
import useAuth from 'hooks/useAuth'
import useEventListener from 'hooks/useEventListener'
import Modal from '../Modal/Modal'
import { Success, Error, Loading } from '../Icons/Status'
import { PayPal } from '../Icons/Payments'
import { LoadingPage, LoadingSpinner } from '../Loading'
import Pagination from '../Pagination'
import Divider from '../Divider'
import NavMenu from '../NavMenu'
import {
  AcceptBtn,
  DeleteBtn,
  EditBtn,
  InvoiceBtn,
  RejectBtn
} from './OrdersTableActions'
import { cardProps, orderInfoProps, orderProps, selectedToppingsProps } from '@types'
import { origin, ITEMS_PER_PAGE, USER } from '@constants'
import goTo from 'functions/goTo'
import { toggleCSSclasses } from 'functions/toggleCSSclasses'
import { createLocaleDateString } from 'functions/convertDate'
import scrollToView from 'functions/scrollToView'
import { isNumber } from 'functions/isNumber'
import Invoice from './Invoice'
import { useTranslate } from 'hooks/useTranslate'
import { useLocale } from 'hooks/useLocale'

const OrdersTable = ({ ordersByUserEmail = false }) => {
  useEffect(() => {
    scrollToView()
  }, [])

  const [orderUpdated, setOrderUpdated] = useState()
  const [deleteOrderStatus, setDeleteOrderStatus] = useState()
  const [orderInfo, setOrderInfo] = useState<orderInfoProps>({
    id: 'string',
    status: 'string',
    email: 'string'
  })
  const [ordersData, setOrdersData] = useState<any>()
  const [orderItemsIds, setOrderItemsIds] = useState([])
  const [orderToppingsId, setOrderToppingsId] = useState<string[]>([''])
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  const { userType } = useAuth()
  const { t } = useTranslate()

  const modalLoading =
    typeof window !== 'undefined' ? document.querySelector('#modal') : null

  const { pathname, query } = useRouter()
  const { pageNum }: any = query
  const redirectPath = pathname.includes('dashboard/orders') ? 'orders' : 'my-orders'
  const pageNumber = !pageNum || !isNumber(pageNum) || pageNum < 1 ? 1 : parseInt(pageNum)

  const { locale } = useLocale()

  const { loading: LoadingOrders, ...response } = useAxios({
    url: `/orders?page=${pageNumber}&limit=${ITEMS_PER_PAGE}?orderDate=-1`
  })

  useEffect(() => {
    if (response.response !== null) {
      setOrdersData(response.response)
      setOrderItemsIds(
        response.response.response.map(({ orderItems }: orderProps['ordersData']) =>
          orderItems?.map(({ cItemId }) => cItemId)
        )
      )
      setOrderToppingsId(
        response.response.response.map(
          ({ orderToppings }: orderProps['ordersData']) =>
            orderToppings?.length > 0 && orderToppings.map(({ toppingId }) => toppingId)
        )
      )
    }
  }, [response.response])

  const inSeletedToppings = orderToppingsId?.map((selected: any) =>
    //if there is no toppings in order then selected will be empty array
    (selected || ['']).filter((element: string) =>
      orderItemsIds.map((id: orderProps['ordersData']['orderId']) =>
        id?.includes(element?.slice(0, -2))
      )
    )
  )

  useEventListener('click', (e: any) => {
    const {
      id,
      dataset: { orderContentArrow }
    } = e.target

    switch (id) {
      case 'acceptOrder':
      case 'rejectOrder':
      case 'invoice':
      case 'deleteOrder': {
        setOrderInfo({
          id: e?.target?.dataset?.id,
          status: e?.target?.dataset?.status,
          email: e?.target?.dataset?.email
        })
        //show modal
        modalLoading!.classList.remove('hidden')
        break
      }

      case 'confirm': {
        orderInfo.status === 'invoice' ? handlePrint() : handleOrder(orderInfo)
        break
      }

      case 'cancel': {
        modalLoading!.classList.add('hidden')
        break
      }
    }

    //showing and hiding order details
    if (orderContentArrow) {
      toggleCSSclasses(
        [e.target.parentElement.nextElementSibling.classList.contains('ordered-items')],
        e.target.parentElement.nextElementSibling,
        ['max-h-0'],
        ['ordered-items', `max-h-screen`]
      )
      toggleCSSclasses(
        [e.target.classList.contains('rotate-180')],
        e.target,
        ['rotate-180', 'hover:translate-y-1'],
        ['rotate-180', 'hover:-translate-y-1']
      )
    }
  })

  const handleOrder = async (orderInfo: orderInfoProps) => {
    //delete order
    if (orderInfo.status === 'delete') {
      try {
        //You need to name the body {data} so it can be recognized in (.delete) method
        const response = await axios.delete(`${origin}/api/orders/${orderInfo.id}`)
        const { orderDeleted } = response.data
        setDeleteOrderStatus(orderDeleted)

        setTimeout(() => {
          modalLoading!.classList.add('hidden')
        }, 300)
      } catch (err) {
        console.error(err)
      }
      return
    }

    //else accept or reject order
    // using FormData to send constructed data
    const formData = new FormData()
    formData.append('orderStatus', orderInfo.status)
    formData.append('orderEmail', orderInfo.email)

    try {
      setIsLoading(true)
      const response = await axios.patch(`${origin}/api/orders/${orderInfo.id}`, formData)
      const { OrderStatusUpdated } = response.data
      setOrderUpdated(OrderStatusUpdated)

      setTimeout(() => {
        modalLoading!.classList.add('hidden')
      }, 300)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const componentRef = useRef(null)
  const onBeforeGetContentResolve = useRef<any>(null)
  const handleOnBeforeGetContent = useCallback(() => {
    setIsLoading(true)

    return new Promise<void>(resolve => {
      onBeforeGetContentResolve.current = resolve
      setTimeout(() => {
        setIsLoading(false)
        resolve()
      }, 2000)
    })
  }, [setIsLoading])
  const reactToPrintContent = useCallback(
    () => componentRef.current,
    [componentRef.current]
  )
  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: 'Invoice',
    onBeforeGetContent: handleOnBeforeGetContent
  })
  useEffect(() => {
    if (typeof onBeforeGetContentResolve.current === 'function') {
      onBeforeGetContentResolve.current()
    }
  }, [setIsLoading, onBeforeGetContentResolve.current])

  return LoadingOrders ? (
    <LoadingPage />
  ) : (
    <>
      {orderUpdated === 1 || deleteOrderStatus === 1 ? (
        <Modal
          status={Success}
          classes='text-2xl'
          msg={
            orderInfo.status === 'accept'
              ? `😄    تمت الموافقة على الطلب    🎉`
              : orderInfo.status === 'delete'
              ? '🗑    تم حذف الطلب بنجاح    ❌'
              : `❗️    تم رفض الطلب بنجاح    😔`
          }
          redirectLink={goTo(redirectPath)}
          redirectTime={4000}
        />
      ) : orderUpdated === 0 ? (
        <Modal
          status={Error}
          msg={`عفواً! خطأ ما!`}
          redirectLink={goTo(redirectPath)}
          redirectTime={4000}
        />
      ) : null}

      {/* Confirm Box */}
      {isLoading ? (
        <Modal
          status={Loading}
          classes='txt-blue text-center'
          msg={`جار ${
            orderInfo.status === 'invoice' ? 'طباعة الطلب' : 'تحديث حالة الطلب...'
          }`}
        />
      ) : (
        <Modal
          status={Loading}
          modalHidden='hidden'
          classes='txt-blue text-center'
          msg={`هل أنت متأكد من ${
            orderInfo.status === 'accept'
              ? 'الموافقة'
              : orderInfo.status === 'delete'
              ? 'حذف'
              : orderInfo.status === 'invoice'
              ? 'طباعة'
              : 'رفض'
          } هذا الطلب؟
          ${orderInfo.status !== 'invoice' ? ' لا يمكن التراجع عن هذا القرار' : ''}
          `}
          ctaConfirmBtns={[
            orderInfo.status === 'accept'
              ? 'موافق'
              : orderInfo.status === 'delete'
              ? 'حذف'
              : orderInfo.status === 'invoice'
              ? 'طباعة'
              : 'رفض',
            'الغاء'
          ]}
        />
      )}

      {isLoading && (
        <Invoice
          ordersData={
            ordersData?.response?.filter((order: any) => order._id === orderInfo.id)[0]
          }
          orderItemsIds={orderItemsIds}
          orderToppingsId={orderToppingsId}
          forwardedRef={componentRef}
        />
      )}

      <table className='table w-full text-center border-collapse table-auto'>
        <thead className='text-white bg-orange-800'>
          <tr>
            <th className='min-w-[0.5rem] px-1 py-2'>
              {t('app.dashboard.orders.itemsTable.columns.no')}
            </th>
            <th className='px-1 py-2 min-w-[10rem]'>
              {t('app.dashboard.orders.itemsTable.columns.name')}
            </th>
            <th className='px-1 py-2 min-w-[7rem]'>
              {t('app.dashboard.orders.itemsTable.columns.email')}
            </th>
            <th className='px-1 py-2'>
              {t('app.dashboard.orders.itemsTable.columns.datetime')}
            </th>
            <th className='px-1 py-2'>
              {t('app.dashboard.orders.itemsTable.columns.phone')}
            </th>
            <th className='px-1 py-2 min-w-[20rem]'>
              {t('app.dashboard.orders.itemsTable.columns.details')}
            </th>
            <th className='px-1 py-2 min-w-[10rem]'>
              {t('app.dashboard.orders.itemsTable.columns.notes')}
            </th>
            <th className='px-1 py-2 min-w-[5rem]'>
              {t('app.dashboard.orders.itemsTable.columns.totalPrice')}
            </th>
            <th className='px-1 py-2'>
              {t('app.dashboard.orders.itemsTable.columns.orderNumber')}
            </th>
            <th className='px-1 py-2 min-w-[6rem]'>
              {t('app.dashboard.orders.itemsTable.columns.paymentUsed')}
            </th>
            <th className='px-1 py-2'>
              {t('app.dashboard.orders.itemsTable.columns.status')}
            </th>
            {(USER.userAccountType === 'admin' ||
              USER.userAccountType === 'cashier' ||
              userType === 'admin' ||
              userType === 'cashier') && (
              <th className='px-1 py-2'>
                {t('app.dashboard.orders.itemsTable.columns.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {ordersData !== undefined && ordersData?.response?.length > 0 ? (
            <>
              {/* filter by email ordersByUserEmail === parseJson(localStorage.getItem('user')).userEmail */}
              {ordersByUserEmail ? (
                //show only orders by user email ==> FILTER by email
                ordersData?.response?.filter(
                  (order: any) =>
                    order.userEmail === (USER.userEmail ?? session!?.user!?.email)
                ).length > 0 ? ( //means there is at least one order by the current user email
                  ordersData?.response
                    ?.filter(
                      (order: any) =>
                        order.userEmail === (USER.userEmail ?? session!?.user!?.email)
                    )
                    .map((order: any, idx: number) => (
                      <tr
                        key={order._id}
                        className='transition-colors even:bg-neutral-300 odd:bg-neutral-200 dark:even:bg-neutral-700 dark:odd:bg-neutral-600'
                      >
                        <td className='min-w-[0.5rem] px-1 py-2'>{idx + 1}</td>
                        <td className='px-1 py-2 min-w-[10rem]'>{order.personName}</td>
                        <td className='px-1 py-2 min-w-[6rem]'>
                          {order.userEmail ? order.userEmail : session!?.user!?.email}
                        </td>
                        <td className='text-center min-w-[13rem] px-1 py-2'>
                          <p>{createLocaleDateString(order.orderDate)}</p>
                        </td>
                        <td className='px-1 py-2'>{order.personPhone}</td>
                        <td className='px-1 py-2 min-w-[30rem]'>
                          <span
                            data-tooltip={`${t(
                              'app.dashboard.orders.itemsTable.rows.show'
                            )} ${order.orderItems.length} ${
                              order.orderItems.length > 1
                                ? t('app.dashboard.orders.itemsTable.rows.orders')
                                : t('app.dashboard.orders.itemsTable.rows.order')
                            }`}
                          >
                            <span
                              data-order-content-arrow
                              className={`inline-block text-xl font-bold transition-transform duration-300 cursor-pointer hover:translate-y-1`}
                            >
                              &#8679;
                            </span>
                          </span>

                          <div className='max-h-screen overflow-hidden transition-all duration-300 ordered-items'>
                            {order?.orderItems.length === 0 ? (
                              <p className='max-w-lg mx-auto my-2 text-lg font-bold leading-10 tracking-wider text-red-500'>
                                {t('app.dashboard.orders.itemsTable.rows.noDetails')}
                              </p>
                            ) : (
                              order?.orderItems?.map((item: cardProps, idx: number) => (
                                <div key={item.cItemId + ''}>
                                  <div className='flex flex-col gap-4'>
                                    <div className='flex flex-col items-start gap-2'>
                                      <div className='flex items-center w-full gap-4'>
                                        <Image
                                          loading='lazy'
                                          src={item.cImg[0].foodImgDisplayPath}
                                          alt={item.cHeading}
                                          width={56}
                                          height={56}
                                          className='object-cover rounded-lg shadow-md w-14 h-14'
                                        />
                                        <div className='flex flex-col items-start'>
                                          <span>
                                            {t(
                                              'app.dashboard.orders.itemsTable.rows.itemName'
                                            )}
                                            : {item.cHeading}
                                          </span>
                                          <span>
                                            {t(
                                              'app.dashboard.orders.itemsTable.rows.qty'
                                            )}
                                            : {item.cQuantity}
                                          </span>
                                        </div>
                                      </div>

                                      <span className='inline-block px-2 py-2 text-green-800 bg-green-300 rounded-xl bg-opacity-80'>
                                        {t(
                                          'app.dashboard.orders.itemsTable.rows.pricePerQty'
                                        )}
                                        : &nbsp;
                                        <strong>
                                          {item.cPrice * item.cQuantity!}
                                          &nbsp;&nbsp;
                                        </strong>
                                        {t('app.currency')}
                                      </span>
                                    </div>
                                    <div className='flex flex-col gap-6'>
                                      {inSeletedToppings
                                        .map(id => id.slice(0, -2))
                                        ?.includes(item.cItemId) && <h3>الاضافات</h3>}
                                      {item?.cToppings?.map(
                                        ({
                                          toppingId,
                                          toppingName,
                                          toppingPrice,
                                          toppingQuantity
                                        }: selectedToppingsProps) =>
                                          inSeletedToppings[idx]?.includes(toppingId) && (
                                            <div
                                              key={toppingId}
                                              className='flex flex-wrap gap-4'
                                            >
                                              <span className='px-2 text-orange-900 bg-orange-200 rounded-lg'>
                                                ✅ &nbsp; {toppingName}
                                              </span>
                                              <span className='p-1 my-auto text-orange-900 bg-orange-200 rounded-lg min-w-fit'>
                                                {t(
                                                  'app.dashboard.orders.itemsTable.rows.toppingPrice'
                                                )}{' '}
                                                {toppingPrice} {t('app.currency')}
                                              </span>
                                              <span className='px-2 text-orange-900 bg-orange-200 rounded-lg'>
                                                {t(
                                                  'app.dashboard.orders.itemsTable.rows.toppingQty'
                                                )}{' '}
                                                {toppingQuantity}
                                              </span>
                                              <span className='px-2 text-green-900 bg-green-200 rounded-lg'>
                                                {t(
                                                  'app.dashboard.orders.itemsTable.rows.pricePerQty'
                                                )}
                                                : {toppingPrice * (toppingQuantity ?? 1)}{' '}
                                                {t('app.currency')}
                                              </span>
                                            </div>
                                          )
                                      )}
                                    </div>
                                  </div>
                                  {order.length > 1 && (
                                    <Divider marginY={2} thickness={0.5} />
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                        <td className='px-1 py-2'>
                          {!order.personNotes ? (
                            <span className='font-bold text-red-600 dark:text-red-400'>
                              {t('app.dashboard.orders.itemsTable.rows.noNotes')}
                            </span>
                          ) : (
                            order.personNotes
                          )}
                        </td>
                        <td>
                          <span className='inline-block px-2 py-2 text-green-800 bg-green-300 rounded-xl bg-opacity-80'>
                            <strong>{order.grandPrice}</strong> {t('app.currency')}
                          </span>
                        </td>
                        <td className='px-1 py-2'>{order.orderId}</td>
                        <td className='px-1 py-2 min-w-[6rem]'>
                          <span
                            data-tooltip={`${t(
                              'app.dashboard.orders.itemsTable.columns.paymentUsed'
                            )} ${
                              order.paymentData.paymentSource === 'paypal' &&
                              t('app.dashboard.orders.itemsTable.rows.paypal')
                            }`}
                          >
                            {order.paymentData.paymentSource === 'paypal' && <PayPal />}
                          </span>
                        </td>
                        <td
                          className={`px-1 py-2 font-bold${
                            order.orderStatus === 'reject'
                              ? ' text-red-600 dark:text-red-400'
                              : order.orderStatus === 'accept'
                              ? ' text-green-600 dark:text-green-500'
                              : ''
                          }`}
                        >
                          {order.orderStatus === 'pending'
                            ? 'تحت المراجعة'
                            : order.orderStatus === 'accept'
                            ? 'تمت الموافقة'
                            : 'تم الرفض'}
                        </td>
                        {(USER.userAccountType === 'admin' ||
                          USER.userAccountType === 'cashier' ||
                          userType === 'admin' ||
                          userType === 'cashier') && (
                          <td>
                            <NavMenu label={`${locale === 'ar' ? 'الإجراء' : 'Action'}`}>
                              {order.orderStatus === 'pending' ? (
                                <>
                                  <AcceptBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                  <RejectBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                  <EditBtn id={order._id} />
                                  <InvoiceBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                  <DeleteBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                </>
                              ) : order.orderStatus === 'accept' ? (
                                <>
                                  <RejectBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                  <EditBtn id={order._id} />
                                  <InvoiceBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                  <DeleteBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                </>
                              ) : order.orderStatus === 'reject' ? (
                                <>
                                  <AcceptBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                  <EditBtn id={order._id} />
                                  <InvoiceBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                  <DeleteBtn
                                    id={order._id}
                                    email={
                                      !order.userEmail
                                        ? order.userEmail
                                        : session!?.user!?.email
                                    }
                                  />
                                </>
                              ) : (
                                <span>لا يوجد إجراء</span>
                              )}
                            </NavMenu>
                          </td>
                        )}
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td className='flex flex-col px-1 py-2'>
                      <p
                        className='my-2 md:text-2xl text-red-600 font-[600] py-2 px-1'
                        data-form-msg
                      >
                        لم يتم العثور على طلبات بعد، يمكنك إنشاء طلب جديد
                      </p>
                      <Link
                        href={`/view`}
                        className='min-w-[7rem] bg-blue-500 hover:bg-blue-600 text-white py-1.5 text-lg px-6 rounded-md'
                      >
                        قائمة الوجبات
                      </Link>
                    </td>
                    <td />
                  </tr>
                )
              ) : (
                //Show all orders
                ordersData?.response?.map((order: any, idx: number) => (
                  <tr
                    key={order._id}
                    className='transition-colors even:bg-neutral-300 odd:bg-neutral-200 dark:even:bg-neutral-700 dark:odd:bg-neutral-600'
                  >
                    <td className='px-1 py-2 max-w-[0.25rem]'>{idx + 1}</td>
                    <td className='px-1 py-2 min-w-[10rem]'>{order.personName}</td>
                    <td className='px-1 py-2 min-w-[6rem]'>
                      {order.userEmail ? order.userEmail : session!?.user!?.email}
                    </td>
                    <td className='text-center min-w-[13rem] px-1 py-2'>
                      <p>{createLocaleDateString(order.orderDate)}</p>
                    </td>
                    <td className='px-1 py-2'>{order.personPhone}</td>
                    <td className='px-1 py-2 min-w-[30rem]'>
                      <span
                        data-tooltip={`${t(
                          'app.dashboard.orders.itemsTable.rows.show'
                        )} ${order.orderItems.length} ${
                          order.orderItems.length > 1
                            ? t('app.dashboard.orders.itemsTable.rows.orders')
                            : t('app.dashboard.orders.itemsTable.rows.order')
                        }`}
                      >
                        <span
                          data-order-content-arrow
                          className={`inline-block text-xl font-bold transition-transform duration-300 cursor-pointer hover:translate-y-1`}
                        >
                          &#8679;
                        </span>
                      </span>

                      <div className='max-h-screen overflow-hidden transition-all duration-300 ordered-items'>
                        {order?.orderItems.length === 0 ? (
                          <p className='max-w-lg mx-auto my-2 text-lg font-bold leading-10 tracking-wider text-red-500'>
                            {t('app.dashboard.orders.itemsTable.rows.noDetails')}
                          </p>
                        ) : (
                          order?.orderItems?.map((item: any) => (
                            <div key={item.cItemId}>
                              <div className='flex flex-col gap-4'>
                                <div className='flex flex-col items-start gap-2'>
                                  <div className='flex items-center w-full gap-4'>
                                    <Image
                                      loading='lazy'
                                      src={item.cImg[0].foodImgDisplayPath}
                                      alt={item.cHeading}
                                      width={56}
                                      height={56}
                                      className='object-cover rounded-lg shadow-md w-14 h-14'
                                    />
                                    <div className='flex flex-col items-start'>
                                      <span>
                                        {t(
                                          'app.dashboard.orders.itemsTable.rows.itemName'
                                        )}
                                        : {item.cHeading}
                                      </span>
                                      <span>
                                        {t('app.dashboard.orders.itemsTable.rows.qty')}:{' '}
                                        {item.cQuantity}
                                      </span>
                                    </div>
                                  </div>

                                  <span className='inline-block px-2 py-2 text-green-800 bg-green-300 rounded-xl bg-opacity-80'>
                                    {t(
                                      'app.dashboard.orders.itemsTable.rows.pricePerQty'
                                    )}
                                    : &nbsp;
                                    <strong>{item.cPrice * item.cQuantity}</strong>{' '}
                                    {t('app.currency')}
                                  </span>
                                </div>
                                <div className='flex flex-col gap-6'>
                                  {inSeletedToppings
                                    .map(id => id.slice(0, -2))
                                    ?.includes(item.cItemId) && <h3>الاضافات</h3>}
                                  {item?.cToppings?.map(
                                    ({
                                      toppingId,
                                      toppingName,
                                      toppingPrice,
                                      toppingQuantity
                                    }: selectedToppingsProps) =>
                                      inSeletedToppings[idx]?.includes(toppingId) && (
                                        <div
                                          key={toppingId}
                                          className='flex flex-wrap gap-4'
                                        >
                                          <span className='p-1 my-auto text-orange-900 bg-orange-200 rounded-lg min-w-fit'>
                                            ✅ &nbsp; {toppingName}
                                          </span>
                                          <span className='p-1 my-auto text-orange-900 bg-orange-200 rounded-lg min-w-fit'>
                                            {t(
                                              'app.dashboard.orders.itemsTable.rows.toppingPrice'
                                            )}{' '}
                                            {toppingPrice} {t('app.currency')}
                                          </span>
                                          <span className='p-1 my-auto text-orange-900 bg-orange-200 rounded-lg min-w-fit'>
                                            {t(
                                              'app.dashboard.orders.itemsTable.rows.toppingQty'
                                            )}{' '}
                                            {toppingQuantity}
                                          </span>
                                          <span className='p-1 my-auto text-green-900 bg-green-200 rounded-lg min-w-fit'>
                                            {t(
                                              'app.dashboard.orders.itemsTable.rows.pricePerQty'
                                            )}
                                            :{toppingPrice * toppingQuantity!}{' '}
                                            {t('app.currency')}
                                          </span>
                                        </div>
                                      )
                                  )}
                                </div>
                              </div>
                              {order.length > 1 && (
                                <Divider marginY={2} thickness={0.5} />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td className='px-1 py-2'>
                      {!order.personNotes ? (
                        <span className='font-bold text-red-600 dark:text-red-400'>
                          {t('app.dashboard.orders.itemsTable.rows.noNotes')}
                        </span>
                      ) : (
                        order.personNotes
                      )}
                    </td>
                    <td>
                      <span className='inline-block px-2 py-2 text-green-800 bg-green-300 rounded-xl bg-opacity-80'>
                        <strong>{order.grandPrice}</strong> {t('app.currency')}
                      </span>
                    </td>
                    <td className='px-1 py-2'>{order.orderId}</td>
                    <td className='px-1 py-2 min-w-[6rem]'>
                      <span
                        data-tooltip={`${t(
                          'app.dashboard.orders.itemsTable.columns.paymentUsed'
                        )} ${
                          order.paymentData.paymentSource === 'paypal' &&
                          t('app.dashboard.orders.itemsTable.rows.paypal')
                        }`}
                      >
                        {order.paymentData.paymentSource === 'paypal' && <PayPal />}
                      </span>
                    </td>
                    <td
                      className={`px-1 py-2 font-bold${
                        order.orderStatus === 'reject'
                          ? ' text-red-600 dark:text-red-400'
                          : order.orderStatus === 'accept'
                          ? ' text-green-600 dark:text-green-500'
                          : ''
                      }`}
                    >
                      {order.orderStatus === 'pending'
                        ? 'تحت المراجعة'
                        : order.orderStatus === 'accept'
                        ? 'تمت الموافقة'
                        : 'تم الرفض'}
                    </td>
                    <td>
                      <NavMenu label={`${locale === 'ar' ? 'الإجراء' : 'Action'}`}>
                        {order.orderStatus === 'pending' ? (
                          <>
                            <AcceptBtn
                              id={order._id}
                              email={
                                order.userEmail === undefined
                                  ? session!?.user!?.email
                                  : order.userEmail
                              }
                            />
                            <RejectBtn
                              id={order._id}
                              email={
                                order.userEmail === undefined
                                  ? session!?.user!?.email
                                  : order.userEmail
                              }
                            />
                            <EditBtn id={order._id} />
                            <DeleteBtn
                              id={order._id}
                              email={
                                order.userEmail === undefined
                                  ? session!?.user!?.email
                                  : order.userEmail
                              }
                            />
                          </>
                        ) : order.orderStatus === 'accept' ? (
                          <>
                            <RejectBtn
                              id={order._id}
                              email={
                                order.userEmail === undefined
                                  ? session!?.user!?.email
                                  : order.userEmail
                              }
                            />
                            <EditBtn id={order._id} />
                            <InvoiceBtn
                              id={order._id}
                              email={
                                order.userEmail === undefined
                                  ? session!?.user!?.email
                                  : order.userEmail
                              }
                            />
                            <DeleteBtn
                              id={order._id}
                              email={
                                order.userEmail === undefined
                                  ? session!?.user!?.email
                                  : order.userEmail
                              }
                            />
                          </>
                        ) : order.orderStatus === 'reject' ? (
                          <>
                            <AcceptBtn
                              id={order._id}
                              email={
                                order.userEmail === undefined
                                  ? session!?.user!?.email
                                  : order.userEmail
                              }
                            />
                            <EditBtn id={order._id} />
                            <InvoiceBtn
                              id={order._id}
                              email={
                                order.userEmail === undefined
                                  ? session!?.user!?.email
                                  : order.userEmail
                              }
                            />
                            <DeleteBtn
                              id={order._id}
                              email={
                                order.userEmail === undefined
                                  ? session!?.user!?.email
                                  : order.userEmail
                              }
                            />
                          </>
                        ) : (
                          <span>لا يوجد إجراء</span>
                        )}
                      </NavMenu>
                    </td>
                  </tr>
                ))
              )}

              <tr>
                <td colSpan={100}>
                  <Pagination
                    routeName={ordersByUserEmail ? `my-orders` : `dashboard/orders`}
                    pageNum={pageNumber}
                    numberOfPages={ordersData?.numberOfPages}
                    count={ordersData?.itemsCount}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                </td>
              </tr>
            </>
          ) : !ordersData ? (
            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td className='p-10'>
                <LoadingSpinner />
              </td>
              <td />
            </tr>
          ) : (
            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td className='flex flex-col px-1 py-2'>
                <p
                  className='my-2 md:text-2xl text-red-600 font-[600] py-2 px-1'
                  data-form-msg
                >
                  {ordersByUserEmail // if this is the user interface, then show the first msg
                    ? 'لم يتم العثور على طلبات بعد، يمكنك إنشاء طلب جديد'
                    : 'لم يتم العثور على طلبات بعد، يمكنك العودة للوحة التحكم بالضغط على'}
                </p>
                <Link
                  href={ordersByUserEmail ? `/view` : `/dashboard`}
                  className='min-w-[7rem] bg-blue-500 hover:bg-blue-600 text-white py-1.5 text-lg px-6 rounded-md'
                >
                  {ordersByUserEmail ? 'تصفح المنتجات' : 'لوحة التحكم'}
                </Link>
              </td>
              <td />
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}

export default OrdersTable
