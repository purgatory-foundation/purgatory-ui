import { CommandLineIcon, KeyIcon, ComputerDesktopIcon, } from '@heroicons/react/20/solid'
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Link from 'next/link';


import {
    useGet2faWalletApprovals,
  } from "../../services/utils/contracts/purgatory/UseFunctions";


interface ApprovedWallet {
    holder: string,
    approver: string,
    ApprovalStatus: string;
    RemainingTime: number;
    canToggleLockDown: boolean,
    isApprovedRecipient: boolean,
  }

export default function Loading() {
    const { address } = useAccount();
    const [currentApproval, setCurrentApproval] = useState<ApprovedWallet | null>(null);
    const approvedWallets  = useGet2faWalletApprovals(address, false);

    function getApproval(wallet:string | undefined):ApprovedWallet | null {
        if(!wallet || !approvedWallets) return null;
        let foundApproval:ApprovedWallet | null = null;
        approvedWallets.forEach((approval:ApprovedWallet) => {
          if(approval.approver === wallet && approval.ApprovalStatus === "Approved" && approval.RemainingTime <= 0) {
            foundApproval =  approval;
          }
        });
        return foundApproval;
      }
    
    function isApproved():boolean {
        return currentApproval && 
        currentApproval.ApprovalStatus === "Approved" 
        && currentApproval.RemainingTime <= 0 ? true : false;
    }
    
    useEffect(() => {
        if(address && approvedWallets) {
            setCurrentApproval(getApproval(address));
        }
    }, [address, approvedWallets]);

    

    return (
      <>
        <div className="mx-auto max-w-lg px-5 md:px-0">
        
        <div
                className="relative block w-full text-center"
                >
                <CommandLineIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                <h2 className="text-base font-semibold leading-6 text-gray-200">Welcome to the purgatory System</h2>
                
                <span className="mt-2 block text-sm font-semibold text-gray-100">Configuration loaded...</span>
                <Link href={isApproved() ? "/2fa" : "/dashboard"} className="mt-5 inline-flex items-center bg-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-safe:animate-pulse">
                    {isApproved() ? 
                    
                    <KeyIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-200" aria-hidden="true" />
                    :
                    <ComputerDesktopIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-200" aria-hidden="true" />
                    }
                    Continue {`>`}
                </Link>
                
            </div>
        </div>
      </>
    )
}