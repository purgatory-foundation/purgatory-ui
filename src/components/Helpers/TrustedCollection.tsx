import { useState, useEffect } from "react";
import { useTokenURI, useGetTokenInfo } from "../../services/utils/contracts/token/UseFunctions";
import { useCollectionEnrolled } from "../../services/utils/contracts/purgatory/UseFunctions";
import { shortenAddress } from "../../services/utils/shorten";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
const etherscanLink = process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL !== undefined ? process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL : "";

interface Token {
    id: string;
    name: string;
    description: string;
    image: string;
    external_url: string;
    symbol: string;
}

export default function TrustedCollection(props: { tokenId: number, address: string}) {
    const address = props.address as string;
    const tokenId = props.tokenId as number;
    const tokenURI = useTokenURI(tokenId, address);
    const {name, symbol} = useGetTokenInfo(address);
    const [tokenMetadata, setTokenMetadata] = useState<Token | null>(null);

    const enrolled = useCollectionEnrolled(address);
    

    async function previewMetadata(token: string | null) {
        
        if(!token) return null;
        
        const isIPFS = token.indexOf("ipfs://", 0) >= 0 ? true: false;
        let url = token as string;
        if (isIPFS) {
            url = token.replace("ipfs://","https://test-purgaroty.infura-ipfs.io/ipfs/");
        }

        const response = await fetch(url);
        const metadata = await response.json();
        if(!metadata) return null;

        let imageUrl = metadata.image;

        const isIPFSImage = imageUrl.indexOf("ipfs://", 0) >= 0 ? true: false;
        if (isIPFSImage) {
            imageUrl = metadata.image.replace("ipfs://","https://test-purgaroty.infura-ipfs.io/ipfs/");
        }
        
        const tokenMetadata: Token = {
            id: metadata.id,
            name: metadata.name,
            description: metadata.description,
            image: imageUrl,
            external_url: metadata.external_url,
            symbol: ""
        }

        setTokenMetadata(tokenMetadata);
    }
    
    useEffect(() => {
        if(!tokenURI) return;
        previewMetadata(tokenURI);
    }, [tokenURI]);
    
    

    return (<>
        {tokenURI ?
        <>
        <a href={`${etherscanLink}address/${address}`} target="_blank" rel="noreferrer">
            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-left">
                <div className="flex-shrink-0 md:mr-2">
                    <img className="h-10 w-10 rounded-full" src={tokenMetadata?.image} alt={tokenMetadata?.name}/>
                </div>
                <div className="flex">
                    <div className="text-sm">
                        <p className="truncate font-medium text-indigo-600">{tokenMetadata?.name}</p>
                        <p className="flex font-normal text-xs text-gray-500">{shortenAddress(address)}</p>
                        {enrolled ? <p className="flex font-normal text-xs text-gray-500"><CheckBadgeIcon className="h-3 w-3 mt-0.5 text-gray-400" aria-hidden="true" /> Enrolled</p> :""}
                    </div>
                    
                    
                </div>
                
            </div>
        </a>
        </>
        :<>
            <a href={`${etherscanLink}address/${address}`} target="_blank" rel="noreferrer">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-left">
                    <div className="flex">
                        <div className="text-sm">
                            <p className="truncate font-medium text-indigo-600">{ name ? name : shortenAddress(address) }{' '}{ symbol ? `($${symbol})` :""}</p>
                            <p className="flex-shrink-0 font-normal text-xs text-gray-500">{ name ? shortenAddress(address) : "Unknown" }</p>
                            {enrolled ? <p className="flex font-normal text-xs text-gray-500"><CheckBadgeIcon className="h-3 w-3 mt-0.5 text-gray-400" aria-hidden="true" /> Enrolled</p>:""}
                        </div>
                        
                    </div>
                </div>
            </a>
        </>}
    </>);
}