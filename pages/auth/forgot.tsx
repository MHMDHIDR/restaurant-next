import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import Notification from 'components/Notification'
import { LoadingPage, LoadingSpinner } from 'components/Loading'
import Layout from 'components/Layout'
import useEventListener from 'hooks/useEventListener'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
import { origin } from '@constants'
import { parseJson } from 'functions/jsonTools'
import { useTranslate } from 'hooks/useTranslate'

const ForgotDataFromLocalStorage =
  typeof window !== 'undefined' && parseJson(localStorage.getItem('ForgotData') || '{}')

const ForgotPassword = () => {
  useDocumentTitle('Forgot Password')

  const [emailOrTel, setEmailOrTel] = useState(
    ForgotDataFromLocalStorage.newUserPassword || ''
  )
  const [sendingForgotForm, setSendingForgotForm] = useState(false)
  const [forgotLinkSentStatus, setForgotLinkSentStatus] = useState(0)
  const [forgotLinkMsg, setForgotLinkMsg] = useState('')

  const modalLoading =
    typeof window !== 'undefined' ? document.querySelector('#modal') : null

  const router = useRouter()

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

  const sendForgotPassForm = async (e: any) => {
    e.preventDefault()

    if (emailOrTel === '') {
      setForgotLinkSentStatus(0)
      setForgotLinkMsg('الرجاء ملء جميع الحقول بطريقة صحيحة')

      return
    }

    const formData = new FormData()
    formData.append('userEmail', emailOrTel.trim().toLowerCase())
    formData.append('userTel', emailOrTel.trim().toLowerCase())

    // if there's no error in the form
    e.target.reset()
    e.target.querySelector('button').setAttribute('disabled', 'disabled')
    setSendingForgotForm(true)

    try {
      const { data } = await axios.post(`${origin}/api/users/forgotpass`, formData)
      //destructering response from backend
      const { forgotPassSent, message } = data

      setForgotLinkSentStatus(forgotPassSent)

      if (forgotPassSent === 0) {
        return setForgotLinkMsg(message)
      }

      //if user is logged in
      setForgotLinkMsg(message)
    } catch (response: any) {
      setForgotLinkMsg(response?.response.message)
    } finally {
      setSendingForgotForm(false)
    }
  }

  const { t } = useTranslate()

  // if done loading (NOT Loading) then show the login form
  return !loading ? (
    <Layout>
      <section className='py-12 my-8'>
        <div className='container mx-auto'>
          <Notification sendStatus={forgotLinkSentStatus} sendStatusMsg={forgotLinkMsg} />
          <h3
            className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'
            data-section='login'
          >
            {t('app.forgot.title')}
          </h3>
          <div className='max-w-6xl mx-auto'>
            <form className='mt-32' onSubmit={sendForgotPassForm}>
              <label htmlFor='email' className='form__group'>
                <input
                  className='form__input'
                  id='email'
                  name='email'
                  type='text'
                  onChange={e => setEmailOrTel(e.target.value)}
                  defaultValue={emailOrTel}
                  dir='auto'
                  autoFocus
                  required
                />
                <span className='form__label'>
                  {t('app.forgot.form.emailOrPhone.label')}
                </span>
              </label>

              <div className='flex flex-col gap-6 text-center border-none form__group ltr'>
                <button
                  className={`flex gap-4 w-fit mx-auto px-12 py-3 text-white uppercase bg-orange-700 rounded-lg hover:bg-orange-800 scale-100 transition-all rtl${
                    sendingForgotForm && sendingForgotForm
                      ? ' scale-105 cursor-progress'
                      : ''
                  } ${
                    //add disbaled class if is true or false (that means user has clicked send button)
                    sendingForgotForm || !sendingForgotForm
                      ? ' disabled:opacity-30 disabled:hover:bg-orange-700'
                      : ''
                  }`}
                  type='submit'
                  id='submitBtn'
                >
                  {sendingForgotForm && sendingForgotForm ? (
                    <>
                      <LoadingSpinner />
                      <span>{t('app.forgot.form.forgotBtn.loading')}</span>
                    </>
                  ) : (
                    t('app.forgot.form.forgotBtn.label')
                  )}
                </button>

                <strong className='block mx-auto my-8 text-orange-800 dark:text-orange-600 w-fit'>
                  {t('app.forgot.form.or')}
                </strong>

                <div className='flex items-center sm:gap-y-12 gap-x-6 justify-evenly'>
                  <Link
                    href='/auth/join'
                    className='mx-auto text-center text-orange-700 underline-hover dark:text-orange-800 sm:dark:text-orange-500 w-fit'
                  >
                    {t('app.forgot.form.join')}
                  </Link>
                  <Link
                    href='/auth/login'
                    className='mx-auto text-center text-orange-700 underline-hover dark:text-orange-800 sm:dark:text-orange-500 w-fit'
                  >
                    {t('app.forgot.form.login')}
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  ) : (
    <LoadingPage />
  )
}
export default ForgotPassword
