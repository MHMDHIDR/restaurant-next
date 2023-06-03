import Link from 'next/link'
import { useState, useEffect } from 'react'
import useAxios from 'hooks/useAxios'
import abstractText from 'functions/abstractText'
import { removeSlug } from 'functions/slug'
import MyLink from './MyLink'
import Logo from './Icons/Logo'
import Backtop from './Icons/Backtop'
import { WhatsApp, Twitter, Instagram } from './Icons/Socials'
import { settingsProps } from '@types'
import { SUGGESTED_FOOTER_ITEMS_COUNT } from '@constants'
import Image from 'next/image'
import { useTranslate } from 'hooks/useTranslate'
import { useLocale } from 'hooks/useLocale'

const Footer = () => {
  const [settings, setSettings] = useState<settingsProps | any>()
  const [suggestedItems, setSuggestedItems] = useState([])

  const fetchSettings = useAxios({ url: '/settings' })
  const productsNames = useAxios({ url: '/foods?page=1&limit=0' })

  useEffect(() => {
    if (fetchSettings.response !== null || productsNames.response !== null) {
      setSettings(fetchSettings.response?.response[0])
      setSuggestedItems(
        productsNames.response?.response
          .map((product: any) => product)
          .sort(() => Math.random() - 0.5)
          .slice(0, SUGGESTED_FOOTER_ITEMS_COUNT)
      )
    }
  }, [fetchSettings.response, productsNames.response])

  const { t } = useTranslate()
  const { locale } = useLocale()

  return (
    <footer className='text-white bg-orange-700 footer'>
      <div className='container mx-auto'>
        <div className='flex flex-col flex-wrap items-center justify-around gap-6 py-4 pb-20 sm:flex-row'>
          <div className='flex flex-wrap items-center justify-center flex-1 sm:flex-nowrap'>
            <Link href={`/${locale}`} aria-label='App Logo' title='App Logo'>
              {settings?.websiteLogoDisplayPath ? (
                <Image
                  src={settings.websiteLogoDisplayPath}
                  width={40}
                  height={40}
                  className='w-10 h-10 transition-transform opacity-50 md:w-14 md:h-14 rounded-2xl hover:opacity-70 hover:scale-105'
                  alt='Website Logo'
                />
              ) : (
                <Logo width='10 md:w-14' height='10 md:h-14' />
              )}
            </Link>
            <p className={`w-full leading-10 ${locale === 'ar' ? 'mr-4' : 'ml-4'}`}>
              {settings
                ? settings?.appDesc
                : 'أطلب ألذ الأطعمة والمشروبات الطازجة من مطعمنا العالمي'}
            </p>
          </div>
          <div className='flex flex-wrap flex-1 w-full gap-14 sm:w-auto justify-evenly'>
            <div>
              <h3 className='mb-3 text-lg font-bold'>
                {t('app.footer.recommendations.title')}
              </h3>
              <ul className='space-y-2'>
                {!suggestedItems || suggestedItems.length === 0 ? (
                  <li>
                    <Link href='/view' className='hover:text-gray-700'>
                      {t('app.footer.recommendations.viewMeals')}
                    </Link>
                  </li>
                ) : (
                  suggestedItems.map((item: any) => (
                    <li key={item._id}>
                      <Link
                        href={`/view/item/${item._id}`}
                        className='hover:text-gray-700'
                      >
                        {removeSlug(abstractText(item.foodName, 20))}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
            {/* Links */}
            <div>
              <h3 className='mb-3 text-lg font-bold'>{t('app.footer.links.title')}</h3>
              <ul className='space-y-2'>
                <li>
                  <Link href='/view' className='hover:text-gray-700'>
                    {t('app.footer.links.all')}
                  </Link>
                </li>
                <li>
                  <MyLink to='new' className='hover:text-gray-700'>
                    {t('app.footer.links.new')}
                  </MyLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-around gap-6 py-4'>
          {settings?.whatsAppNumber && settings?.whatsAppNumber !== '' && (
            <a
              rel='noreferrer'
              href={`https://web.whatsapp.com/send?phone=974${settings?.whatsAppNumber}&text=مرحبا+اسمي:+....،+معك+.....+أرغب+بالتواصل+معك+بخصوص:+....`}
              target='_blank'
            >
              <WhatsApp fill='lime' />
            </a>
          )}
          {settings?.instagramAccount && settings?.instagramAccount !== '' && (
            <a rel='noreferrer' href={settings?.instagramAccount} target='_blank'>
              <Instagram fill='hotpink' />
            </a>
          )}
          {settings?.twitterAccount && settings?.twitterAccount !== '' && (
            <a rel='noreferrer' href={settings?.twitterAccount} target='_blank'>
              <Twitter fill='cyan' />
            </a>
          )}
        </div>

        <div className='flex items-center justify-around gap-6 py-4'>
          <p className='font-[600] text-center px-2 sm:px-0 leading-loose'>
            <strong>{settings?.appName}</strong> {t('app.footer.copyrights')} &copy; 2021
            - {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <Backtop />
    </footer>
  )
}

export default Footer
