import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// import { CartContext } from '../Contexts/CartContext'

// import useAxios from '../hooks/useAxios'

import abstractText from '../utils/functions/abstractText'
import { removeSlug } from '../utils/functions/slug'

import Card from './Card'
import { LoadingCard } from './Loading'
import { viewFoodDataProps } from '../types'

const NewFood = () => {
  const [data, setData] = useState<any>()

  // const { ...response } = useAxios({ url: '/foods/1/7?category=foods' })

  // useEffect(() => {
  //   if (response.response !== null) {
  //     setData(response.response)
  //   }
  // }, [response.response])

  // const { items } = useContext(CartContext)

  return (
    <section id='new' className='py-12 my-8 overflow-x-hidden new'>
      <div className='container mx-auto text-center'>
        <h2 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
          الوجبات الجديدة
        </h2>
        {data && data?.response?.length > 0 ? (
          data?.response?.map((item: viewFoodDataProps, idx: number) => (
            <motion.div
              className='odd:ltr'
              key={item._id}
              initial={
                idx % 2 === 0 ? { x: '50vw', opacity: 0 } : { x: '-50vw', opacity: 0 }
              }
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
                    {removeSlug(abstractText(item.foodName, 40))}
                  </Link>
                }
                cPrice={item.foodPrice}
                cCategory={item.category}
                cDesc={abstractText(item.foodDesc, 100)}
                cTags={item?.foodTags}
                cToppings={item.foodToppings}
                cImg={item.foodImgs}
                cImgAlt={item.foodName}
                cCtaLabel={'testing'}
                // cCtaLabel={
                //   //add to cart button, if item is already in cart then disable the button
                //   items.find(itemInCart => itemInCart.cItemId === item._id) ? (
                //     <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-red-800 hover:bg-red-700'>
                //       <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                //         ❌
                //       </span>
                //       &nbsp;&nbsp;
                //       <span className='mr-4 text-center pointer-events-none'>
                //         إحذف من السلة
                //       </span>
                //     </div>
                //   ) : (
                //     <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-green-800 hover:bg-green-700'>
                //       <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                //         🛒
                //       </span>
                //       &nbsp;&nbsp;
                //       <span className='mr-4 text-center pointer-events-none'>
                //         أضف إلى السلة
                //       </span>
                //     </div>
                //   )
                // }
              />
            </motion.div>
          ))
        ) : !data?.response ||
          data?.response === null ||
          data?.response?.itemsCount === undefined ? (
          <LoadingCard />
        ) : (
          <p className='form__msg inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'>
            عفواً، لم يتم العثور على وجبات جديدة 😕
          </p>
        )}
      </div>
    </section>
  )
}

export default NewFood
