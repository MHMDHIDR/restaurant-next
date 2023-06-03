import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Notification from 'components/Notification'
import { LoadingSpinner, LoadingPage } from 'components/Loading'
import Layout from 'components/Layout'
import useEventListener from 'hooks/useEventListener'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
import { origin } from '@constants'
import { validPassword } from 'functions/validForm'
import { stringJson } from 'functions/jsonTools'
import { useTranslate } from 'hooks/useTranslate'
import { EyeIconClose, EyeIconOpen } from 'components/Icons/EyeIcon'

const ResetPassword = () => {
  useDocumentTitle('Reset Password')

  const [newUserPass, setNewUserPass] = useState('')
  const [newUserPassConfirm, setNewUserPassConfirm] = useState('')
  const [sendingResetForm, setIsSendingResetForm] = useState(false)
  const [resetLinkSentStatus, setNewPassStatus] = useState(0)
  const [resetLinkMsg, setNewPassMsg] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)

  const newPassErr = useRef<HTMLSpanElement>(null)
  const confirmNewPassErr = useRef<HTMLSpanElement>(null)

  const modalLoading =
    typeof window !== 'undefined' ? document.querySelector('#modal') : null

  const { push, query } = useRouter()
  const { t: token } = query

  const { isAuth, userType, loading } = useAuth()

  useEffect(() => {
    isAuth && userType === 'admin'
      ? push('/dashboard')
      : isAuth && userType === 'user'
      ? push('/')
      : null
  }, [isAuth, userType, push])

  useEventListener('click', (e: any) => {
    //confirm means cancel Modal message (hide it)
    if (e.target.id === 'confirm') {
      modalLoading!.classList.add('hidden')
    }
  })

  const sendResetPassForm = async (e: any) => {
    e.preventDefault()

    if (
      newUserPass === '' ||
      newUserPassConfirm === '' ||
      newPassErr.current!.textContent !== '' ||
      confirmNewPassErr.current!.textContent !== ''
    ) {
      setNewPassStatus(0)
      setNewPassMsg('الرجاء ملء جميع الحقول بطريقة صحيحة')
      return
    } else if (newUserPass !== newUserPassConfirm) {
      setNewPassStatus(0)
      setNewPassMsg('كلمة المرور غير متطابقة')
      return
    } else {
      const formData = new FormData()
      formData.append('userPassword', newUserPass.trim())
      formData.append('userToken', stringJson(token ?? 'token'))

      // if there's no error in the form
      e.target.reset()
      e.target.querySelector('button').setAttribute('disabled', 'disabled')
      setIsSendingResetForm(true)

      try {
        const { data } = await axios.post(`${origin}/api/users/resetpass`, formData)
        //destructering response from backend
        const { newPassSet, message } = data

        setNewPassStatus(newPassSet)
        setNewPassMsg(message)

        if (newPassSet === 1) {
          //if user has changed his password successfully
          setTimeout(() => {
            push('/auth/login')
          }, 5000)
        }
      } catch (error: any) {
        setNewPassMsg(error)
      } finally {
        setIsSendingResetForm(false)
      }
    }
  }

  const { t } = useTranslate()
  const { locale } = useRouter()

  // if done loading (NOT Loading) then show the login form
  return !loading ? (
    <Layout>
      <section className='py-12 my-8'>
        <div className='container mx-auto'>
          <Notification sendStatus={resetLinkSentStatus} sendStatusMsg={resetLinkMsg} />
          <h3
            className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'
            data-section='login'
          >
            {t('app.reset.title')}
          </h3>

          <div className='max-w-6xl mx-auto'>
            <form className='mt-32' onSubmit={sendResetPassForm}>
              <label htmlFor='newUserPass' className='form__group'>
                <input
                  className='form__input rtl'
                  id='newUserPass'
                  name='newUserPass'
                  type={passwordVisible ? 'text' : 'password'}
                  min={8}
                  max={50}
                  onChange={e => setNewUserPass(e.target.value)}
                  onKeyUp={(e: any) => {
                    const parent = e.target.parentElement
                    if (e.target.value.length > 0 && !validPassword(e.target.value)) {
                      parent!.classList.add('notvalid')
                      newPassErr.current!.textContent = t(
                        'app.reset.form.password.longText'
                      )
                    } else if (
                      newUserPassConfirm.length > 0 &&
                      e.target.value !== newUserPassConfirm
                    ) {
                      parent!.classList.add('notvalid')
                      newPassErr.current!.textContent = t(
                        'app.reset.form.password.noMatch'
                      )
                    } else {
                      parent!.classList.remove('notvalid')
                      newPassErr.current!.textContent = ''
                    }
                  }}
                  autoFocus
                  required
                />
                <span
                  className={`absolute cursor-pointer px-2 text-xs text-black capitalize transition-all bg-gray-200 select-none sm:text-sm md:text-lg dark:text-gray-100 dark:bg-gray-800 opacity-60  ${
                    locale === 'ar' ? 'left-1' : 'right-1'
                  }`}
                  onClick={prevState2 => setPasswordVisible(prevState => !prevState)}
                >
                  {passwordVisible ? (
                    <EyeIconClose className={`stroke-red-700 dark:stroke-red-400`} />
                  ) : (
                    <EyeIconOpen className={`fill-green-700 dark:fill-green-400`} />
                  )}
                </span>
                <span className='form__label'>{t('app.reset.form.password.label')}</span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={newPassErr}
                />
              </label>

              <label htmlFor='newUserPassConfirm' className='form__group'>
                <input
                  className='form__input rtl'
                  id='newUserPassConfirm'
                  name='newUserPassConfirm'
                  type={passwordVisible ? 'text' : 'password'}
                  min={8}
                  max={50}
                  onChange={e => setNewUserPassConfirm(e.target.value)}
                  onKeyUp={(e: any) => {
                    const parent = e.target.parentElement
                    if (e.target.value && !validPassword(e.target.value)) {
                      parent.classList.add('notvalid')
                      confirmNewPassErr.current!.textContent = t(
                        'app.reset.form.password.longText'
                      )
                    } else if (e.target.value !== newUserPass) {
                      parent.classList.add('notvalid')
                      confirmNewPassErr.current!.textContent = t(
                        'app.reset.form.password.noMatch'
                      )
                    } else {
                      parent.classList.remove('notvalid')
                      confirmNewPassErr.current!.textContent = ''
                    }
                  }}
                  required
                />
                <span
                  className={`absolute cursor-pointer px-2 text-xs text-black capitalize transition-all bg-gray-200 select-none sm:text-sm md:text-lg dark:text-gray-100 dark:bg-gray-800 opacity-60  ${
                    locale === 'ar' ? 'left-1' : 'right-1'
                  }`}
                  onClick={prevState2 => setPasswordVisible(prevState => !prevState)}
                >
                  {passwordVisible ? (
                    <EyeIconClose className={`stroke-red-700 dark:stroke-red-400`} />
                  ) : (
                    <EyeIconOpen className={`fill-green-700 dark:fill-green-400`} />
                  )}
                </span>
                <span className='form__label'>
                  {t('app.reset.form.confirmPassword.label')}
                </span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={confirmNewPassErr}
                />
              </label>

              <div className='flex flex-col gap-6 text-center border-none form__group ltr'>
                <button
                  className={`flex gap-4 w-fit  mx-auto px-12 py-3 text-white uppercase bg-orange-700 rounded-lg hover:bg-orange-800 scale-100 transition-all rtl${
                    sendingResetForm && sendingResetForm
                      ? ' scale-105 cursor-progress'
                      : ''
                  } ${
                    //add disbaled class if is true or false (that means user has clicked send button)
                    sendingResetForm || !sendingResetForm
                      ? ' disabled:opacity-30 disabled:hover:bg-orange-700'
                      : ''
                  }`}
                  type='submit'
                  id='submitBtn'
                >
                  {sendingResetForm && sendingResetForm ? (
                    <>
                      <LoadingSpinner />
                      {t('app.reset.form.resetBtn.loading')}
                    </>
                  ) : (
                    t('app.reset.form.resetBtn.label')
                  )}
                </button>
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
export default ResetPassword
