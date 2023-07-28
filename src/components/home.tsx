'use client'
import { useGameContext } from '@/contexts/gameContext'
import Link from 'next/link'
import { use, useContext, useState } from 'react'

type Number = {
  value: string,
  qty: number
}

export default function Home() {
  const numbers = Array(100).fill('').map((v,i)=>i.toString().padStart(2, '0'))
  const [total, setTotal] = useState(0)
  const { editGameContext, numbers: selected } = useGameContext();

  const chooseNumber = (n: string) => {
    let totalSelected: Number[] = [];

    if (selected.map((n) => n.value).includes(n)) {
      const qty = selected.find((v) => v.value === n)!.qty + 1
      const newSelected = selected.filter(v=>v.value!==n)
      totalSelected = [...newSelected, {value: n, qty: qty}].sort((a,b)=>parseInt(a.value)-parseInt(b.value))
    } else {
      totalSelected = [...selected, {value: n, qty: 1}].sort((a,b)=>parseInt(a.value)-parseInt(b.value))
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
  return (
    <>
      <div className="grid grid-cols-5 lg:grid-cols-10 gap-2 overflow-y-scroll">
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
        <Link href="/numbers">${total.toFixed(2)}</Link>
      </div>
    </>
  )
}
