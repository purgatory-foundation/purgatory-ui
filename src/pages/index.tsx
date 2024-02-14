import ConnectWallet from '../components/Wallet/ConnectWallet';
import { useAccount } from "wagmi";
import Head from 'next/head';
import Loading from '../components/Layout/Loading';
import { useRouter } from 'next/router';

export default function Home() {
  const { address } = useAccount();
  const router = useRouter();

  return (
    <>    
      <Head>
        <title>Purgatory</title>
      </Head>
      {/* Main Content */}

      <div className="">
          <div className="relative">
            {!address ? 
              <div className="mt-40 lg:mt-20">
                <div className="max-w-3xl mx-auto flex justify-center">
                  <div className="flex flex-shrink-0">
                    <h1 className="mb-5 text-4xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-VT323">PURGATORY</h1>
                  </div>
                </div>
                <ConnectWallet/>
              </div>
              :
            <>
              <div className="mt-40 lg:mt-20 text-white">
                <div className="max-w-3xl mx-auto flex justify-center">
                  <div className="flex flex-shrink-0">
                    <h1 className="mb-5 text-4xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-VT323">PURGATORY</h1>
                  </div>
                </div>
                
                {router.isReady ? <Loading /> : 'Loading...'}
              </div>
            </>}
            </div>
      </div>
      
    </>
  )
}
