import { shortenAddress } from "../../services/utils/shorten";
import { useEnsName } from "wagmi";

export default function FormattedWallet(props:{ address:`0x${string}` | undefined }) {
    const address = props.address as `0x${string}` | undefined;
    const { data, isError, isLoading } = useEnsName({ address: address});

    const label = function () {
        if (isError) {
          return "Error";
        }
        if (isLoading) {
          return "Loading...";
        }
        if (data) {
          return data;
        }
        return shortenAddress(address);
    }
    return (
        <span>{label()}</span>
    );
}