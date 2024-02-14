import abi from "./abi.json";

export const contractAddress = process.env.NEXT_PUBLIC_PURGATORY_ADD !== undefined ? process.env.NEXT_PUBLIC_PURGATORY_ADD : "";
export const contractABI = abi;