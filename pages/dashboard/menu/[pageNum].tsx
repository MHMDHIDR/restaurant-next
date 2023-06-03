import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import axios from 'axios'
import useDocumentTitle from 'hooks/useDocumentTitle'
import useEventListener from 'hooks/useEventListener'
import useAuth from 'hooks/useAuth'
import Modal from 'components/Modal/Modal'
import { Success, Error, Loading } from 'components/Icons/Status'
import { LoadingPage, LoadingSpinner } from 'components/Loading'
import Pagination from 'components/Pagination'
import ModalNotFound from 'components/Modal/ModalNotFound'
import NavMenu from 'components/NavMenu'
import Layout from 'components/dashboard/Layout'
import abstractText from 'functions/abstractText'
import { removeSlug } from 'functions/slug'
import goTo from 'functions/goTo'
import { isNumber } from 'functions/isNumber'
import { createLocaleDateString } from 'functions/convertDate'
import scrollToView from 'functions/scrollToView'
import { origin, ITEMS_PER_PAGE, USER } from '@constants'
import { stringJson } from 'functions/jsonTools'
import { ClickableButton } from 'components/Button'
import Add from 'components/Icons/Add'
import { useTranslate } from 'hooks/useTranslate'
import { useLocale } from 'hooks/useLocale'

