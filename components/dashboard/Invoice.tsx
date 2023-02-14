import Image from 'next/image'
import { createLocaleDateString } from '@functions/convertDate'
import Divider from '../Divider'

const Invoice = ({
  personName,
  userEmail,
  orderId,
  orderDate,
  personPhone,
  orderItemsIds,
  orderToppingsId,
  forwardedRef
}) => {
  const inSeletedToppings = orderToppingsId?.map(selected =>
    //if there is no toppings in order then selected will be empty array
    (selected || []).filter(element =>
      orderItemsIds.map(id => id?.includes(element?.slice(0, -2)))
    )
  )

  return (
    <table ref={forwardedRef} className='w-full text-center border-collapse table-auto'>
      <thead className='text-white bg-orange-800'>
        <tr className='rtl'>
          <th className='px-1 py-2 min-w-[10rem]'>الاسم</th>
          <th className='px-1 py-2 min-w-[7rem]'>البريد الالكتروني</th>
          <th className='px-1 py-2'>رقم الطلب</th>
          <th className='px-1 py-2'>تاريخ الطلب</th>
          <th className='px-1 py-2'>الهاتف</th>
          <th className='px-1 py-2 min-w-[20rem]'>التفاصيل</th>
          <th className='px-1 py-2'>الملاحظات</th>
          <th className='px-1 py-2'>السعر الاجمالي</th>
        </tr>
      </thead>

      <tbody>
        <tr className='transition-colors even:bg-neutral-300 odd:bg-neutral-200 dark:even:bg-neutral-700 dark:odd:bg-neutral-600 rtl'>
          <td className='px-1 py-2 min-w-[10rem]'>{personName}</td>
          <td className='px-1 py-2 min-w-[6rem]'>{userEmail}</td>
          <td className='px-1 py-2'>{orderId}</td>
          <td className='text-center min-w-[13rem] px-1 py-2'>
            <p>{createLocaleDateString(orderDate)}</p>
          </td>
          <td className='px-1 py-2'>{personPhone}</td>
          {/* <td className='px-1 py-2 min-w-[30rem]'>
            <span
              data-tooltip={`عرض ${order.orderItems.length} ${
                order.orderItems.length > 1 ? 'طلبات' : 'طلب'
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
                  لا يوجد تفاصيل خاصة بهذا الطلب
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
                            width='50'
                            height='50'
                            className='object-cover rounded-lg shadow-md w-14 h-14'
                          />
                          <div className='flex flex-col items-start'>
                            <span>اسم الطلب: {item.cHeading}</span>
                            <span>الكمية: {item.cQuantity}</span>
                          </div>
                        </div>

                        <span className='inline-block px-2 py-2 text-green-800 bg-green-300 rounded-xl bg-opacity-80'>
                          السعر على حسب الكميات: &nbsp;
                          <strong>{item.cPrice * item.cQuantity}</strong> ر.ق
                        </span>
                      </div>
                      <div className='flex flex-col gap-6'>
                        {inSeletedToppings
                          .map(id => id.slice(0, -2))
                          ?.includes(item.cItemId) && <h3>الاضافات</h3>}
                        {item?.cToppings?.map(
                          ({ toppingId, toppingName, toppingPrice, toppingQuantity }) =>
                            inSeletedToppings[idx]?.includes(toppingId) && (
                              <div key={toppingId} className='flex gap-4'>
                                <span className='px-2 text-orange-900 bg-orange-200 rounded-lg'>
                                  ✅ &nbsp; {toppingName}
                                </span>
                                <span className='px-2 text-orange-900 bg-orange-200 rounded-lg'>
                                  سعر الوحدة {toppingPrice}
                                </span>
                                <span className='px-2 text-orange-900 bg-orange-200 rounded-lg'>
                                  الكمية المطلوبة {toppingQuantity}
                                </span>
                                <span className='px-2 text-green-900 bg-green-200 rounded-lg'>
                                  السعر حسب الكمية: {toppingPrice * toppingQuantity} ر.ق
                                </span>
                                <hr />
                              </div>
                            )
                        )}
                      </div>
                    </div>
                    <Divider marginY={2} thickness={0.5} />
                  </div>
                ))
              )}
            </div>
          </td>
          <td className='px-1 py-2'>
            {!order.personNotes ? (
              <span className='font-bold text-red-600 dark:text-red-400'>
                لا يوجد ملاحظات في الطلب
              </span>
            ) : (
              order.personNotes
            )}
          </td>
          <td>
            <span className='inline-block px-2 py-2 text-green-800 bg-green-300 rounded-xl bg-opacity-80'>
              <strong>{order.grandPrice}</strong> ر.ق
            </span>
          </td> */}
        </tr>
      </tbody>
    </table>
  )
}

export default Invoice
