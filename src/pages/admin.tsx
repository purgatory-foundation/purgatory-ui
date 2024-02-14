import Header from "../components/Layout/Header";
import CollectionManager from '../components/CollectionManager';
import AdminMainFunctions from '../components/MainFunctions/AdminMainFunctions';
import { useAccount } from "wagmi";
import ConnectWallet from '../components/Wallet/ConnectWallet';
import Head from 'next/head';

export default function Admin() {
  
  const { address } = useAccount();

  return (
    <>
    <Head>
        <title>Purgatory: Manage Collections</title>
    </Head>
    <div className="">
      <div className="relative">
        <Header/>
        {!address ? 
          <div className="mt-10 lg:mt-20">
            <ConnectWallet/>
            </div>
            :
          <>
            <header className="">
              <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-xl tracking-tight text-gray-100">Collection Manager</h1>
              </div>
            </header>
            <main>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="justify-stretch md:mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:space-y-0 sm:space-x-3 sm:space-x-reverse mt-0 md:flex-row md:space-x-3">
                      <AdminMainFunctions />
                    </div>  
                  </div>
                  <section aria-labelledby="primary-heading" className="h-full mt-2">
                      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <CollectionManager />
                      </div>
                      
                    </section>
            </main>
          </> }
      </div>
    </div>
    </>
  )
}