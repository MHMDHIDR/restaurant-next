import { useState } from 'react'
// import Axios from 'axios'

import Notification from './Notification'
import { LoadingSpinner } from './Loading'

import { validEmail } from '../utils/functions/validForm'

import { API_URL } from '../constants'

const Contact = () => {
  const [theName, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  //Msg returned from server
  const [loading, setLoading] = useState(false)
  const [sendStatus, setSendStatus] = useState(0)
  const [sendStatusMsg, setSendStatusMsg] = useState('')

  const sendContactForm = async (e: any) => {
    e.preventDefault()

    if (email === '' || msg === '' || theName === '' || subject === '') {
      setSendStatus(0)
      setSendStatusMsg('الرجاء ملء جميع الحقول بطريقة صحيحة')

      return
    }

    const formData = new FormData()
    formData.append('name', theName)
    formData.append('subject', subject)
    formData.append('from', email)
    formData.append('msg', msg)

    // if there's no error in the form
    e.target.reset()
    e.target.querySelector('button').setAttribute('disabled', 'disabled')
    setLoading(true)

    try {
      const { data } = await Axios.post(`${API_URL}/contact`, formData)

      setSendStatus(data.mailSent)
      setSendStatusMsg(
        data?.message === 'Email Sent Successfully'
          ? 'شكراً على تواصلك معنا، سيتم الرد عليك في أقرب وقت ممكن 😄'
          : data?.message
      )
    } catch ({ response }) {
      setSendStatusMsg(
        response.status === 400 ? 'رجاء تعبئة جميع الحقول أدناه' : response.statusText
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section id='contact' className='py-12 my-8 contact'>
        <div className='container mx-auto'>
          <h2 className='mt-4 mb-12 text-2xl text-center md:text-3xl'>تواصل معنا</h2>
          <div className='max-w-6xl px-1 mx-auto'>
            <p className='text-sm text-center my-14 sm:text-base md:text-lg'>
              سواءً كان لديك استفسار أو تريد أن تتصل بنا، يمكنك مراسلتنا عبر النموذج أدناه
              <strong className='inline-block w-full mt-3'>نسعد بخدمتك دائماً</strong>
            </p>

            <form method='POST' className='form' onSubmit={sendContactForm}>
              <Notification sendStatus={sendStatus} sendStatusMsg={sendStatusMsg} />

              <label htmlFor='name' className='form__group'>
                <input
                  className='form__input'
                  type='text'
                  name='name'
                  id='name'
                  onChange={e => setName(e.target.value)}
                  required
                />
                <span className='form__label'>الاســـــــــــــــــم</span>
              </label>

              <label htmlFor='subject' className='form__group'>
                <input
                  className='form__input'
                  type='text'
                  name='subject'
                  id='subject'
                  onChange={e => setSubject(e.target.value)}
                  required
                />
                <span className='form__label'>الموضــــــــــــوع</span>
              </label>

              <label htmlFor='email' className='form__group'>
                <input
                  className='form__input'
                  type='email'
                  id='email'
                  name='email'
                  onChange={e => {
                    const parent = e.target.parentElement
                    if (e.target.value && !validEmail(e.target.value)) {
                      // parent.classList.add('notvalid')
                    } else if (!e.target.value) {
                      // parent.classList.remove('notvalid')
                      return
                    }

                    if (validEmail(e.target.value)) setEmail(e.target.value)
                  }}
                  required
                />
                <span className='form__label'>البريد الالكترونــي</span>
              </label>

              <label htmlFor='message' className='form__group'>
                <textarea
                  className='form__input'
                  id='message'
                  name='message'
                  onChange={e => setMsg(e.target.value)}
                  required
                ></textarea>
                <span className='form__label'>أكتب لنا ماذا تريد؟</span>
              </label>

              <div className='mb-20 border-none form__group'>
                <button
                  className={`w-full px-12 py-3 text-white uppercase bg-orange-700 rounded-lg hover:bg-orange-800 scale-100 transition-all flex justify-center items-center gap-3${
                    loading && loading ? ' scale-105 cursor-progress' : ''
                  } ${
                    //add disbaled class if is true or false (that means user has clicked send button)
                    loading || !loading
                      ? ' disabled:opacity-30 disabled:hover:bg-orange-700'
                      : ''
                  }`}
                  type='submit'
                  id='submitBtn'
                >
                  {loading && loading ? (
                    <>
                      <LoadingSpinner />
                      جارِ الإرسال...
                    </>
                  ) : (
                    'أرسل'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
