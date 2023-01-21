import { useState, useEffect, useContext, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CartContext } from '../../contexts/CartContext'
import useAxios from '../../hooks/useAxios'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import abstractText from '../../utils/functions/abstractText'
import { removeSlug } from '../../utils/functions/slug'
import scrollToView from '../../utils/functions/scrollToView'
import { viewFoodDataProps } from '../../types'
import { ITEMS_PER_PAGE } from '../../constants'
import ModalNotFound from '../../components/Modal/ModalNotFound'
import Card from '../../components/Card'
import Pagination from '../../components/Pagination'
import Layout from '../../components/Layout'

const ViewFood = () => {
  useDocumentTitle('View Foods')

  useEffect(() => {
    scrollToView()
  }, [])

  const { pathname, query } = useRouter()
  let { pageNum, foodId }: any = query

  const loaction = pathname.split('/')[pathname.split('/').length - 2]
  const category = loaction !== 'view' && loaction

  const pageNumber = !pageNum || pageNum < 1 || isNaN(pageNum) ? 1 : parseInt(pageNum)

  const [data, setData] = useState<any>()

  //if there's food id then fetch with food id, otherwise fetch everything
  const { error, ...response } = useAxios({
    url: foodId
      ? `/foods/1/1/${foodId}`
      : category
      ? `/foods/${pageNumber}/${ITEMS_PER_PAGE}?category=${category}`
      : `/foods/${pageNumber}/${ITEMS_PER_PAGE}`
  })

  useEffect(() => {
    if (response.response !== null) {
      setData(response.response)
    }
  }, [response.response])

  const { items } = useContext(CartContext)

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
              : 'عرض الوجبات'}
          </h2>

          {data ?? data !== undefined ? (
            // if data.length gives a number that means there are Multiple food items
            data?.response?.length > 0 ? (
              <>
                {data?.response?.map((item: viewFoodDataProps, idx: number) => (
                  // View Multiple (Many) food items
                  <motion.div
                    key={item._id}
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
                          <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-red-800 hover:bg-red-700'>
                            <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                              ❌
                            </span>
                            &nbsp;&nbsp;
                            <span className='mr-4 text-center pointer-events-none'>
                              إحذف من السلة
                            </span>
                          </div>
                        ) : (
                          <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-green-800 hover:bg-green-700'>
                            <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                              🛒
                            </span>
                            &nbsp;&nbsp;
                            <span className='mr-4 text-center pointer-events-none'>
                              أضف إلى السلة
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
              </>
            ) : data?.response?.length === 0 ? (
              <ModalNotFound />
            ) : (
              <Card
                key={data?.response?._id}
                cItemId={data?.response?._id}
                cHeading={
                  <Link href={`/view/item/${data?.response?._id}`}>
                    {removeSlug(data?.response?.foodName)}
                  </Link>
                }
                cPrice={data?.response?.foodPrice}
                cCategory={data?.response?.category}
                cDesc={data?.response?.foodDesc}
                cTags={data?.response?.foodTags}
                cToppings={data?.response?.foodToppings}
                cImg={data?.response?.foodImgs}
                cImgAlt={data?.response?.foodName}
                cCtaLabel={
                  //add to cart button, if item is already in cart then disable the button
                  items.find(
                    (itemInCart: { cItemId: string }) =>
                      itemInCart.cItemId === data?.response?._id
                  ) ? (
                    <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-red-800 hover:bg-red-700'>
                      <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                        ❌
                      </span>
                      &nbsp;&nbsp;
                      <span className='mr-4 text-center pointer-events-none'>
                        إحذف من السلة
                      </span>
                    </div>
                  ) : (
                    <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-green-800 hover:bg-green-700'>
                      <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                        🛒
                      </span>
                      &nbsp;&nbsp;
                      <span className='mr-4 text-center pointer-events-none'>
                        أضف إلى السلة
                      </span>
                    </div>
                  )
                }
              />
            )
          ) : (
            <div className='flex flex-col items-center justify-center text-base text-center lg:text-xl 2xl:text-3xl gap-14'>
              <span className='my-2 font-bold text-red-500'>
                عفواً! لم يتم العثور على الوجبة المطلوبة &nbsp;&nbsp;&nbsp; 😥
              </span>
              <Link
                href='/'
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

export default ViewFood
