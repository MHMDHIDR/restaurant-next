import { useState, useEffect, Suspense, lazy } from 'react'
import useAxios from '../hooks/useAxios'

import { LoadingCard } from './Loading'
const EmblaCarousel = lazy(() => import('./Embla/EmblaCarousel'))

const Menu = () => {
  const SLIDES_IN_MENU = 10
  const [food, setFood] = useState<{ itemsCount: any } | any>('')

  const { ...response } = useAxios({ url: `/foods/0/0?category=foods&createdAt=1` })

  useEffect(() => {
    if (response.response !== null) {
      setFood(response.response.response)
    }
  }, [response.response])

  /**
   * if the SLIDES_IN_MENU const is bigger than how many food items are in the database, then the number
   * of slides will be the number of food items in the database else it will be the number of SLIDES_IN_MENU const
   */
  const SlidesCount =
    SLIDES_IN_MENU > response.response?.itemsCount
      ? response.response?.itemsCount
      : SLIDES_IN_MENU

  const slides = Array.from(Array(SlidesCount).keys())

  let media = []

  //push food images to media array
  food &&
    food.map(({ _id, foodImgs, foodName, foodPrice }) =>
      media.push({
        foodId: _id,
        foodImgDisplayPath: foodImgs[0]?.foodImgDisplayPath,
        foodName,
        foodPrice
      })
    )

  return (
    <section id='menu' className='py-12 my-8 menu'>
      <div className='container relative mx-auto'>
        <h2 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>القائمة</h2>
        <div className='w-11/12 mx-auto overflow-hidden'>
          <Suspense fallback={<LoadingCard />}>
            {food?.length > 0 ? (
              <div className='max-w-5xl mx-auto transition-transform translate-x-0 select-none'>
                <EmblaCarousel slides={slides} media={media} />
              </div>
            ) : !food || !food === null || food?.itemsCount === undefined ? (
              <LoadingCard />
            ) : (
              <span className='inline-block w-full my-2 text-lg font-bold text-center text-red-500'>
                عفواً! لم يتم العثور على وجبات 😥
              </span>
            )}
          </Suspense>
        </div>
      </div>
    </section>
  )
}

export default Menu
