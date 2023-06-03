import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import ThemeToggler from '../ThemeToggler'
import Logo from '../Icons/Logo'
import menuToggler from 'functions/menuToggler'
import Image from 'next/image'
import useAxios from 'hooks/useAxios'
import { USER } from '@constants'
import LanguageSwitcher from 'components/LanguageSwitcher'

const DashboardNav = () => {
  const handleLogout = () => {
    if (USER) {
      localStorage.removeItem('user')
      window.location.href = '/'
    } else {
      signOut({ redirect: true, callbackUrl: '/' })
    }
  }

  const [websiteLogoDisplayPath, setWebsiteLogoDisplayPath] = useState('')
  const { response } = useAxios({ url: '/settings' })

  useEffect(() => {
    if (response !== null) setWebsiteLogoDisplayPath(response.websiteLogoDisplayPath)
  }, [response])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-20 flex flex-wrap items-center gap-2 px-5 py-2 text-sm bg-gray-300 shadow-xl xl:text-base bg-opacity-90 dark:bg-neutral-900 dark:bg-opacity-90 nav justify-evenly sm:justify-between lg:px-8 backdrop-blur-sm${
        typeof window !== 'undefined' && navigator.userAgent.includes('iPhone')
          ? ' standalone:pt-[2.3rem]'
          : ''
      }`}
      onClick={() => menuToggler(true)}
    >
      <Link href='/'>
        {websiteLogoDisplayPath ? (
          <Image
            src={websiteLogoDisplayPath}
            width={40}
            height={40}
            className='w-10 h-10 opacity-50 xl:w-14 xl:h-14 rounded-2xl hover:opacity-80'
            alt='Website Logo'
          />
        ) : (
          <Logo />
        )}
      </Link>

      <div className='flex items-center justify-center gap-x-5 gap-y-3'>
        <ThemeToggler />
        <LanguageSwitcher />
      </div>

      <div className='flex flex-wrap justify-end gap-4'>
        <Link
          href='/#'
          className='inline-block px-2 py-1 text-white bg-orange-700 border rounded-lg cursor-pointer hover:bg-opacity-30'
          onClick={handleLogout}
        >
          تسجيل الخروج
        </Link>
        <Link
          href='/'
          className='inline-block px-2 py-1 text-white bg-orange-700 border rounded-lg cursor-pointer hover:bg-opacity-30'
        >
          زيارة الموقع
        </Link>
      </div>
    </nav>
  )
}

export default DashboardNav
