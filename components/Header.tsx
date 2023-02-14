import { useState, useEffect } from 'react'
import useAxios from '@hooks/useAxios'
import Search from './Search'
import Nav from './Nav'
import ScrollDown from './ScrollDown'
import Typewriter from 'typewriter-effect'
import { headerProps } from '@types'
import Image from 'next/image'

const Header = () => {
  const [data, setData] = useState<headerProps>()
  const { response } = useAxios({ url: '/settings' })

  useEffect(() => {
    response
      ? setData(response?.response[0])
      : setData({
          appTagline: '',
          websiteLogoDisplayPath: ''
        })
  }, [response])

  return (
    <header
      id='hero'
      className='relative bg-fixed bg-center bg-cover'
      style={{
        backgroundImage: `url("/assets/img/header-bg-1.webp")`
      }}
    >
      <Nav />
      {/* Overlay layer */}
      <div className='bg-gray-800 bg-opacity-90'>
        <div className='container mx-auto ltr'>
          {/* Search form and main hero */}
          <main className='flex flex-col items-center justify-center min-h-screen'>
            {/* logo */}
            {data?.websiteLogoDisplayPath ? (
              <Image
                src={data.websiteLogoDisplayPath}
                width={128}
                height={128}
                className='w-32 h-32 mb-12 md:w-60 md:h-60 rounded-2xl opacity-30'
                alt='Website Logo'
              />
            ) : (
              <Image
                src='/assets/img/icons/logo.svg'
                alt='logo'
                className='w-32 h-32 mb-12 md:w-60 md:h-60'
                width={150}
                height={150}
              />
            )}

            <h1 className='inline-block h-20 max-w-xs px-2 my-4 overflow-x-hidden text-lg leading-loose text-center text-white select-none sm:max-w-fit xl:text-3xl sm:text-xl md:text-4xl rtl sm:whitespace-nowrap'>
              <Typewriter
                options={{
                  strings:
                    data?.appTagline || `نحن الأفضل، وسنبقى كذلك ... إلى الأبد 😄 🤍`,
                  autoStart: true,
                  loop: true
                }}
              />
            </h1>
            <Search />
            <ScrollDown />
          </main>
        </div>
      </div>

      {/* Wavey saprator svg */}
      <div className='absolute min-w-full overflow-hidden -bottom-1'>
        <svg
          data-name='Wavey saprator'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 1200 120'
          preserveAspectRatio='none'
          className='transition-colors fill-gray-200 dark:fill-gray-800'
        >
          <path d='M 0 11 L 24 18.3 C 48 26 96 40 144 49.5 C 192 59 240 62 288 58.7 C 336 55 384 44 432 47.7 C 480 51 528 70 576 77 C 624 84 672 81 720 75.2 C 768 70 816 62 864 49.5 C 912 37 960 18 1008 25.7 C 1056 33 1104 66 1152 77 C 1200 88 1248 77 1296 60.5 C 1344 44 1392 22 1440 12.8 C 1488 4 1536 7 1584 18.3 C 1632 29 1680 48 1728 62.3 C 1776 77 1824 88 1872 77 C 1920 66 1968 33 2016 29.3 C 2064 26 2112 51 2160 64.2 C 2208 77 2256 77 2304 78.8 C 2352 81 2400 84 2448 80.7 C 2496 77 2544 66 2592 60.5 C 2640 55 2688 55 2736 45.8 C 2784 37 2832 18 2880 20.2 C 2928 22 2976 44 3024 45.8 C 3072 48 3120 29 3168 22 C 3216 15 3264 18 3312 16.5 C 3360 15 3408 7 3432 3.7 L 3456 0 L 3455 229 L 0 248 Z'></path>
        </svg>
      </div>
    </header>
  )
}

export default Header
