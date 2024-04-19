'use client'
import { formatDate } from '@/utils/helper';
import Header from './header';
import LotteryNumbersPlayed from './lotteryNumbersPlayed';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import xance from "../abi/Xance.json"
import { NumberBoughtInterface } from '@/utils/interfaces';
import { useGameContext } from '@/contexts/gameContext';

type Props = {
    lottery: any
}

export default function LotteryDetail({lottery}: Props) {
    const { address } = useAccount();
    const [ boughtNumbers, setBoughtNumbers ] = useState<NumberBoughtInterface[]>([]);
    const { editGameContext } = useGameContext();
    const [isWinner, setIsWinner] = useState(false)

    const { data: dataNumbers, isError: isErrorNumbers, isLoading: isLoadingNumbers } = useContractRead({
        address: lottery.contractHash as `0x${string}`,
        abi: xance.abi,
        functionName: 'getAllSoldNumbers',
    })

    useEffect(() => {
        editGameContext(lottery, 'lottery');
        if(dataNumbers && address){
            const numbersBought = (dataNumbers as NumberBoughtInterface[]).filter((w: any) => w.addr === address.toString());
            setBoughtNumbers(numbersBought);
        }
    }, [dataNumbers, address]);

    return (
        <>
            <div className="lg:overflow-y-scroll">
                {
                    lottery &&
                    <Header 
                        xanceUrl={`${process.env.NEXT_PUBLIC_SCAN_URL}${lottery.contractHash}`} 
                        hash={lottery.contractHash}
                        isOpen={lottery.lotteryDate > new Date()}
                        date={formatDate(lottery.lotteryDate)}
                        maxInventoryNumber={0}
                    />
                }
            </div>
            <LotteryNumbersPlayed boughtNumbers={boughtNumbers}/>
       </>    
    )
}