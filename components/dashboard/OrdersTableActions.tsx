import Link from 'next/link'
import { useLocale } from 'hooks/useLocale'

export const AcceptBtn = ({ id, email }: any) => {
  const { locale } = useLocale()

  return (
    <button
      id='acceptOrder'
      data-id={id}
      data-status='accept'
      data-email={email}
      className={`m-1 p-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 min-w-[7rem] overflow-hidden ${
        locale === 'ar' ? 'text-right' : 'text-left'
      }`}
      data-tooltip={`${locale === 'ar' ? 'موافقة الطلب' : 'Accept Order'}`}
    >
      <span className='py-0.5 px-1 md:pl-1 bg-green-300 rounded-md'>&#9989;</span>
      <span
        className={`inline-block pointer-events-none ${
          locale === 'ar' ? 'pr-3' : 'pl-3'
        }`}
      >{`${locale === 'ar' ? 'موافقة' : 'Accept'}`}</span>
    </button>
  )
}

export const EditBtn = ({ id }: any) => {
  const { locale } = useLocale()

  return (
    <Link
      href={`/dashboard/orders/edit/${id}`}
      id='editOrder'
      className={`m-1 p-2 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700 min-w-[7rem] overflow-hidden ${
        locale === 'ar' ? 'text-right' : 'text-left'
      }`}
      data-tooltip={`${locale === 'ar' ? 'تعديل الطلب' : 'Edit Order'}`}
    >
      <span className='py-0.5 px-1 md:pl-1 bg-gray-300 rounded-md'>&#9997;</span>
      <span
        className={`inline-block pointer-events-none ${
          locale === 'ar' ? 'pr-3' : 'pl-3'
        }`}
      >{`${locale === 'ar' ? 'تعديل' : 'Edit'}`}</span>
    </Link>
  )
}

export const RejectBtn = ({ id, email }: any) => {
  const { locale } = useLocale()

  return (
    <button
      id='rejectOrder'
      data-id={id}
      data-status='reject'
      data-email={email}
      className={`m-1 p-2 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700 min-w-[7rem] overflow-hidden ${
        locale === 'ar' ? 'text-right' : 'text-left'
      }`}
      data-tooltip={`${locale === 'ar' ? 'رفض الطلب' : 'Reject Order'}`}
    >
      <span className='py-0.5 px-1 md:pl-1 bg-gray-300 rounded-md'>&#10060;</span>
      <span
        className={`inline-block pointer-events-none ${
          locale === 'ar' ? 'pr-3' : 'pl-3'
        }`}
      >{`${locale === 'ar' ? 'رفض' : 'Reject'}`}</span>
    </button>
  )
}

export const DeleteBtn = ({ id, email }: any) => {
  const { locale } = useLocale()

  return (
    <button
      id='deleteOrder'
      data-id={id}
      data-status='delete'
      data-email={email}
      className={`m-1 p-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 min-w-[7rem] overflow-hidden ${
        locale === 'ar' ? 'text-right' : 'text-left'
      }`}
      data-tooltip={`${locale === 'ar' ? 'حذف الطلب' : 'Delete Order'}`}
    >
      <span className='py-0.5 px-1 md:pl-1 bg-red-200 rounded-md'>&#128465;</span>
      <span
        className={`inline-block pointer-events-none ${
          locale === 'ar' ? 'pr-3' : 'pl-3'
        }`}
      >{`${locale === 'ar' ? 'حذف' : 'Delete'}`}</span>
    </button>
  )
}

export const InvoiceBtn = ({ id, email, onClick }: any) => {
  const { locale } = useLocale()

  return (
    <button
      id='invoice'
      data-id={id}
      data-status='invoice'
      data-email={email}
      className={`m-1 p-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 min-w-[5rem] overflow-hidden ${
        locale === 'ar' ? 'text-right' : 'text-left'
      }`}
      data-tooltip={`${locale === 'ar' ? 'إنشاء فاتورة للطلب' : 'Create Order Receipt'}`}
      onClick={onClick}
    >
      <span className='py-0.5 px-1 bg-blue-200 rounded-md pointer-events-none'>
        &#128424;
      </span>
      <span
        className={`inline-block pointer-events-none ${
          locale === 'ar' ? 'pr-3' : 'pl-3'
        }`}
      >
        {`${locale === 'ar' ? 'إنشاء فاتورة' : 'Create Receipt'}`}
      </span>
    </button>
  )
}
