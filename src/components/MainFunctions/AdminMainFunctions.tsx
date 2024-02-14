
import React, { useState } from "react";
import { ethers, ContractReceipt, ContractTransaction, BigNumber } from "ethers";
import { contractAddress , contractABI } from "../../services/utils/contracts/purgatory/objects/contract";

import ErrorAlert from "../Notifications/ErrorAlert";
import TransactionModal from "../Notifications/TransactionModal";
import { 
    usePurgatoryGlobalTime
} from "../../services/utils/contracts/purgatory/UseFunctions";
import { timeLeft } from "../../services/utils/timer";
import { 
 
    ClockIcon

} from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useSigner } from "wagmi";
import { config } from "../../services/config";

const times = config.purgatoryTimes;


function AdminMainFunctions () {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [time, setTime] = useState<number | undefined>(undefined);
    const globalTime = usePurgatoryGlobalTime();
    const router = useRouter();
    const { data: signer } = useSigner();

    const handleSelectedChange = (event:any) => {
        
        setTime(event.target.value);
    }
        
    async function setPurgatoryTime(time:number | undefined) {
        if(!time)  {
            return;
        }
        setOpenModal(false);
        const timeFrame = time > 0 ? BigNumber.from(time*60) : BigNumber.from(300) /// Default : 5 mins
        try {
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            const tx = await contract.setPurgatoryTime(timeFrame);
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



    return (
        <>
            <TransactionModal open={openModal} tx={tx} txReceipt={txReceipt} title={"Transaction successful"} />
            <ErrorAlert showError={ showError } message={ errorMessage } ></ErrorAlert>
            <ul role="list" className="grid grid-cols-1">
                <li className="col-span-1 flex rounded-none shadow-sm">
                    <div
                    className="bg-indigo-600 flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-none"
                    >
                    <ClockIcon className="h-8 w-8 text-white-300" aria-hidden="true" />
                    </div>
                    <div className="flex flex-1 items-center justify-between truncate rounded-r-none border-t border-r border-b border-gray-200 bg-white">
                    <div className="flex-1 truncate px-4 py-1 text-xs">
                        <span className="font-medium text-gray-900 hover:text-gray-600">
                            Purgatory Time : {timeLeft(globalTime)}
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
                        onClick={() => setPurgatoryTime(time)}
                        >
                        <span className="sr-only text-sm">Time Options</span>
                        <ArrowPathIcon className="h-5 w-5 text-white-300" aria-hidden="true" />
                        
                        </button>
                    </div>
                    </div>
                </li>
            </ul>
        </>
      )
};

export default AdminMainFunctions;