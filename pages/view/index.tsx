import { useState, useEffect, useContext, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { LoadingCard } from 'components/Loading'
import Layout from 'components/Layout'
import Card from 'components/Card'
import Pagination from 'components/Pagination'
import { CartContext } from 'contexts/CartContext'
import useDocumentTitle from 'hooks/useDocumentTitle'
import abstractText from 'functions/abstractText'
import { removeSlug } from 'functions/slug'
import scrollToView from 'functions/scrollToView'
import { foodDataProps } from '@types'
import { API_URL, ITEMS_PER_PAGE } from '@constants'
import { useTranslate } from 'hooks/useTranslate'
import { useLocale } from 'hooks/useLocale'

const ViewFood = ({ viewFood }: any) => {
  useDocumentTitle('View Foods')
  useEffect(() => {
    scrollToView()
  }, [])

  const [data, setData] = useState<any>()
  const { pathname, query } = useRouter()
  let { pageNum }: any = query
  const loaction = pathname.split('/')[pathname.split('/').length - 2]
  const category = loaction !== 'view' ? loaction : ''
  const pageNumber = !pageNum || pageNum < 1 || isNaN(pageNum) ? 1 : parseInt(pageNum)

  useEffect(() => {
    setData(viewFood)
  }, [viewFood])

  const { items } = useContext(CartContext)

  const { t } = useTranslate()
  const { locale } = useLocale()

  return (
    <Layout>
      <section id='viewFood' className='py-12 my-8'>
        <div className='container mx-auto'>
          <h2 className='text-xl font-bold text-center mb-28 md:text-2xl'>
            {!data?.response?.length
              ? //single food item (Title)
                data?.response && (
                  <Link href={`/view/item/${data?.response?._id}`}>
                    {removeSlug(data?.response?.foodName)}
                  </Link>
                )
              : t('app.viewPage.title')}
          </h2>

          {data !== undefined && data?.response?.length > 0 ? (
            <Suspense fallback={<LoadingCard />}>
              {data?.response?.map((item: foodDataProps['response']) => (
                // View Multiple (Many) food items
                <motion.div
                  key={String(item._id)}
                  initial={{ x: '50vw', opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: 'spring',
                    duration: 3
                  }}
                >
                  <Card
                    cItemId={item._id}
                    cHeading={
                      <Link href={`/view/item/${item._id}`}>
                        {removeSlug(abstractText(item.foodName, 70))}
                      </Link>
                    }
                    cPrice={item.foodPrice}
                    cCategory={item.category}
                    cDesc={abstractText(item.foodDesc, 120)}
                    cTags={item?.foodTags}
                    cToppings={item.foodToppings}
                    cImg={item.foodImgs}
                    cImgAlt={item.foodName}
                    cCtaLabel={
                      //add to cart button, if item is already in cart then disable the button
                      items.find(itemInCart => itemInCart.cItemId === item._id) ? (
                        <div className='relative rtl min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-red-800 hover:bg-red-700'>
                          <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                            ❌
                          </span>
                          &nbsp;&nbsp;
                          <span className='mr-4 text-center pointer-events-none'>
                            {t('app.foodItem.removeFromCart')}
                          </span>
                        </div>
                      ) : (
                        <div className='relative rtl min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-green-800 hover:bg-green-700'>
                          <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                            🛒
                          </span>
                          &nbsp;&nbsp;
                          <span className='mr-4 text-center pointer-events-none'>
                            {t('app.foodItem.addToCart')}
                          </span>
                        </div>
                      )
                    }
                  />
                </motion.div>
              ))}

              <Pagination
                routeName={`view`}
                pageNum={pageNumber}
                numberOfPages={data?.numberOfPages}
                count={data?.itemsCount}
                foodId={data?.response?._id}
                itemsPerPage={ITEMS_PER_PAGE}
                loaction={loaction}
                category={category}
              />
            </Suspense>
          ) : (
            <div className='flex flex-col items-center justify-center text-base text-center lg:text-xl 2xl:text-3xl gap-14'>
              <span className='my-2 font-bold text-red-500'>
                عفواً! لم يتم العثور على الوجبة المطلوبة &nbsp;&nbsp;&nbsp; 😥
              </span>
              <Link
                href={`/${locale}`}
                className='px-3 py-1 text-orange-800 transition-colors bg-orange-100 border border-orange-700 rounded hover:bg-orange-200'
              >
                يمكنك العودة للصفحة الرئيسية
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

export async function getServerSideProps() {
  const URL = `${API_URL}/foods?page=1&limit=${ITEMS_PER_PAGE}`
  const viewFood = await fetch(URL).then(viewFood => viewFood.json())
  return { props: { viewFood } }
}

export default ViewFood
