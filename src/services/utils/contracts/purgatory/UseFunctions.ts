import { useEffect, useState } from "react";
import { contractABI, contractAddress } from "./objects/contract";
import { useContract } from "../UseContract";
import { BigNumber } from "ethers";


const approvalStatus =[
    "Approved",
    "InPurgatory",
    "NoApproval",
    "Expired"
]

interface ApprovalData {
    ApprovalStatus: string;
    RemainingTime: number;
}

interface StatusData {
    Collection: string;
    Operator: string;
    ApprovalStatus: string;
    RemainingTime: number;
    shortLiveApprovalReaminingTime: number;
}

interface ApprovedWallet {
    holder: string,
    approver: string,
    ApprovalStatus: string;
    RemainingTime: number;
    canToggleLockDown: boolean,
    isApprovedRecipient: boolean,
}

interface ApprovedWalletRecipient {
    collection: string,
    holder: string,
    recipient: string,
    ApprovalStatus: string;
    RemainingTime: number;
    isTwoFactor: boolean;
}

interface GlobalApprovedWalletRecipient {
    holder: string,
    recipient: string,
    ApprovalStatus: string;
    RemainingTime: number;
    isTwoFactor: boolean;
}

interface CollectionData {
    collectionAddress: string;
    enrolled: boolean;
}

export function useIsApproved(fromAddress: string | undefined, erc721Address: string, operatorAddress: string): boolean | null {
    const contract = useContract(contractAddress, contractABI);
    const [approved, setApproved] = useState<boolean | null>(null);

    useEffect(() => {
        if(!contract || !fromAddress || !erc721Address) {
            setApproved(null);
            return;
        }

        contract["isApproved(address,address,address)"](fromAddress, operatorAddress, erc721Address).then(setApproved);
        
    }, [fromAddress, contract, erc721Address, operatorAddress]);
    
    return approved;
}

export function useCollectionEnrolled(erc721Address: string): boolean | null {
    const contract = useContract(contractAddress, contractABI);
    const [enrolled, setEnrolled] = useState<boolean | null>(null);

    useEffect(() => {
        if(!contract || !erc721Address) {
            setEnrolled(null);
            return;
        }
        contract.enrolledCollections(erc721Address).then(setEnrolled);
    }, [contract, erc721Address])

    return enrolled;
}

export function useEnrolledCollections(): CollectionData[] {
    const contract = useContract(contractAddress, contractABI);
    const [collections, setCollections] = useState<CollectionData[]>([]);

    useEffect(() => {
        if(!contract) {
            setCollections([]);
            return;
        }
        const collectionEnrollmentSetFilter = contract.filters.CollectionEnrollmentSet(null, null);
        const collectionEnrollmentSetEvents = contract.queryFilter(collectionEnrollmentSetFilter);
        collectionEnrollmentSetEvents.then((collections) => {
            const uniqueCollections = collections.map((collection) => {
                return collection.args?.collection;
            }).reduce((unique:any, item:any) => unique.includes(item) ? unique : [...unique, item]
            ,[]);

            uniqueCollections.forEach((collection:any) => {
                (async () => {
                    const enrolled = await contract.enrolledCollections(collection);
                    const CollectionData: CollectionData = {
                        collectionAddress: collection,
                        enrolled: enrolled
                    }
                    setCollections((collections) => [...collections, CollectionData]);
                })();
            });
            
        });

    }, [contract])

    return collections;
}
export function useOptInStatus(userAddress:string | undefined): ApprovalData | null {
    const contract = useContract(contractAddress, contractABI);
    const [optIn, setOptIn] = useState<ApprovalData | null>(null);

    useEffect(() => {
        if(!contract || !userAddress) {
            setOptIn(null);
            return;
        }
        contract.optInStatus(userAddress).then((optStatus:any) => {            
            const data:ApprovalData = {
                ApprovalStatus: approvalStatus[optStatus.approvalStatus],
                RemainingTime: optStatus.timeRemaining.toNumber()
            }
        
            setOptIn(data)
        }).catch((e:any) => console.log("could not retrieve status", e));

    }, [userAddress, contract])

    return optIn;
}

