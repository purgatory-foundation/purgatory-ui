import Countdown from 'react-countdown';
import { timeLeft } from "../../services/utils/timer";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function LiveCountDown(props: any) {
    const time = props?.time;
    const router = useRouter();
    // Random component
    const Completionist = () => 
        <span>
            <ClockIcon className="h-5 w-5 text-red-300" aria-hidden="true" />
        </span>;

    // Renderer callback with condition
    const renderer = ({ hours, minutes, seconds, completed }:any) => {
    if (completed) {
        // Render a completed state
        router.refresh();
        return <Completionist />;
    } else {
        // Render a countdown
        return <span className="animate-pulse table w-14 text-center">{ timeLeft(hours*60*60 + minutes*60 + seconds) }</span>;
    }
    };
    return (
        <Countdown
        date={Date.now() + time *1000}
        renderer={renderer}
        />
    );
}