import { useState, useEffect, useRef, useContext, ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import Axios from 'axios'

import { TagsContext } from '../../../Contexts/TagsContext'
import { FileUploadContext } from '../../../Contexts/FileUploadContext'

import useDocumentTitle from '../../../hooks/useDocumentTitle'
import useEventListener from '../../../hooks/useEventListener'
import useAxios from '../../../hooks/useAxios'

import Modal from '../../../components/Modal/Modal'
import { Success, Error, Loading } from '../../../components/Icons/Status'
import AddTags from '../../../components/AddTags'
import { LoadingCard } from '../../../components/Loading'
import FileUpload from '../../../components/FileUpload'

import { removeSlug, createSlug } from '../../../utils/slug'
import goTo from '../../../utils/goTo'
import scrollToView from '../../../utils/scrollToView'

const EditFood = () => {
  useDocumentTitle('Edit Food')

  useEffect(() => {
    scrollToView()
  }, [])

  const [delFoodName, setDelFoodName] = useState('')
  const [action, setAction] = useState('')
  const [delFoodImg, setDelFoodImg] = useState()
  const [data, setData] = useState<any>()
  const [categoryList, setCategoryList] = useState([])
  const [toppings, setToppings] = useState([])
  const [deleteFoodStatus, setDeleteFoodStatus] = useState()
  const [deleteImgStatus, setDeleteImgStatus] = useState()

  //Form States
  const [foodName, setFoodName] = useState('')
  const [foodPrice, setFoodPrice] = useState('')
  const [category, setCategory] = useState([])
  const [foodDesc, setFoodDesc] = useState('')

  const [updatedFoodStatus, setUpdatedFoodStatus] = useState()
  const [loadingMsg, setLoadingMsg] = useState('')
  const [hasConfirmBtns, setHasConfirmBtn] = useState(false)

  //Contexts
  const { tags, setTags } = useContext(TagsContext)
  const { file } = useContext(FileUploadContext)

  //Form errors messages
  const ImgErr = useRef<HTMLSpanElement>(null)
  const foodNameErr = useRef<HTMLSpanElement>(null)
  const priceErr = useRef<HTMLSpanElement>(null)
  const descErr = useRef<HTMLSpanElement>(null)
  const formMsg = useRef<HTMLDivElement>(null)

  const modalLoading = document.querySelector('#modal')
  const API_URL =
    process.env.NODE_ENV === 'development'
      ? process.env.API_LOCAL_URL
      : process.env.API_URL

  const { foodId } = useParams()

  const foodData = useAxios({ url: `/foods/1/1/${foodId}` })

  //fetching categories
  const categories = useAxios({ url: '/settings' })

  useEffect(() => {
    if (foodData?.response?.response !== null && categories?.response !== null) {
      setData(foodData?.response?.response)
      setCategoryList(categories?.response?.CategoryList)
      setToppings(foodData?.response?.response?.foodToppings)
    }
  }, [foodData?.response?.response, categories?.response])

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: string | number
  ) => {
    const { name, value } = e.target
    const newToppings = [...toppings]
    newToppings[index][name] = value
    setToppings(newToppings)
  }

  const handleAddClick = () => {
    setToppings([...toppings, {}])
  }

  const handleRemoveClick = (index: number) => {
    const list = [...toppings]
    list.splice(index, 1)
    setToppings(list)
  }

  useEffect(() => {
    data && setTags(data?.foodTags)
  }, [data, setTags])

  const handleUpdateFood = async (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'Enter') {
      //don't submit the form if Enter is pressed
      e.preventDefault()
    } else {
      e.preventDefault()
      //initial form values if no value was updated taking it from [0] index
      const currentFoodId = data?._id
      const currentFoodName = data?.foodName
      const currentFoodPrice = data?.foodPrice
      const currentCategory = data?.category
      const currentFoodDesc = data?.foodDesc
      const prevFoodImgPathsAndNames = [
        ...data?.foodImgs.map(({ foodImgDisplayPath, foodImgDisplayName }) => {
          return {
            foodImgDisplayPath,
            foodImgDisplayName
          }
        })
      ]

      //using FormData to send constructed data
      const formData = new FormData()
      formData.append('foodId', currentFoodId)
      formData.append('foodName', foodName || currentFoodName)
      formData.append('foodPrice', foodPrice || currentFoodPrice)
      formData.append('category', category[0] || currentCategory)
      formData.append('foodDesc', foodDesc || currentFoodDesc)
      toppings[0].toppingName === ''
        ? formData.append(
            'foodToppings',
            JSON.stringify([
              {
                toppingName: {},
                toppingPrice: {}
              }
            ])
          )
        : typeof toppings[0].toppingName === 'string' &&
          formData.append('foodToppings', JSON.stringify(toppings))
      formData.append('foodTags', JSON.stringify(tags))
      file.map(foodImg => formData.append('foodImg', foodImg))
      formData.append(
        'prevFoodImgPathsAndNames',
        JSON.stringify(prevFoodImgPathsAndNames)
      )

      if (
        ImgErr.current.textContent === '' &&
        foodNameErr.current.textContent === '' &&
        priceErr.current.textContent === '' &&
        descErr.current.textContent === ''
      ) {
        try {
          setLoadingMsg(`جار تحديث ${foodName}`)
          //show waiting modal
          modalLoading.classList.remove('hidden')
          const response = await Axios.patch(
            `${API_URL}/foods/${currentFoodId}`,
            formData
          )

          const { foodUpdated } = response.data

          setUpdatedFoodStatus(foodUpdated)
          //Remove waiting modal
          setTimeout(() => {
            modalLoading.classList.add('hidden')
          }, 300)
        } catch (err) {
          console.error(err)
        }
      } else {
        formMsg.current.textContent =
          'الرجاء إضافة البيانات بشكل صحيح لتستطيع تحديث البيانات 😃'
      }
    }
  }

  const handleDeleteFood = async (foodId, foodImgs = data?.foodImgs) => {
    const prevFoodImgPathsAndNames = [
      ...foodImgs.map(({ foodImgDisplayPath, foodImgDisplayName }) => {
        return {
          foodImgDisplayPath,
          foodImgDisplayName
        }
      })
    ]
    //Using FormData to send constructed data
    const formData = new FormData()
    formData.append('prevFoodImgPathsAndNames', JSON.stringify(prevFoodImgPathsAndNames))
    try {
      //You need to name the body {data} so it can be recognized in (.delete) method
      const response = await Axios.delete(`${API_URL}/foods/${foodId}`, {
        data: formData
      })
      const { foodDeleted } = response.data
      setDeleteFoodStatus(foodDeleted)
      //Remove waiting modal
      setTimeout(() => {
        modalLoading.classList.add('hidden')
      }, 300)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteImg = async (foodId, foodImg) => {
    try {
      //You need to name the body {data} so it can be recognized in (.delete) method
      const response = await Axios.delete(`${API_URL}/foods/${foodId}/${foodImg}`)
      const { ImgDeleted } = response.data
      setDeleteImgStatus(ImgDeleted)
      //Remove waiting modal
      setTimeout(() => {
        modalLoading.classList.add('hidden')
      }, 300)
    } catch (err) {
      console.error(err)
    }
  }

  useEventListener('click', (e: any) => {
    if (e.target.id === 'deleteImg') {
      setAction('deleteImg')
      setHasConfirmBtn(true)
      setLoadingMsg(`هل أنت متأكد من حذف الصورة لا يمكن التراجع عن هذا القرار`)
      setDelFoodImg(e.target.dataset.imgName)
      modalLoading.classList.remove('hidden')
    }

    if (e.target.id === 'deleteFood') {
      setAction('deleteFood')
      setDelFoodName(removeSlug(e.target.dataset.name))
      setHasConfirmBtn(true)
      setLoadingMsg(
        `هل أنت متأكد من حذف المنتج ${removeSlug(
          e.target.dataset.name
        )} ؟ لا يمكن التراجع عن هذا القرار`
      )
      modalLoading.classList.remove('hidden')
    }

    if (e.target.id === 'cancel') {
      modalLoading.classList.add('hidden')
    } else if (e.target.id === 'confirm') {
      action === 'deleteImg'
        ? handleDeleteImg(data?._id, delFoodImg)
        : handleDeleteFood(data?._id, data?.foodImgs)
    }
  })

  return (
    <>
      {updatedFoodStatus === 1 ? (
        <Modal
          status={Success}
          msg={`تم تحديث بيانات ${removeSlug(
            data?.foodName
          )} بنجاح   😄   الرجاء الانتظار ليتم تحويلك لقائمة الوجبات والمشروبات`}
          redirectLink={goTo('menu')}
          redirectTime={3500}
        />
      ) : updatedFoodStatus === 0 ? (
        <Modal
          status={Error}
          msg='حدث خطأ ما أثناء تحديث بيانات الوجبة!'
          redirectLink={goTo(`edit-food/${data?._id}`)}
          redirectTime={3500}
        />
      ) : deleteImgStatus === 1 ? (
        <Modal
          status={Success}
          msg={`تم حذف الصورة بنجاح 😄`}
          redirectLink={goTo(`edit-food/${data?._id}`)}
          redirectTime={3500}
        />
      ) : deleteImgStatus === 0 ? (
        <Modal
          status={Error}
          msg='حدث خطأ ما أثناء حذف الصورة!'
          redirectLink={goTo(`edit-food/${data?._id}`)}
          redirectTime={3500}
        />
      ) : deleteFoodStatus === 1 ? (
        <Modal
          status={Success}
          msg={`تم حذف ${delFoodName} بنجاح 😄 الرجاء الانتظار ليتم تحويلك لقائمة الوجبات`}
          redirectLink={goTo('menu')}
          redirectTime={3500}
        />
      ) : deleteFoodStatus === 0 ? (
        <Modal
          status={Error}
          msg={`حدث خطأ ما أثناء حذف ${delFoodName}!`}
          redirectLink={goTo(`edit-food/${data?._id}`)}
          redirectTime={3500}
        />
      ) : null}

      <section className='py-12 my-8 dashboard'>
        <div className='container mx-auto'>
          {/* Confirm Box */}
          <Modal
            status={Loading}
            modalHidden='hidden'
            classes='text-blue-600 dark:text-blue-400 text-lg'
            msg={loadingMsg}
            ctaConfirmBtns={hasConfirmBtns && ['حذف', 'الغاء']}
          />

          <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
            تعديل وجبة أو مشروب
          </h3>

          <div className='dashboard__food__form edit'>
            <div className='food'>
              {data && data !== undefined ? (
                <form key={data?._id} className='form' encType='multipart/form-data'>
                  <div className='flex flex-col items-center justify-center gap-4 mb-8 sm:justify-between'>
                    <FileUpload
                      data={{
                        foodId: data?._id,
                        defaultImg: data?.foodImgs,
                        foodName: data?.foodName
                      }}
                    />

                    <span
                      className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                      ref={ImgErr}
                    ></span>
                  </div>

                  <label htmlFor='foodName' className='form__group'>
                    <input
                      type='text'
                      id='foodName'
                      className='form__input'
                      defaultValue={removeSlug(data?.foodName)}
                      autoFocus
                      onChange={e => setFoodName(createSlug(e.target.value.trim()))}
                      onKeyUp={e => {
                        const target = e.target.value.trim()

                        if (target.length > 0 && target.length < 5) {
                          foodNameErr.current.textContent =
                            'إسم الوجبة أو المشروب صغير ولا يوصف'
                        } else if (target.length > 30) {
                          foodNameErr.current.textContent =
                            'الاسم لا يمكن أن يزيد عن 30 حرفاً، يمكنك إضافة وصف طويل إذا كنت تحتاج لذلك'
                        } else {
                          foodNameErr.current.textContent = ''
                        }
                      }}
                    />
                    <span className='form__label'>اسم الوجبة أو المشروب</span>
                    <span
                      className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                      ref={foodNameErr}
                    ></span>
                  </label>

                  <label htmlFor='foodPrice' className='form__group'>
                    <input
                      type='number'
                      id='foodPrice'
                      className='form__input'
                      min='5'
                      max='500'
                      onChange={e => setFoodPrice(e.target.value.trim())}
                      onKeyUp={e => {
                        const target = parseInt(e.target.value.trim())

                        if (target > 0 && target < 5) {
                          priceErr.current.textContent = `سعر الوجبة أو المشروب يجب أن لا يقل عن 5 ريال`
                        } else if (target > 500) {
                          priceErr.current.textContent = `سعر الوجبة أو المشروب يجب أن لا يزيد عن 500 ريال`
                        } else {
                          priceErr.current.textContent = ''
                        }
                      }}
                      defaultValue={data?.foodPrice}
                    />
                    <span className='form__label'>السعر (ر.ق)</span>
                    <span
                      className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                      ref={priceErr}
                    ></span>
                  </label>

                  <label htmlFor='category' className='form__group'>
                    <select
                      id='category'
                      className='form__input'
                      required
                      onChange={e =>
                        setCategory([
                          e.target.value.trim(),
                          e.target.options[e.target.selectedIndex].textContent
                        ])
                      }
                      defaultValue={data?.category}
                    >
                      <option value=''>اختر التصنيف</option>
                      {categoryList?.map((category, idx) => (
                        <option key={idx} value={category[0]}>
                          {category[1]}
                        </option>
                      ))}
                    </select>
                    <span className='form__label active'>التصنيف</span>
                  </label>

                  <label htmlFor='foodDescription' className='form__group'>
                    <textarea
                      name='foodDescription'
                      id='foodDescription'
                      className='form__input'
                      minLength={10}
                      maxLength={300}
                      onChange={e => setFoodDesc(e.target.value.trim())}
                      onKeyUp={e => {
                        const target = e.target.value.trim()

                        if (target.length > 0 && target.length < 30) {
                          descErr.current.textContent = `الوصف صغير ولا يكفي أن يصف العنصر المضاف`
                        } else if (target.length > 300) {
                          descErr.current.textContent = `الوصف لا يمكن أن يزيد عن 300 حرف`
                        } else {
                          descErr.current.textContent = ''
                        }
                      }}
                      defaultValue={data?.foodDesc}
                    ></textarea>
                    <span className='form__label'>وصف الوجبة</span>
                    <span
                      className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'
                      ref={descErr}
                    ></span>
                  </label>

                  <label htmlFor='foodTags' className='form__group'>
                    <AddTags inputId='foodTags' />
                    <span className='form__label'>
                      علامات تصنيفية تساعد في عملية البحث عن الوجبة (Tags) - هذا الحقل
                      اختياري
                    </span>
                  </label>

                  <div className='mx-0 mt-4 mb-6 text-center'>
                    <h3 className='mb-10 text-xl'>الإضافات - Toppings (اختياري)</h3>
                    <div className='flex justify-around'>
                      <span className='text-xl'>الإضافة</span>
                      <span className='text-xl'>السعر (ر.ق)</span>
                    </div>
                  </div>
                  {toppings?.map(({ toppingName, toppingPrice }, idx) => (
                    <label className='block space-y-2' key={idx}>
                      <div className='flex gap-4 justify-evenly'>
                        <input
                          type='text'
                          id='toppingName'
                          min='5'
                          max='500'
                          className='w-2/4 p-3 text-xl text-gray-700 bg-transparent border-2 border-gray-500 border-solid rounded-lg outline-none focus-within:border-orange-500 dark:focus-within:border-gray-400 dark:text-gray-200'
                          dir='auto'
                          name='toppingName'
                          defaultValue={
                            typeof toppingName === 'string' ? toppingName : ''
                          }
                          onChange={e => handleInputChange(e, idx)}
                        />
                        <input
                          type='number'
                          id='toppingPrice'
                          min='1'
                          max='500'
                          className='w-2/4 p-3 text-xl text-gray-700 bg-transparent border-2 border-gray-500 border-solid rounded-lg outline-none focus-within:border-orange-500 dark:focus-within:border-gray-400 dark:text-gray-200 rtl'
                          dir='auto'
                          name='toppingPrice'
                          defaultValue={
                            typeof toppingPrice === 'string' ? toppingPrice : ''
                          }
                          onChange={e => handleInputChange(e, idx)}
                        />
                      </div>
                      <div className='flex gap-4 pb-6'>
                        {toppings.length !== 1 && (
                          <button
                            type='button'
                            data-tooltip='حذف الإضافة'
                            className='px-5 py-2 text-white transition-colors bg-red-500 rounded-lg w-fit hover:bg-red-600'
                            onClick={() => handleRemoveClick(idx)}
                          >
                            -
                          </button>
                        )}
                        {toppings.length - 1 === idx && (
                          <button
                            type='button'
                            data-tooltip='إضافة جديدة'
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
                    className='my-14 inline-block md:text-2xl text-red-600 dark:text-red-400 font-[600] py-2 px-1'
                    ref={formMsg}
                  ></div>

                  <div className='flex items-center justify-evenly'>
                    <button
                      id='updateFood'
                      className='min-w-[7rem] bg-green-600 hover:bg-green-700 text-white py-1.5 px-6 rounded-md'
                      onClick={(e: any) => handleUpdateFood(e)}
                    >
                      تحديث
                    </button>
                    <button
                      id='deleteFood'
                      type='button'
                      data-name={data?.foodName}
                      data-imgname={data?.foodImgDisplayName}
                      className='min-w-[7rem] bg-red-600 hover:bg-red-700 text-white py-1.5 px-6 rounded-md'
                    >
                      حذف
                    </button>
                  </div>
                </form>
              ) : data?.itemsCount === undefined ? (
                <div className='flex flex-col items-center gap-8 text-lg justify-evenly'>
                  <p className='inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'>
                    عفواً، لم يتم العثور على الوجبة &nbsp;&nbsp; 😕
                  </p>
                  <Link
                    to={goTo('dashboard')}
                    className='px-3 py-1 text-orange-800 transition-colors bg-orange-100 border border-orange-700 rounded hover:bg-orange-200'
                  >
                    أرجع الى للوحة التحكم
                  </Link>
                </div>
              ) : !data || !data === null ? (
                <LoadingCard />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default EditFood