export function useOptStatus(userAddress:string | undefined): boolean | null {
    
    const [optIn, setOptIn] = useState<boolean | null>(null);
    const status = useOptInStatus(userAddress);

    useEffect(() => {
        if(!userAddress || !status) {
            setOptIn(null);
            return;
        }
        const result = status?.ApprovalStatus === "Approved" ? true : false;
        setOptIn(result)

    }, [userAddress, status])

    return optIn;
}

export function useLockDownStatus(userAddress:string | undefined): ApprovalData | null {
    const contract = useContract(contractAddress, contractABI);
    const [lockDown, setLockDown] = useState<ApprovalData | null>(null);

    useEffect(() => {
        if(!contract || !userAddress) {
            setLockDown(null);
            return;
        }

        contract.lockDownStatus(userAddress).then((lockStatus:any) => {
            const data:ApprovalData = {
                ApprovalStatus: approvalStatus[lockStatus.approvalStatus],
                RemainingTime: lockStatus.timeRemaining.toNumber()
            }
            
            setLockDown(data)
        }).catch((e:any) => console.log("could not retrieve status", e));

    }, [userAddress, contract])

    return lockDown;
}

export function useIsLockedDown(userAddress:string | undefined): boolean | null {
    const [locked, setLocked] = useState<boolean | null>(null);
    const status = useLockDownStatus(userAddress);

    useEffect(() => {
        if(!status || !userAddress) {
            setLocked(null);
            return;
        }

        const result = status?.ApprovalStatus === "Approved" ? true : false;
        setLocked(result);

    }, [userAddress, status])

    return locked;
}

export function usePurgatoryTime(holderAdress: string | undefined, operatorAddress: string | undefined, collectionAddress: string | undefined):number | null {
    const contract = useContract(contractAddress, contractABI);
    const [time,setTime] = useState<number | null>(null);

    useEffect(() => {
        if(!contract || !holderAdress || !operatorAddress || !collectionAddress) {
            setTime(null);
            return;
        }
        contract.approvals(collectionAddress, holderAdress, operatorAddress).then((Approval:any) => {
            setTime(Approval.lastUpdated.toNumber())
        })
    }, [contract, holderAdress, operatorAddress, collectionAddress]);

    return time;
    
}

export function useGetOperators(collectionAddress: string | undefined, holderAdress: string| undefined): string[] | null {
    const contract = useContract(contractAddress, contractABI);
    const [operators, setOperators] = useState<string[] | null>(null);

    useEffect(() => {
        if(!contract || !collectionAddress || !holderAdress) {
            setOperators(null);
            return;
        }
        const eventFilter = contract.filters.NewOperatorApprovalRequest();

        contract.queryFilter(eventFilter).then((approvals) => {
            
            const operators:any = approvals.map((approval) => {
                
                return approval?.args?.collection == collectionAddress 
                    && approval?.args?.holder == holderAdress 
                    ? approval?.args?.operator : null;
            });
            const uniqueOperators = operators.reduce((unique:any, item:any) => unique.includes(item) ? unique : [...unique, item]
            ,[]);
            setOperators(uniqueOperators);
        });
        
    }, [contract, collectionAddress, holderAdress])

    return operators;
}

