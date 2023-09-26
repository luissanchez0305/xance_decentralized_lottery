'use client'
import { useGameContext } from '@/contexts/gameContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { use, useCallback, useContext, useEffect, useState } from 'react'
import xance from "../abi/Xance.json"

type Number = {
  value: string,
  qty: number
}

export default function Home() {
  const xanceAddress = process.env.NEXT_PUBLIC_XANCE_CONTRACT_ADDRESS ?? '0x0';
  const xanceUrl = `${process.env.NEXT_PUBLIC_SCAN_URL}${xanceAddress}`
  const router = useRouter();
  const numbers = Array(100).fill('').map((v,i)=>i.toString().padStart(2, '0'))
  const [textDisplay, setTextDisplay] = useState("Loading...")
  const [boughtNumbers, setBoughtNumbers] = useState<Number[]>([])
  const [showNumbers, setShowNumbers] = useState(false)
  const [total, setTotal] = useState(0)
  const [isWinner, setIsWinner] = useState(false)
  const { address } = useAccount();
  const { editGameContext, numbers: selected, maxInventoryNumber, isGameExpired } = useGameContext();

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

  const { data: dataWinners, isError: isErrorWinners, isLoading: isLoadingWinners } = useContractRead({
    address: xanceAddress as `0x${string}`,
    abi: xance.abi,
    functionName: 'getAllPrizeNumbers',
  })
  
  const { config: configClaim,
    error: prepareErrorClaim,
    isError: isPrepareErrorClaim, 
} = usePrepareContractWrite({
    address: xanceAddress as `0x${string}`, // Xance address
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
      setShowNumbers(true)
    }
  }, [dataNumbers])

  useEffect(() => {
    if(dataMaxInventoryNum){
      editGameContext(Number(dataMaxInventoryNum) - 1, "maxInventoryNumber")
    }
  }, [dataMaxInventoryNum])
  return (
    <>
      <div className="lg:overflow-y-scroll">
        <div className="flex flex-row justify-between bg-indigo-500">
          <div className="flow-root w-full">
            <label className="text-2l font-bold float-left">Contrato del sorteo</label>
            <label className="text-sm float-right text-end"><a href={xanceUrl} target="_blank">{xanceAddress.substring(0,7) + "..." + xanceAddress.substring(38)}</a></label>
          </div>
        </div>
        <div className="flex flex-row justify-between bg-indigo-500">
          <div className="flex flex-col">
            <p className="text-2l font-bold">{`Escoge mínimo ${maxInventoryNumber < 10 ? maxInventoryNumber : 10} números`}</p>
            <p className="text-sm">Costo por número: $0.25</p>
          </div>
          <div className="flex flex-col">
            <p className="text-2l font-bold">Fecha de sorteo</p>
            <p className="text-sm">{textDisplay}</p>
          </div>
        </div>
        <div className="grid grid-cols-5 xs:grid-cols-10 xs:gap-8 pt-2 bg-gradient-to-b from-indigo-500">
          { showNumbers &&
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
      <div className="flex flex-row sticky inset-x-0 bottom-0 h-10 mt-2" style={{backgroundColor:"white", color: "black"}}>
        {
          (<div className="flex flex-row overflow-x-auto w-full">
          {selected.map((v,i)=>(
            <div key={i} className="basis-3/4 flex justify-start">
              <div className="flex-none w-8" onClick={() => removeNumber(v.value)}>
                {v.value}
              </div>
              <div style={{
                backgroundColor: "#202020",
                color: "#fff",
                padding: "8px",
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
          ))}
          </div>)
        }
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
                <label className="mr-2 m-auto w-full text-end" style={{color: "black"}}>
                  Sorteo Expirado
                </label>) : (
              <div className="mr-3 w-[25%] text-end">
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
