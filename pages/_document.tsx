import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
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
        <script src='https://www.paypal.com/sdk/js?client-id=AYJHPBtF1WJl8Hh6hDGouvXVcyO6e2sBrAIfp3ghvIX6EZJMAci75L_gB2kCGLhZWIU3pw8KeaHiipc1' />
      </body>
    </Html>
  )
}
