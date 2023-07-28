import { useGameContext } from '@/contexts/gameContext';
import Link from 'next/link';
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Numbers() {
    const { numbers: selected } = useGameContext();
    const [total, setTotal] = useState(0)

    useEffect(() => {
        setTotal((selected.reduce((a, b) => a + b.qty, 0) * 0.25))
    }, [selected])

    return (
        <>
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-2 overflow-y-scroll">
                {
                    selected.map((v,i)=>(
                        <div key={i} className="text-center" >
                            <div key={i} className="flex-none w-8">
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
                        </div>
                    ))
                }
                <Link href="/numbers">${total.toFixed(2)}</Link>
            </div>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <ConnectButton />
            </div>
        </>
    )
}