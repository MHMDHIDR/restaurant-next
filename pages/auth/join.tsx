import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Axios from 'axios'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Notification from '../../components/Notification'
import { LoadingSpinner, LoadingPage } from '../../components/Loading'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { API_URL } from '../../constants'
import useAuth from '../../hooks/useAuth'
import { EyeIconClose, EyeIconOpen } from '../../components/Icons/EyeIcon'

const Join = () => {
  useDocumentTitle('Join')

  const [userFullName, setFullName] = useState('')
  const [userEmail, setEmail] = useState('')
  const [userTel, setTel] = useState('')
  const [userPassword, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [regStatus, setRegStatus] = useState()
  const [isSendingJoinForm, setIsSendingJoinForm] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const router = useRouter()

  const { isAuth, userType, loading } = useAuth()
  useEffect(() => {
    isAuth && userType === 'admin'
      ? router.push('/dashboard')
      : isAuth && userType === 'user'
      ? router.push('/')
      : null
  }, [isAuth, userType, router])

  const handleJoin = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    setIsSendingJoinForm(true)

    try {
      const joinUser = await Axios.post(`${API_URL}/users/join`, {
        userFullName,
        userEmail,
        userTel,
        userPassword
      })
      //getting response from backend
      const { data } = joinUser
      setRegStatus(data.userAdded)

      //if user is joined correctly
      setErrMsg(data?.message)
    } catch (response: any) {
      setErrMsg(
        response?.response?.status === 409
          ? 'عفواً المستخدم مسجل من قبل بنفس البريد الالكتروني'
          : response?.response?.status === 400
          ? 'رجاء تعبئة جميع الحقول أدناه'
          : response?.response?.statusText
      )
    } finally {
      setIsSendingJoinForm(false)
    }
  }

  // if done loading (NOT Loading) then show the login form
  return !loading ? (
    <>
      <Header />
      <section className='py-12 my-8'>
        <div className='container mx-auto'>
          <Notification sendStatus={regStatus || 0} sendStatusMsg={errMsg} />
          <h3
            className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'
            data-section='login'
          >
            تسجيل حساب جديد
          </h3>
          <div className='max-w-6xl mx-auto'>
            <form className='mt-32' onSubmit={handleJoin}>
              <label htmlFor='name' className='form__group'>
                <input
                  className='form__input'
                  id='name'
                  name='name'
                  type='text'
                  onChange={e => setFullName(e.target.value)}
                  autoFocus
                  required
                />
                <span className='form__label'>الاســـــــــــــــــم</span>
              </label>

              <label htmlFor='email' className='form__group'>
                <input
                  className='form__input'
                  id='email'
                  name='email'
                  type='text'
                  onChange={e => setEmail(e.target.value)}
                  dir='auto'
                  required
                />
                <span className='form__label'>البريد الالكترونــي</span>
              </label>

              <label htmlFor='tel' className='form__group'>
                <input
                  className='form__input'
                  id='tel'
                  name='tel'
                  type='tel'
                  onChange={e => setTel(e.target.value)}
                  dir='auto'
                  required
                />
                <span className='form__label'>رقم الهاتـــــــــف</span>
              </label>

              <label htmlFor='password' className='form__group'>
                <input
                  className='form__input'
                  id='password'
                  name='password'
                  type={passwordVisible ? 'text' : 'password'}
                  onChange={e => setPassword(e.target.value)}
                  dir='auto'
                  required
                />
                <span
                  className='absolute cursor-pointer px-2 text-xs text-black capitalize transition-all bg-gray-200 select-none left-1 sm:text-sm md:text-lg dark:text-gray-100 dark:bg-gray-800 opacity-60;'
                  onClick={prevState2 => setPasswordVisible(prevState => !prevState)}
                >
                  {passwordVisible ? (
                    <EyeIconClose className={`stroke-red-700 dark:stroke-red-400`} />
                  ) : (
                    <EyeIconOpen className={`fill-green-700 dark:fill-green-400`} />
                  )}
                </span>
                <span className='form__label'>كلمــة المــــــرور</span>
              </label>

              <div className='flex flex-col gap-6 text-center border-none form__group'>
                <button
                  className={`w-fit mx-auto px-12 py-3 text-white uppercase bg-orange-700 rounded-lg hover:bg-orange-800 scale-100 transition-all`}
                  type='submit'
                  id='submitBtn'
                >
                  {isSendingJoinForm && isSendingJoinForm ? (
                    <>
                      <LoadingSpinner />
                      &nbsp;جارِ التسجيل...
                    </>
                  ) : (
                    'تسجيل'
                  )}
                </button>

                <strong className='block mx-auto my-8 text-orange-800 dark:text-orange-600 w-fit'>
                  أو
                </strong>

                <div className='flex items-center sm:gap-y-12 gap-x-6 justify-evenly'>
                  <Link
                    href='/auth/login'
                    className='mx-auto text-center text-orange-700 underline-hover dark:text-orange-800 sm:dark:text-orange-500 w-fit'
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  ) : (
    <LoadingPage />
  )
}
export default Join
