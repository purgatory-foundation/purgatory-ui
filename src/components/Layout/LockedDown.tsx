import { ChevronRightIcon, KeyIcon, LockClosedIcon, LockOpenIcon, ArrowsRightLeftIcon, BuildingStorefrontIcon, ClockIcon } from '@heroicons/react/20/solid'
import React, { useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers, ContractReceipt, ContractTransaction, BigNumber, BigNumberish } from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI } from "../../services/utils/contracts/purgatory/objects/contract";
import { useRouter } from "next/navigation";
import ErrorAlert from "../Notifications/ErrorAlert";
import TransactionModal from "../Notifications/TransactionModal";
import { 
    useLockDownStatus,
    useIsLockedDown
} from "../../services/utils/contracts/purgatory/UseFunctions";
import { timeLeft } from "../../services/utils/timer";
import LiveCountDown from "../Helpers/LiveCountDown";



const items = [
  {
    name: 'Operator tranfers denied',
    description: 'Your NFTs wont be able to sell.',
    href: '#',
    iconColor: 'bg-pink-500',
    icon: BuildingStorefrontIcon,
  },
  {
    name: 'Transfers denied',
    description: 'Your NFTs wont be able to be transfered.',
    href: '#',
    iconColor: 'bg-purple-500',
    icon: ArrowsRightLeftIcon,
  },
  {
    name: '2FA',
    description: 'Use your 2FA wallet to approve or deny this state.',
    href: '#',
    iconColor: 'bg-yellow-500',
    icon: KeyIcon,
  },
]

function classNames(...classes:any) {
  return classes.filter(Boolean).join(' ')
}

export default function LockedDown() {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { address } = useAccount();
    const lockDownStatus = useLockDownStatus(address);
    const locked = useIsLockedDown(address);
    const router = useRouter();
    const { data: signer } = useSigner();

    async function setToggleLockDownMode() {
        setOpenModal(false);        
        try{
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.toggleLockDownMode();
            setTx(tx);
            setOpenModal(true);
            const txReceipt = await tx.wait();
            setTxReceipt(txReceipt)
            setTxStatus(false);
            setOpenModal(false);
            router.refresh();
        } catch(error:any) {
            setTxStatus(false);
            console.log(error.message)
            if(typeof error.message !== undefined){
                setErrorMessage(`${error.message.slice(0,100)}...`);
            } else if(typeof error.error.message !== undefined){
                setErrorMessage(`${error.error.message.slice(0,100)}...`);
            } else {
                setErrorMessage("Unknown error ocurred");
            }
            
            setShowError(true);
            
            setTimeout(() => {
                setShowError(false);
                setErrorMessage(null);
            },5000);
            
        }  
    }

  return (
    <div className="mx-auto max-w-lg px-5 md:px-0">
        <TransactionModal open={openModal} tx={tx} txReceipt={txReceipt} title={"Unlock request!"} />
        <ErrorAlert showError={ showError } message={ errorMessage } ></ErrorAlert>
         
      <h2 className="=text-base font-semibold leading-6 text-gray-200 mb-10">Locked Down</h2>
        {locked && timeLeft(lockDownStatus?.RemainingTime) ? 
        <>
            <div
                className="relative block w-full  border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                {/*
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                    />
                </svg>
                */}
                <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />

                <span className="mt-2 inline-flex text-sm font-semibold text-gray-400"><ClockIcon className="mx-auto h-5 w-5 text-gray-400" aria-hidden="true" />{' '}<LiveCountDown time={lockDownStatus?.RemainingTime} />{' '}to unlock</span>
            </div>
            
        </> : 
        <>
            <button
                type="button"
                disabled={txStatus}
                onClick={() => setToggleLockDownMode()}
                className="relative block w-full  border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                {/*
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                    />
                </svg>
                */}
                <LockOpenIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />

                <span className="mt-2 block text-sm font-semibold text-gray-100">Unlock</span>
            </button>
        </>}
      
      <ul role="list" className="mt-6 divide-y divide-gray-200 border-b border-t border-gray-200">
        {items.map((item, itemIdx) => (
          <li key={itemIdx}>
            <div className="group relative flex items-start space-x-3 py-4">
              <div className="flex-shrink-0">
                <span
                  className={classNames(item.iconColor, 'inline-flex h-10 w-10 items-center justify-center')}
                >
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-200">
                  <a href={item.href}>
                    <span className="absolute inset-0" aria-hidden="true" />
                    {item.name}
                  </a>
                </div>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <div className="flex-shrink-0 self-center">
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex">
        <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          View more on our documentation
          <span aria-hidden="true"> &rarr;</span>
        </a>
      </div>
    </div>
  )
}