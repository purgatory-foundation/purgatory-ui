import { useTrustedOperator } from "../../services/utils/UseTrustedOperator";
import { shortenAddress } from "../../services/utils/shorten";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
const etherscanLink = process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL !== undefined ? process.env.NEXT_PUBLIC_BASE_ETHERSCAN_URL : "";

export default function TrustedOperator(props: { address: string | undefined}) {
    const address = props.address as string | undefined;
    const operator = useTrustedOperator(address);
    return (<>
    {operator ?
        <>
        <a href={operator.url} target="_blank" rel="noreferrer">
            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-left">
                <div className="flex-shrink-0 md:mr-2">
                    <img className="h-5 w-5 rounded-full" src={operator.imageUrl} alt={operator.name}/>
                </div>
                <div className="flex">
                    <div className="text-sm">
                        <p className="truncate font-medium text-indigo-600">{operator.name}</p>
                        <p className="flex-shrink-0 font-normal text-xs text-gray-500">{shortenAddress(operator)}</p>
                    </div>
                </div>
            </div>
        </a>
        </>
        :<>
            <a href={`${etherscanLink}address/${address}`} target="_blank" rel="noreferrer">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-left">
                    <div className="flex-shrink-0 md:mr-2">
                        <ExclamationTriangleIcon className="h-5 w-5 rounded-full text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="flex">
                        <div className="text-sm">
                            <p className="truncate font-medium text-indigo-600">Unknown</p>
                            <p className="flex-shrink-0 font-normal text-xs text-gray-500">{shortenAddress(address)}</p>
                        </div>
                    </div>
                </div>
            </a>
        </>}
    </>);
}