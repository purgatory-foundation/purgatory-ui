import React, { useState } from "react";
import { useAccount } from "wagmi";
import { ethers, ContractReceipt, ContractTransaction, BigNumberish } from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI } from "../../services/utils/contracts/purgatory/objects/contract";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useGetGlobalWalletRecipientApprovals } from "../../services/utils/contracts/purgatory/UseFunctions";
import { formatStatus } from "../../services/utils/format";

import ErrorAlert from "../Notifications/ErrorAlert";
import TransactionModal from "../Notifications/TransactionModal";
import LiveCountDown from "../Helpers/LiveCountDown";
import { useRouter } from "next/navigation";
import { KeyIcon } from "@heroicons/react/20/solid";
import { useSigner } from "wagmi";
import FormattedWallet from "../Wallet/FormattedWallet";

export default function ManageRecipients() {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { address } = useAccount();
    const approvedGlobalWallets = useGetGlobalWalletRecipientApprovals(address);
    const router = useRouter();
    const { data: signer } = useSigner();

    const [walletApproval, setWalletApproval] = useState<string>("");

    const handleChange = (event:any) => {
        setWalletApproval(event.target.value);
    };

   
    async function setApprovedGlobalRecipient(wallet:string, approve:boolean) {
        setOpenModal(false);
    
        try {
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.setApprovedGlobalRecipient(wallet, approve);
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
                        Global Transfer Recipient Wallet Address
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
                
                    <div className="flex flex-shrink-0 lg:justify-end pb-4">
                        <button
                                type="submit"
                                onClick={() => setApprovedGlobalRecipient(walletApproval,true)}
                                className="mt-3 inline-flex w-full items-center justify-center rounded-none border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                disabled={txStatus}
                            >
                                {txStatus ? 'Loading...' : 'Add'}
                        </button>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">Active Global Tranfer Recipient Wallets</h2>
                </div>
                <div className="mt-0">
                    
                    <ul role="list" className="grid grid-cols-1 gap-6 divide-y">
                        {approvedGlobalWallets?.map((wallet, index) => (
                            
                        <li key={index} className={`col-span-1 ${wallet.ApprovalStatus === "Expired" || wallet.ApprovalStatus === "NoApproval" ? "hidden" : ""}`} >
                           <div className="flex w-full justify-between py-6">
                                <div className="flex items-left space-x-3">
                                       <h3 className="truncate text-sm font-medium text-gray-900">{<FormattedWallet address={wallet.recipient as `0x{string}`} /> }</h3>
                                       <a href={`${process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL}address/${wallet.recipient}`} className="block hover:bg-gray-50" target="_blank" rel="noreferrer">
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
                                                {wallet.RemainingTime > 0 ? <LiveCountDown time={wallet.RemainingTime } /> :""}    
                                            </div>
                                            :<></>
                                        } 
                                        {wallet.isTwoFactor ? 
                                            <div
                                            className="inline-flex items-center rounded-none  px-3 py-1 text-sm font-medium leading-4 text-gray-600"
                                            >
                                                <KeyIcon key={index} className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gray-200 text-gray-600 p-1" />   
                                            </div>
                                        :
                                            <button
                                                type="submit"
                                                onClick={() => setApprovedGlobalRecipient(wallet.recipient, false)}
                                                className="mt-3 inline-flex w-full items-center justify-center rounded-none border border-transparent bg-gray-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto text-xs"
                                                disabled={txStatus}
                                                >
                                                {txStatus ? 'Loading...' : wallet.RemainingTime > 0 ? 'Cancel' : 'Remove'}
                                            </button> 
                                        }
                                        
                                        
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
                        </li>                 
                        ))}
                    </ul>
                </div>
            </div>
            
        </>
       
      )
}