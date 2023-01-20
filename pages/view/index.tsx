import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { viewFoodDataProps } from '../../types'
import { CartContext } from '../../contexts/CartContext'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import scrollToView from '../../utils/functions/scrollToView'
import abstractText from '../../utils/functions/abstractText'
import { removeSlug } from '../../utils/functions/slug'
import ModalNotFound from '../../components/Modal/ModalNotFound'
import Card from '../../components/Card'
import Layout from '../../components/Layout'
import Pagination from '../../components/Pagination'
import { API_URL, ITEMS_PER_PAGE } from '../../constants'
import { ObjectId } from 'mongoose'

const index = ({ viewFood }: any) => {
  useDocumentTitle('View Foods')

  useEffect(() => {
    scrollToView()
  }, [])

  const [data, setData] = useState<any>()

  useEffect(() => {
    if (viewFood.response !== null) {
      setData(viewFood.response)
    }
  }, [viewFood.response])

  const { items } = useContext(CartContext)

  return (
    <Layout>
      <section id='viewFood' className='py-12 my-8'>
        <div className='container mx-auto'>
          <h2 className='text-xl font-bold text-center mb-28 md:text-2xl'>عرض الوجبات</h2>
          {data?.length > 0 ? (
            <>
              {data?.map((item: viewFoodDataProps) => (
                <motion.div
                  key={item._id + ''}
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
                      items.find(
                        (itemInCart: { cItemId: ObjectId }) =>
                          itemInCart.cItemId === item._id
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
                </motion.div>
              ))}

              {/*
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
              */}
            </>
          ) : data?.length === 0 ? (
            <ModalNotFound />
          ) : null}
        </div>
      </section>
    </Layout>
  )
}

export const getServerSideProps = async () => {
  const fetchURLs = {
    new: `${API_URL}/foods?page=1&limit=${ITEMS_PER_PAGE}`
  }

  const viewFood = await fetch(fetchURLs.new).then(viewFood => viewFood.json())

  return {
    props: { viewFood }
  }
}

export default index
