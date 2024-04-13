'use client'
import { useGameContext } from '@/contexts/gameContext'
import { useRouter } from 'next/navigation'
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { useEffect, useState } from 'react'
import xance from "../abi/Xance.json"
import Header from './header'
import { lottery as _lottery } from "@prisma/client";
import { lotteryType } from '@/utils/types'

type Number = {
  value: string,
  qty: number
}

export default function Home() {
  const router = useRouter();
  const [numbers, setNumbers] = useState<string[]>();
  const [textDisplay, setTextDisplay] = useState("Loading...")
  const [boughtNumbers, setBoughtNumbers] = useState<Number[]>([])
  const [showNumbers, setShowNumbers] = useState(false)
  const [number, setNumber] = useState<number>();
  const [total, setTotal] = useState(0)
  const [isWinner, setIsWinner] = useState(false)
  const { address } = useAccount();
  const { editGameContext, numbers: selected, maxInventoryNumber, isGameExpired, lottery } = useGameContext();

  const getDefaultLottery = async () => {
    const lottery = await fetch(`/api/lottery/`).then(res => res.json())
    editGameContext(lottery, "lottery");
  }
  const xanceUrl = () => {
    return `${process.env.NEXT_PUBLIC_SCAN_URL}${lottery?.contractHash}`;
  }

  const chooseNumber = (n: string) => {
    let totalSelected: Number[] = [];
    if(isSoldOut(n) || isGameExpired()) return

    if (selected.map((n) => n.value).includes(n)) {
      const qty = selected.find((v) => v.value === n)!.qty + 1
      const newSelected = selected.filter(v=>v.value!==n)
      totalSelected = [...newSelected, {value: n, qty: qty}].sort((a,b)=>parseInt(a.value)-parseInt(b.value))
    } else {
      totalSelected = [...selected, {value: n, qty: 1}].sort((a,b)=>parseInt(a.value)-parseInt(b.value))
    }
    const bougthQty = boughtNumbers.find((b) => b.value == n);
    const selectedQty = totalSelected.find((b) => b.value == n)!;
    
    if(bougthQty && bougthQty.qty + selectedQty.qty >= maxInventoryNumber){
      alert(`Solo quedan ${maxInventoryNumber - bougthQty.qty - 1} números disponibles`)
      return
    }
    
    setTotal((totalSelected.reduce((a, b) => a + b.qty, 0) * 0.25))
    editGameContext(totalSelected, "numbers");
  }

  const removeNumber = (n: string) => {
    let totalSelected: Number[] = [];
    const qty = selected.find((v) => v.value === n)!.qty
    if (qty - 1 === 0) {
      totalSelected = selected.filter(v=>v.value!==n)
    } else {
      const newSelected = selected.filter(v=>v.value!==n)
      totalSelected = [...newSelected, {value: n, qty: qty-1}].sort((a,b)=>parseInt(a.value)-parseInt(b.value))
    }
    setTotal((totalSelected.reduce((a, b) => a + b.qty, 0) * 0.25))
    editGameContext(totalSelected, "numbers")
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

  const { data: dataNumbers, isError: isErrorNumbers, isLoading: isLoadingNumbers } = useContractRead({
    address: lottery?.contractHash as `0x${string}`,
    abi: xance.abi,
    functionName: 'getAllSoldNumbers',
  })

  const { data: dataWinners, isError: isErrorWinners, isLoading: isLoadingWinners } = useContractRead({
    address: lottery?.contractHash as `0x${string}`,
    abi: xance.abi,
    functionName: 'getAllPrizeNumbers',
  })

  const { data: dataExpiresAt, isError: isErrorExpiresAt, isLoading: isLoadingExpiresAt } = useContractRead({
    address: lottery?.contractHash as `0x${string}`,
    abi: xance.abi,
    functionName: 'expiresAt',
  })

  const { data: dataMaxInventoryNum, isError: isErrorMaxInventoryNum, isLoading: isLoadingMaxInventoryNum } = useContractRead({
    address: lottery?.contractHash as `0x${string}`,
    abi: xance.abi,
    functionName: 'maxInventoryNumber',
  })

  const { config: configClaim,
    error: prepareErrorClaim,
    isError: isPrepareErrorClaim, 
  } = usePrepareContractWrite({
      address: lottery?.contractHash as `0x${string}`, // Xance address
      abi: xance.abi,
      functionName: 'claim',
      args: []
  })
  const { data: dataClaim, write: writeClaim } = useContractWrite(configClaim)

  const { 
      isLoading: isLoadingClaim, 
      error: errorClaim, 
      isError: isErrorClaim, 
      isSuccess: isSuccessClaim
  } = useWaitForTransaction({
    hash: dataClaim?.hash,
  })

  const inputNumber = (e: any) => {
    const val = parseInt(e.target.value);
    if(val > 99 || val < 0) return;
    setNumber(val)
    if(!e.target.value){
      setShowNumbers(false)
      return;
    }

    if(e.target.value.length === 1){
      const numbersArray = Array(10).fill('').map((v,i)=>i.toString());
      setNumbers(numbersArray.map((n) => e.target.value + n));
    }

    if(e.target.value.length > 1){
      setNumbers([e.target.value])
    }
    
    setShowNumbers(true);
  }

  useEffect(() => {
    if(dataExpiresAt){
      setTextDisplay(new Date(Number(dataExpiresAt) * 1000).toLocaleString());
      editGameContext(dataExpiresAt, "expiresAt")
      if(isGameExpired()){
        editGameContext([], "numbers");
        if(address && !isErrorWinners && dataWinners) {
          if((dataWinners as []).map((v: any) => v.map((w: any) => w.addr).includes(address.toString())).includes(true)){
            setIsWinner(true)
          }
        }
      }
    }
    if(isErrorExpiresAt)
        setTextDisplay("Error"); 
  }, [dataExpiresAt, isLoadingExpiresAt, isErrorExpiresAt, dataWinners, address])

  useEffect(() => {
    if(dataNumbers){
      setBoughtNumbers((dataNumbers as []).map((v: any) => ({value: v.number.toString(), qty: v.qty})))
      // setShowNumbers(true)
    }
  }, [dataNumbers])

  useEffect(() => {
    if(dataMaxInventoryNum){
      editGameContext(Number(dataMaxInventoryNum) - 1, "maxInventoryNumber")
    }
  }, [dataMaxInventoryNum])

  useEffect(() => {
    getDefaultLottery();
  }, []);
  
  return (
    <>
      <div className="lg:overflow-y-scroll">
        <Header xanceUrl={xanceUrl()} hash={lottery ? lottery.contractHash : '0x0'} isOpen={true} date={textDisplay} maxInventoryNumber={maxInventoryNumber} />
        <div className="h-40 grid grid-cols-1 gap-4 content-center xs:gap-8 pt-2 bg-gradient-to-b from-indigo-500">
          <div className="mb-6 mx-auto">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Escoge un número</label>
              <input 
                type="number" 
                id="large-input" 
                className="block w-[100px] text-2xl mx-auto p-6 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChange={inputNumber} value={number}
              />
          </div>
        </div>
        <div className="grid grid-cols-5">
        { (showNumbers && numbers) &&
          numbers.map((v,i)=>(
            <div key={i} className="text-center rounded-full border-2" style={{
              borderColor: isSoldOut(v) ? "#000" : "#fff",
              cursor: isSoldOut(v) || isGameExpired() ? "not-allowed" : "pointer"
            }} onClick={() => chooseNumber(v)}>
              {v}
            </div>
          ))
        }
        </div>
      </div>
      { 
        selected.length > 0 ? 
          <div className="flex flex-row overflow-x-auto w-full mt-10 border-t-2 border-[#afafaf]">
            Números seleccionados
          </div>
        : null
      }
      
      <div className="grid grid-cols-5 sticky inset-x-0 bottom-0 mt-2">
        {
          selected.map((v,i)=>(
            <div key={i} className="grid grid-cols-2">
              <div className="text-center rounded-full border-2" style={{
                  borderColor: "#fff", cursor: "pointer"
                }} onClick={() => removeNumber(v.value)}
              >
                {v.value}
              </div>
              <div style={{
                backgroundColor: "transparent",
                color: "#fff",
                padding: "0 0 0 4px",
                margin: 0,
                borderRadius: "5px",
                fontSize: "12px",
                position: "relative", 
                bottom: 0, 
                left: 0
              }}>
                <p>{v.qty}</p>
              </div>
            </div>
          )
        )}
      </div>
      <div className="flex flex-row justify-between mt-10 w-full">
        {
          isLoadingExpiresAt || isLoadingNumbers || isLoadingMaxInventoryNum ? 
            "Loading..." : 
              isErrorExpiresAt || isErrorNumbers || isErrorMaxInventoryNum ? "Error" : isGameExpired() ? (isWinner ? 
                (isSuccessClaim ? 
                  <label className="mr-3 w-full text-end" style={{color: "black"}}>
                    Tu Premio ha sido depositado. FELICIDADES!!
                  </label> : <button onClick={() => writeClaim?.()} className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ">
                  { isLoadingClaim ? "Reclamando..." : "Reclamar Premio" }
                </button>) : 
                <label className="mr-2 m-auto text-end" style={{color: "black"}}>
                  Sorteo Expirado
                </label>) : (
              <div className="mr-3 w-full text-end">
                <button onClick={() => { runBuy() }} className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ">
                  ${total.toFixed(2)}
                </button>
              </div>
          )
        }
      </div>
    </>
  )
}
