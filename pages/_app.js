import Head from 'next/head'
import '../styles/global.css'

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Show 'Em Boys</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App