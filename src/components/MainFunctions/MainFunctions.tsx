import React, { useState } from "react";
import { useAccount } from "wagmi";
import { ethers, ContractReceipt, ContractTransaction, BigNumber} from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI } from "../../services/utils/contracts/purgatory/objects/contract";

import ErrorAlert from "../Notifications/ErrorAlert";
import TransactionModal from "../Notifications/TransactionModal";
import { 
    useOptStatus, 
    useIsLockedDown ,
    useLockDownStatus,
    useGetShortLiveApprovalLength
} from "../../services/utils/contracts/purgatory/UseFunctions";
import { timeLeft } from "../../services/utils/timer";
import { 
    LockClosedIcon, 
    LockOpenIcon, 
    ClockIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon,
    KeyIcon,
    Cog6ToothIcon,
    WalletIcon
} from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import LiveCountDown from "../Helpers/LiveCountDown";
import { useRouter } from "next/navigation";
import { useSigner } from "wagmi";
import { config } from "../../services/config";

const times = config.purgatoryTimes;

function MainFunctions (props:any) {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { address } = useAccount();
    const optIn = useOptStatus(address);
    const locked = useIsLockedDown(address);
    const [time, setTime] = useState<number | undefined>(undefined);
    const openSideBar  = props?.sideBar;
    const sideBarRecipients = props?.sideBarRecipients;
    const lockDownStatus = useLockDownStatus(address);
    const router = useRouter();
    const shortLivedApprovalStatus = useGetShortLiveApprovalLength(address);
    const { data: signer } = useSigner();


    const handleSelectedChange = (event:any) => {
        
        setTime(event.target.value);
    }
    
    function handleOpenSideBar(){
        openSideBar(true);
    }

    function handleOpenSideBarRecipients(){
        sideBarRecipients(false);
    }
    

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

    async function setShortLivedApprovalLength(time:number | undefined) {
        if(!time)  {
            return;
        }
        setOpenModal(false);
        const timeFrame = time > 0 ? BigNumber.from(time*60) : BigNumber.from(300) /// Default : 5 mins
        try {
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.setShortLivedApprovalLength(timeFrame);
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
                console.log(error.message);
                setErrorMessage(`${error.message.slice(0,100)}...`);
            } else if(typeof error.error.message !== undefined){
                console.log(error.error.message);
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
                    <li className="col-span-1 flex rounded-none shadow-sm">
                        <div
                        className="bg-indigo-600 flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-none"
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
                            <p className="text-gray-500">Your wallet is {!optIn ? 'not' : ''} protected</p>
                        </div>
                        <div className="flex-shrink-0 pr-2">
                            <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={txStatus}
                            onClick={() => setOptIn(!optIn)}
                            >
                            <span className="sr-only">Open options</span>
                            {optIn ? 
                                <>
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 text-white-300" aria-hidden="true" />
                                </> 
                                : 
                                <>
                                    <ArrowLeftOnRectangleIcon className="h-5 w-5 text-white-300" aria-hidden="true" />
                                </>
                            }
                            
                            </button>
                        </div>
                        </div>
                    </li>
                    :
                    <div className="flex flex-shrink-0 lg:justify-end py-4">
                        <button
                            type="button"
                            className="mx-auto inline-flex items-center rounded-none border border-transparent bg-indigo-600 px-6 py-3 text-sm font-medium text-gray-100 shadow-sm hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            disabled={txStatus}
                            onClick={() => setOptIn(!optIn)}
                            >
                            <ArrowLeftOnRectangleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                            Opt In
                        </button>
                    </div>
                    }
                </>
                 :<></>
                }
                {optIn && !locked ?
                <>
                <li className="col-span-1 flex rounded-none shadow-sm">
                    <div
                    className="bg-indigo-600 flex-shrink-0 flex items-center justify-center w-16 text-white text-xs font-medium rounded-l-none"
                    >
                    <ClockIcon className="h-8 w-8 text-white-300" aria-hidden="true" />
                    </div>
                    <div className="flex flex-1 items-center justify-between truncate rounded-r-none border-t border-r border-b border-gray-200 bg-white">
                    <div className="flex-1 truncate px-4 py-1 text-xs">
                        <span className="font-medium text-gray-900 hover:text-gray-600">
                            Short Approvals : {shortLivedApprovalStatus && shortLivedApprovalStatus === 0 ? <ClockIcon className="h-5 w-5 text-red-300" aria-hidden="true" /> : timeLeft(shortLivedApprovalStatus)}
                        </span>
                        <select
                                name="time-selection"
                                className="mt-1 block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 rounded-none"
                                value={time}
                                onChange={handleSelectedChange}
                            >
                                <option value={undefined}>Select</option>
                                <>
                                {times.map((time, index) => (
                                    <option value={time.value} key={index}>{time.name}</option>
                                ))}
                                </>
                        </select>
                    </div>
                    <div className="flex-shrink-0 pr-2">
                        <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        disabled={txStatus}
                        onClick={() => setShortLivedApprovalLength(time)}
                        >
                        <span className="sr-only">Time Options</span>
                        <ArrowPathIcon className="h-5 w-5 text-white-300" aria-hidden="true" />
                        
                        </button>
                    </div>
                    </div>
                </li>
                <li className="col-span-1 flex rounded-none shadow-sm">
                    <div
                    className="bg-indigo-600 flex-shrink-0 flex items-center justify-center w-16 text-white text-xs font-medium rounded-l-none"
                    >
                    <KeyIcon className="h-8 w-8 text-white-300" aria-hidden="true" />
                    </div>
                    <div className="flex flex-1 items-center justify-between truncate rounded-r-none border-t border-r border-b border-gray-200 bg-white">
                    <div className="flex-1 truncate px-4 py-1 text-xs">
                        <span className="font-medium text-gray-900 hover:text-gray-600">
                            2FA
                        </span>
                        <p className="text-gray-500">Manage 2FA Wallet</p>
                    </div>
                    <div className="flex-shrink-0 pr-2">
                        <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => handleOpenSideBar()}
                        >
                        <span className="sr-only">Time Options</span>
                        <Cog6ToothIcon className="h-5 w-5 text-white-300" aria-hidden="true" />
                        
                        </button>
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
                :<></>
                }
                {optIn ?
                <>
                {locked ?
                <li className="col-span-1 flex rounded-none shadow-sm">
                    <div
                    className="bg-indigo-600 flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-none"
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
                    <div className="flex-1 truncate px-4 py-2 text-sm">
                        <span className="font-medium text-gray-900 hover:text-gray-600">
                            {!locked ? 'Not Locked Down' : 'Locked Down'}
                        </span>
                        <p className="text-gray-500 flex">
                            {locked && timeLeft(lockDownStatus?.RemainingTime) ? 
                            <>
                                <LiveCountDown time={lockDownStatus?.RemainingTime} />
                            </> : 
                            <>
                            Click to unlock
                            </>}
                        </p>
                    </div>
                    <div className="flex-shrink-0 pr-2">
                        {locked && lockDownStatus && lockDownStatus?.RemainingTime <= 0 ?
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={txStatus}
                            onClick={setToggleLockDownMode}
                            >
                            <span className="sr-only">Set Lock Down</span>
                            {!locked ? 
                                <>
                                    <LockClosedIcon className="h-5 w-5 text-white-300" aria-hidden="true" />
                                </> 
                                : 
                                <>
                                    <LockOpenIcon className="h-5 w-5 text-white-300" aria-hidden="true" />
                                </>
                            }
                        </button>
                        :
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={true}
                            onClick={()=>{}}
                            >
                            <span className="sr-only">Open options</span>
                            <LockOpenIcon className="h-5 w-5 text-white-300" aria-hidden="true" />
                        </button>}
                    </div>
                    </div>
                </li>
                :
                <></>
                }
                </>
                :<></>
                }
                
            </ul>
            {optIn  && !locked?
            <div className="flex justify-center md:justify-start py-4">
                <button
                    type="button"
                    className="inline-flex items-center rounded-none border border-transparent bg-indigo-600 px-6 py-3 text-sm font-medium text-gray-100 shadow-sm hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    disabled={txStatus}
                    onClick={setToggleLockDownMode}
                    >
                    <LockClosedIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                    Lock Down
                </button>
            </div>
            :<></>}
              
        </div>
      )
};

export default MainFunctions;