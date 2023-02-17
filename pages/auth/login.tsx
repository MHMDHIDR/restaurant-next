import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Axios from 'axios'
import useEventListener from 'hooks/useEventListener'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
// import GoogleLogin from 'react-google-login'
// import { gapi } from 'gapi-script'
import Notification from 'components/Notification'
import { LoadingSpinner, LoadingPage } from 'components/Loading'
import Layout from 'components/Layout'
import { EyeIconOpen, EyeIconClose } from 'components/Icons/EyeIcon'
import { UserProps /*,GoogleLoginOnFailureProps*/ } from '@types'
import { API_URL } from '@constants'
import { parseJson, stringJson } from 'functions/jsonTools'

const LoginDataFromLocalStorage =
  typeof window !== 'undefined' && parseJson(localStorage.getItem('LoginData') || '{}')

const Login = () => {
  useDocumentTitle('Login')

  const [userEmailOrTel, setEmailOrTel] = useState(
    LoginDataFromLocalStorage.userEmailOrTel || ''
  )
  const [userPassword, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loggedInStatus, setLoggedInStatus] = useState(0)
  const [isSendingLoginForm, setIsSendingLoginForm] = useState(false)
  const [loginMsg, setLoginMsg] = useState('')
  const router = useRouter()

  const { redirect } = router.query

  const modalLoading =
    typeof window !== 'undefined' ? document.querySelector('#modal') : null

  const { isAuth, userType, loading } = useAuth()

  useEffect(() => {
    isAuth && userType === 'admin'
      ? router.push('/dashboard')
      : isAuth && userType === 'user'
      ? router.push('/')
      : null
  }, [isAuth, userType, router])

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
      const loginUser = await Axios.post(`${API_URL}/users/login`, {
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
        : userAccountType === 'admin'
        ? router.push('/dashboard')
        : router.push('/')
    } catch (response: any) {
      setLoginMsg(response?.response.message)
    } finally {
      setIsSendingLoginForm(false)
    }
  }

  //this useEffect is for google login
  // useEffect(() => {
  //   function start() {
  //     gapi.client?.init({
  //       clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  //       scope: 'profile email'
  //     })
  //   }
  //   start()
  //   gapi.load('client:auth2', start)
  // }, [])

  // const handleGoogleLogin = async (googleData: any) => {
  //   try {
  //     const loginUser = await Axios.post(`${API_URL}/users/googleLogin`, {
  //       tokenId: googleData.tokenId
  //     })
  //     const { data } = loginUser
  //     const { LoggedIn, _id, userAccountType, userFullName, userEmail, token, message } =
  //       data
  //     setLoggedInStatus(LoggedIn)

  //     if (LoggedIn === 0) {
  //       return setLoginMsg(message)
  //     }
  //     //else if user is logged in
  //     setLoginMsg(message)
  //     localStorage.setItem(
  //       'user',
  //       stringJson({ _id, userAccountType, userFullName, userEmail, token })
  //     )

  //     redirect
  //       ? router.push(`/${redirect}`)
  //       : userAccountType === 'admin'
  //       ? router.push('/dashboard')
  //       : router.push('/')
  //   } catch (response: any) {
  //     setLoginMsg(response?.response.message)
  //   }
  // }

  // if done loading (NOT Loading) then show the login form

  return loading ? (
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
                <button
                  className={`w-fit mx-auto px-12 py-3 text-white uppercase bg-orange-700 rounded-lg hover:bg-orange-800 scale-100 transition-all rtl`}
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

                {/* 
                <div>
                  <strong className='block mx-auto my-8 text-orange-800 dark:text-orange-600 w-fit'>
                    أو تسجيل الدخول عن طريق حسابك في جوجل
                  </strong>
                  <GoogleLogin
                    clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
                    buttonText='Log in with Google'
                    onSuccess={handleGoogleLogin}
                    onFailure={(res: GoogleLoginOnFailureProps) =>
                      console.error(res.details)
                    }
                    cookiePolicy={'single_host_origin'}
                  />
                </div> */}

                <strong className='block mx-auto my-8 text-orange-800 dark:text-orange-600 w-fit'>
                  أو
                </strong>

                <div className='flex items-center sm:gap-y-12 gap-x-6 justify-evenly'>
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
