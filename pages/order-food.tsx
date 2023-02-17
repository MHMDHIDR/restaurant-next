import { useContext, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { CartContext } from 'contexts/CartContext'
import { ToppingsContext } from 'contexts/ToppingsContext'
import useDocumentTitle from '@hooks/useDocumentTitle'
import useAxios from '@hooks/useAxios'
import { API_URL, USER } from '@constants'
import Modal from '@components/Modal/Modal'
import { Success, Loading } from '@components/Icons/Status'
import { LoadingPage, LoadingSpinner } from '@components/Loading'
import CartItems from '@components/CartItems'
import PaymentButton from '@components/PaymentButton'
import NoItems from '@components/NoItems'
import Layout from '@components/Layout'
import { selectedToppingsProps, orderMsgProps } from '@types'
import { validPhone } from '@functions/validForm'
import scrollToView from '@functions/scrollToView'
import { parseJson, stringJson } from '@functions/jsonTools'

const formDataFromLocalStorage =
  typeof window !== 'undefined'
    ? parseJson(localStorage.getItem('formDataCart') || '[]')
    : []

//orderFood
const OrderFood = () => {
  useDocumentTitle('Cart Items')
  const { pathname } = useRouter()

  useEffect(() => {
    scrollToView()
  }, [])

  //global variables
  const MAX_CHARACTERS = 100

  const { items, grandPrice, setGrandPrice } = useContext(CartContext)
  const { checkedToppings } = useContext(ToppingsContext)

  //Form States
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [personName, setPersonName] = useState(formDataFromLocalStorage.personName || '')
  const [personPhone, setPersonPhone] = useState(
    formDataFromLocalStorage.personPhone || ''
  )
  const [personAddress, setPersonAddress] = useState(
    formDataFromLocalStorage.personAddress || ''
  )
  const [personNotes, setPersonNotes] = useState(
    formDataFromLocalStorage.personNotes || ''
  )
  const [orderFoodStatus, setOrderFoodStatus] = useState(0)
  const [responseMsg, setResponseMsg] = useState<orderMsgProps>({
    Success: '',
    Failure: ''
  })
  const [showLoginRegisterModal, setShowLoginRegisterModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  //Declaring Referenced Element
  const personNameErr = useRef<HTMLSpanElement>(null)
  const personPhoneErr = useRef<HTMLSpanElement>(null)
  const personAddressErr = useRef<HTMLSpanElement>(null)
  const formErr = useRef<HTMLParagraphElement>(null)
  const grandPriceRef = useRef<HTMLElement>(null)

  const { loading, ...response } = useAxios({ url: '/settings' })

  useEffect(() => {
    if (response.response !== null) {
      setResponseMsg(response.response.response[0].orderMsg)
    }
  }, [response.response])

  useEffect(() => {
    setUserId(USER?._id!)
    setUserEmail(USER?.userEmail!)

    localStorage.setItem(
      'formDataCart',
      stringJson({ personName, personPhone, personAddress, personNotes })
    )
  }, [personName, personPhone, personAddress, personNotes])

  useEffect(() => {
    setGrandPrice(grandPriceRef?.current?.textContent || grandPrice)
  }, [grandPriceRef?.current?.textContent, grandPrice, setGrandPrice])

  const handleCollectOrder = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (
      personName !== '' &&
      personPhone !== '' &&
      personNameErr.current!.textContent === '' &&
      personPhoneErr.current!.textContent === '' &&
      personAddressErr.current!.textContent === ''
    ) {
      formErr.current!.textContent = ''

      //if there's No user in localStorage then show modal to login or register else collect order
      if (USER) {
        setShowLoginRegisterModal(false)
        setShowPaymentModal(true)
      } else {
        setShowLoginRegisterModal(true)
      }
    } else {
      formErr.current!.textContent = 'الرجاء إدخال البيانات المطلوبة بشكل صحيح'
    }
  }

  const handleSaveOrder = async (paymentData: any) => {
    //using FormData to send constructed data
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('userEmail', userEmail)
    formData.append('personName', personName)
    formData.append('personPhone', personPhone)
    formData.append('personAddress', personAddress)
    formData.append('personNotes', personNotes)
    formData.append('checkedToppings', stringJson(checkedToppings))
    formData.append('foodItems', stringJson(items))
    formData.append('grandPrice', grandPriceRef?.current?.textContent || '')
    formData.append('paymentData', stringJson(paymentData))

    try {
      const response = await axios.post(`${API_URL}/orders`, formData)
      const { orderAdded, message } = response.data

      setIsLoading(false)
      setOrderFoodStatus(orderAdded)
      orderAdded === 0 &&
        setResponseMsg(msg => {
          return { ...msg, Failure: msg.Failure + message }
        })

      //remove all items from cart
      if (orderAdded) {
        const cartItems = ['restCartItems', 'restCheckedToppings', 'formDataCart']
        cartItems.forEach(item => localStorage.removeItem(item))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Layout>
      <section id='orderFood' className='py-12 my-8'>
        {orderFoodStatus === 1 ? (
          <Modal
            status={Success}
            msg={responseMsg.Success}
            btnName='قائمة الوجبات'
            btnLink='/view'
            redirectLink='/view'
            redirectTime={10000}
          />
        ) : showLoginRegisterModal === true ? (
          <Modal
            status={Loading}
            msg={`يجب عليك تسجيل الدخول أو عمل حساب جديد أولا وذلك للطلب`}
            btnName='تسجيل دخول'
            btnLink={`/auth/login?redirect=${pathname}`}
          />
        ) : showPaymentModal === true ? (
          <Modal
            status={Loading}
            msg={`سيتم الدفع بالعملة (دولار أمريكي) وذلك بعد تحويل الإجمالي: ${grandPrice} ر.ق، سيتم دفع = ${(
              grandPrice / 3.65
            ).toFixed(2)} دولار أمريكي لدفع بأحد الوسائل التالية:`}
            extraComponents={
              <PaymentButton
                value={(grandPrice / 3.65).toFixed(2)}
                onSuccess={(paymentData: any) => {
                  setShowPaymentModal(false)
                  handleSaveOrder(paymentData)
                }}
                /*
                 <LoadingSpinner />
                */
                // onError={() => {
                //   setShowPaymentModal(false)
                //   setOrderFoodStatus(0)
                //   setResponseMsg('حدث خطأ أثناء الدفع')
                // }}
              />
            }
            btnName='رجوع'
            btnLink={`order-food`}
          />
        ) : null}

        <div className='container mx-auto text-center'>
          {loading ? (
            <LoadingPage />
          ) : items.length > 0 ? (
            <>
              <h2 className='inline-block mb-20 text-3xl font-bold'>سلة الطلبات</h2>
              <CartItems />

              <form method='POST' onSubmit={handleCollectOrder}>
                <Link
                  href='/view'
                  className='relative pr-10 block p-2 mx-auto my-10 text-xl text-gray-900 bg-orange-400 border group border-orange-700 hover:bg-orange-500 transition-colors rounded-md w-[20rem] lg:w-[25rem]'
                >
                  <span className='absolute inline-flex justify-center pt-3.5 ml-3 pointer-events-none transition-all bg-white border border-orange-700 rounded-full -top-1.5 w-14 h-14 group-hover:right-2 right-6'>
                    🛒
                  </span>
                  تصفح وجبات أخرى
                </Link>

                <h2 className='mb-10 text-2xl'>يرجى إضافة تفاصيل الطلب</h2>
                <label htmlFor='name' className={`form__group`}>
                  <input
                    className={`relative form__input`}
                    id='name'
                    name='name'
                    type='text'
                    defaultValue={personName}
                    onChange={e => setPersonName(e.target.value.trim())}
                    onKeyUp={(e: any) => {
                      const target = e.target.value.trim()

                      if (target.length > 0 && target.length < 4) {
                        personNameErr.current!.textContent = 'يرجى إدخال إسم بصيغة صحيحة'
                      } else if (target.length > 30) {
                        personNameErr.current!.textContent =
                          'الاسم طويل جداً، يرجى إضافة إسم لا يزيد عن 30 حرف'
                      } else {
                        personNameErr.current!.textContent = ''
                      }
                    }}
                    required
                  />
                  <span className={`form__label`}>
                    الاســـــــــــــــــم &nbsp;
                    <strong className='text-xl leading-4 text-red-600'>*</strong>
                  </span>
                  <span
                    className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                    ref={personNameErr}
                  ></span>
                </label>
                <label htmlFor='phoneNumber' className={`form__group`}>
                  <input
                    className={`form__input`}
                    id='phoneNumber'
                    name='phoneNumber'
                    type='tel'
                    defaultValue={personPhone}
                    onChange={e => setPersonPhone(e.target.value.trim())}
                    onKeyUp={(e: any) => {
                      const target = e.target.value.trim()

                      if (
                        (target.length > 0 && target.length < 8) ||
                        target.length > 8 ||
                        !validPhone(target)
                      ) {
                        personPhoneErr.current!.textContent =
                          'الرجاء إدخال رقم هاتف نفس صيغة رقم الهاتف في المثال'
                      } else {
                        personPhoneErr.current!.textContent = ''
                      }
                    }}
                    required
                  />
                  <span className={`form__label`}>
                    رقم الهاتف - مثال: 33445566 &nbsp;
                    <strong className='text-xl leading-4 text-red-600'>*</strong>
                  </span>
                  <span
                    className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                    ref={personPhoneErr}
                  ></span>
                </label>
                <label htmlFor='Address' className={`form__group`}>
                  <input
                    className={`form__input`}
                    id='Address'
                    name='Address'
                    type='text'
                    defaultValue={personAddress}
                    onChange={e => setPersonAddress(e.target.value.trim())}
                    onKeyUp={(e: any) => {
                      const target = e.target.value.trim()

                      if (target.length > 0 && target.length < 4) {
                        personAddressErr.current!.textContent =
                          'يرجى إدخال إسم بصيغة صحيحة'
                      } else {
                        personAddressErr.current!.textContent = ''
                      }
                    }}
                    required
                  />
                  <span className={`form__label`}>
                    العنوان - مثال: منطقة رقم 53 - شارع رقم 000 - منزل رقم 00&nbsp;
                    <strong className='text-xl leading-4 text-red-600'>*</strong>
                  </span>
                  <span
                    className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                    ref={personAddressErr}
                  ></span>
                </label>
                <label htmlFor='message' className={`form__group`}>
                  <textarea
                    className={`form__input`}
                    id='message'
                    name='message'
                    defaultValue={personNotes}
                    maxLength={MAX_CHARACTERS * 2}
                    onChange={e => setPersonNotes(e.target.value.trim())}
                  ></textarea>

                  <span className={`form__label`}>
                    تستطيع وضع ملاحظات أو اضافات للشيف لإضافتها لك في طلبك &nbsp;😄
                  </span>
                </label>
                <p
                  className='block text-2xl my-4 text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={formErr}
                ></p>
                <span className='inline-block px-3 py-1 my-4 text-xl text-green-800 bg-green-300 border border-green-800 rounded-md select-none'>
                  السعر الاجمالي:&nbsp;
                  <strong ref={grandPriceRef}>
                    {items.reduce(
                      (acc: number, item: any) =>
                        acc +
                        item.cPrice * item.cQuantity +
                        checkedToppings.reduce(
                          (acc: number, curr: selectedToppingsProps) =>
                            curr.toppingId.slice(0, -2) === item.cItemId
                              ? acc +
                                curr.toppingPrice *
                                  item.cToppings.reduce(
                                    (acc: number, curr2: selectedToppingsProps) =>
                                      curr2.toppingId === curr.toppingId
                                        ? curr2.toppingQuantity
                                        : acc,
                                    0
                                  )
                              : acc,
                          0
                        ),
                      0
                    )}
                  </strong>
                  &nbsp; ر.ق
                </span>

                <div className='flex flex-col items-center justify-evenly'>
                  <button
                    type='submit'
                    className={`w-full py-2 text-white text-lg uppercase bg-green-800 hover:bg-green-700 rounded-lg scale-100 transition-all flex justify-center items-center gap-3`}
                    onClick={handleCollectOrder}
                  >
                    {isLoading && isLoading ? (
                      <>
                        <LoadingSpinner />
                        جارِ تأكيد بيانات الطلب...
                      </>
                    ) : (
                      'تأكيد البيانات'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <NoItems
              links={[
                { to: `../view`, label: 'تصفح الوجبات' },
                { to: `../categories`, label: 'تصفح التصنيفات' }
              ]}
            />
          )}
        </div>
      </section>
    </Layout>
  )
}

export default OrderFood
