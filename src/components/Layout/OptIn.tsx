import { ChevronRightIcon, PowerIcon, BriefcaseIcon, KeyIcon, LockClosedIcon } from '@heroicons/react/20/solid'
import React, { useState } from "react";
import { useSigner } from "wagmi";
import { ethers, ContractReceipt, ContractTransaction, BigNumber, BigNumberish } from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI } from "../../services/utils/contracts/purgatory/objects/contract";
import { useRouter } from "next/navigation";
import ErrorAlert from "../Notifications/ErrorAlert";
import TransactionModal from "../Notifications/TransactionModal";

const items = [
  {
    name: 'Operator and Transfer approvals',
    description: 'Have control over your NFTs and who can transfer them.',
    href: '#',
    iconColor: 'bg-pink-500',
    icon: BriefcaseIcon,
  },
  {
    name: '2FA wallets',
    description: 'Manage your 2FA wallets to setup approvals on your behalf.',
    href: '#',
    iconColor: 'bg-purple-500',
    icon: KeyIcon,
  },
  {
    name: 'Lock your wallet',
    description: 'Lock your wallet to prevent any transfers from happening.',
    href: '#',
    iconColor: 'bg-yellow-500',
    icon: LockClosedIcon,
  },
]

function classNames(...classes:any) {
  return classes.filter(Boolean).join(' ')
}

export default function OptIn() {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const router = useRouter();
    const { data: signer } = useSigner();

    async function setOptIn(status:boolean) {
        setOpenModal(false);        
        try{
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const timeFrame = BigNumber.from(0);
            const tx = await contract.setOptStatus(status, timeFrame);
            setTx(tx);
            setOpenModal(true);
            const txReceipt = await tx.wait();
            setTxReceipt(txReceipt)
            setTxStatus(false);
            setOpenModal(false);
            router.refresh();
        } catch(error:any) {
            setTxStatus(false);
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
        <TransactionModal open={openModal} tx={tx} txReceipt={txReceipt} title={"Welcome!"} />
        <ErrorAlert showError={ showError } message={ errorMessage } ></ErrorAlert>
      <h2 className="text-base font-semibold leading-6 text-gray-200">Welcome to the purgatory System</h2>
      <p className="mt-1 text-sm text-gray-300 mb-10">Opt in to start using its benefits</p>
      <button
            type="button"
            disabled={txStatus}
            onClick={() => setOptIn(true)}
            className="relative block w-full border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
            <PowerIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />

            <span className="mt-5 inline-flex items-center bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Opt In</span>
        </button>
      <ul role="list" className="mt-6 divide-y divide-gray-200 border-b border-t border-gray-200">
        {items.map((item, itemIdx) => (
          <li key={itemIdx}>
            <div className="group relative flex items-start space-x-3 py-4">
              <div className="flex-shrink-0">
                <span
                  className={classNames(item.iconColor, 'inline-flex h-10 w-10 items-center justify-center ')}
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
