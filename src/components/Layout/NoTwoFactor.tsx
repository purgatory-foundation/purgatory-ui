import { KeyIcon } from '@heroicons/react/20/solid'

export default function NoTwoFactor() {
  return (
    <div className="mx-auto max-w-lg">
      <div>
        <div className="text-center">
            <KeyIcon className="mx-auto h-12 w-12 text-gray-200" aria-hidden="true" />
          <h2 className="mt-2 text-base font-semibold leading-6 text-gray-100">Wallet not registered</h2>
          <p className="mt-1 text-sm text-gray-400">
            It appears that this wallet is not registered as a 2FA wallet. Please register it first from your main wallet.
            <br />
            <br />
            Or Connect from your 2FA wallet.
          </p>
        </div>
      </div>
    </div>
  )
}
