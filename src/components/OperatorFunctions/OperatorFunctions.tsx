import React, { useState } from "react";
import { useAccount } from "wagmi";
import { ethers, ContractReceipt, ContractTransaction, BigNumber, BigNumberish } from "ethers";
import { contractAddress as purgatoryContract, contractABI as purgatoryABI  } from "../../services/utils/contracts/purgatory/objects/contract";
import { formatOperatorStatus } from "../../services/utils/format";

import ErrorAlert from "../Notifications/ErrorAlert";
import TransactionModal from "../Notifications/TransactionModal";
import { useGetApprovals } from "../../services/utils/contracts/purgatory/UseFunctions";
import LiveCountDown from "../Helpers/LiveCountDown";
import { useRouter } from "next/navigation";
import { useSigner } from "wagmi";
import TrustedOperator from "../Helpers/TrustedOperator";
import TrustedCollection from "../Helpers/TrustedCollection";


function OperatorFunctions (props: any) {
    const [tx, setTx] = useState<ContractTransaction | null>(null);
    const [txReceipt, setTxReceipt] = useState<ContractReceipt | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>("");
    const [txStatus, setTxStatus] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { address } = useAccount();
    const router = useRouter();
    const { data: signer } = useSigner();
    
    const myApprovals = useGetApprovals(address, null);

    


    async function setApproval(contractAddress:string, operator:string, status:boolean) {
        setOpenModal(false);        
        try{
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const abi =['function setApprovalForAll(address operator, bool approved)']
            const contract = new ethers.Contract(contractAddress, abi, signer);
            const tx = await contract.setApprovalForAll(operator, status);
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

    async function refreshApproval(contractAddress:string ,operator:string) {
        setOpenModal(false);        
        try{
            setTxStatus(true);
            if(!signer) throw new Error("Signer not found");
            const contract = new ethers.Contract(purgatoryContract, purgatoryABI, signer);
            const tx = await contract.refreshApproval(contractAddress, operator);
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
                                Operator
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
                                    <TrustedCollection tokenId={1} address={approval.Collection} />
                                </td>
                                <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                                    <TrustedOperator address={approval.Operator} />
                                </td>
                                <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                                    <div className="flex gap-1">
                                        <div className="flex -space-x-1">
                                            {formatOperatorStatus(approval.ApprovalStatus, approval.RemainingTime, approval.shortLiveApprovalReaminingTime).map((status:any, index:any) => (
                                                <status.icon key={index} className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-800 bg-gray-200 text-gray-600 p-1" />
                                            ))}
                                        </div>
                                        <div className="mt-.5">
                                            {approval.RemainingTime > 0 ? <LiveCountDown time={approval.RemainingTime } /> :<></>}
                                            {approval.ApprovalStatus == "Approved"  && approval.RemainingTime <= 0 && approval.shortLiveApprovalReaminingTime > 0 ? <LiveCountDown time={approval.shortLiveApprovalReaminingTime } /> :<></>}
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-0">
                                    { approval.ApprovalStatus == "Expired" ? 
                                        <div className="flex-shrink-0">
                                            <button
                                                type="button"
                                                disabled={txStatus}
                                                onClick={() => refreshApproval(approval.Collection, approval.Operator)}
                                                className="inline-flex items-center rounded-none border border-gray-300 px-3 py-2 text-xs font-medium leading-4 text-gray-100 shadow-sm hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            >
                                                {txStatus ? 'Loading...' : 'Refresh'}
                                            </button>
                                        </div>
                                    : <></>
                                    }
                                    {approval.ApprovalStatus == "Approved" && approval.RemainingTime <= 0 && approval.shortLiveApprovalReaminingTime <= 0? 
                                        <div className="flex-shrink-0">
                                            <button
                                                type="button"
                                                disabled={txStatus}
                                                onClick={() => setApproval(approval.Collection, approval.Operator, false)}
                                                className="inline-flex items-center rounded-none border border-gray-300 px-3 py-2 text-xs font-medium leading-4 text-gray-100 shadow-sm hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            >
                                                {txStatus ? 'Loading...' : 'Revoke'}
                                            </button>
                                        </div>
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

export default OperatorFunctions;