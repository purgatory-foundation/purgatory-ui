import React, { useState, useEffect } from "react";
import { Switch } from '@headlessui/react';
import { ethers, ContractReceipt, ContractTransaction } from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI } from "../services/utils/contracts/purgatory/objects/contract";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { shortenAddress } from "../services/utils/shorten";

import ErrorAlert from "./Notifications/ErrorAlert";
import TransactionModal from "./Notifications/TransactionModal";
import { useSigner } from "wagmi";

function classNames(...classes:any) {
    return classes.filter(Boolean).join(' ')
}

export default function TwoFactorOptions(props:any) {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [walletApproval, setWalletApproval] = useState<boolean>(false);
    const [canToggleLockDown, setCanToggleLockDown] = useState<boolean>(false);
    const [isApprovedRecipient, setIsApprovedRecipient] = useState<boolean>(false);
    const wallet = props?.wallet;
    const router = useRouter();
    const { data: signer } = useSigner();

    useEffect(() => {
        if(props?.wallet.approved){
            setWalletApproval(true);
        }
        if(props?.wallet.canToggleLockDown){
            setCanToggleLockDown(true);
        }
        if(props?.wallet.isApprovedRecipient){
            setIsApprovedRecipient(true);
        }
    }, [props?.wallet.approved, props?.wallet.canToggleLockDown, props?.wallet.isApprovedRecipient]);

    useEffect(() => {
        if(!walletApproval) {
            setCanToggleLockDown(false);
            setIsApprovedRecipient(false);
        }
    }, [walletApproval]);

    useEffect(() => {
        if(canToggleLockDown) {
            setWalletApproval(true);
        }
    }, [canToggleLockDown]);

    useEffect(() => {
        if(isApprovedRecipient) {
            setWalletApproval(true);
        }
    }, [isApprovedRecipient]);

    async function set2FA() {
        setOpenModal(false);
    
        try {
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.setTwoFactorWalletApprover(wallet.approver, walletApproval, canToggleLockDown, isApprovedRecipient);
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

    return ( <>
        <TransactionModal open={openModal} tx={tx} txReceipt={txReceipt} title={"Transaction successful"} />
        <ErrorAlert showError={ showError } message={ errorMessage } ></ErrorAlert>
        <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="">
                <div className="flex items-center space-x-3">
                    <h3 className="truncate text-sm font-medium text-gray-900">{shortenAddress(wallet.approver)}</h3>
                </div>
            </div>
            <a href={`${process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL}address/${wallet.approver}`} className="block hover:bg-gray-50" target="_blank" rel="noreferrer">
                <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </a>
        </div>
        <div>
            <div className="-mt-px flex">
                <div className="flex w-0 flex-1">
                    <Switch.Group as="div" className="flex items-center mx-5">
                    <Switch
                        checked={walletApproval}
                        onChange={setWalletApproval}
                        className={classNames(
                            walletApproval ? 'bg-indigo-600' : 'bg-gray-200',
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                        )}
                        >
                    <span className="sr-only">Use setting</span>
                    <span
                        className={classNames(
                            walletApproval ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        )}
                    >
                        <span
                        className={classNames(
                            walletApproval ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
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
                            walletApproval ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
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
                        <span className="text-sm text-gray-500">Approved</span>
                    </Switch.Label>
                    </Switch.Group>
                </div>
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
                        <span className="text-sm text-gray-500">Toogle Lock Down</span>
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
            <div className="flex flex-shrink-0 lg:justify-end p-4">
                <button
                        type="submit"
                        onClick={() => set2FA()}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-none border border-transparent bg-gray-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto text-xs"
                        disabled={txStatus}
                    >
                        {txStatus ? 'Loading...' : 'Update'}
                </button>
            </div>
        </div>
    </>)};