const DashboardMenu = () => {
  useDocumentTitle('Menu')

  const [delFoodId, setDelFoodId] = useState('')
  const [delFoodName, setDelFoodName] = useState('')
  const [deleteFoodStatus, setDeleteFoodStatus] = useState()
  const [modalLoading, setModalLoading] = useState<boolean>(true)
  const [menuFood, setMenuFood] = useState<any>()
  const { loading, userType } = useAuth()
  const { query } = useRouter()
  const { pageNum }: any = query

  const { t } = useTranslate()
  const { locale } = useLocale()

  const pageNumber =
    !pageNum || !isNumber(pageNum) || pageNum < 1
      ? typeof window !== 'undefined'
        ? parseInt(
            window.location.pathname.split('/')[
              window.location.pathname.split('/').length - 1
            ]
          )
        : 1
      : parseInt(pageNum)

  useEffect(() => {
    axios
      .get(`foods?page=${pageNumber}&limit=${ITEMS_PER_PAGE}&createdAt=-1`)
      .then(({ data }) => setMenuFood(data))
    scrollToView()
  }, [])

  useEventListener('click', (e: any) => {
    if (e.target.id === 'deleteFood') {
      setDelFoodId(e.target.dataset.id)
      setDelFoodName(removeSlug(e.target.dataset.name))
      setModalLoading(true)
    }

    if (e.target.id === 'cancel') {
      setModalLoading(false)
    } else if (e.target.id === 'confirm') {
      handleDeleteFood(delFoodId)
    }
  })

  const handleDeleteFood = async (
    foodId: string,
    foodImgs?: { foodImgDisplayPath: string; foodImgDisplayName: string }[]
  ) => {
    const prevFoodImgPathsAndNames = [
      ...foodImgs!.map(({ foodImgDisplayPath, foodImgDisplayName }) => {
        return {
          foodImgDisplayPath,
          foodImgDisplayName
        }
      })
    ]
    //Using FormData to send constructed data
    const formData = new FormData()
    formData.append('prevFoodImgPathsAndNames', stringJson(prevFoodImgPathsAndNames))
    try {
      //You need to name the body {data} so it can be recognized in (.delete) method
      const response = await axios.delete(`${origin}/api/foods/${foodId}`, {
        data: formData
      })
      const { foodDeleted } = response.data
      setDeleteFoodStatus(foodDeleted)
      //Remove waiting modal
      setTimeout(() => {
        setModalLoading(false)
      }, 300)
    } catch (err) {
      console.error(err)
    }
  }

  return loading || !userType ? (
    <LoadingPage />
  ) : userType !== 'admin' || (USER && USER?.userAccountType !== 'admin') ? (
    <ModalNotFound btnLink='/dashboard' btnName='لوحة التحكم' />
  ) : (
    <>
      {deleteFoodStatus === 1 ? (
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
          redirectLink={goTo('menu')}
          redirectTime={3500}
        />
      ) : null}

      <Layout>
        <section className='py-12 my-8 dashboard'>
          <div className='container mx-auto'>
            {/* Confirm Box */}

            {modalLoading && (
              <Modal
                status={Loading}
                modalHidden='hidden'
                classes='text-blue-600 dark:text-blue-400 text-lg'
                msg={`هل أنت متأكد من حذف ${delFoodName} ؟ لا يمكن التراجع عن هذا القرار`}
                ctaConfirmBtns={['حذف', 'الغاء']}
              />
            )}

            <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
              {t('app.dashboard.menuPage.title')}
            </h3>

            <Link href={goTo('food/add')}>
              <ClickableButton>
                <>
                  <Add className={`inline-flex ${locale === 'ar' ? 'ml-4' : 'mr-4'}`} />
                  <span>{t('app.dashboard.menuPage.add')}</span>
                </>
              </ClickableButton>
            </Link>
            <table className='table w-full text-center'>
              <thead className='text-white bg-orange-800'>
                <tr>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.menuPage.itemsTable.columns.order')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.menuPage.itemsTable.columns.image')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.menuPage.itemsTable.columns.name')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.menuPage.itemsTable.columns.desc')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.menuPage.itemsTable.columns.price')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.menuPage.itemsTable.columns.lastUpdate')}
                  </th>
                  <th className='px-1 py-2'>
                    {t('app.dashboard.menuPage.itemsTable.columns.actions')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {menuFood?.response?.length > 0 ? (
                  <>
                    {menuFood?.response?.map((item: any, idx: number) => (
                      <tr
                        key={item._id}
                        className='transition-colors even:bg-gray-200 odd:bg-gray-300 dark:even:bg-gray-600 dark:odd:bg-gray-700'
                      >
                        <td className='px-1 py-2 font-bold'>{idx + 1}</td>
                        <td className='px-1 py-2 pr-3 min-w-[5rem]'>
                          <Image
                            loading='lazy'
                            height={56}
                            width={56}
                            src={item.foodImgs[0]?.foodImgDisplayPath}
                            alt={item.foodName}
                            className='object-cover mx-auto rounded-lg shadow-md h-14 w-14'
                          />
                        </td>
                        <td className='px-1 py-2'>
                          {typeof window !== 'undefined' && window.innerWidth < 1360
                            ? abstractText(removeSlug(item.foodName), 10)
                            : removeSlug(item.foodName)}
                        </td>
                        <td className='px-1 py-2'>
                          <p>
                            {typeof window !== 'undefined' && window.innerWidth < 1200
                              ? abstractText(item.foodDesc, 20)
                              : item.foodDesc}
                          </p>
                        </td>
                        <td className='px-1 py-2 min-w-[5.5rem]'>
                          <span>
                            <strong className='inline-block m-2 text-xl text-green-700 dark:text-green-400'>
                              {item.foodPrice}
                            </strong>
                            {t('app.currency')}
                          </span>
                        </td>
                        <td className='px-1 py-2 min-w-[16rem]'>
                          {createLocaleDateString(item.updatedAt)}
                        </td>
                        <td className='px-1 py-2'>
                          <NavMenu label={`${locale === 'ar' ? 'الإجراء' : 'Action'}`}>
                            <Link
                              href={goTo(`food/edit/${item._id}`)}
                              className='px-4 py-1 mx-2 text-white bg-green-600 rounded-md hover:bg-green-700'
                            >
                              {t('app.foodItem.edit')}
                            </Link>
                            <button
                              id='deleteFood'
                              data-id={item._id}
                              data-name={item.foodName}
                              data-imgname={stringJson(item.foodImgs)}
                              className='px-4 py-1 mx-2 text-white bg-red-600 rounded-md hover:bg-red-700'
                            >
                              {t('app.foodItem.remove')}
                            </button>
                          </NavMenu>
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td colSpan={100}>
                        <Pagination
                          routeName={`dashboard/menu`}
                          pageNum={pageNumber}
                          numberOfPages={menuFood?.numberOfPages}
                          count={menuFood?.itemsCount}
                          foodId={menuFood?.response?._id}
                          itemsPerPage={ITEMS_PER_PAGE}
                        />
                      </td>
                    </tr>
                  </>
                ) : !menuFood?.response ? (
                  <tr>
                    <td />
                    <td />
                    <td />
                    <td className='flex justify-center py-10'>
                      <LoadingSpinner size='10' />
                    </td>
                    <td />
                    <td />
                  </tr>
                ) : (
                  <tr>
                    <td />
                    <td />
                    <td />
                    <td className='flex flex-col px-1 py-2'>
                      <p className='my-2 md:text-2xl text-red-600 dark:text-red-400 font-[600] py-2 px-1'>
                        عفواً، لم يتم العثور على أي وجبات
                      </p>
                      <div className='flex justify-center gap-4'>
                        <Link
                          href={goTo('food/add')}
                          className='min-w-[7rem] bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-6 rounded-md'
                        >
                          إضافة وجبة
                        </Link>
                        <Link
                          href={goTo('dashboard')}
                          className='min-w-[7rem] bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-6 rounded-md'
                        >
                          لوحة التحكم
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </Layout>
    </>
  )
}

export default DashboardMenu
