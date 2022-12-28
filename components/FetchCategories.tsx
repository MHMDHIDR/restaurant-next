import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import useAxios from '../hooks/useAxios'
import { ImgsProps } from '../types'

import { LoadingCard } from './Loading'

const FetchCategories = () => {
  const [foodImgs, setFoodImgs] = useState<ImgsProps>()
  const [drinkImgs, setDrinkImgs] = useState<ImgsProps>()
  const [sweetsImgs, setSweetsImgs] = useState<ImgsProps>()
  const ITEMS_COUNT = 0 // if items count is == 0 then it will fetch everything in food category

  const foods = useAxios({ url: `/foods/1/${ITEMS_COUNT}?category=foods` })

  const drinks = useAxios({ url: `/foods/1/${ITEMS_COUNT}?category=drinks` })

  const sweets = useAxios({ url: `/foods/1/${ITEMS_COUNT}?category=sweets` })

  useEffect(() => {
    if (
      foods?.response !== null &&
      sweets?.response !== null &&
      drinks?.response !== null
    ) {
      setFoodImgs(foods?.response?.response)
      setSweetsImgs(sweets?.response?.response)
      setDrinkImgs(drinks?.response?.response)
    }
  }, [foods?.response, drinks?.response, sweets?.response])

  const getRandomFoodImg = () => {
    const randomIndex = Math.floor(Math.random() * foodImgs?.length)
    return foodImgs?.[randomIndex]?.foodImgs[0]?.foodImgDisplayPath
  }
  const getSweetsDrinkImg = () => {
    const randomIndex = Math.floor(Math.random() * sweetsImgs?.length)
    return sweetsImgs?.[randomIndex]?.foodImgs[0]?.foodImgDisplayPath
  }
  const getRandomDrinkImg = () => {
    const randomIndex = Math.floor(Math.random() * drinkImgs?.length)
    return drinkImgs?.[randomIndex]?.foodImgs[0]?.foodImgDisplayPath
  }

  return !foodImgs || !drinkImgs ? (
    <LoadingCard />
  ) : (
    <div className='container mx-auto'>
      <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
        الوجبات والتصنيفات
      </h3>
      <div className='flex flex-wrap justify-center mt-32 gap-14 xl:justify-between'>
        <Link
          to={`/view`}
          className='block overflow-hidden transition-transform duration-300 bg-cover w-72 h-72 rounded-2xl hover:-translate-y-2'
          style={{
            backgroundImage: `url("${getRandomFoodImg()}")`
          }}
        >
          <h3 className='flex items-center justify-center h-full text-sm font-bold text-white bg-gray-800 md:text-base 2xl:text-xl bg-opacity-80'>
            كل الوجبات والمشروبات
          </h3>
        </Link>

        <Link
          to={`/view/foods/`}
          className='block overflow-hidden transition-transform duration-300 bg-cover w-72 h-72 rounded-2xl hover:-translate-y-2'
          style={{
            backgroundImage: `url("${getRandomFoodImg()}")`
          }}
        >
          <h3 className='flex items-center justify-center h-full text-sm font-bold text-white bg-gray-800 md:text-base 2xl:text-xl bg-opacity-80'>
            الوجبات
          </h3>
        </Link>

        <Link
          to={`/view/drinks/`}
          className='block overflow-hidden transition-transform duration-300 bg-cover w-72 h-72 rounded-2xl hover:-translate-y-2'
          style={{
            backgroundImage: `url("${getRandomDrinkImg()}")`
          }}
        >
          <h3 className='flex items-center justify-center h-full text-sm font-bold text-white bg-gray-800 md:text-base 2xl:text-xl bg-opacity-80'>
            المشروبات
          </h3>
        </Link>

        <Link
          to={`/view/sweets/`}
          className='block overflow-hidden transition-transform duration-300 bg-cover w-72 h-72 rounded-2xl hover:-translate-y-2'
          style={{
            backgroundImage: `url("${getSweetsDrinkImg()}")`
          }}
        >
          <h3 className='flex items-center justify-center h-full text-sm font-bold text-white bg-gray-800 md:text-base 2xl:text-xl bg-opacity-80'>
            الحلويات
          </h3>
        </Link>
      </div>
    </div>
  )
}

export default FetchCategories
