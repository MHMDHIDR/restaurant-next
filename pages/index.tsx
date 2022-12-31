import Head from 'next/head'
import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CartContext } from '../Contexts/CartContext'
import { LoadingCard } from '../components/Loading'
import { viewFoodDataProps } from '../types'
import About from '../components/About'
import Contact from '../components/Contact'
import FetchCategories from '../components/FetchCategories'
import Menu from '../components/Menu'
import Layout from '../components/Layout'
import Card from '../components/Card'
import abstractText from '../utils/functions/abstractText'
import { removeSlug } from '../utils/functions/slug'

const Index = ({ foods }: any) => {
  const [data, setData] = useState<any>()
  console.log(foods)

  useEffect(() => {
    if (foods !== null) {
      setData(foods)
    }
  }, [foods])

  const { items } = useContext(CartContext)

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
        <title>Restaurant</title>
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
        <title>Resaturant App</title>
      </Head>
      <Layout>
        <Menu />
        <FetchCategories />
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
        <About />
        <Contact />
      </Layout>
    </>
  )
}

export async function getServerSideProps() {
  const response = await fetch(
    'http://dev.com:3000/api/foods?page=1&limit=2&category=foods'
  )
  const data = await response.json()
  console.log(data)

  return {
    props: {
      foods: data
    }
  }
}

export default Index
