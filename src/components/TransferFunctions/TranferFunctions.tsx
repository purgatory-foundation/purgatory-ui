import React, { useState } from "react";
import { useAccount } from "wagmi";
import { ethers, ContractReceipt, ContractTransaction } from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI  } from "../../services/utils/contracts/purgatory/objects/contract";
import { formatStatus } from "../../services/utils/format";

import ErrorAlert from "../Notifications/ErrorAlert";
import TransactionModal from "../Notifications/TransactionModal";
import { useEnrolledCollections, useGetWalletRecipientApprovals } from "../../services/utils/contracts/purgatory/UseFunctions";
import LiveCountDown from "../Helpers/LiveCountDown";
import { useRouter } from "next/navigation";
import { useSigner } from "wagmi";
import FormattedWallet from "../Wallet/FormattedWallet";
import TrustedCollection from "../Helpers/TrustedCollection";
import TrustedCollectionList from "../Helpers/TrustedCollectionsList";

const etherscanLink = process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL !== undefined ? process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL : "";

function TransferFunctions () {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { address } = useAccount();
    const router = useRouter();
    const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined);
    const enronlledCollections = useEnrolledCollections();
    const [selectedRecipient, setSelectedRecipient] = useState<string | undefined>(undefined);
    const { data: signer } = useSigner();

    const myApprovals = useGetWalletRecipientApprovals(address, null);

    const handleCollectionDataChange = (collectionAddress: string) => {
        setSelectedCollection(collectionAddress);
    }



    async function setApprovedRecipient(collectionAddress: string | undefined, recipient: string | undefined, approved:boolean) {
        setOpenModal(false);

        if(collectionAddress === undefined || recipient === undefined) return;        
        try{
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.setApprovedRecipient(collectionAddress, recipient, approved);
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

    const handleSelectedAddressChange = (event:any) => {
        setSelectedRecipient(event.target.value);
    }
    
    return (
        <>
            <TransactionModal open={openModal} tx={tx} txReceipt={txReceipt} title={"Transaction successful"} />
            <ErrorAlert showError={ showError } message={ errorMessage } ></ErrorAlert>

            <div className="">
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
                            <tr>
                                <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-200 sm:pl-0">
                                    <TrustedCollectionList collection={enronlledCollections} onCollectionChange={handleCollectionDataChange} />
                                </td>
                                <td colSpan={2} className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-200 sm:pl-0">
                                    <label htmlFor="email" className="sr-only">
                                        Transfer Recipient
                                    </label>
                                    <input
                                        type="text"
                                        name="transferRecipient"
                                        value={selectedRecipient}
                                        onChange={handleSelectedAddressChange}
                                        className="block w-full rounded-none border py-1.5 text-gray-200 placeholder:text-gray-400 sm:text-sm sm:leading-6 bg-transparent"
                                        placeholder="0x000..."
                                    />
                                </td>
                                
                                <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-0">       
                                    <button
                                        type="submit"
                                        disabled={txStatus}
                                        onClick={ () => setApprovedRecipient(selectedCollection, selectedRecipient, true) }
                                        className="inline-flex items-center rounded-none bg-indigo-600 px-5 py-2 text-xs font-medium leading-4 text-gray-100 shadow-sm hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                        {txStatus ? 'Loading...' : 'Add'}
                                    </button> 
                                </td>
                            </tr>
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
                                       
                                        {(approval.ApprovalStatus == "Approved" && approval.RemainingTime <= 0) || (approval.ApprovalStatus == "InPurgatory" && approval.RemainingTime > 0) ? 
                                            <button
                                                type="submit"
                                                onClick={() => setApprovedRecipient(approval.collection, approval.recipient, false)}
                                                className="inline-flex items-center rounded-none border border-gray-300 px-3 py-2 text-xs font-medium leading-4 text-gray-100 shadow-sm hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                disabled={txStatus}
                                                >
                                                {txStatus ? 'Loading...' : approval.RemainingTime > 0 ? 'Cancel' : 'Remove'}
                                            </button> 
                                        : <></>}

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </div>
                </div>

            </div>
        </>
      )
};

export default TransferFunctions;