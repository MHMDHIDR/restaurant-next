import { useState } from 'react'
import Notification from './Notification'
import { LoadingSpinner } from './Loading'
import { validEmail } from 'functions/validForm'
import { origin } from '@constants'
import axios from 'axios'
import { useTranslate } from 'hooks/useTranslate'

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

    if (
      email.length === 0 ||
      msg.length === 0 ||
      theName.length === 0 ||
      subject.length === 0
    ) {
      setSendStatus(0)
      setSendStatusMsg('الرجاء ملء جميع الحقول بطريقة صحيحة')
      return
    }

    const formData = {
      name: theName,
      subject: subject,
      from: email,
      msg: msg
    }

    // if there's no error in the form
    e.target.reset()
    e.target.querySelector('button').setAttribute('disabled', 'disabled')
    setLoading(true)

    try {
      const { data } = await axios.post(`${origin}/api/contact`, formData)
      setSendStatus(data.mailSent)
      setSendStatusMsg(
        data?.message === 'Email Sent Successfully'
          ? 'شكراً على تواصلك معنا، سيتم الرد عليك في أقرب وقت ممكن 😄'
          : data?.message
      )
    } catch (error: any) {
      setSendStatusMsg(error)
    } finally {
      setLoading(false)
    }
  }

  const { t } = useTranslate()

  return (
    <>
      <section id='contact' className='py-12 my-8 contact'>
        <div className='container mx-auto'>
          <h2 className='mt-4 mb-12 text-2xl text-center md:text-3xl'>
            {t('app.contact.title')}
          </h2>
          <div className='max-w-6xl px-1 mx-auto'>
            <p className='text-sm text-center my-14 sm:text-base md:text-lg'>
              {t('app.contact.description')}
              <strong className='inline-block w-full mt-3'>
                {t('app.contact.tagLine')}
              </strong>
            </p>

            <form method='POST' className='form' onSubmit={sendContactForm}>
              <Notification sendStatus={sendStatus} sendStatusMsg={sendStatusMsg} />

              <label htmlFor='name' className='form__group'>
                <input
                  className='form__input'
                  type='text'
                  name='name'
                  id='name'
                  onChange={e => setName((e.target as HTMLInputElement).value)}
                  required
                />
                <span className='form__label'>{t('app.contact.form.name')}</span>
              </label>

              <label htmlFor='subject' className='form__group'>
                <input
                  className='form__input'
                  type='text'
                  name='subject'
                  id='subject'
                  onChange={e => setSubject((e.target as HTMLInputElement).value)}
                  required
                />
                <span className='form__label'>{t('app.contact.form.subject')}</span>
              </label>

              <label htmlFor='email' className='form__group'>
                <input
                  className='form__input'
                  type='email'
                  id='email'
                  name='email'
                  onChange={({ target }) => {
                    validEmail(target.value) ? setEmail(target.value) : setEmail('')
                  }}
                  required
                />
                <span className='form__label'>{t('app.contact.form.email')}</span>
              </label>

              <label htmlFor='message' className='form__group'>
                <textarea
                  className='form__input'
                  id='message'
                  name='message'
                  onChange={e => setMsg((e.target as HTMLTextAreaElement).value)}
                  required
                ></textarea>
                <span className='form__label'>{t('app.contact.form.message')}</span>
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
