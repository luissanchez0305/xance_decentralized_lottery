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
    const [ winningNumbers, setWinningNumbers ] = useState<number[]>([])

    const { data: dataNumbers, isError: isErrorNumbers, isLoading: isLoadingNumbers } = useContractRead({
        address: lottery.contractHash as `0x${string}`,
        abi: xance.abi,
        functionName: 'getAllSoldNumbers',
    })

    const { data: dataPrizes1, isError: isErrordrizes1, isLoading: isLoadingPrizes1 } = useContractRead({
        address: lottery.contractHash as `0x${string}`,
        abi: xance.abi,
        functionName: 'prizes',
        args: [1]
    })

    const { data: dataPrizes2, isError: isErrordrizes2, isLoading: isLoadingPrizes2 } = useContractRead({
        address: lottery.contractHash as `0x${string}`,
        abi: xance.abi,
        functionName: 'prizes',
        args: [2]
    })

    const { data: dataPrizes3, isError: isErrordrizes3, isLoading: isLoadingPrizes3 } = useContractRead({
        address: lottery.contractHash as `0x${string}`,
        abi: xance.abi,
        functionName: 'prizes',
        args: [3]
    })

    useEffect(() => {
        editGameContext(lottery, 'lottery');
        if(dataNumbers && address){
            const numbersBought = (dataNumbers as NumberBoughtInterface[]).filter((w: any) => w.addr === address.toString());
            setBoughtNumbers(numbersBought);
        }
    }, [dataNumbers, address]);

    useEffect(() => {
        if(dataPrizes1 && dataPrizes2 && dataPrizes3){
            console.log('dataPrizes', dataPrizes1, dataPrizes2, dataPrizes3);
            setWinningNumbers([Number(dataPrizes1), Number(dataPrizes2), Number(dataPrizes3)])
        }
    }, [dataPrizes1, dataPrizes2, dataPrizes3]);

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
                        winningNumbers={winningNumbers}
                    />
                }
            </div>
            <LotteryNumbersPlayed boughtNumbers={boughtNumbers}/>
       </>    
    )
}