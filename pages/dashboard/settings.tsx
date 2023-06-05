import { useState, useEffect, useRef, ChangeEvent, useContext } from 'react'
import axios from 'axios'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useAxios from 'hooks/useAxios'
import useAuth from 'hooks/useAuth'
import { FileUploadContext } from 'contexts/FileUploadContext'
import FileUpload from 'components/FileUpload'
import Modal from 'components/Modal/Modal'
import { Success, Error, Loading } from 'components/Icons/Status'
import { LoadingPage, LoadingSpinner } from 'components/Loading'
import ModalNotFound from 'components/Modal/ModalNotFound'
import Layout from 'components/dashboard/Layout'
import { API_URL } from '@constants'
import { responseTypes } from '@types'
import goTo from 'functions/goTo'
import { stringJson } from 'functions/jsonTools'
import uploadS3 from 'utils/functions/uploadS3'
import { useTranslate } from 'hooks/useTranslate'

const Settings = () => {
  useDocumentTitle('Settings')

  //Contexts
  const { file } = useContext(FileUploadContext)

  //Description Form States
  const [appName, setAppName] = useState('')
  const [appDesc, setAppDesc] = useState('')
  const [appTagline, setAppTagline] = useState('')
  const [orderMsgSuccess, setOrderMsgSuccess] = useState('')
  const [orderMsgFailure, setOrderMsgFailure] = useState('')
  const [whatsAppNumber, setWhatsAppNumber] = useState('')
  const [instagramAccount, setInstagramAccount] = useState('')
  const [twitterAccount, setTwitterAccount] = useState('')

  //Loading States
  const [settingsUpdated, setSettingsUpdated] = useState()
  const [settingsUpdatedMsg, setSettingsUpdatedMsg] = useState()

  //TagLine Form States
  const [data, setData] = useState<responseTypes>()
  const [categoryList, setCategoryList] = useState<any>(['', ''])
  const [isUpdating, setIsUpdating] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const { userType } = useAuth()
  const { t } = useTranslate()

  //fetching description data
  const { response, loading } = useAxios({ url: '/settings' })

  useEffect(() => {
    if (response !== null) {
      setData(response?.response[0])
      setCategoryList(response?.response[0]?.CategoryList)
    }
  }, [response])

  const DESC_MIN_LENGTH = 30
  const DESC_MAX_LENGTH = 400

  const TAGLINE_MIN_LENGTH = 10
  const TAGLINE_MAX_LENGTH = 100

  //Form errors messages
  const appNameErr = useRef<HTMLSpanElement>(null)
  const descErr = useRef<HTMLSpanElement>(null)
  const tagLineErr = useRef<HTMLSpanElement>(null)
  const orderMsgErr = useRef<HTMLSpanElement>(null)
  const whatsAppNumberErr = useRef<HTMLSpanElement>(null)
  const instagramAccountErr = useRef<HTMLSpanElement>(null)
  const twitterAccountErr = useRef<HTMLSpanElement>(null)
  const formMsg = useRef<HTMLDivElement>(null)

  // handle input change
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    otherValue: any
  ) => {
    const { name, value } = e.target
    const list = [...categoryList]
    list[index] = name === 'categoryValue' ? [otherValue, value] : [value, otherValue]

    setCategoryList(list)
  }

  // handle click event of the Add button
  const handleAddClick = () => {
    setCategoryList([...categoryList, ['', '']])
  }

  const handleRemoveClick = (index: number) => {
    const list = [...categoryList]
    list.splice(index, 1)
    setCategoryList(list)
  }

  const HandleUpdate = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    //initial form values if no value was updated taking it from [0] index
    const currentAppName = appName || data?.appName
    const currentAppDesc = appDesc || data?.appDesc
    const currentAppTagline = appTagline || data?.appTagline
    const currentOrderMsgSuccess = orderMsgSuccess || data?.orderMsg.Success
    const currentOrderMsgFailure = orderMsgFailure || data?.orderMsg.Failure
    const currentWhatsAppNumber = whatsAppNumber || data?.whatsAppNumber
    const currentInstagramAccount = instagramAccount || data?.instagramAccount
    const currentTwitterAccount = twitterAccount || data?.twitterAccount
    const currentCategoryList = categoryList || data?.appTagline
    const prevSettingImgPath = data?.websiteLogoDisplayPath ?? ''
    const prevSettingImgName = data?.websiteLogoDisplayName ?? ''

    const formData = new FormData()
    formData.append('appName', currentAppName!)
    formData.append('appDesc', currentAppDesc!)
    formData.append('appTagline', currentAppTagline!)
    formData.append('orderMsgSuccess', currentOrderMsgSuccess!)
    formData.append('orderMsgFailure', currentOrderMsgFailure!)
    formData.append('whatsAppNumber', currentWhatsAppNumber!)
    formData.append('instagramAccount', currentInstagramAccount!)
    formData.append('twitterAccount', currentTwitterAccount!)
    formData.append('CategoryList', stringJson(currentCategoryList))
    formData.append('prevLogoImgPath', prevSettingImgPath)
    formData.append('prevLogoImgName', prevSettingImgName)

    if (
      descErr.current!.textContent === '' ||
      tagLineErr.current!.textContent === '' ||
      whatsAppNumberErr.current!.textContent === '' ||
      instagramAccountErr.current!.textContent === '' ||
      twitterAccountErr.current!.textContent === ''
    ) {
      setModalLoading(true)
      setIsUpdating(true)

      const { foodImgs } = await uploadS3(file)
      formData.append('foodImgs', stringJson(foodImgs.length > 0 ? foodImgs : []))

      try {
        const response = await axios.patch(`${API_URL}/settings/${data?._id}`, formData)
        const { settingsUpdated, message } = response.data

        setSettingsUpdated(settingsUpdated)
        setSettingsUpdatedMsg(message)

        //Remove waiting modal
        setTimeout(() => {
          setModalLoading(false)
        }, 300)
      } catch (err) {
        console.error(err)
      } finally {
        setIsUpdating(false)
      }
    } else {
      formMsg.current!.textContent =
        'الرجاء إضافة التعديلات بطريقة صحيحة لتستطيع التحديث بنجاح 😃'
    }
  }

  return loading || !userType ? (
    <LoadingPage />
  ) : userType !== 'admin' ? (
    <ModalNotFound btnLink='/dashboard' btnName='لوحة التحكم' />
  ) : (
    <>
      {settingsUpdated === 1 ? (
        <Modal
          status={Success}
          msg={settingsUpdatedMsg}
          redirectLink={goTo(`settings`)}
          redirectTime={3500}
        />
      ) : settingsUpdated === 0 ? (
        <Modal
          status={Error}
          msg='حدث خطأ ما أثناء تحديث الإعدادات!'
          redirectLink={goTo(`settings`)}
          redirectTime={3500}
        />
      ) : null}
      <Layout>
        <section className='py-12 my-8 dashboard'>
          <div className='container mx-auto'>
            {/* Show Modal Loading when submitting form */}
            {modalLoading && (
              <Modal
                status={Loading}
                modalHidden='hidden'
                classes='txt-blue text-center'
                msg='الرجاء الانتظار...'
              />
            )}

            {/* Description Form */}
            <form id='descForm' onSubmit={HandleUpdate}>
              <h2 className='mx-0 mt-4 mb-8 mr-5 text-xl text-center'>
                {t('app.dashboard.settings.title')}
              </h2>
              <label
                htmlFor='logoImg'
                className='flex flex-wrap items-center justify-center gap-5 mb-10 cursor-pointer md:justify-between'
              >
                <FileUpload
                  data={{
                    foodId: data!?._id,
                    foodName: data!?.websiteLogoDisplayName,
                    defaultImg: [
                      {
                        foodImgDisplayName: data!?.websiteLogoDisplayName,
                        foodImgDisplayPath: data!?.websiteLogoDisplayPath
                      }
                    ]
                  }}
                  ignoreDelete={true}
                />
              </label>

              <label htmlFor='appName' className='form__group'>
                <input
                  name='appName'
                  id='appName'
                  className='form__input'
                  defaultValue={data && data.appName}
                  minLength={10}
                  maxLength={100}
                  onChange={e => setAppName(e.target.value.trim())}
                  onKeyUp={e => {
                    const target = (e.target as HTMLInputElement).value.trim()

                    if (target.length > 0 && target.length < 10) {
                      appNameErr.current!.textContent = `اسم الموقع قصير جداً ولا يوصف الموقع بشكل كافي، الاســـــم يجب يتكون من ${10} حرف على الأقل`
                    } else if (target.length > 100) {
                      appNameErr.current!.textContent = `وصف الموقع طويل جداً! لا يمكن أن يزيد عن ${100} حرف`
                    } else {
                      appNameErr.current!.textContent = ''
                    }
                  }}
                  required
                ></input>
                <span className='form__label'>
                  {t('app.dashboard.settings.form.name.label')}
                </span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={appNameErr}
                ></span>
              </label>

              <h3 className='mx-0 mt-4 mb-12 text-lg text-center'>
                {t('app.dashboard.settings.form.about.label')}
              </h3>
              <label htmlFor='aboutDescription' className='form__group'>
                <textarea
                  name='aboutDescription'
                  id='aboutDescription'
                  className='form__input'
                  defaultValue={data && data.appDesc}
                  minLength={DESC_MIN_LENGTH}
                  maxLength={DESC_MAX_LENGTH}
                  onChange={e => setAppDesc(e.target.value.trim())}
                  onKeyUp={e => {
                    const target = (e.target as HTMLTextAreaElement).value.trim()

                    if (target.length > 0 && target.length < DESC_MIN_LENGTH) {
                      descErr.current!.textContent = `وصف الموقع قصير جداً ولا يوصف الموقع بشكل كافي، الوصف يتكون من ${DESC_MIN_LENGTH} حرف على الأقل`
                    } else if (target.length > DESC_MAX_LENGTH) {
                      descErr.current!.textContent = `وصف الموقع طويل جداً! لا يمكن أن يزيد عن ${DESC_MAX_LENGTH} حرف`
                    } else {
                      descErr.current!.textContent = ''
                    }
                  }}
                  required
                ></textarea>
                <span className='form__label'>
                  {t('app.dashboard.settings.form.about.aboutText')}
                </span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={descErr}
                ></span>
              </label>

              <h3 className='mx-0 mt-4 mb-12 text-lg text-center'>
                {t('app.dashboard.settings.form.tagLine.label')}
              </h3>
              <label htmlFor='aboutTagline' className='form__group'>
                <textarea
                  name='aboutTagline'
                  id='aboutTagline'
                  className='form__input'
                  defaultValue={data && data.appTagline}
                  minLength={TAGLINE_MIN_LENGTH}
                  maxLength={TAGLINE_MAX_LENGTH}
                  onChange={e => setAppTagline(e.target.value.trim())}
                  onKeyUp={e => {
                    const target = (e.target as HTMLTextAreaElement).value.trim()

                    if (target.length > 0 && target.length < TAGLINE_MIN_LENGTH) {
                      tagLineErr.current!.textContent = `شعار الموقع قصير جداً ولا يعبر عن الموقع، الشعار يتكون من ${TAGLINE_MIN_LENGTH} حرف على الأقل`
                    } else if (target.length > TAGLINE_MAX_LENGTH) {
                      tagLineErr.current!.textContent = `شعار الموقع طويل جداً! لا يمكن أن يزيد عن ${TAGLINE_MAX_LENGTH} حرف`
                    } else {
                      tagLineErr.current!.textContent = ''
                    }
                  }}
                  required
                ></textarea>
                <span className='form__label'>
                  {t('app.dashboard.settings.form.tagLine.tagLineText')}
                </span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={tagLineErr}
                ></span>
              </label>

              <h3 className='mx-0 mt-4 mb-12 text-lg text-center'>
                {t('app.dashboard.settings.form.afterOrder.label')}
              </h3>
              <label htmlFor='orderMsg' className='form__group'>
                <textarea
                  name='orderMsg'
                  id='orderMsg'
                  className='form__input'
                  defaultValue={data && data.orderMsg?.Success}
                  minLength={TAGLINE_MIN_LENGTH}
                  maxLength={TAGLINE_MAX_LENGTH * 3}
                  onChange={e => setOrderMsgSuccess(e.target.value.trim())}
                  onKeyUp={e => {
                    const target = (e.target as HTMLTextAreaElement).value.trim()

                    if (target.length > 0 && target.length < TAGLINE_MIN_LENGTH) {
                      orderMsgErr.current!.textContent = `رسالة ما بعد الطلب قصيرة جداً، يجب أن تتكون الرسالة من يتكون من ${TAGLINE_MIN_LENGTH} حرف على الأقل`
                    } else if (target.length > TAGLINE_MAX_LENGTH * 3) {
                      orderMsgErr.current!.textContent = `رسالة ما بعد الطلب طويلة جداً! لا يمكن أن تزيد عن ${TAGLINE_MAX_LENGTH} حرف`
                    } else {
                      orderMsgErr.current!.textContent = ''
                    }
                  }}
                  required
                ></textarea>
                <span className='form__label'>
                  {t('app.dashboard.settings.form.afterOrder.success')}
                </span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={orderMsgErr}
                ></span>
              </label>
              <label htmlFor='orderMsg' className='form__group'>
                <textarea
                  name='orderMsg'
                  id='orderMsg'
                  className='form__input'
                  defaultValue={data && data.orderMsg?.Failure}
                  minLength={TAGLINE_MIN_LENGTH}
                  maxLength={TAGLINE_MAX_LENGTH * 3}
                  onChange={e => setOrderMsgFailure(e.target.value.trim())}
                  onKeyUp={e => {
                    const target = (e.target as HTMLTextAreaElement).value.trim()

                    if (target.length > 0 && target.length < TAGLINE_MIN_LENGTH) {
                      orderMsgErr.current!.textContent = `رسالة ما بعد الطلب قصيرة جداً، يجب أن تتكون الرسالة من يتكون من ${TAGLINE_MIN_LENGTH} حرف على الأقل`
                    } else if (target.length > TAGLINE_MAX_LENGTH * 3) {
                      orderMsgErr.current!.textContent = `رسالة ما بعد الطلب طويلة جداً! لا يمكن أن تزيد عن ${TAGLINE_MAX_LENGTH} حرف`
                    } else {
                      orderMsgErr.current!.textContent = ''
                    }
                  }}
                  required
                ></textarea>
                <span className='form__label'>
                  {t('app.dashboard.settings.form.afterOrder.failure')}
                </span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={orderMsgErr}
                ></span>
              </label>

              <h3 className='mx-0 mt-4 mb-12 text-lg text-center'>
                {t('app.dashboard.settings.form.whatsapp.label')}
              </h3>
              <label htmlFor='whatsAppNumber' className='form__group'>
                <input
                  name='whatsAppNumber'
                  id='instagramAccount'
                  type='text'
                  className='form__input'
                  defaultValue={data && data.instagramAccount}
                  minLength={8}
                  maxLength={8}
                  onChange={e => setWhatsAppNumber(e.target.value.trim())}
                  onKeyUp={e => {
                    const target = (e.target as HTMLInputElement).value.trim()

                    if (target.length > 0 && target.length < 8) {
                      whatsAppNumberErr.current!.textContent = `رقم الوتساب قصير يجب أن يتكون من ٨ أرقام`
                    } else if (target.length > 8) {
                      whatsAppNumberErr.current!.textContent = `رقم الوتساب طويل لا يمكن أن يزيد عن ٨ أرقام`
                    } else {
                      whatsAppNumberErr.current!.textContent = ''
                    }
                  }}
                />
                <span className='pointer-events-none form__label'>
                  {t('app.dashboard.settings.form.whatsapp.whatsappText')}
                </span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={whatsAppNumberErr}
                ></span>
              </label>

              <h3 className='mx-0 mt-4 mb-12 text-lg text-center'>
                {t('app.dashboard.settings.form.instagram.label')}
              </h3>
              <label htmlFor='instagramAccount' className='form__group'>
                <input
                  name='instagramAccount'
                  id='instagramAccount'
                  type='text'
                  className='form__input'
                  defaultValue={data && data.instagramAccount}
                  minLength={TAGLINE_MIN_LENGTH}
                  maxLength={TAGLINE_MAX_LENGTH}
                  onChange={e => setInstagramAccount(e.target.value.trim())}
                  onKeyUp={e => {
                    const target = (e.target as HTMLInputElement).value.trim()

                    if (target.length > 0 && target.length < TAGLINE_MIN_LENGTH) {
                      instagramAccountErr.current!.textContent = `رابط حساب الانستقرام قصير جداً يجب أن يتكون من ${TAGLINE_MIN_LENGTH} حرف على الأقل`
                    } else if (target.length > TAGLINE_MAX_LENGTH) {
                      instagramAccountErr.current!.textContent = `رابط حساب الانستقرام طويل جداً! لا يمكن أن يزيد عن ${TAGLINE_MAX_LENGTH} حرف`
                    } else {
                      instagramAccountErr.current!.textContent = ''
                    }
                  }}
                />
                <span className='pointer-events-none form__label'>
                  {t('app.dashboard.settings.form.instagram.instagramText')}
                </span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={instagramAccountErr}
                ></span>
              </label>

              <h3 className='mx-0 mt-4 mb-12 text-lg text-center'>
                {t('app.dashboard.settings.form.twitter.label')}
              </h3>
              <label htmlFor='twitterAccount' className='form__group'>
                <input
                  name='twitterAccount'
                  id='twitterAccount'
                  type='text'
                  className='form__input'
                  defaultValue={data && data.twitterAccount}
                  minLength={TAGLINE_MIN_LENGTH}
                  maxLength={TAGLINE_MAX_LENGTH}
                  onChange={e => setTwitterAccount(e.target.value.trim())}
                  onKeyUp={e => {
                    const target = (e.target as HTMLInputElement).value.trim()

                    if (target.length > 0 && target.length < TAGLINE_MIN_LENGTH) {
                      twitterAccountErr.current!.textContent = `رابط حساب التويتر قصير جداً، يجب أن يتكون من ${TAGLINE_MIN_LENGTH} حرف على الأقل`
                    } else if (target.length > TAGLINE_MAX_LENGTH) {
                      twitterAccountErr.current!.textContent = `رابط حساب التويتر طويل جداً! لا يمكن أن يزيد عن ${TAGLINE_MAX_LENGTH} حرف`
                    } else {
                      twitterAccountErr.current!.textContent = ''
                    }
                  }}
                />
                <span className='pointer-events-none form__label'>
                  {t('app.dashboard.settings.form.twitter.twitterText')}
                </span>
                <span
                  className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                  ref={twitterAccountErr}
                ></span>
              </label>

              <div className='mx-0 mt-4 mb-6 text-center'>
                <h3 className='mb-10 text-lg'>
                  {t('app.dashboard.settings.form.categories.label')}
                </h3>
                <div className='flex justify-evenly'>
                  <span>{t('app.dashboard.settings.form.categories.nameEn')}</span>
                  <span>{t('app.dashboard.settings.form.categories.nameAr')}</span>
                </div>
              </div>
              {categoryList?.map((categoryItem: string[], idx: number) => (
                <label className='mb-4 space-y-2' key={idx}>
                  <div className='flex gap-4 justify-evenly'>
                    <input
                      type='text'
                      id='category'
                      min='5'
                      max='500'
                      onChange={e => handleInputChange(e, idx, categoryItem[1])}
                      className='w-2/4 px-2 py-1 text-xl text-gray-700 bg-transparent border-2 border-gray-500 border-solid rounded-lg outline-none focus-within:border-orange-500 dark:focus-within:border-gray-400 dark:text-gray-200'
                      dir='auto'
                      name='categoryName'
                      defaultValue={categoryItem[0]}
                      required
                    />
                    <input
                      type='text'
                      id='category'
                      min='5'
                      max='500'
                      onChange={e => handleInputChange(e, idx, categoryItem[0])}
                      className='w-2/4 px-2 py-1 text-xl text-gray-700 bg-transparent border-2 border-gray-500 border-solid rounded-lg outline-none focus-within:border-orange-500 dark:focus-within:border-gray-400 dark:text-gray-200'
                      dir='auto'
                      name='categoryValue'
                      defaultValue={categoryItem[1]}
                      required
                    />
                  </div>
                  <div className='flex gap-4 pb-6'>
                    {categoryList.length !== 1 && (
                      <button
                        type='button'
                        className='px-5 py-2 text-white transition-colors bg-red-500 rounded-lg w-fit hover:bg-red-600'
                        onClick={() => handleRemoveClick(idx)}
                      >
                        -
                      </button>
                    )}
                    {categoryList.length - 1 === idx && (
                      <button
                        type='button'
                        className='px-5 py-2 text-white transition-colors bg-blue-500 rounded-lg w-fit hover:bg-blue-600'
                        onClick={handleAddClick}
                      >
                        +
                      </button>
                    )}
                  </div>
                </label>
              ))}

              <div
                className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                data-form-msg
              ></div>

              <div className='flex items-center justify-evenly'>
                <button
                  type='submit'
                  className='m-2 min-w-[7rem] bg-green-600 hover:bg-green-700 text-white py-1.5 px-6 rounded-md'
                >
                  {isUpdating && isUpdating ? (
                    <>
                      <LoadingSpinner />
                      {t('app.dashboard.settings.form.update.updating')}
                    </>
                  ) : (
                    t('app.dashboard.settings.form.update.label')
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </Layout>
    </>
  )
}

export default Settings
