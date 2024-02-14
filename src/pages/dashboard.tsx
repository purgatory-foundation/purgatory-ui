import Header from '../components/Layout/Header';
import OperatorFunctions from '../components/OperatorFunctions/OperatorFunctions';
import TransferFunctions from '../components/TransferFunctions/TranferFunctions';
import MainFunctions from '../components/MainFunctions/MainFunctions';
import  Manage2faWallets from '../components/Manage2faWallets';
import ManageRecipients from '../components/Recipients/ManageRecipients';
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ArrowsRightLeftIcon, BuildingStorefrontIcon, ListBulletIcon } from '@heroicons/react/20/solid'
import ConnectWallet from '../components/Wallet/ConnectWallet';
import OptIn from '../components/Layout/OptIn';
import LockedDown from '../components/Layout/LockedDown';
import { useAccount } from "wagmi";
import Head from 'next/head';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
  useOptStatus, 
  useIsLockedDown ,
} from "../services/utils/contracts/purgatory/UseFunctions";
const tabs = [
  { name: 'Approvals', href: '#', icon: BuildingStorefrontIcon, current: true },
  { name: 'Transfers', href: '#', icon: ArrowsRightLeftIcon, current: false },
]

function classNames(...classes:any) {
  return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  const [open, setOpen] = useState(false);

  const [option, setOption] = useState<string | null >('Approvals');
  const { address } = useAccount();
  const optIn = useOptStatus(address);
  const locked = useIsLockedDown(address);

  type SideBar = {
    index: number,
    name:string | undefined,
    description:string | undefined
  }
  const [sideBarInfo, setSideBarInfo] = useState<SideBar | undefined>(undefined);

  const sideBar = () => {
    const sideBar2FA = {
      index:1,
      name: "Manage 2FA Wallets",
      description: "Add or remove 2FA wallets that can approve transactions on your behalf."
    }
    setSideBarInfo(sideBar2FA);
    setOpen(true);
  }

  const sideBarRecipients = () => {
    const sideBar2FA = {
      index:2,
      name: "Manage Global Recipients",
      description: "Add or remove Recipients wallets that can recive tranfers."
    }
    setSideBarInfo(sideBar2FA);
    setOpen(true);
  }


  return (
    <>    
      <Head>
        <title>Purgatory: Dashboard</title>
      </Head>
      {/* Main Content */}

      <div className="">
          <div className="relative">
            <Header/>
            {!address ? 
              <div className="mt-10 lg:mt-20">
                <ConnectWallet/>
              </div>
              :
            <>
              {optIn && !locked ?
              <>
                <header className="">
                  <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-xl tracking-tight text-gray-100">Dashboard</h1>
                  </div>
                </header>
                <main>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="justify-stretch md:mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:space-y-0 sm:space-x-3 sm:space-x-reverse mt-0 md:flex-row md:space-x-3">
                    <MainFunctions sideBar = { sideBar } sideBarRecipients = { sideBarRecipients } />
                  </div>  
                </div>
                <div className="mx-auto max-w-7xl py-6 px-4 lg:px-8">
                  <div className="flex flex-1 items-stretch overflow-hidden">
                    {/* Secondary column (hidden on smaller screens) */}
                    <main className="flex-1 overflow-y-auto">
                      {/* Primary column */}
                      <section aria-labelledby="primary-heading" className="flex h-full min-w-0 flex-1 flex-col lg:order-last">

                        {/*tabs*/}

                        <div>
                          <div className="sm:hidden">
                            <label htmlFor="tabs" className="sr-only">
                              Select an option
                            </label>
                            {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                            <select
                              id="tabs"
                              name="tabs"
                              onChange={(e) => setOption(e.target.value)}
                              className="block w-full rounded-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                              defaultValue={tabs.find((tab) => tab.current)?.name}
                            >
                              {tabs.map((tab) => (
                                <option key={tab.name}>{tab.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="hidden sm:block">
                            <div className="border-b border-gray-600">
                              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                {tabs.map((tab) => (
                                  <button
                                    key={tab.name}
                                    onClick={() => setOption(tab.name)}
                                    className={classNames(
                                      option === tab.name
                                        ? 'border-gray-200 text-white'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                      'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium'
                                    )}
                                    aria-current={tab.current ? 'page' : undefined}
                                  >
                                    <tab.icon
                                      className={classNames(
                                        option === tab.name ? 'text-white' : 'text-gray-400 group-hover:text-gray-500',
                                        '-ml-0.5 mr-2 h-5 w-5'
                                      )}
                                      aria-hidden="true"
                                    />
                                    <span>{tab.name}</span>
                                  </button>
                                ))}
                              </nav>
                            </div>
                          </div>
                        </div>
                        <div className="max-w-full">
                          {option === 'Approvals' ?
                            <OperatorFunctions />
                          :<></>}
                          {option === 'Transfers' ?
                            <TransferFunctions />
                          :<></>}
                        </div>
                        
                      </section>
                    </main>       

                
                    </div>
                  </div>
                </main>
              </>
              :<></>}
              {!optIn ?
              <div className="mt-10 lg:mt-20">
                <OptIn />
              </div>
              :<></>}
              {optIn && locked ?
                <div className="mt-10 lg:mt-20">
                  <LockedDown />
                </div>
                :<></>}
              </>
            }
            </div>
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <form className="flex h-full flex-col divide-y divide-gray-200 bg-gray-100 shadow-xl">
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-indigo-700 py-6 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg font-medium text-white">{sideBarInfo?.name}</Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-none bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={() => setOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-indigo-300">
                            {sideBarInfo?.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        {sideBarInfo?.index === 1 ?
                        <Manage2faWallets />
                        :
                        <ManageRecipients />
                      }
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
        </Dialog>
      </Transition.Root>
      
      
    </>
  )
}
