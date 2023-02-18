import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Notification from 'components/Notification'
import { LoadingSpinner, LoadingPage } from 'components/Loading'
import Layout from 'components/Layout'
import useEventListener from 'hooks/useEventListener'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAuth from 'hooks/useAuth'
import { API_URL } from '@constants'
import { validPassword } from 'functions/validForm'
import { stringJson } from 'functions/jsonTools'

const ResetPassword = () => {
  useDocumentTitle('Reset Password')

  const [newUserPass, setNewUserPass] = useState('')
  const [newUserPassConfirm, setNewUserPassConfirm] = useState('')
  const [sendingResetForm, setIsSendingResetForm] = useState(false)
  const [resetLinkSentStatus, setNewPassStatus] = useState(0)
  const [resetLinkMsg, setNewPassMsg] = useState('')

  const newPassErr = useRef<HTMLSpanElement>(null)
  const confirmNewPassErr = useRef<HTMLSpanElement>(null)

  const modalLoading =
    typeof window !== 'undefined' ? document.querySelector('#modal') : null

  const { push, query } = useRouter()
  const { t } = query

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
      formData.append('userToken', stringJson(t ?? 't'))

      // if there's no error in the form
      e.target.reset()
      e.target.querySelector('button').setAttribute('disabled', 'disabled')
      setIsSendingResetForm(true)

      try {
        const { data } = await axios.post(`${API_URL}/users/resetpass`, formData)
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
            كلمة السر الجديدة
          </h3>

          <div className='max-w-6xl mx-auto'>
            <form className='mt-32' onSubmit={sendResetPassForm}>
              <label htmlFor='newUserPass' className='form__group'>
                <input
                  className='form__input rtl'
                  id='newUserPass'
                  name='newUserPass'
                  type='password'
                  min={8}
                  max={50}
                  onChange={e => setNewUserPass(e.target.value)}
                  onKeyUp={(e: any) => {
                    const parent = e.target.parentElement
                    if (e.target.value.length > 0 && !validPassword(e.target.value)) {
                      parent!.classList.add('notvalid')
                      newPassErr.current!.textContent =
                        'كلمة المرور يجب أن تتكون من حروف وأرقام بالانجليزية فقط، وطولها من 8 أحرف وأرقام على الأقل إلى 50 أحرف وأرقام على الأكثر'
                    } else if (
                      newUserPassConfirm.length > 0 &&
                      e.target.value !== newUserPassConfirm
                    ) {
                      parent!.classList.add('notvalid')
                      newPassErr.current!.textContent = 'كلمة المرور غير متطابقة'
                    } else {
                      parent!.classList.remove('notvalid')
                      newPassErr.current!.textContent = ''
                    }
                  }}
                  autoFocus
                  required
                />
                <span className='form__label'>الرجاء كتابة كلمة المرور الجديدة</span>
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
                  type='password'
                  min={8}
                  max={50}
                  onChange={e => setNewUserPassConfirm(e.target.value)}
                  onKeyUp={(e: any) => {
                    const parent = e.target.parentElement
                    if (e.target.value && !validPassword(e.target.value)) {
                      parent.classList.add('notvalid')
                      confirmNewPassErr.current!.textContent =
                        'كلمة المرور يجب أن تتكون من حروف وأرقام بالانجليزية فقط، وطولها 8 أحرف وأرقام على الأقل و 50 أحرف وأرقام على الأكثر'
                    } else if (e.target.value !== newUserPass) {
                      parent.classList.add('notvalid')
                      confirmNewPassErr.current!.textContent = 'كلمة المرور غير متطابقة'
                    } else {
                      parent.classList.remove('notvalid')
                      confirmNewPassErr.current!.textContent = ''
                    }
                  }}
                  required
                />
                <span className='form__label'>
                  الرجاء كتابة كلمة المرور الجديدة مرة أخرى للتأكيد
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
                      جارِ تغيير كلمة المرور...
                    </>
                  ) : (
                    'تغيير كلمة المرور'
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
