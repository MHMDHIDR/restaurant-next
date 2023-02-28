import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
import useEventListener from 'hooks/useEventListener'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
import Notification from 'components/Notification'
import { LoadingSpinner, LoadingPage } from 'components/Loading'
import Layout from 'components/Layout'
import { EyeIconOpen, EyeIconClose } from 'components/Icons/EyeIcon'
import { UserProps } from '@types'
import { origin, APP_URL, USER } from '@constants'
import { parseJson, stringJson } from 'functions/jsonTools'

const LoginDataFromLocalStorage =
  typeof window !== 'undefined' && parseJson(localStorage.getItem('LoginData') || '{}')

const Login = () => {
  useDocumentTitle('Login')
  const router = useRouter()
  const { redirect } = router.query
  const { data: session } = useSession()

  useEffect(() => {
    USER || session!?.user ? router.push('/') : null
  }, [router, session])

  const [userEmailOrTel, setEmailOrTel] = useState(
    LoginDataFromLocalStorage.userEmailOrTel || ''
  )
  const [userPassword, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loggedInStatus, setLoggedInStatus] = useState(0)
  const [isSendingLoginForm, setIsSendingLoginForm] = useState(false)
  const [loginMsg, setLoginMsg] = useState('')

  const modalLoading =
    typeof window !== 'undefined' ? document.querySelector('#modal') : null

  const { loading } = useAuth()

  useEventListener('click', (e: any) => {
    //confirm means cancel Modal message (hide it)
    if (e.target.id === 'confirm') {
      modalLoading!.classList.add('hidden')
    }
  })

  const sendLoginForm = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsSendingLoginForm(true)

    try {
      const loginUser = await axios.post(`${origin}/api/users/login`, {
        userPassword,
        userEmail: userEmailOrTel.trim().toLowerCase(),
        userTel: userEmailOrTel.trim().toLowerCase()
      })
      //getting response from backend
      const { data } = loginUser
      const {
        LoggedIn,
        _id,
        userAccountType,
        userFullName,
        userEmail,
        token,
        message
      }: UserProps = data
      setLoggedInStatus(LoggedIn ?? 0)

      if (LoggedIn === 0) {
        return setLoginMsg(message ?? '')
      }

      //if user is logged in
      setLoginMsg(message ?? '')
      localStorage.setItem(
        'user',
        stringJson({ _id, userAccountType, userFullName, userEmail, token })
      )

      redirect
        ? router.push(`/${redirect}`)
        : userAccountType === 'user'
        ? window.location.replace('/')
        : userAccountType === 'admin'
        ? window.location.replace('/dashboard')
        : null
    } catch (response: any) {
      setLoginMsg(response?.response?.message)
    } finally {
      setIsSendingLoginForm(false)
    }
  }

  return USER || loading || session!?.user ? (
    <LoadingPage />
  ) : (
    <Layout>
      <section className='py-12 my-8'>
        <div className='container mx-auto'>
          <Notification sendStatus={loggedInStatus} sendStatusMsg={loginMsg} />

          <h3
            className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'
            data-section='login'
          >
            تسجيل الدخول
          </h3>
          <div className='max-w-6xl mx-auto'>
            <form className='mt-32' onSubmit={sendLoginForm}>
              <label htmlFor='email' className='form__group'>
                <input
                  className='form__input'
                  id='email'
                  name='email'
                  type='text'
                  onChange={e => setEmailOrTel(e.target.value)}
                  defaultValue={userEmailOrTel}
                  dir='auto'
                  autoFocus
                  required
                />
                <span className='form__label'>البريد الالكتروني أو رقم الهاتف</span>
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
                  onClick={() => setPasswordVisible(prevState => !prevState)}
                >
                  {passwordVisible ? (
                    <EyeIconClose className={`stroke-red-700 dark:stroke-red-400`} />
                  ) : (
                    <EyeIconOpen className={`fill-green-700 dark:fill-green-400`} />
                  )}
                </span>
                <span className='form__label'>كلمة المرور</span>
              </label>

              <div className='flex flex-col gap-6 text-center border-none form__group ltr'>
                <div className='flex flex-wrap items-center justify-around gap-y-4 rtl'>
                  <button
                    className={`w-fit px-12 py-3 text-white uppercase bg-orange-700 rounded-lg hover:bg-orange-800 scale-100 transition-all`}
                    type='submit'
                    id='submitBtn'
                  >
                    {isSendingLoginForm ? (
                      <>
                        <LoadingSpinner />
                        &nbsp; جارِ تسجيل الدخول...
                      </>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </button>
                  <button
                    type='button'
                    className={`w-fit flex items-center gap-4 px-8 py-2 text-gray-700 dark:text-white uppercase rounded-lg outline outline-1 focus:outline-2 outline-orange-500 hover:outline-orange-500 scale-100 transition-all`}
                    onClick={() => signIn('google', { callbackUrl: APP_URL })}
                  >
                    تسجيل الدخول عبر جوجل
                    <Image
                      src={`/assets/img/icons/google.svg`}
                      className='w-8 h-8'
                      width='28'
                      height='28'
                      alt='Google Login'
                    />
                  </button>
                </div>

                <strong className='block mx-auto my-8 text-orange-800 dark:text-orange-600 w-fit'>
                  أو
                </strong>

                <div className='flex flex-wrap items-center justify-evenly gap-y-6'>
                  <Link
                    href='/auth/join'
                    className='mx-auto text-center text-orange-700 underline-hover dark:text-orange-800 sm:dark:text-orange-500 w-fit'
                  >
                    تسجيل حساب جديد
                  </Link>

                  <Link
                    href='/auth/forgot'
                    className='mx-auto text-center text-orange-700 underline-hover dark:text-orange-800 sm:dark:text-orange-500 w-fit'
                  >
                    نسيت كلمة المرور
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  )
}
export default Login
