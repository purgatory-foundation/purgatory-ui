import { useNetwork } from 'wagmi';

export default function WrongNetwork() {
    const { chain } = useNetwork();
  return (
    <>
        {chain && chain?.name !== "Ethereum"  ?
        <div className="flex items-center gap-x-6 bg-indigo-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
            <p className="text-sm leading-6 text-white">
                <strong className="font-semibold">Your are connected to {chain?.name} Network</strong>
            </p>
            <div className="flex flex-1 justify-end">
            
            </div>
        </div>
        :<></>}
    </>
  )
}