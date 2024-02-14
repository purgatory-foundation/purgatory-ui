import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className='bg-gray-900'>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet"></link>
      </Head>
      <body className="font-VT323">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}