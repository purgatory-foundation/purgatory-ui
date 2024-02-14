import { BriefcaseIcon } from '@heroicons/react/20/solid'

export default function SelectMainWallet() {
  return (
    <div className="mx-auto max-w-lg">
      <div>
        <div className="text-center">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-200" aria-hidden="true" />
          <h2 className="mt-2 text-base font-semibold leading-6 text-gray-100">Select main wallet</h2>
          <p className="mt-1 text-sm text-gray-400">
            Select a main wallet to continue
          </p>
        </div>
      </div>
    </div>
  )
}
