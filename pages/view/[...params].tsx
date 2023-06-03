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
import { isNumber } from 'functions/isNumber'
import { useTranslate } from 'hooks/useTranslate'
import { useLocale } from 'hooks/useLocale'

const ViewFood = ({ viewFood }: any) => {
  useDocumentTitle('View Foods')

  const [data, setData] = useState<any>()
  const {
    asPath,
    query: { params }
  }: any = useRouter()

  const loaction = (splitBy: number) =>
    asPath.split('/')[asPath.split('/').length - splitBy]
  const category =
    loaction(2) !== 'view' ? loaction(2) : !isNumber(params[0]) && loaction(1)

  const pageNumber = isNumber(params[0])
    ? parseInt(params[0])
    : params[1]
    ? parseInt(params[1])
    : 1

  const { items } = useContext(CartContext)

  useEffect(() => {
    scrollToView()
    setData(viewFood)
  }, [viewFood])

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
                loaction={loaction(2)}
                category={category}
              />
            </Suspense>
          ) : (
            <div className='flex flex-col items-center justify-center text-base text-center lg:text-xl 2xl:text-3xl gap-14'>
              <span className='my-2 font-bold text-red-500'>
                {t('app.viewPage.item.notFound')}
              </span>
              <Link
                href={`/${locale}`}
                className='px-3 py-1 text-orange-800 transition-colors bg-orange-100 border border-orange-700 rounded hover:bg-orange-200'
              >
                {t('app.viewPage.item.returnToHome')}
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

export async function getServerSideProps({ query: { params } }: any) {
  const categoriesURL = `${API_URL}/settings`
  const { response } = await fetch(categoriesURL).then(viewFood => viewFood.json())

  const isCategory = response[0].CategoryList.map((c: string[]) => c[0]).includes(
    params[0]
  )
  const pageNum =
    !params[0] || params[0] < 1 || isNaN(params[0]) ? 1 : parseInt(params[0])
  const pageNumWithCat =
    !params[1] || params[1] < 1 || isNaN(params[1]) ? 1 : parseInt(params[1])

  const URL = `${API_URL}/foods?page=${
    isCategory ? pageNumWithCat : pageNum
  }&limit=${ITEMS_PER_PAGE}${isCategory && `&category=${params[0]}`}`

  const viewFood = await fetch(URL).then(viewFood => viewFood.json())
  return { props: { viewFood } }
}

export default ViewFood
