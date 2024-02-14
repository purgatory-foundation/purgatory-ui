import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { useSigner } from "wagmi";

export function useContract(address:string | undefined, abi:any): Contract | null {
    const [contract, setContract] = useState<Contract | null>(null);
    const { data: signer } = useSigner();
    useEffect(() => {
        if (!address || !signer) return;
        const contract = new ethers.Contract(address, abi, signer);
        setContract(contract);
    },[address, abi, signer])

    return contract;
}