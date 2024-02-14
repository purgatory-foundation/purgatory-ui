
import { BigNumberish } from "ethers";
import { CheckIcon, ClockIcon, ExclamationTriangleIcon, NoSymbolIcon } from "@heroicons/react/24/outline";

export function formatStatus(status:string, time:BigNumberish, showApproved: boolean | null | undefined):{icon:any, text:string}[] {
    let statuses:{icon:any, text:string}[] = [{icon:ExclamationTriangleIcon, text:"undefined"}];
    const timeNumber = parseInt(time.toString());
    if(status === "Approved" && timeNumber <= 0) {
        if(showApproved) {
            statuses = [
                { icon: CheckIcon, text: "Approved" }
            ];
        } else {
            statuses = [];
        }
        
    } else if(status === "Approved" && timeNumber > 0) {
        statuses = [
            { icon: CheckIcon, text: "Approved" }, 
            { icon: ClockIcon, text: "In purgatory" },
            { icon: NoSymbolIcon, text: "NoApproval" }
        ];
    } else if(status === "InPurgatory" && timeNumber > 0) {
        statuses = [
            { icon: ClockIcon, text: "In purgatory" },
            { icon: CheckIcon, text: "Approval" }
        ];
    } else if (status === "Expired" || status === "NoApproval") {
        statuses = [
            { icon: NoSymbolIcon, text: "Revoked" }
        ];
    } else {
        statuses = [
            { icon: ExclamationTriangleIcon, text: "NoApproval" }
        ];
    }
    return statuses;
}

export function formatOperatorStatus(status:string, time:BigNumberish, shortLiveApproval:BigNumberish):{icon:any, text:string}[] {
    let statuses:{icon:any, text:string}[] = [{icon:ExclamationTriangleIcon, text:"undefined"}];
    const timeNumber = parseInt(time.toString());
    const shortLiveApprovalNumber = parseInt(shortLiveApproval.toString());
    if(status === "Approved" && timeNumber <= 0 && shortLiveApproval == 0) {
        statuses = [{ icon: CheckIcon, text: "Approved" }];
    } else if(status === "Approved" && timeNumber > 0) {
        statuses = [
            { icon: CheckIcon, text: "Approved" }, 
            { icon: ClockIcon, text: "In purgatory" },
            { icon: NoSymbolIcon, text: "NoApproval" }
        ];
    } else if(status === "InPurgatory" && timeNumber > 0) {
        statuses = [
            { icon: ClockIcon, text: "In purgatory" },
            { icon: CheckIcon, text: "Approval" }
        ];
    } else if (status === "Expired") {
        statuses = [
            { icon: NoSymbolIcon, text: "Revoked" }
        ];
    } 
    else if(status === "NoApproval") {
        statuses = [
            { icon: ExclamationTriangleIcon, text: "NoApproval" }
        ];
    }
    else if(status === "Approved" && timeNumber <= 0 && shortLiveApprovalNumber > 0) {
        statuses = [
            { icon: CheckIcon, text: "Approved" }, 
            { icon: ClockIcon, text: "In purgatory" },
        ];
    } else {
        statuses = [
            { icon: ExclamationTriangleIcon, text: "NoApproval" }
        ];
    }
    return statuses;
}

