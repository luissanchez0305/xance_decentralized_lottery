'use client'
import { useGameContext } from '@/contexts/gameContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useContractRead } from 'wagmi'
import { use, useContext, useEffect, useState } from 'react'
import xance from "../abi/Xance.json"

type Number = {
  value: string,
  qty: number
}

export default function Home() {
  const xanceAddress = process.env.NEXT_PUBLIC_XANCE_CONTRACT_ADDRESS!;
  const router = useRouter();
  const numbers = Array(100).fill('').map((v,i)=>i.toString().padStart(2, '0'))
  const [boughtNumbers, setBoughtNumbers] = useState<Number[]>([])
  const [total, setTotal] = useState(0)
  const { editGameContext, numbers: selected, maxInventoryNumber } = useGameContext();

  const chooseNumber = (n: string) => {
    let totalSelected: Number[] = [];

    if (selected.map((n) => n.value).includes(n)) {
      const qty = selected.find((v) => v.value === n)!.qty + 1
      const newSelected = selected.filter(v=>v.value!==n)
      totalSelected = [...newSelected, {value: n, qty: qty}].sort((a,b)=>parseInt(a.value)-parseInt(b.value))
    } else {
      totalSelected = [...selected, {value: n, qty: 1}].sort((a,b)=>parseInt(a.value)-parseInt(b.value))
    }
    const bougthQty = boughtNumbers.find((b) => b.value == n);
    const selectedQty = totalSelected.find((b) => b.value == n)!;
    console.log('boughtNumbers', boughtNumbers)
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

  const runBuy = async () => {
    if(selected.reduce((acc, obj) => { return acc + obj.qty; }, 0) < maxInventoryNumber){
      alert(`Debes escoger mínimo ${maxInventoryNumber < 10 ? maxInventoryNumber : 10} números`)
      return
    }
    router.push("/numbers")
  }

  const { data: dataExpiresAt, isError: isErrorExpiresAt, isLoading: isLoadingExpiresAt } = useContractRead({
    address: xanceAddress as `0x${string}`,
    abi: xance.abi,
    functionName: 'expiresAt',
  })

  const { data: dataNumbers, isError: isErrorNumbers, isLoading: isLoadingNumbers } = useContractRead({
    address: xanceAddress as `0x${string}`,
    abi: xance.abi,
    functionName: 'getAllSoldNumbers',
  })

  const { data: dataMaxInventoryNum, isError: isErrorMaxInventoryNum, isLoading: isLoadingMaxInventoryNum } = useContractRead({
    address: xanceAddress as `0x${string}`,
    abi: xance.abi,
    functionName: 'maxInventoryNumber',
  })

  useEffect(() => {
    if(dataExpiresAt){
      editGameContext(dataExpiresAt, "expiresAt")
    }
  }, [dataExpiresAt])

  useEffect(() => {
    if(dataNumbers){
      console.log('dataNumbers', dataNumbers)
      setBoughtNumbers((dataNumbers as []).map((v: any) => ({value: v.number, qty: v.qty})))
    }
  }, [dataNumbers])

  useEffect(() => {
    if(dataMaxInventoryNum){
      editGameContext(Number(dataMaxInventoryNum) - 1, "maxInventoryNumber")
    }
  }, [dataMaxInventoryNum])
  return (
    <div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <p className="text-2l font-bold">Contrato del sorteo</p>
          <p className="text-sm"><a href={`https://goerli.etherscan.io/address/${xanceAddress}`} target="_blank">{xanceAddress}</a></p>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <p className="text-2l font-bold">{`Escoge mínimo ${maxInventoryNumber < 10 ? maxInventoryNumber : 10} números`}</p>
          <p className="text-sm">Cada uno tiene un costo de $0.25</p>
        </div>
        <div className="flex flex-col">
          <p className="text-2l font-bold">Fecha de sorteo</p>
          <p className="text-sm">{
            isLoadingExpiresAt ? 
              "Loading..." : 
              isErrorExpiresAt ? 
                "Error" : 
                dataExpiresAt ? 
                  new Date(Number(dataExpiresAt) * 1000).toLocaleString() : 
                  "Loading..."
              }
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 xs:grid-cols-10 xs:gap-6 overflow-y-scroll">
        {
          numbers.map((v,i)=>(
            <div key={i} className="text-center" onClick={() => chooseNumber(v)}>
              {v}
            </div>
          ))
        }
      </div>
      <div className="flex flex-row absolute inset-x-0 bottom-0 h-8" style={{backgroundColor:"white", color: "black"}}>

        <div className="basis-3/4 flex justify-start max-w-[75%]">
        {
          selected.map((v,i)=>(
            <>
              <div key={i} className="flex-none w-8" onClick={() => removeNumber(v.value)}>
                {v.value}
              </div>
              <div style={{
                backgroundColor: "#202020",
                color: "#fff",
                padding: "10px",
                margin: 0,
                borderRadius: "5px",
                fontSize: "12px",
                position: "relative", 
                bottom: 0, 
                left: 0
              }}>
                <p>{v.qty}</p>
              </div>
            </>
          ))
        }
        </div>
        {
          isLoadingExpiresAt || isLoadingNumbers || isLoadingMaxInventoryNum ? 
            "Loading..." : 
              isErrorExpiresAt || isErrorNumbers || isErrorMaxInventoryNum ? "Error" : (
            <button onClick={() => { runBuy() }} className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ">
              ${total.toFixed(2)}
            </button>
          )
        }
      </div>
    </div>
  )
}
