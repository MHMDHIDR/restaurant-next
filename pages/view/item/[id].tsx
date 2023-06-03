import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { ServerSideProps } from '@types'
import { CartContext } from 'contexts/CartContext'
import useDocumentTitle from 'hooks/useDocumentTitle'
import scrollToView from 'functions/scrollToView'
import { removeSlug } from 'functions/slug'
import Card from 'components/Card'
import { API_URL } from '@constants'
import Layout from 'components/Layout'
import { useTranslate } from 'hooks/useTranslate'
import { useLocale } from 'hooks/useLocale'

const IndexId = ({ item }: any) => {
  useDocumentTitle('View Foods')

  const { items } = useContext(CartContext)
  const [cartItems, setCartItems] = useState<any>()

  useEffect(() => {
    scrollToView()
    setCartItems(items)
  }, [items])

  const { t } = useTranslate()
  const { locale } = useLocale()

  return (
    <Layout>
      <section id='viewFood' className='py-12 my-8'>
        <div className='container mx-auto'>
          {item?.response ? (
            <>
              <h2 className='text-xl font-bold text-center mb-28 md:text-2xl'>
                <Link href={`/view/item/${item?.response?._id}`}>
                  {removeSlug(item?.response?.foodName)}
                </Link>
              </h2>
              <Card
                key={item?.response?._id}
                cItemId={item?.response?._id}
                cHeading={
                  <Link href={`/view/item/${item?.response?._id}`}>
                    {removeSlug(item?.response?.foodName)}
                  </Link>
                }
                cPrice={item?.response?.foodPrice}
                cCategory={item?.response?.category}
                cDesc={item?.response?.foodDesc}
                cTags={item?.response?.foodTags}
                cToppings={item?.response?.foodToppings}
                cImg={item?.response?.foodImgs}
                cImgAlt={item?.response?.foodName}
                cCtaLabel={
                  //add to cart button, if item is already in cart then disable the button
                  cartItems?.find(
                    (itemInCart: any) => itemInCart.cItemId === item?.response?._id
                  ) ? (
                    <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-red-800 hover:bg-red-700'>
                      <span className='py-0.5 px-1 pr-1.5 bg-gray-100 rounded-md absolute right-1 top-1 pointer-events-none'>
                        ❌
                      </span>
                      &nbsp;&nbsp;
                      <span className='mr-4 text-center pointer-events-none'>
                        {t('app.foodItem.removeFromCart')}
                      </span>
                    </div>
                  ) : (
                    <div className='relative rtl m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-green-800 hover:bg-green-700'>
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
            </>
          ) : (
            <>
              <h2 className='text-xl font-bold text-center mb-28 md:text-2xl'>
                {t('app.viewPage.title')}
              </h2>

              <div className='flex flex-col items-center justify-center text-base text-center lg:text-xl 2xl:text-2xl gap-14'>
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
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}

export async function getServerSideProps(props: ServerSideProps) {
  const { params } = props
  const { id } = params
  const fetchURL = `${API_URL}/foods?page=1&limit=1&itemId=${id}`
  const item = await fetch(fetchURL).then(item => item.json())

  return { props: { item } }
}
export default IndexId
