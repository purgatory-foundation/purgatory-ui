import React, { useState } from "react";
import { Switch } from '@headlessui/react'
import { useAccount } from "wagmi";
import { ethers, ContractReceipt, ContractTransaction, BigNumberish } from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI } from "../services/utils/contracts/purgatory/objects/contract";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useGet2faWalletApprovals } from "../services/utils/contracts/purgatory/UseFunctions";
import { formatStatus } from "../services/utils/format";

import ErrorAlert from "./Notifications/ErrorAlert";
import TransactionModal from "./Notifications/TransactionModal";
import LiveCountDown from "./Helpers/LiveCountDown";
import { useRouter } from "next/navigation";
import { useSigner } from "wagmi";
import FormattedWallet from "./Wallet/FormattedWallet";

function classNames(...classes:any) {
    return classes.filter(Boolean).join(' ')
  }

export default function Manage2faWallets() {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { address } = useAccount();
    const approvedWallets = useGet2faWalletApprovals(address, true);
    const [canToggleLockDown, setCanToggleLockDown] = useState<boolean>(false);
    const [isApprovedRecipient, setIsApprovedRecipient] = useState<boolean>(false);
    const router = useRouter();
    const { data: signer } = useSigner();

    const [walletApproval, setWalletApproval] = useState<string>("");

    const handleChange = (event:any) => {
        setWalletApproval(event.target.value);
    };

    
    async function set2FA(wallet:string, approve:boolean) {
        setOpenModal(false);
    
        try {
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.setTwoFactorWalletApprover(wallet, approve, canToggleLockDown, isApprovedRecipient);
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
        <>
            <TransactionModal open={openModal} tx={tx} txReceipt={txReceipt} title={"Transaction successful"} />
            <ErrorAlert showError={ showError } message={ errorMessage } ></ErrorAlert>
            <div className="px-4 sm:px-6 divide-y">
                <div className="space-y-6 pt-6 pb-5">
                    <div>
                        <label htmlFor="project-name" className="block text-sm font-medium text-gray-900">
                        2FA Wallet Address
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="project-name"
                                id="project-name"
                                className="block w-full rounded-none border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={walletApproval}
                                onChange={handleChange}
                                placeholder="0x..."
                            />
                        </div>
                    </div>
                    <div className="-mt-px flex">
                        <div className="flex w-0 flex-1">
                            <Switch.Group as="div" className="flex items-center mx-5">
                            <Switch
                                checked={canToggleLockDown}
                                onChange={setCanToggleLockDown}
                                className={classNames(
                                    canToggleLockDown ? 'bg-indigo-600' : 'bg-gray-200',
                                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                                )}
                                >
                            <span className="sr-only">Use setting</span>
                            <span
                                className={classNames(
                                    canToggleLockDown ? 'translate-x-5' : 'translate-x-0',
                                'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                )}
                            >
                                <span
                                className={classNames(
                                    canToggleLockDown ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                                )}
                                aria-hidden="true"
                                >
                                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                    <path
                                    d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    />
                                </svg>
                                </span>
                                <span
                                className={classNames(
                                    canToggleLockDown ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                                )}
                                aria-hidden="true"
                                >
                                <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                </svg>
                                </span>
                            </span>
                            </Switch>
                            <Switch.Label as="span" className="ml-3">
                                <span className="text-sm text-gray-500">Can Toggle Lock Down</span>
                            </Switch.Label>
                            </Switch.Group>
                        </div>
                        <div className="flex w-0 flex-1">
                            <Switch.Group as="div" className="flex items-center mx-5">
                            <Switch
                                checked={isApprovedRecipient}
                                onChange={setIsApprovedRecipient}
                                className={classNames(
                                    isApprovedRecipient ? 'bg-indigo-600' : 'bg-gray-200',
                                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                                )}
                                >
                            <span className="sr-only">Use setting</span>
                            <span
                                className={classNames(
                                    isApprovedRecipient ? 'translate-x-5' : 'translate-x-0',
                                'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                )}
                            >
                                <span
                                className={classNames(
                                    isApprovedRecipient ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                                )}
                                aria-hidden="true"
                                >
                                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                    <path
                                    d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    />
                                </svg>
                                </span>
                                <span
                                className={classNames(
                                    isApprovedRecipient ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                                )}
                                aria-hidden="true"
                                >
                                <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                </svg>
                                </span>
                            </span>
                            </Switch>
                            <Switch.Label as="span" className="ml-3">
                                <span className="text-sm text-gray-500">Approved Recipient</span>
                            </Switch.Label>
                            </Switch.Group>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 lg:justify-end pb-4">
                        <button
                                type="submit"
                                onClick={() => set2FA(walletApproval,true)}
                                className="mt-3 inline-flex w-full items-center justify-center rounded-none border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                disabled={txStatus}
                            >
                                {txStatus ? 'Loading...' : 'Add'}
                        </button>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">Active 2FA Wallets</h2>
                </div>
                <div className="mt-0">
                    
                    <ul role="list" className="grid grid-cols-1 gap-6 divide-y">
                        {approvedWallets?.map((wallet, index) => (
                            
                        <li key={index} className={`col-span-1 ${wallet.ApprovalStatus === "Expired" || wallet.ApprovalStatus === "NoApproval" ? "hidden" : ""}`} >
                           <div className="flex w-full justify-between py-6">
                                <div className="flex items-left space-x-3">
                                       <h3 className="truncate text-sm font-medium text-gray-900">{<FormattedWallet address={wallet.approver as `0x{string}`} /> }</h3>
                                       <a href={`${process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL}address/${wallet.approver}`} className="block hover:bg-gray-50" target="_blank" rel="noreferrer">
                                           <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                       </a>
                                </div>
                               <div className="flex justify-end space-x-4">
                                    <div className="flex -space-x-1 overflow-hidden">
                                        {formatStatus(wallet.ApprovalStatus, wallet.RemainingTime, false).map((status, index) => (
                                            <status.icon key={index} className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gray-200 text-gray-600 p-1" />
                                        ))}
                                    </div>
                                    {/*&& wallet.RemainingTime <= 0 */}
                                    {
                                    (wallet.ApprovalStatus == "Approved" && wallet.RemainingTime <= 0) || (wallet.ApprovalStatus == "InPurgatory" && wallet.RemainingTime > 0) ? 
                                    <div className="ml-5 flex-shrink-0">
                                        {wallet.RemainingTime > 0 ? 
                                            <div
                                                className="inline-flex items-center rounded-none  px-3 py-1 text-sm font-medium leading-4 text-gray-600"
                                                >
                                                {wallet.RemainingTime > 0 ? <LiveCountDown time={wallet.RemainingTime} /> :""}    
                                            </div>
                                            :<></>
                                        }
                                        <button
                                            type="submit"
                                            onClick={() => set2FA(wallet.approver, false)}
                                            className="mt-3 inline-flex w-full items-center justify-center rounded-none border border-transparent bg-gray-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto text-xs"
                                            disabled={txStatus}
                                            >
                                            {txStatus ? 'Loading...' : 'Remove'}
                                        </button>
                                        
                                    </div>
                                    :
                                    wallet.ApprovalStatus == "Approved" || wallet.ApprovalStatus == "InPurgatory" && wallet.RemainingTime > 0 ?
                                    <div className="ml-5 flex-shrink-0">
                                        <div
                                            className="inline-flex items-center rounded-none  px-3 py-1 text-sm font-medium leading-4 text-gray-600"
                                        >
                                            {wallet.RemainingTime > 0 ? <LiveCountDown time={wallet.RemainingTime} />:""}    
                                        </div>
                                    </div>
                                    :<></>
                                    }
                                    
                               </div>
                               
                           </div>
                           {wallet.canToggleLockDown || wallet.isApprovedRecipient ?
                                <div className="flex w-full items-left mt-2 space-x-2">
                                    { wallet.canToggleLockDown ? 
                                        <span className="inline-flex items-center rounded-none bg-indigo-100 px-2.5 py-0.5 text-xs md:text-sm font-medium text-indigo-800">Can Toggle Lock Down</span>
                                    :""}
                                    {wallet.isApprovedRecipient ? 
                                        <span className="inline-flex items-center rounded-none bg-indigo-100 px-2.5 py-0.5 text-xs md:text-sm font-medium text-indigo-800">Approved Recipient</span>
                                    :""} 
                                </div>
                           :<></>}
                        </li>                 
                        ))}
                    </ul>
                </div>
            </div>
            
        </>
       
      )
}