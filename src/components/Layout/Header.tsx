import { Disclosure, Menu } from '@headlessui/react'
import Link from "next/link";
import ConnectButton from "../Wallet/ConnectButton";
import WrongNetwork from './WrongNetwork';

export default function Header() {
  return (
    <>
      <div className="min-h-full">
        <WrongNetwork />
        <Disclosure as="nav" className="">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Link href="/">
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-VT323">PURGATORY</h1>
                      </Link>
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                        <ConnectButton />
                        </div>
                      </Menu>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>
      </div>
    </>
  )
}
