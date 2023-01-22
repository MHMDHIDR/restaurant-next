import Link from 'next/link'
import { useContext } from 'react'

import { CartContext } from '../contexts/CartContext'
import { ToppingsContext } from '../contexts/ToppingsContext'
import TagIcon from './Icons/TagIcon'
import EmblaCarousel from './EmblaCarousel'

import { removeSlug } from '../utils/functions/slug'

import Logo from './Icons/Logo'
import { cardProps, CartProps, mediaProps, selectedToppingsProps } from '../types'

const Card = ({
  cItemId,
  cHeading,
  cDesc,
  cTags,
  cToppings,
  cCtaLabel,
  cCtaLink,
  cImg = '',
  cImgAlt = 'Food Card',
  cPrice,
  cCategory
}: cardProps) => {
  const { items, addToCart, removeFromCart } = useContext<CartProps>(CartContext)
  const { handleToppingChecked, checkedToppings } = useContext(ToppingsContext)

  const handleCart = () => {
    const item = items.find(item => item.cItemId === cItemId)
    if (item) {
      if (
        window.confirm(`هل أنت متأكد من حذف (${cHeading.props.children}) من سلة الطلبات؟`)
      ) {
        removeFromCart(cItemId)
      }
    } else {
      addToCart(
        cItemId,
        cHeading.props.children,
        cImg,
        cPrice,
        cCategory,
        cDesc,
        cToppings
      )
    }
  }

  const SlidesCount = cImg.length
  const slides = Array.from(Array(SlidesCount).keys())
  let media: mediaProps = []
  cImg &&
    cImg.map(({ foodImgDisplayPath }: any) =>
      media.push({
        foodId: cItemId + '',
        foodImgDisplayPath,
        foodName: cHeading.props.children
      })
    )

  return (
    <div className='mb-32'>
      <div className='flex flex-wrap items-center justify-center max-w-xs mx-auto lg:justify-between sm:max-w-full'>
        <div className='flex flex-col flex-wrap items-center justify-center flex-1 order-1 gap-3 sm:px-16'>
          {cHeading ? (
            <h3 className='inline-block pt-5 mt-10 text-xl text-center text-gray-800 bg-transparent sm:mt-0 sm:pt-2 dark:text-white underline-hover'>
              {cHeading}
            </h3>
          ) : null}
          {cPrice ? (
            <span className='px-3 py-1 text-xl text-green-800 bg-green-300 rounded-xl bg-opacity-80 rtl'>
              {cPrice + ' ر.ق'}
            </span>
          ) : null}
          <p className='py-8 break-all'>{cDesc}</p>
          {cTags && cTags.length > 0 && (
            <ul className='flex flex-wrap overflow-x-scroll'>
              {cTags.map((tag, index) => (
                <li
                  key={index}
                  className='flex items-center justify-center py-1 mb-2 ml-2 tracking-widest text-white transition-colors bg-orange-700 rounded select-none hover:bg-orange-800 group hover:cursor-pointer'
                >
                  <span className='flex items-center gap-2 mx-2 whitespace-nowrap'>
                    <TagIcon />
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {/* {typeof cToppings[0]?.toppingName === 'string' && (
            // if this item has toppings and it's a string
            <div className='flex flex-col flex-wrap items-start gap-4 rtl'>
              <span>الإضافات:</span>
              {cToppings.map(({ toppingName = 'إضافة', toppingPrice = 1 }, idx) => {
                const cToppingId = cItemId + '-' + idx

                return (
                  <div className='flex items-center' key={cToppingId}>
                    <input
                      type='checkbox'
                      id={cToppingId}
                      className='cursor-pointer min-w-[1.5rem] min-h-[1.5rem]'
                      onChange={() => handleToppingChecked(cToppingId, toppingPrice)}
                      defaultChecked={checkedToppings.find(
                        (topping: selectedToppingsProps) =>
                          topping.toppingId === cToppingId
                      )}
                    />
                    <label
                      htmlFor={cToppingId}
                      className='cursor-pointer p-1.5 text-base rounded-md select-none'
                    >
                      {toppingName}
                    </label>
                    <label
                      htmlFor={cToppingId}
                      className='px-3 py-1 mr-2 -ml-2 text-base text-green-800 bg-green-300 rounded-md cursor-pointer bg-opacity-80 min-w-fit'
                    >
                      {toppingPrice + ' ر.ق'}
                    </label>
                  </div>
                )
              })}
            </div>
          )} */}
          {cCtaLabel ? (
            <div className='flex justify-evenly gap-3 flex-wrap grow-[0.5] text-center bg-transparent'>
              {cCtaLink ? (
                <Link
                  href={cCtaLink}
                  className='m-2 min-w-[7.5rem] text-white py-1.5 px-6 rounded-lg bg-green-800 hover:bg-green-700'
                >
                  {cCtaLabel}
                </Link>
              ) : (
                <button onClick={() => handleCart()}>{cCtaLabel}</button>
              )}
            </div>
          ) : null}
        </div>
        <div
          title={removeSlug(cImgAlt)}
          className='[--cardImgSize:20rem] min-w-[var(--cardImgSize)] max-w-[calc(var(--cardImgSize))] overflow-hidden transition-colors bg-gray-100 border border-gray-400 rounded-lg dark:bg-gray-600 min-h-[var(--cardImgSize)*2] max-h-[calc(var(--cardImgSize)*2)]'
        >
          {cImg ? (
            <EmblaCarousel slides={slides} media={media} smallView={true} />
          ) : (
            <Logo width='32 md:w-60' height='32 md:h-60' className='mx-auto my-2' />
          )}
        </div>
      </div>
    </div>
  )
}

export default Card
