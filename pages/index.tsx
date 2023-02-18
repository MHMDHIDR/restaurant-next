import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { foodDataProps, mediaProps } from '@types'
import { CartContext } from 'contexts/CartContext'
import EmblaCarousel from 'components/EmblaCarousel'
import Layout from 'components/Layout'
import About from 'components/About'
import Contact from 'components/Contact'
import Card from 'components/Card'
import abstractText from 'functions/abstractText'
import { removeSlug } from 'functions/slug'
import { SLIDES_IN_MENU, API_URL } from '@constants'

const Index = ({
  menuFood,
  catFoodResponse,
  catDrinkResponse,
  catSweetResponse,
  newFoodItems
}: any) => {
  const { items } = useContext(CartContext)

  const SlidesCount =
    SLIDES_IN_MENU > menuFood?.itemsCount ? menuFood?.itemsCount : SLIDES_IN_MENU
  const slides = Array.from(Array(SlidesCount).keys())
  let media: mediaProps = []

  //push food images to media array
  menuFood &&
    menuFood?.response.map(({ _id, foodImgs, foodName, foodPrice }: any) =>
      media.push({
        foodId: _id,
        foodImgDisplayPath: foodImgs[0]?.foodImgDisplayPath,
        foodName,
        foodPrice
      })
    )

  const [foodImgs, setFoodImgs] = useState<any>('')
  const [drinkImgs, setDrinkImgs] = useState<any>('')
  const [sweetsImgs, setSweetsImgs] = useState<any>('')
  const [newFood, setNewFood] = useState<any>('')
  useEffect(() => {
    setFoodImgs(catFoodResponse?.response)
    setSweetsImgs(catDrinkResponse?.response)
    setDrinkImgs(catSweetResponse?.response)
    setNewFood(newFoodItems)
  }, [
    catFoodResponse.response,
    catDrinkResponse.response,
    catSweetResponse.response,
    newFoodItems
  ])

  const getRandomFoodImg = () => {
    const randomIndex = Math.floor(Math.random() * foodImgs?.length)
    return foodImgs?.[randomIndex]?.foodImgs[0]?.foodImgDisplayPath
  }

  const getRandomDrinkImg = () => {
    const randomIndex = Math.floor(Math.random() * drinkImgs?.length)
    return drinkImgs?.[randomIndex]?.foodImgs[0]?.foodImgDisplayPath
  }
  const getSweetsDrinkImg = () => {
    const randomIndex = Math.floor(Math.random() * sweetsImgs?.length)
    return sweetsImgs?.[randomIndex]?.foodImgs[0]?.foodImgDisplayPath
  }

  return (
    <>
      <Head>
        <meta charSet='UTF-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta
          name='description'
          content='Restaurant App To Find Order And Delicious Food'
        />
        <meta name='robots' content='index, follow' />
        <meta name='keywords' content='restaurant, food, delicious, order, online' />
        <meta name='author' content='mr.hamood277@gmail.com' />
        <meta name='theme-color' content='#b73306' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, viewport-fit=cover'
        />
        <link rel='manifest' href='manifest.json' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
        <link
          rel='shortcut icon'
          type='image/png'
          sizes='196x196'
          href='/assets/img/icons/mobile/favicon-196.png'
        />
        <link rel='apple-touch-icon' href='/assets/img/icons/mobile/apple-icon-180.png' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2048-2732.jpg'
          media='(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2732-2048.jpg'
          media='(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1668-2388.jpg'
          media='(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2388-1668.jpg'
          media='(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1536-2048.jpg'
          media='(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2048-1536.jpg'
          media='(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1668-2224.jpg'
          media='(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2224-1668.jpg'
          media='(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1620-2160.jpg'
          media='(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2160-1620.jpg'
          media='(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1284-2778.jpg'
          media='(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2778-1284.jpg'
          media='(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1170-2532.jpg'
          media='(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2532-1170.jpg'
          media='(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1125-2436.jpg'
          media='(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2436-1125.jpg'
          media='(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1242-2688.jpg'
          media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2688-1242.jpg'
          media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-828-1792.jpg'
          media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1792-828.jpg'
          media='(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1242-2208.jpg'
          media='(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-2208-1242.jpg'
          media='(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-750-1334.jpg'
          media='(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1334-750.jpg'
          media='(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-640-1136.jpg'
          media='(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        />
        <link
          rel='apple-touch-startup-image'
          href='/assets/img/icons/mobile/apple-splash-1136-640.jpg'
          media='(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Restaurant Ordering web app' />
        <meta property='og:title' content='Restaurant - Find and Order Food' />
        <meta
          property='og:description'
          content='Restaurant is a web app to find and order delicious food, drinks.'
        />
        <meta property='og:url' content='https://mhmdhidr-restaurant.netlify.app' />
        <meta name='twitter:card' content='Restaurant - Find and Order Food' />
        <meta name='twitter:url' content='{{pageUrl}}' />
        <meta name='twitter:title' content='{{pageTitle}}' />
        <meta name='twitter:description' content='{{description}}' />
        <meta name='twitter:image' content='{{imageUrl}}' />
        <title>Restaurant</title>
      </Head>
      <Layout>
        <section id='menu' className='py-12 my-8 menu'>
          <div className='container relative mx-auto'>
            <h2 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>القائمة</h2>
            <div className='w-11/12 mx-auto overflow-hidden'>
              {menuFood && menuFood?.response?.length > 0 ? (
                <div className='max-w-5xl mx-auto transition-transform translate-x-0 select-none'>
                  <EmblaCarousel slides={slides} media={media} />
                </div>
              ) : (
                <span className='inline-block w-full my-2 text-lg font-bold text-center text-red-500'>
                  عفواً! لم يتم العثور على وجبات 😥
                </span>
              )}
            </div>
          </div>
        </section>
        <section id='Categories' className='container mx-auto'>
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
                  getSweetsDrinkImg() || '/assets/img/icons/logo.svg'
                }")`
              }}
            >
              <h3 className='flex items-center justify-center h-full text-sm font-bold text-white bg-gray-800 md:text-base 2xl:text-xl bg-opacity-80'>
                الحلويات
              </h3>
            </Link>
          </div>
        </section>
        <section id='new' className='py-12 my-8 overflow-x-hidden new'>
          <div className='container mx-auto text-center'>
            <h2 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>
              الوجبات الجديدة
            </h2>
            {newFood && newFood?.response?.length > 0 ? (
              newFood?.response?.map((item: foodDataProps['response'], idx: number) => (
                <motion.div
                  className='odd:ltr'
                  key={idx}
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
                    cCtaLabel={
                      //add to cart button, if item is already in cart then disable the button
                      items.find(itemInCart => itemInCart.cItemId === item._id) ? (
                        <div className='relative rtl min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-red-800 hover:bg-red-700'>
                          <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                            ❌
                          </span>
                          &nbsp;&nbsp;
                          <span className='mr-4 text-center pointer-events-none'>
                            إحذف من السلة
                          </span>
                        </div>
                      ) : (
                        <div className='relative rtl min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-green-800 hover:bg-green-700'>
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
              ))
            ) : (
              <p className='form__msg inline-block md:text-lg text-red-600 dark:text-red-400 font-[600] pt-2 px-1'>
                عفواً، لم يتم العثور على وجبات جديدة 😕
              </p>
            )}
          </div>
        </section>
        <About />
        <Contact />
      </Layout>
    </>
  )
}

export async function getServerSideProps() {
  const fetchURLs = {
    menu: `${API_URL}/foods?page=1&limit=0&category=foods&createdAt=1`,
    categories: {
      foods: `${API_URL}/foods?page=1&limit=0&category=foods`,
      drinks: `${API_URL}/foods?page=1&limit=0&category=drinks`,
      sweets: `${API_URL}/foods?page=1&limit=0&category=sweets`
    },
    new: `${API_URL}/foods?page=1&limit=7&category=foods`
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
  const menuFood = await fetch(fetchURLs.menu).then(menu => menu.json())
  const newFoodItems = await fetch(fetchURLs.new).then(newFoodItems =>
    newFoodItems.json()
  )

  return {
    props: {
      menuFood,
      catFoodResponse,
      catDrinkResponse,
      catSweetResponse,
      newFoodItems
    }
  }
}

export default Index
