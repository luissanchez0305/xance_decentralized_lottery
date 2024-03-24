'use client'
import { formatDate } from '@/utils/helper';
import Header from './header';
import LotteryNumbersPlayed from './lotteryNumbersPlayed';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import xance from "../abi/Xance.json"
import { NumberBoughtInterface } from '@/utils/interfaces';

type Props = {
    lottery: any
}

export default function LotteryDetail({lottery}: Props) {
    const { address } = useAccount();
    const [ numbersBought, setNumbersBought ] = useState<NumberBoughtInterface[]>([]);

    const { data: dataNumbers, isError: isErrorNumbers, isLoading: isLoadingNumbers } = useContractRead({
        address: lottery.contractHash as `0x${string}`,
        abi: xance.abi,
        functionName: 'getAllSoldNumbers',
      })

    useEffect(() => {
        if(dataNumbers && address){
            console.log('dataNumbers', dataNumbers);
            const numbersBought = (dataNumbers as NumberBoughtInterface[]).filter((w: any) => w.addr === address.toString());
            setNumbersBought(numbersBought);
            console.log('------------numberBought', numbersBought);
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
            <LotteryNumbersPlayed numbersBought={numbersBought}/>
       </>    
    )
}