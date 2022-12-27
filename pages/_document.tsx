import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link
          href='https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
          rel='stylesheet'
          crossOrigin='anonymous'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script src='https://www.paypal.com/sdk/js?client-id=AVHjwQ-58XYH3WXHbZTF8JOcnCIFdHVAA-XpasumZ72E_g7nQy4ppsOBi33IQiLArVrsmMIk58zxyvFh' />
      </body>
    </Html>
  )
}
