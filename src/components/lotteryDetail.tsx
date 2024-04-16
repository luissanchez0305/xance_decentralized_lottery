'use client'
import { formatDate } from '@/utils/helper';
import Header from './header';
import LotteryNumbersPlayed from './lotteryNumbersPlayed';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import xance from "../abi/Xance.json"
import { NumberBoughtInterface } from '@/utils/interfaces';
import { useGameContext } from '@/contexts/gameContext';
import { NumberType } from '@/utils/types';
import BuyNumbers from './buyNumbers';

type Props = {
    lottery: any
}

export default function LotteryDetail({lottery}: Props) {
    const { address } = useAccount();
    const [ boughtNumbers, setBoughtNumbers ] = useState<NumberType[]>([]);
    const [ addresBoughtNumbers, setAddressBoughtNumbers ] = useState<NumberBoughtInterface[]>([]);
    const { editGameContext, numbers: selected, maxInventoryNumber } = useGameContext();

    const { data: dataNumbers, isError: isErrorNumbers, isLoading: isLoadingNumbers } = useContractRead({
        address: lottery.contractHash as `0x${string}`,
        abi: xance.abi,
        functionName: 'getAllSoldNumbers',
    })

    const { data: dataMaxInventoryNum, isError: isErrorMaxInventoryNum, isLoading: isLoadingMaxInventoryNum } = useContractRead({
        address: lottery.contractHash as `0x${string}`,
        abi: xance.abi,
        functionName: 'maxInventoryNumber',
    })

    const isSoldOut = (n: string) => {
      const totalBought = boughtNumbers.filter((v) => v.value === n).reduce((acc, obj) => { return acc + obj.qty; }, 0)
      const totalSelected = selected.filter((v) => v.value === n).reduce((acc, obj) => { return acc + obj.qty; }, 0)
      return totalBought + totalSelected >= maxInventoryNumber
    }

    useEffect(() => {
      if(dataMaxInventoryNum){
        editGameContext(Number(dataMaxInventoryNum) - 1, "maxInventoryNumber")
      }
    }, [dataMaxInventoryNum])

    useEffect(() => {
        if(dataNumbers){
            setBoughtNumbers((dataNumbers as []).map((v: any) => ({value: v.number.toString(), qty: v.qty})))
            if(address){
                const addrBoughtNumber = (dataNumbers as NumberBoughtInterface[]).filter((w: any) => w.addr === address.toString());
                setAddressBoughtNumbers(addrBoughtNumber);
            }
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
                        maxInventoryNumber={maxInventoryNumber}
                    />
                }
            </div>
            <BuyNumbers isSoldOut={isSoldOut} boughtNumbers={boughtNumbers} />
            <LotteryNumbersPlayed addresBoughtNumbers={addresBoughtNumbers}/>
       </>    
    )
}