export function useGet2faWalletApprovals(userAddress: string | undefined, asMainWallet: boolean): ApprovedWallet[] | null {
    const contract = useContract(contractAddress, contractABI);
    const [wallets, setWallets] = useState<ApprovedWallet[]>([]);

    useEffect(() => {
        if(!contract || !userAddress) {
            setWallets([]);
            return;
        }
        const eventFilter = contract.filters.NewTwoFactorWalletApproverRequest(
            asMainWallet ? userAddress : null, 
            !asMainWallet ? userAddress : null
            );

        contract.queryFilter(eventFilter).then((wallets) => {
            const twofactorwallets = wallets.map((wallet) => {
                return {
                    holder: wallet?.args?.holder,
                    approver: wallet?.args?.approver,
                    approved: wallet?.args?.approved,
                    canToggleLockDown: wallet?.args?.canToggleLockDown,
                    isApprovedRecipient: wallet?.args?.isApprovedRecipient,
                    blockHash: wallet?.blockHash,
                    blockNumber: wallet?.blockNumber
                }
            });

            let sortedWallets = twofactorwallets.sort(
                (p1, p2) => (p1.blockNumber < p2.blockNumber) ? 1 : (p1.blockNumber > p2.blockNumber) ? -1 : 0);
            let uniqueWallets = sortedWallets.filter((ele, ind) => ind === sortedWallets.findIndex(elem => elem.approver === ele.approver));
            if(uniqueWallets && uniqueWallets.length > 0) {
                uniqueWallets.forEach((wallet:any) => {
                    (async () => {
                        const approved = await contract.twoFactorWalletApprovalStatus(
                            asMainWallet ? userAddress : wallet.holder, 
                            asMainWallet ? wallet.approver : userAddress
                            );
                        const status:ApprovedWallet = {
                            holder: wallet.holder,
                            approver: wallet.approver,
                            ApprovalStatus: approvalStatus[approved.approvalStatus],
                            RemainingTime: approved.timeRemaining.toNumber(),
                            canToggleLockDown: wallet.canToggleLockDown,
                            isApprovedRecipient: wallet.isApprovedRecipient
                        }

                        setWallets((wallets) => [...wallets as [], status]);
                    })();
                });
            }            
        });
        
    }, [contract, userAddress, asMainWallet])

    return wallets;
}

export function useGetGlobalWalletRecipientApprovals(userAddress: string | undefined): GlobalApprovedWalletRecipient[] | null {
    const contract = useContract(contractAddress, contractABI);
    const [wallets, setWallets] = useState<GlobalApprovedWalletRecipient[]>([]);

    useEffect(() => {
        if(!contract || !userAddress) {
            setWallets([]);
            return;
        }
        const eventFilter = contract.filters.NewGlobalTransferRecipientRequest(userAddress, null, null);

        contract.queryFilter(eventFilter).then((wallets) => {
            const approvedWallets = wallets.map((wallet) => {
                return {
                    holder: wallet?.args?.holder,
                    recipient: wallet?.args?.recipient,
                    approved: wallet?.args?.approved,
                    blockHash: wallet?.blockHash,
                    blockNumber: wallet?.blockNumber
                }
            });
            console.log("approvedWallets", approvedWallets);

            let sortedWallets = approvedWallets.sort(
                (p1, p2) => (p1.blockNumber < p2.blockNumber) ? 1 : (p1.blockNumber > p2.blockNumber) ? -1 : 0);
            
            let uniqueWallets = sortedWallets.filter((ele, ind) => ind === sortedWallets.findIndex(elem => elem.recipient === ele.recipient));
            /// TODO: consider adding the Two factor
            /// If its two factor approved then it should be global approved, two factor bypass global approval
            /// Solution dont show the global approval if its two factor approved
            uniqueWallets.forEach((wallet:any) => {
                (async () => {
                    const approved = await contract.transferRecipientApprovalStatus(
                        '0x0000000000000000000000000000000000000000',
                        userAddress, 
                        wallet.recipient
                        );
                    const twofactor = await contract.twoFactorWalletApprovalStatus(userAddress, wallet.recipient);
            
                    console.log("approved", approved)
                    const status:GlobalApprovedWalletRecipient = {
                        holder: wallet.holder,
                        recipient: wallet.recipient,
                        ApprovalStatus: approvalStatus[approved.approvalStatus],
                        RemainingTime: approved.timeRemaining.toNumber(),
                        isTwoFactor: twofactor.approvalStatus === 0 || twofactor.approvalStatus === 1 ? true : false
                    }
                    console.log("status", status)
                    setWallets((wallets) => [...wallets, status]);
                })();
            });   
        });
        
    }, [contract, userAddress])

    return wallets;
}

