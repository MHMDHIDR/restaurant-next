import Link from 'next/link'
import { useEffect, useState } from 'react'
import useDocumentTitle from 'hooks/useDocumentTitle'
import Layout from 'components/Layout'
import { API_URL } from '@constants'

const Categories = ({ catFoodResponse, catDrinkResponse, catSweetResponse }: any) => {
  useDocumentTitle('Categories')

  const [foodImgs, setFoodImgs] = useState<any>()
  const [drinkImgs, setDrinkImgs] = useState<any>()
  const [sweetsImgs, setSweetsImgs] = useState<any>()
  useEffect(() => {
    setFoodImgs(catFoodResponse?.response)
    setDrinkImgs(catDrinkResponse?.response)
    setSweetsImgs(catSweetResponse?.response)
  }, [catFoodResponse.response, catDrinkResponse.response, catSweetResponse.response])

  const getRandomFoodImg = () => {
    const randomIndex = Math.floor(Math.random() * foodImgs?.length)
    return foodImgs?.[randomIndex]?.foodImgs[0]?.foodImgDisplayPath
  }
  const getRandomDrinkImg = () => {
    const randomIndex = Math.floor(Math.random() * drinkImgs?.length)
    return drinkImgs?.[randomIndex]?.foodImgs[0]?.foodImgDisplayPath
  }
  const getRandomSweetImg = () => {
    const randomIndex = Math.floor(Math.random() * sweetsImgs?.length)
    return sweetsImgs?.[randomIndex]?.foodImgs[0]?.foodImgDisplayPath
  }

  return (
    <Layout>
      <section className='container py-20 mx-auto my-40'>
        <h3 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
          الوجبات والتصنيفات
        </h3>
        <div className='flex flex-wrap justify-center mt-32 gap-14 xl:justify-between'>
          <Link
            href={`/view`}
            className='block overflow-hidden transition-transform duration-300 bg-cover w-72 h-72 rounded-2xl hover:-translate-y-2'
            style={{
              backgroundImage: `url("${
                getRandomFoodImg() || '/assets/img/icons/logo.svg'
              }")`
            }}
          >
            <h3 className='flex items-center justify-center h-full text-sm font-bold text-white bg-gray-800 md:text-base 2xl:text-xl bg-opacity-80'>
              كل الوجبات والمشروبات
            </h3>
          </Link>

          <Link
            href={`/view/foods/`}
            className='block overflow-hidden transition-transform duration-300 bg-cover w-72 h-72 rounded-2xl hover:-translate-y-2'
            style={{
              backgroundImage: `url("${
                getRandomFoodImg() || '/assets/img/icons/logo.svg'
              }")`
            }}
          >
            <h3 className='flex items-center justify-center h-full text-sm font-bold text-white bg-gray-800 md:text-base 2xl:text-xl bg-opacity-80'>
              الوجبات
            </h3>
          </Link>

          <Link
            href={`/view/drinks/`}
            className='block overflow-hidden transition-transform duration-300 bg-cover w-72 h-72 rounded-2xl hover:-translate-y-2'
            style={{
              backgroundImage: `url("${
                getRandomDrinkImg() || '/assets/img/icons/logo.svg'
              }")`
            }}
          >
            <h3 className='flex items-center justify-center h-full text-sm font-bold text-white bg-gray-800 md:text-base 2xl:text-xl bg-opacity-80'>
              المشروبات
            </h3>
          </Link>

          <Link
            href={`/view/sweets/`}
            className='block overflow-hidden transition-transform duration-300 bg-cover w-72 h-72 rounded-2xl hover:-translate-y-2'
            style={{
              backgroundImage: `url("${
                getRandomSweetImg() || '/assets/img/icons/logo.svg'
              }")`
            }}
          >
            <h3 className='flex items-center justify-center h-full text-sm font-bold text-white bg-gray-800 md:text-base 2xl:text-xl bg-opacity-80'>
              الحلويات
            </h3>
          </Link>
        </div>
      </section>
    </Layout>
  )
}

export const getServerSideProps = async () => {
  const fetchURLs = {
    categories: {
      foods: `${API_URL}/foods?page=1&limit=0&category=foods`,
      drinks: `${API_URL}/foods?page=1&limit=0&category=drinks`,
      sweets: `${API_URL}/foods?page=1&limit=0&category=sweets`
    }
  }

  const catFoodResponse = await fetch(fetchURLs.categories.foods).then(catFood =>
    catFood.json()
  )
  const catDrinkResponse = await fetch(fetchURLs.categories.drinks).then(catDrink =>
    catDrink.json()
  )
  const catSweetResponse = await fetch(fetchURLs.categories.sweets).then(catSweet =>
    catSweet.json()
  )

  return {
    props: {
      catFoodResponse,
      catDrinkResponse,
      catSweetResponse
    }
  }
}

export default Categories
