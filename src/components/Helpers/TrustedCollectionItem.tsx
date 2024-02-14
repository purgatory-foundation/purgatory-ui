import { useState, useEffect } from "react";
import { useTokenURI, useGetTokenInfo } from "../../services/utils/contracts/token/UseFunctions";
import { shortenAddress } from "../../services/utils/shorten";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";


interface Token {
    id: string;
    name: string;
    description: string;
    image: string;
    external_url: string;
}

export default function TrustedCollectionItem(props: { tokenId: number, address: string}) {
    const address = props.address as string;
    const tokenId = props.tokenId as number;
    const token = useTokenURI(tokenId, address);
    const {name, symbol} = useGetTokenInfo(address);
    const [tokenMetadata, setTokenMetadata] = useState<Token | null>(null);


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
            external_url: metadata.external_url
        }

        setTokenMetadata(tokenMetadata);
    }

    useEffect(() => {
        if(!token) return;
        previewMetadata(token);
    }, [token]);

    return (<>
        {token ?
        <>
        <div className="min-w-0 flex sm:items-center sm:justify-left">
                <div className="flex-shrink-0 md:mr-2">
                    <img className="h-8 w-8 rounded-full" src={tokenMetadata?.image} alt={tokenMetadata?.name}/>
                    <CheckBadgeIcon className="h-3 w-3 text-gray-400" aria-hidden="true" />
                </div>
                <div className="flex">
                    <div className="text-sm">
                        <p className="truncate font-medium text-indigo-600">{tokenMetadata?.name}</p>
                        <p className="flex-shrink-0 font-normal text-xs text-gray-500">{shortenAddress(address)}</p>
                    </div>
                </div>
            </div>
        </>
        :<>
            <div className="min-w-0 flex sm:items-center sm:justify-left">
                    <div className="flex">
                        <div className="text-sm">
                            <p className="truncate font-medium text-indigo-600">{ name ? name : shortenAddress(address) }{' '}{ symbol ? `($${symbol})` :""}</p>
                            <p className="flex-shrink-0 font-normal text-xs text-gray-500">{ name ? shortenAddress(address) : "Unknown" }</p>
                        </div>
                        
                    </div>
            </div>
        </>}
    </>);
}