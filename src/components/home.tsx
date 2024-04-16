'use client'
import { useGameContext } from '@/contexts/gameContext'
import { useRouter } from 'next/navigation'
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { useEffect, useState } from 'react'
import xance from "../abi/Xance.json"
import Header from './header'
import { lottery as _lottery } from "@prisma/client";
import { NumberType, lotteryType } from '@/utils/types'
import BuyNumbers from './buyNumbers'

export default function Home() {
  const router = useRouter();
  const [textDateDisplay, setTextDateDisplay] = useState("Loading...")
  const [boughtNumbers, setBoughtNumbers] = useState<NumberType[]>([])
  const [isWinner, setIsWinner] = useState(false)
  const { address } = useAccount();
  const { editGameContext, numbers: selected, maxInventoryNumber, isGameExpired, total, lottery } = useGameContext();

  const getDefaultLottery = async () => {
    const lottery = await fetch(`/api/lottery/first`).then(res => res.json())
    editGameContext(lottery, "lottery");
  }
  const xanceUrl = () => {
    return `${process.env.NEXT_PUBLIC_SCAN_URL}${lottery?.contractHash}`;
  }

  const isSoldOut = (n: string) => {
    const totalBought = boughtNumbers.filter((v) => v.value === n).reduce((acc, obj) => { return acc + obj.qty; }, 0)
    const totalSelected = selected.filter((v) => v.value === n).reduce((acc, obj) => { return acc + obj.qty; }, 0)
    return totalBought + totalSelected >= maxInventoryNumber
  }

  const runBuy = async () => {
    const minOnBuy = maxInventoryNumber < 10 ? maxInventoryNumber : 10
    if(selected.reduce((acc, obj) => { return acc + obj.qty; }, 0) < minOnBuy){
      alert(`Debes escoger mínimo ${minOnBuy} números`)
      return
    }
    router.push("/numbers")
  }



  useEffect(() => {
    getDefaultLottery();
  }, []);
  
  return (
    <>
      <div className="lg:overflow-y-scroll">
        <Header xanceUrl={xanceUrl()} hash={lottery ? lottery.contractHash : '0x0'} isOpen={true} date={textDateDisplay} maxInventoryNumber={maxInventoryNumber} />
        <BuyNumbers isSoldOut={isSoldOut} boughtNumbers={boughtNumbers} />
      </div>
      
    </>
  )
}
