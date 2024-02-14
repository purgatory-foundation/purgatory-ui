import { useWeb3Modal } from "@web3modal/react";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ArrowsRightLeftIcon, BriefcaseIcon } from '@heroicons/react/20/solid';
import FormattedWallet from "./FormattedWallet";
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react';
import Link from "next/link";

import {
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  ComputerDesktopIcon,
  KeyIcon,
  ServerStackIcon
} from '@heroicons/react/20/solid'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ComputerDesktopIcon,current: false },
  { name: '2FA', href:'/2fa', icon: KeyIcon,current: false},
  { name: 'Collection Manager', icon: ServerStackIcon, href: '/admin', current: false }
]

function classNames(...classes:any) {
  return classes.filter(Boolean).join(' ')
}

export default function ConnectButton() {
  const [loading, setLoading] = useState(false);
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  
  const Icon = isConnected ? BriefcaseIcon : ArrowsRightLeftIcon as any;

  const label = () => { 
    return (!address ? "Connect Wallet" : <FormattedWallet address={address} />) 
  }

  async function onOpen() {
    setLoading(true);
    await open();
    setLoading(false);
  }

  function connect() {
    onOpen();
  }

  return (
    <>
    {!isConnected ? 
    <button 
        onClick={connect} 
        disabled={loading}
        className="inline-flex items-center bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
        <Icon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
      { loading ? "Loading..." : label() }
    </button>
    :
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
          <Icon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          { loading ? "Loading..." : label() }
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {navigation.map((item, index) => (
                <Menu.Item key={index}>
                {({ active }) => (
                  <Link
                    href={item.href}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'group flex items-center px-4 py-2 text-sm'
                    )}
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )}
              </Menu.Item>
            ))}
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm w-full'
                  )}
                >
                  <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Disconnect
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
    }
    </>
  );
}