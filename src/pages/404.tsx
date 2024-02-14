import { ShieldExclamationIcon } from '@heroicons/react/20/solid'

export default function Custom404() {
    <>
    <div className='relative mt-10 lg:mt-20'>
    <div className="mx-auto max-w-lg">
      <div>
        <div className="text-center">
            <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-200" aria-hidden="true" />
          <h2 className="mt-2 text-base font-semibold leading-6 text-gray-100">404</h2>
          <p className="mt-1 text-sm text-gray-400">
            Page not found
          </p>
        </div>
      </div>
    </div>
    </div>
    
    </>
  }