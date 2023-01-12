import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { CartContext } from '../contexts/CartContext'
import ThemeToggler from './ThemeToggler'
import Logo from './Icons/Logo'
import menuToggler from '../utils/functions/menuToggler'
import MyLink from './MyLink'
import useEventListener from '../hooks/useEventListener'
import useAxios from '../hooks/useAxios'
import NavMenu from './NavMenu'
import { UserProps } from '../types'
import Image from 'next/image'

const Nav = () => {
  const handleLogout = () => {
    'user' in localStorage && localStorage.removeItem('user')
    window.location.href = '/'
  }

  const [websiteLogoDisplayPath, setWebsiteLogoDisplayPath] = useState('')
  const USER: UserProps = JSON.parse(
    typeof window !== 'undefined' ? localStorage.getItem('user') || '{}' : '{}'
  )
  const { response } = useAxios({ url: '/settings' })

  useEffect(() => {
    response
      ? setWebsiteLogoDisplayPath(response?.response[0].websiteLogoDisplayPath)
      : setWebsiteLogoDisplayPath('')
  }, [response])

  let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0

  useEventListener('scroll', () => {
    const nav = document.querySelector('.nav')
    const hideNavClass = '-translate-y-[1000px]'

    lastScrollY < window.scrollY
      ? nav?.classList.add(hideNavClass)
      : nav?.classList.remove(hideNavClass)
    lastScrollY = window.scrollY
  })

  const { items } = useContext(CartContext)

  return (
    <div className='fixed inset-0 bottom-auto z-[9999] w-full transition-transform duration-300 nav ltr'>
      <nav
        className={`flex flex-wrap items-center justify-between px-5 xl:px-10 lg:px-20 py-1 bg-gray-300 bg-opacity-90 dark:bg-neutral-900 dark:bg-opacity-90 shadow-xl backdrop-blur-sm
          saturate-[180%] transition-all ${
            typeof window !== 'undefined'
              ? navigator.userAgent.includes('iPhone')
                ? ' standalone:pt-10'
                : ''
              : ''
          }`}
      >
        <Link aria-label='App Logo' title='App Logo' href='/'>
          {websiteLogoDisplayPath ? (
            <Image
              src={websiteLogoDisplayPath}
              width={40}
              height={40}
              className='w-10 h-10 xl:w-14 xl:h-14 rounded-2xl opacity-70'
              alt='Website Logo'
            />
          ) : (
            <Logo width='10 xl:w-14' height='10 xl:h-14' />
          )}
        </Link>

        <ThemeToggler />

        <Link href='/order-food' className='underline-hover'>
          <span className='hidden sm:inline'>سلة الطلبات: </span>
          <span>{items?.length || 0}&nbsp;&nbsp;🛒</span>
        </Link>

        {/* Nav toggler */}
        <input
          className={`absolute w-10 h-10 opacity-0 cursor-pointer xl:pointer-events-none right-5 lg:right-20 top-1 peer group ${
            typeof window !== 'undefined'
              ? navigator.userAgent.includes('iPhone')
                ? ' standalone:top-10'
                : ''
              : ''
          }`}
          type='checkbox'
          aria-label='Navigation Menu'
          title='Navigation Menu'
          id='menuToggler'
        />
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-10 h-10 transition-colors xl:hidden stroke-gray-800 dark:stroke-white peer-checked:stroke-orange-600'
          viewBox='0 0 24 24'
          onClick={() => menuToggler()}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.5'
            d='M4 6h16M4 12h16M4 18h16'
          />
        </svg>

        {/* Navigation Menu */}
        <div
          className='w-full transition-all duration-200 opacity-0 pointer-events-none -translate-y-96 peer-checked:opacity-100 peer-checked:translate-y-0 peer-checked:pointer-events-auto xl:pointer-events-auto xl:translate-y-0 xl:flex xl:items-center xl:w-auto xl:opacity-100'
          id='menu'
        >
          <ul
            className='absolute flex flex-col items-center w-full py-5 mx-auto mt-3 text-gray-800 border border-orange-300 rounded-lg shadow-lg gap-x-6 2xl:gap-12 space-y-7 sm:space-y-10 sm:py-8 sm:mt-8 bg-gradient-to-tr from-orange-300 to-orange-400 rtl xl:static xl:justify-between xl:flex-row xl:space-y-0 xl:bg-none xl:space-x-4 xl:py-0 xl:mt-0 xl:border-none xl:shadow-none'
            id='menu'
          >
            <li>
              <MyLink to='menu'>القائمة</MyLink>
            </li>
            <li>
              <MyLink to='new'>جديدنا</MyLink>
            </li>
            <li>
              <Link href='/categories' className='underline-hover'>
                التصنيفات
              </Link>
            </li>
            <li>
              <MyLink to='about'>عن المطعم</MyLink>
            </li>
            <li>
              <MyLink to='contact'>تواصل معنا</MyLink>
            </li>
            {'user' in {} ? (
              // localStorage
              <li className='flex gap-3'>
                <NavMenu
                  label={`مرحباً عزيزي ${USER.userFullName || ''}`}
                  isOptions={false}
                >
                  {(USER?.userAccountType === 'admin' ||
                    USER?.userAccountType === 'cashier') && (
                    <Link
                      href='/dashboard'
                      className='px-3 py-1 text-sm text-center text-white transition-colors bg-gray-800 border-2 rounded-lg select-none hover:bg-gray-700 xl:border-0'
                    >
                      لوحة التحكم
                    </Link>
                  )}
                  <Link
                    href='/my-orders'
                    className='px-3 py-1 text-sm text-center text-white transition-colors bg-gray-800 border-2 rounded-lg select-none hover:bg-gray-700 xl:border-0'
                  >
                    طلباتي
                  </Link>
                  <Link
                    href='/#'
                    className='px-3 py-1 text-sm text-center text-white transition-colors bg-red-700 border-2 rounded-lg select-none hover:bg-red-600 xl:border-0'
                    onClick={handleLogout}
                  >
                    تسجيل الخروج
                  </Link>
                </NavMenu>
              </li>
            ) : (
              <li>
                <Link
                  href='/auth/login'
                  className='px-3 py-1 text-sm text-center text-white transition-colors bg-gray-800 border-2 rounded-lg select-none hover:bg-gray-700 xl:border-0'
                >
                  تسجيل الدخول
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default Nav
