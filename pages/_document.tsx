import { Html, Head, Main, NextScript } from 'next/document'
import { useEffect } from 'react'

export default function Document() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () =>
        navigator.serviceWorker
          .register('/sw.js')
          .then(reg => reg)
          .catch(err => console.error(err))
      )
    }
  }, [])

  return (
    <Html dir='rtl' lang='ar'>
      <Head>
        <link
          href='https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
          rel='stylesheet'
          crossOrigin='anonymous'
        />
      </Head>
      <body className='flex flex-col justify-between h-screen overflow-x-hidden transition-all bg-gray-200'>
        <Main />
        <NextScript />
        <script src='https://www.paypal.com/sdk/js?client-id=AVHjwQ-58XYH3WXHbZTF8JOcnCIFdHVAA-XpasumZ72E_g7nQy4ppsOBi33IQiLArVrsmMIk58zxyvFh' />
      </body>
    </Html>
  )
}
