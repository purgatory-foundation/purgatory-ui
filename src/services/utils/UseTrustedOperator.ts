import { config }  from '../config';
import { useNetwork } from 'wagmi';
import { useState, useEffect } from 'react';
const operators = config.operators;


interface Operator {
    name: string;
    address: string;
    imageUrl: string;
    url: string;
    network: string;
}

export function useTrustedOperator(address: string | undefined):Operator | null {
    const [operator, setOperator] = useState<Operator | null>(null);
    const { chain } = useNetwork();

    useEffect(() => {
        if(!chain || !address){
            return;
        }
        operators.find((operator) => {
            if(operator.address.toLocaleLowerCase() === address.toLocaleLowerCase() && operator.network === chain.name) {
                setOperator(operator as Operator);
            }
        });
    }, [chain, address]);

    return operator;
}
