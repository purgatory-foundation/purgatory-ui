import React, { useState } from "react";
import { ethers, ContractReceipt, ContractTransaction, BigNumber } from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI } from "../../services/utils/contracts/purgatory/objects/contract";

import ErrorAlert from "../Notifications/ErrorAlert";
import TransactionModal from "../Notifications/TransactionModal";
import { 
    useOptStatus, 
    useIsLockedDown ,
    useLockDownStatus,
} from "../../services/utils/contracts/purgatory/UseFunctions";
import LiveCountDown from "../Helpers/LiveCountDown";
import { 
    LockClosedIcon, 
    LockOpenIcon, 
    ShieldCheckIcon,
    ShieldExclamationIcon,
    WalletIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSigner } from "wagmi";

function TwoFactorMainFunctions (props:any) {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const account = props.selectedWallet;
    const optIn = useOptStatus(account);
    const locked = useIsLockedDown(account);
    const lockDownStatus = useLockDownStatus(account);
    const router = useRouter();
    const sideBarRecipients = props?.sideBarRecipients;
    const { data: signer } = useSigner();

    function handleOpenSideBarRecipients(){
        sideBarRecipients(false);
    }

    async function setLockDownMode() {
        setOpenModal(false);        
        try{
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.enableLockDownModeFromTwoFactorWalletApprover(account);
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

    ///setApprovalForDeactivatingLockDown

    async function setUnLockedMode() {
        setOpenModal(false);        
        try{
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.setApprovalForDeactivatingLockDown(account);
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-1 md:mr-5 mr-0">
            <TransactionModal open={openModal} tx={tx} txReceipt={txReceipt} title={"Transaction successful"} />
            <ErrorAlert showError={ showError } message={ errorMessage } ></ErrorAlert>
            <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 md:mr-5 mr-0">
                {!locked ?
                <>
                    {optIn ?
                        <>
                        <li className="col-span-1 flex rounded-none shadow-sm">
                            <div
                            className="bg-indigo-600 flex-shrink-0 flex items-center justify-center w-16 text-white text-xs font-medium rounded-l-none"
                            >
                            {optIn ? 
                                <>
                                    <ShieldCheckIcon className="h-8 w-8 text-white-300" aria-hidden="true" />
                                </> 
                                : 
                                <>
                                    <ShieldExclamationIcon className="h-8 w-8 text-white-300" aria-hidden="true" />
                                </>
                            }
                            </div>
                            <div className="flex flex-1 items-center justify-between truncate rounded-r-none border-t border-r border-b border-gray-200 bg-white">
                            <div className="flex-1 truncate px-4 py-1 text-xs">
                                <span className="font-medium text-gray-900 hover:text-gray-600">
                                    {optIn ? 'Opted In' : 'Opted Out'}
                                </span>
                                <p className="text-gray-500">Main wallet is {!optIn ? 'not' : ''} protected</p>
                            </div>
                            <div className="flex-shrink-0 pr-2">
                            </div>
                            </div>
                        </li>
                        <li className="col-span-1 flex rounded-none shadow-sm">
                            <div
                            className="bg-indigo-600 flex-shrink-0 flex items-center justify-center w-16 text-white text-xs font-medium rounded-l-none"
                            >
                                <WalletIcon className="h-8 w-8 text-white-300" aria-hidden="true" />
                                </div>
                                <div className="flex flex-1 items-center justify-between truncate rounded-r-none border-t border-r border-b border-gray-200 bg-white">
                                <div className="flex-1 truncate px-4 py-1 text-xs">
                                    <span className="font-medium text-gray-900 hover:text-gray-600">
                                    Global Recipients
                                    </span>
                                    <p className="text-gray-500">Manage Global Recipients</p>
                                </div>
                                <div className="flex-shrink-0 pr-2">
                                    <button
                                    type="button"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    onClick={() => handleOpenSideBarRecipients()}
                                    >
                                    <span className="sr-only">Time Options</span>
                                    <Cog6ToothIcon className="h-5 w-5 text-white-300" aria-hidden="true" />
                                    
                                    </button>
                                </div>
                            </div>
                        </li>
                        </>
                        
                
                    :
                    <></>
                    }
                </>
                 :<></>
                }
                {optIn ?
                <>
                {locked ?
                    <>
                        <li className="col-span-1 flex rounded-none shadow-sm">
                            <div
                            className="bg-indigo-600 flex-shrink-0 flex items-center justify-center w-16 text-white text-xs font-medium rounded-l-none"
                            >
                            {!locked ? 
                                <>
                                    <LockOpenIcon className="h-8 w-8 text-white-300" aria-hidden="true" />
                                </> 
                                : 
                                <>
                                    <LockClosedIcon className="h-8 w-8 text-white-300" aria-hidden="true" />
                                </>
                            }
                            </div>
                            <div className="flex flex-1 items-center justify-between truncate rounded-r-none border-t border-r border-b border-gray-200 bg-white">
                                <div className="flex-1 truncate px-4 py-1 text-xs">
                                    <span className="font-medium text-gray-900 hover:text-gray-600">
                                        {!locked ? 'Not Locked Down' : 'Locked Down'}
                                    </span>
                                    <p className="text-gray-500">
                                    {locked && lockDownStatus && lockDownStatus?.RemainingTime > 0 ? 
                                    <>
                                        <LiveCountDown time={lockDownStatus?.RemainingTime} />
                                    </>
                                    
                                    : 
                                    <></>}
                                    </p>
                                </div>
                            </div>
                        </li>
                        {locked && lockDownStatus && lockDownStatus?.RemainingTime > 0 ?
                        <div className="flex flex-shrink-0 lg:justify-end py-4">
                            <button
                                type="button"
                                className="mx-auto inline-flex items-center border border-transparent bg-indigo-600 px-6 py-3 text-sm font-medium text-gray-100 shadow-sm hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                disabled={txStatus}
                                onClick={setUnLockedMode}
                                >
                                <LockOpenIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                                Fast Unlock
                            </button>
                        </div>
                        :<></>}
                    </>
                    
                :
                <div className="flex flex-shrink-0 lg:justify-end py-1">
                    <button
                        type="button"
                        className="mx-auto inline-flex items-center border border-transparent bg-indigo-600 px-6 py-3 text-sm font-medium text-gray-100 shadow-sm hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        disabled={txStatus}
                        onClick={setLockDownMode}
                        >
                        <LockClosedIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                        Lock Down
                    </button>
                </div>
                }
                </>
                :<></>
                }
                
            </ul>
              
        </div>
      )
};

export default TwoFactorMainFunctions;