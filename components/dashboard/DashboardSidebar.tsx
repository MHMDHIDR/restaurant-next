import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
// import { USER } from '../../constants'

import goTo from '../../utils/functions/goTo'
import menuToggler from '../../utils/functions/menuToggler'

const DashboardSidebar = () => {
  const menuTogglerRef = useRef<any>()
  const [top, setTop] = useState<number>(0)
  useEffect(() => {
    setTop(menuTogglerRef?.current?.getBoundingClientRect().top)
  }, [])

  return (
    <aside>
      <>
        <input
          className='absolute w-0 h-0 overflow-hidden peer'
          type='checkbox'
          aria-label='Navigation Menu'
          title='Navigation Menu'
          id='menuToggler'
        />
        <label
          data-tooltip='القائمة'
          htmlFor='menuToggler'
          className={`block z-20 w-10 h-10 transition-all translate-x-0 bg-orange-700 border-2 border-r-0 border-gray-800 cursor-pointer hover:bg-orange-800 dark:border-white translate-y-36 sm:translate-y-36 peer-checked:-translate-x-56 ${
            top < 100 &&
            `after:content-[attr(tooltip)] after:bottom-[calc(var(--top)*2)] after:mt-2 before:dark:border-t-transparent before:border-t-transparent before:border-b-gray-800 before:dark:border-b-gray-300 before:top-[var(--bottom)]`
          }`}
          style={{ margin: '0' }}
          ref={menuTogglerRef}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 512 512'
            className='stroke-white'
          >
            <title>Sidebar Menu</title>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='17'
              d='M96 256h320M96 176h320M96 336h320'
            />
          </svg>
        </label>
        {/* overlay full inset-0 */}
        <div
          className='fixed inset-0 z-10 transition-opacity duration-500 bg-black opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:bg-opacity-80 peer-checked:pointer-events-auto'
          onClick={() => menuToggler()}
        />

        <ul
          className='fixed z-10 flex flex-col w-56 h-full pt-24 overflow-x-hidden overflow-y-auto transition-all translate-x-full bg-orange-800 shadow-inner dashboard__sidebar sm:pt-20 peer-checked:translate-x-0'
          id='menu'
        >
          <SideBarLink href={'dashboard'}>لوحة التحكم</SideBarLink>
          {/* {USER?.userAccountType === 'admin' ? ( */}
          <>
            <SideBarLink href={'orders'}>الطلبات</SideBarLink>
            <SideBarLink href={'stats'}>الإحصائيات</SideBarLink>
            <SideBarLink href={'menu'}>قائمة الوجبات</SideBarLink>
            <SideBarLink href={'add-food'}>إضافة وجبة</SideBarLink>
            <SideBarLink href={'users'}>المستخدمين</SideBarLink>
            <SideBarLink href={'settings'}>إعدادات الموقع</SideBarLink>
          </>
          {/* 
             ) : (
               USER?.userAccountType === 'cashier' && (
                 <>
                   <SideBarLink href={'orders'}>الطلبات</SideBarLink>
                   <SideBarLink href={'stats'}>الإحصائيات</SideBarLink>
                 </>
               )
             )}
           */}
        </ul>
      </>
    </aside>
  )
}

const SideBarLink = ({ href, children }: any) => (
  <li className='hover:bg-orange-700'>
    <Link
      href={goTo(href)}
      className='dashboard__nav'
      // className={({ isActive }: boolean) =>
      //   !isActive ? 'dashboard__nav' : 'dashboard__nav isActive'
      // }
      onClick={() => menuToggler()}
    >
      {children}
    </Link>
  </li>
)

export default DashboardSidebar