export function useGetWalletRecipientApprovals(userAddress: string | undefined, collectionAddress: string | null): ApprovedWalletRecipient[] | null {
    const contract = useContract(contractAddress, contractABI);
    const [wallets, setWallets] = useState<ApprovedWalletRecipient[]>([]);

    useEffect(() => {
        if(!contract || !userAddress) {
            setWallets([]);
            return;
        }
        const eventFilter = contract.filters.NewTransferRecipientRequest(collectionAddress, userAddress, null, null);

        contract.queryFilter(eventFilter).then((wallets) => {
            const approvedWallets = wallets.map((wallet) => {
                return {
                    collection: wallet?.args?.collection,
                    holder: wallet?.args?.holder,
                    recipient: wallet?.args?.recipient,
                    approved: wallet?.args?.approved,
                    blockHash: wallet?.blockHash,
                    blockNumber: wallet?.blockNumber
                }
            });
            console.log("approvedWallets", approvedWallets);

            let sortedWallets = approvedWallets.sort(
                (p1, p2) => (p1.blockNumber < p2.blockNumber) ? 1 : (p1.blockNumber > p2.blockNumber) ? -1 : 0);
                console.log("sortedWallets", sortedWallets);
            
            let uniqueWallets = sortedWallets.filter((ele, ind) => ind === sortedWallets.findIndex(elem => elem.recipient === ele.recipient));
           console.log("uniqueWallets", uniqueWallets);
            uniqueWallets.forEach((wallet:any) => {
                (async () => {
                    const approved = await contract.transferRecipientApprovalStatus(
                        wallet.collection,
                        userAddress, 
                        wallet.recipient
                        );
                    const twofactor = await contract.twoFactorWalletApprovalStatus(userAddress, wallet.recipient);
            
                    console.log("approved", approved)
                    const status:ApprovedWalletRecipient = {
                        collection: wallet.collection,
                        holder: wallet.holder,
                        recipient: wallet.recipient,
                        ApprovalStatus: approvalStatus[approved.approvalStatus],
                        RemainingTime: approved.timeRemaining.toNumber(),
                        isTwoFactor: twofactor.approvalStatus === 0 || twofactor.approvalStatus === 1 ? true : false
                    }
                    console.log("status", status)
                    setWallets((wallets) => [...wallets, status]);
                })();
            });   
        });
        
    }, [contract, userAddress, collectionAddress])

    return wallets;
}

export function useGetApprovalStatus(userAddress: string | undefined, collectionAddress: string | undefined, operatorAddress: string | undefined): ApprovalData | null {
    const contract = useContract(contractAddress, contractABI);
    const [approvalStatus, setApprovalStatus] = useState<ApprovalData | null>(null);

    useEffect(() => {
        if(!contract || !userAddress || !collectionAddress || !operatorAddress) {
            setApprovalStatus(null);
            return;
        }
        contract.operatorApprovalStatus(collectionAddress, userAddress, operatorAddress).then((approval:any) => {
            const status = {
                ApprovalStatus: approval.ApprovalStatus,
                RemainingTime: approval.RemainingTime.toNumber()
            }
            setApprovalStatus(status);
        });
    }, [contract, userAddress, collectionAddress, operatorAddress]);

    return approvalStatus;
};

