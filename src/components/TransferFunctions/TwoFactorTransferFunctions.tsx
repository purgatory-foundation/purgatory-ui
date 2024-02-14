import React, { useState } from "react";
import { ethers, ContractReceipt, ContractTransaction } from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI  } from "../../services/utils/contracts/purgatory/objects/contract";
import { formatStatus } from "../../services/utils/format";

import ErrorAlert from "../Notifications/ErrorAlert";
import TransactionModal from "../Notifications/TransactionModal";
import { useGetWalletRecipientApprovals } from "../../services/utils/contracts/purgatory/UseFunctions";
import LiveCountDown from "../Helpers/LiveCountDown";
import { useRouter } from "next/navigation";
import { useSigner } from "wagmi";
import FormattedWallet from "../Wallet/FormattedWallet";
import TrustedCollection from "../Helpers/TrustedCollection";

const etherscanLink = process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL !== undefined ? process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL : "";

function TwoFactorTransferFunctions (props: any) {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const  account  = props?.account;
    const router = useRouter();
    const { data: signer } = useSigner();

    const myApprovals = useGetWalletRecipientApprovals(account, null);

    async function setApprovedRecipient(collectionAddress: string | undefined, recipient: string | undefined, approved:boolean) {
        setOpenModal(false);
        console.log("setApprovedRecipient", collectionAddress, recipient, approved);
        if(collectionAddress === undefined || recipient === undefined) return;        
        try{
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.setApprovalForTransferRecipient(account, recipient, collectionAddress, approved);
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
    
    const renderStatus = () => {
       
            return (
                <>
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-600">
                        <thead>
                            <tr className="">
                            <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-200 sm:pl-0">
                                Collection
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-200">
                                Recipient
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-200">
                                Status
                            </th>
                            <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-200 sm:pr-0">
                                Action
                            </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 ">
                            {myApprovals?.map((approval, index) => (
                                <tr key={index} className="">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-200 sm:pl-0">
                                        <TrustedCollection tokenId={1} address={approval.collection} />
                                    </td>
                                    <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                                        <a href={`${etherscanLink}address/${approval.recipient}`} target="_blank" rel="noreferrer" className="text-sm text-gray-200">
                                        <FormattedWallet address={approval.recipient as `0x{string}`} />            
                                        </a>
                                    </td>
                                    <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                                        <div className="flex gap-1">
                                            <div className="flex -space-x-1">
                                                {formatStatus(approval.ApprovalStatus, approval.RemainingTime, true).map((status:any, index:any) => (
                                                    <status.icon key={index} className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-800 bg-gray-200 text-gray-600 p-1" />
                                                ))}
                                            </div>
                                            <div className="mt-.5">
                                                {approval.RemainingTime > 0 ? <LiveCountDown time={approval.RemainingTime } /> :<></>}
                                                
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-0">
                                       
                                        {approval.ApprovalStatus == "InPurgatory" && approval.RemainingTime > 0 ?
                                        <>
                                            <div className="flex gap-1">
                                                <div className="flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        disabled={txStatus}
                                                        onClick={() => setApprovedRecipient(approval.collection, approval.recipient, true)}
                                                        className="inline-flex items-center rounded-none border border-gray-300 px-3 py-2 text-xs font-medium leading-4 text-gray-100 shadow-sm hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    >
                                                        {txStatus ? 'Loading...' : 'Approve'}
                                                    </button>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        disabled={txStatus}
                                                        onClick={() => setApprovedRecipient(approval.collection, approval.recipient, false)}
                                                        className="inline-flex items-center rounded-none border border-gray-300 px-3 py-2 text-xs font-medium leading-4 text-gray-100 shadow-sm hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    >
                                                        {txStatus ? 'Loading...' : 'Deny'}
                                                    </button>
                                                </div>
                                            </div>
                                        </> 
                                        : <></>}

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </div>
                </div>
                </>
            );
    }

    return (
        <>
            <TransactionModal open={openModal} tx={tx} txReceipt={txReceipt} title={"Transaction successful"} />
            <ErrorAlert showError={ showError } message={ errorMessage } ></ErrorAlert>

            <div className="">
                {renderStatus()}
            </div>
        </>
      )
};

export default TwoFactorTransferFunctions;