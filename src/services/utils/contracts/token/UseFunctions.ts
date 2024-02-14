import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useSigner } from "wagmi";

export function useTokenURI(tokenId: number | null, contractAddress: string | undefined): string | null {
    const [uri, setUri] = useState<string | null>(null);
    const { data: signer } = useSigner();

    useEffect(() => {
        if(!tokenId || !contractAddress || !signer) {
            setUri(null);
            
            return;
        }

        const abi = [
            {
                "inputs": [
                  {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                  }
                ],
                "name": "uri",
                "outputs": [
                  {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                    }
                ],
                "name": "tokenURI",
                "outputs": [
                    {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try{
            contract['uri(uint256)'](tokenId).then(setUri).catch((e:any) => console.log("didnt work with uri(uint256)", e));
        } catch (e) {
            console.log("didnt work with uri(uint256)", e);
        }
        try{
            contract['tokenURI(uint256)'](tokenId).then(setUri).catch((e:any) => console.log("didnt work with tokenURI(uint256)", e));
        } catch (e) {
            console.log("didnt work with tokenURI(uint256)", e);
        }
        
    }, [tokenId, contractAddress, signer]);

    
    return uri;
}


export function useGetTokenInfo(contractAddress: string | undefined): {name: string | null, symbol:string | null} {
    const [name, setName] = useState<string | null>(null);
    const [symbol, setSymbol] = useState<string | null>(null);
    const { data: signer } = useSigner();
    useEffect(() => {
        if(!contractAddress || !signer) {
            setName(null);
            setSymbol(null);
            return;
        }

        const abi = [
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [
                    {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "name",
                "outputs": [
                  {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
            },
        ]
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try{
            contract['symbol()']().then(setSymbol).catch((e:any) => console.log(`${contractAddress} ===> didnt work with symbol`, e));
            contract['name()']().then(setName).catch((e:any) => console.log(`${contractAddress} ===> didnt work with name`, e));
        } catch (e) {
            console.log("didnt work with symbol and name", e);
        }
        
    }, [contractAddress, signer]);

    
    return {name, symbol};
}