export function useGetApprovals(userAddress: string | undefined, collectionAddress: string | null | undefined): any[] | null {
    const contract = useContract(contractAddress, contractABI);
    const [approvals, setApprovals] = useState<StatusData[]>([]);

    useEffect(() => {
        setApprovals([]);
        if(!contract || !userAddress) {
            setApprovals([]);
            return;
        }
        const operatorApprovalRequestFilter = contract.filters.NewOperatorApprovalRequest(collectionAddress, userAddress, null, null);
        
        contract.queryFilter(operatorApprovalRequestFilter).then((approvalsEvent) => {
            const approvals = approvalsEvent.map((approval) => {
                return {
                        operator: approval?.args?.operator,
                        approvalStatus: approval?.args?.approved,
                        blockHash: approval?.blockHash,
                        blockNumber: approval?.blockNumber,
                        collectionAddress: approval?.args?.collection,
                        holderAddress: approval?.args?.holder
                    };
            }).reduce((unique:any, item:any) => unique.includes(item) ? unique : [...unique, item]
            ,[]);

            let sortedApprovals = approvals.sort(
                (p1:any, p2:any) => (p1.blockNumber < p2.blockNumber) ? 1 : (p1.blockNumber > p2.blockNumber) ? -1 : 0);
            let uniqueApprovals = sortedApprovals.filter((ele:any, ind:any) => ind === sortedApprovals.findIndex((elem: { operator: any; }) => elem.operator === ele.operator));
            uniqueApprovals.forEach((approval:any) => {
                (async () => {
                    const response = await contract.operatorApprovalStatus(approval.collectionAddress, userAddress, approval.operator);
                    const shortLiveStatus = await contract.shortLivedApprovalStatus(userAddress);
                    const status:StatusData = {
                            Collection: approval.collectionAddress,
                            Operator: approval.operator,
                            ApprovalStatus: approvalStatus[response.approvalStatus],
                            RemainingTime: response.timeRemaining.toNumber(),
                            shortLiveApprovalReaminingTime: shortLiveStatus?.timeRemaining?.toNumber()
                        };
                        
                    setApprovals((approvals) => [...approvals, status]);
                })();
            });
        });
        
        
    }, [contract, userAddress, collectionAddress])

    return approvals;
}

export function useShortLivedApprovalStatus (userAddress: string | undefined): ApprovalData | null {
    const contract = useContract(contractAddress, contractABI);
    const [shortApproval, setShortApproval] = useState<ApprovalData | null>(null);

    useEffect(() => {
        if(!contract || !userAddress) {
            setShortApproval(null);
            return;
        }
        contract.shortLivedApprovalStatus(userAddress).then((approval:any) => {
            
            const status:ApprovalData = {
                ApprovalStatus: approvalStatus[approval.approvalStatus],
                RemainingTime: approval.timeRemaining.toNumber()
            }
            
            setShortApproval(status);
        });
    }, [contract, userAddress]);

    return shortApproval;

}

export function useGetShortLiveApprovalLength(userAddress: string | undefined): number | null {
    const contract = useContract(contractAddress, contractABI);
    const [shortLiveApprovalLength, setShortLiveApprovalLength] = useState<number | null>(null);

    useEffect(() => {
        if(!contract || !userAddress) {
            setShortLiveApprovalLength(null);
            return;
        }
        contract.optStatus(userAddress).then((optStatus:any) => {
            const length = optStatus?.shortLivedApprovalLength;
            setShortLiveApprovalLength(length);
        });
    }, [contract, userAddress]);
    
    return shortLiveApprovalLength;
}

export function usePurgatoryGlobalTime(): number | null {
    const contract = useContract(contractAddress, contractABI);
    const [time, setTime] = useState<number | null> (null);

    useEffect(() => {
        if(!contract) {
            setTime(null);
            return;
        }
        
        contract.purgatoryTime().then((contractTime:number) => {
            setTime(contractTime);
        })
    }, [contract]);

    return time;
}

export function usePurgatoryGlobalTimeLeft(): number | null {
    const contract = useContract(contractAddress, contractABI);
    const [time, setTime] = useState<number | null> (null);

    useEffect(() => {
        if(!contract) {
            setTime(null);
            return;
        }
        
        contract.purgatoryTime().then((contractTime:BigNumber) => {
            /// get the current time and subtract it from the contract time
            const currentTime = Math.floor(Date.now() / 1000);

            setTime(contractTime.toNumber() - currentTime > 0 ? contractTime.toNumber() - currentTime : 0);
        })
    }, [contract]);

    return time;
}