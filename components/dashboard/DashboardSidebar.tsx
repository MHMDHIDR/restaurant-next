import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import useAuth from 'hooks/useAuth'
import { USER } from '@constants'
import goTo from 'functions/goTo'
import menuToggler from 'functions/menuToggler'
import { useRouter } from 'next/router'
import { useTranslate } from 'hooks/useTranslate'

const DashboardSidebar = () => {
  const menuTogglerRef = useRef<any>()
  const [top, setTop] = useState<number>(0)
  const { userType, loading } = useAuth()
  useEffect(() => {
    setTop(menuTogglerRef?.current?.getBoundingClientRect().top)
  }, [])

  const { t } = useTranslate()
  const { locale } = useRouter()

  return (
    <aside>
      <input
        className='absolute w-0 h-0 overflow-hidden peer'
        type='checkbox'
        aria-label='Navigation Menu'
        title='Navigation Menu'
        id='menuToggler'
      />
      <label
        data-tooltip={locale === 'ar' ? 'القائمة' : 'Menu'}
        htmlFor='menuToggler'
        className={`block z-20 w-10 h-10 transition-all translate-x-0 bg-orange-700 border-2 border-gray-800 cursor-pointer hover:bg-orange-800 dark:border-white translate-y-36 sm:translate-y-36 peer-checked:-translate-x-56 ${
          top < 100 &&
          `after:content-[attr(tooltip)] after:bottom-[calc(var(--top)*2)] after:mt-2 before:dark:border-t-transparent before:border-t-transparent before:border-b-gray-800 before:dark:border-b-gray-300 before:top-[var(--bottom)]`
        } ${locale === 'ar' ? 'border-r-0' : 'border-l-0'}`}
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

      {!loading && (
        <ul
          className={`fixed z-10 flex flex-col w-56 h-full pt-24 overflow-x-hidden overflow-y-auto transition-all bg-orange-800 shadow-inner dashboard__sidebar sm:pt-20 peer-checked:translate-x-0 ${
            locale === 'ar' ? 'translate-x-full' : '-translate-x-full'
          }`}
          id='menu'
        >
          <SideBarLink href={'dashboard'}>
            {t('app.dashboard.sideBar.dashboard')}
          </SideBarLink>
          {USER?.userAccountType === 'admin' || userType === 'admin' ? (
            <>
              <SideBarLink href={'orders'}>
                {t('app.dashboard.sideBar.orders')}
              </SideBarLink>
              <SideBarLink href={'statistics'}>
                {t('app.dashboard.sideBar.statistics')}
              </SideBarLink>
              <SideBarLink href={'menu'}>{t('app.dashboard.sideBar.menu')}</SideBarLink>
              <SideBarLink href={'food/add'}>
                {t('app.dashboard.sideBar.add')}
              </SideBarLink>
              <SideBarLink href={'users'}>{t('app.dashboard.sideBar.users')}</SideBarLink>
              <SideBarLink href={'settings'}>
                {t('app.dashboard.sideBar.settings')}
              </SideBarLink>
            </>
          ) : (
            USER?.userAccountType === 'cashier' ||
            (userType === 'cashier' && (
              <>
                <SideBarLink href={'orders'}>
                  {t('app.dashboard.sideBar.orders')}
                </SideBarLink>
              </>
            ))
          )}
        </ul>
      )}
    </aside>
  )
}

const SideBarLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <li className='hover:bg-orange-700'>
      <Link href={goTo(href)} className='dashboard__nav' onClick={() => menuToggler()}>
        {children}
      </Link>
    </li>
  )
}

export default DashboardSidebar
