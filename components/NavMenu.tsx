import { useState } from 'react'
import { NavMenuPros } from '@types'
import abstractText from 'functions/abstractText'
import Image from 'next/image'

const NavMenu: React.FC<NavMenuPros> = ({
  children,
  isOptions = true,
  label = 'الاجراء',
  className,
  src
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`relative sm:mx-auto mx-2 px-3 py-2 text-sm leading-relaxed transition-colors duration-150 bg-white dark:bg-gray-700 border border-gray-400 rounded-lg dropdown:block focus:outline-none hover:border-gray-600 focus:shadow-outline focus:border-gray-900 cursor-pointer${
        isOptions ? ' 3xl:max-w-fit' : ''
      }`}
      role='menuitem'
      aria-haspopup='true'
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className='flex items-center justify-center'>
        {isOptions && (
          <svg
            className='w-4 h-4 text-gray-500 fill-current dark:text-white'
            viewBox='0 0 20 20'
            aria-hidden='true'
          >
            <path d='M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z'></path>
          </svg>
        )}

        <span className='px-2 text-center text-gray-800 select-none dark:text-white'>
          {abstractText(label, 30)}
        </span>

        {src && <Image src={src} alt={label} height={30} width={30} />}

        <svg
          className='w-4 h-4 text-gray-500 fill-current dark:text-white'
          viewBox='0 0 20 20'
          aria-hidden='true'
        >
          <path
            d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
            clipRule='evenodd'
            fillRule='evenodd'
          ></path>
        </svg>
      </div>
      <ul
        className={`absolute flex flex-col gap-1.5 left-1/2 -translate-x-1/2 min-w-max p-1 mt-4 text-sm bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-700 z-[1000] rounded-lg shadow-l${
          !isOpen && ' hidden'
        }${className ? ' ' + className : ''}`}
        aria-label='submenu'
      >
        {children}
      </ul>
    </div>
  )
}

export default NavMenu
