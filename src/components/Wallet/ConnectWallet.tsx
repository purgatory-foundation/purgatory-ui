import { BriefcaseIcon } from '@heroicons/react/24/outline';
import ConnectButton from './ConnectButton';


export default function ConnectWallet() {
  return (
      <div className="text-center">
      <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
      <h3 className="mt-2 text-sm font-semibold text-gray-400">Wallet Not Connected</h3>
      <p className="mt-1 text-sm text-gray-200">Get started by conecting your wallet</p>
      <div className="mt-6">
          <ConnectButton />
      </div>
      </div>
  )
}