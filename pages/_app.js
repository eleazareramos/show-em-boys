import Head from 'next/head'
import '../styles/global.css'

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Show 'Em Boys</title>
        <link
          rel="icon"
          href="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/237/eyes_1f440.png"
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App
