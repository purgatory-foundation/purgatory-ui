import React, { useState } from "react";
import { ethers, ContractReceipt, ContractTransaction } from "ethers";
import { contractAddress , contractABI  } from "../services/utils/contracts/purgatory/objects/contract";

import { 
    useEnrolledCollections
  } from "../services/utils/contracts/purgatory/UseFunctions";


import ErrorAlert from "./Notifications/ErrorAlert";
import TransactionModal from "./Notifications/TransactionModal";
import TrustedCollection from "./Helpers/TrustedCollection";

import { useRouter } from "next/navigation";
import { useSigner } from "wagmi";


const etherscanLink = process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL !== undefined ? process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL : "";


function CollectionManager () {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const enronlledCollections = useEnrolledCollections();
    const [collectionAddress, setCollectionAddress] = useState<string>("");
    const router = useRouter();
    const { data: signer } = useSigner();  


    async function deroll(collectionAddress:string) {
        setOpenModal(false);
    
        try {
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            const tx = await contract.toggleCollectionEnroll(collectionAddress);
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

    async function enroll() {
        setOpenModal(false);
    
        try {
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            const tx = await contract.toggleCollectionEnroll(collectionAddress);
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

    const handleChange = (event:any) => {
        setCollectionAddress(event.target.value);
    };

    
    
    const renderStatus = () => {
        return (
            <div className="md:col-span-2 md:mt-0">
                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-600">
                            <thead>
                                <tr className="">
                                <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-200 sm:pl-0">
                                    Collection
                                </th>
                                <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-200 sm:pr-0">
                                    Action
                                </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 ">
                                <tr className="">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-200 sm:pl-0">
                                            <label htmlFor="collection" className="sr-only">
                                            Collection Address
                                            </label>
                                            <input
                                                type="text"
                                                name="transferRecipient"
                                                value={collectionAddress}
                                                onChange={handleChange}
                                                className="block w-full rounded-none border py-1.5 text-gray-200 placeholder:text-gray-400 sm:text-sm sm:leading-6 bg-transparent"
                                                placeholder="0x000..."
                                            />
                                        </td>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-0">
                                            <button
                                                type="submit"
                                                disabled={txStatus}
                                                onClick={ () => enroll() }
                                                className="inline-flex items-center rounded-none bg-indigo-600 px-5 py-2 text-xs font-medium leading-4 text-gray-100 shadow-sm hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                >
                                                {txStatus ? 'Loading...' : 'Add'}
                                            </button> 
                                        </td>
                                    </tr>
                                {enronlledCollections?.map((collection, index) => (
                                    <tr key={index} className="">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-200 sm:pl-0">
                                            <TrustedCollection tokenId={1} address={collection.collectionAddress} />
                                        </td>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-0">
                                            <button
                                                type="submit"
                                                onClick={() => deroll(collection.collectionAddress)}
                                                className="inline-flex items-center rounded-none border border-gray-300 px-3 py-2 text-xs font-medium leading-4 text-gray-100 shadow-sm hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                disabled={txStatus}
                                                >
                                                {txStatus ? 'Loading...' : 'Remove'}
                                            </button> 
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
            </div>
        );
    }

    return (
        <>
            <TransactionModal open={openModal} tx={tx} txReceipt={txReceipt} title={"Transaction successful"} />
            <ErrorAlert showError={ showError } message={ errorMessage } ></ErrorAlert>

            <div className="">
                <div className="">
                {renderStatus()}
                
                </div>
            </div>
        </>
      )
};

export default CollectionManager;