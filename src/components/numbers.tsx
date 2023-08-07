'use client'
import { useGameContext } from '@/contexts/gameContext';
import Link from 'next/link';
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TopMenu from './topMenu';
import { 
    useAccount, 
    usePrepareContractWrite, 
    useContractWrite, 
    useWaitForTransaction
} from "wagmi";
import { useDebounce } from '@/hooks/useDebounce';
import { ethers } from "ethers"
import xance from "../abi/Xance.json"

export default function Numbers() {
    
    const [total, setTotal] = useState(0)
    const [steps, setSteps] = useState(0)
    const { numbers: selected } = useGameContext();
    const debouncedSelectedNumbers = useDebounce(selected, 500)
    const { address, connector } = useAccount();
    const xanceAddress = process.env.NEXT_PUBLIC_XANCE_CONTRACT_ADDRESS;
    const { config: configBuy,
        error: prepareErrorBuy,
        isError: isPrepareErrorBuy, 
    } = usePrepareContractWrite({
        address: xanceAddress as `0x${string}`, // Xance address
        abi: xance.abi,
        functionName: 'buy',
        args: [
            debouncedSelectedNumbers.map((n) => n.value), 
            debouncedSelectedNumbers.map((n) => n.qty)
        ]
    })
    const { data: dataBuy, write: writeBuy } = useContractWrite(configBuy)
 
    const { 
        isLoading: isLoadingBuy, 
        error: errorBuy, 
        isError: isErrorBuy, 
        isSuccess: isSuccessBuy 
    } = useWaitForTransaction({
      hash: dataBuy?.hash,
    })
    const { config: configToken,
        error: prepareErrorToken,
        isError: isPrepareErrorToken, 
    } = usePrepareContractWrite({
        address: '0xA063b4EA6f5D924415FbF4E3a590bCb39e695e85', // usd address
        abi: [
            {
                "inputs": [
                  {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  }
                ],
                "name": "approve",
                "outputs": [
                  {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                  }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
              }
        ],
        functionName: 'approve',
        args: [ xanceAddress, ethers.parseEther(total.toString())
        ],
        value: BigInt('0')
    })
    const { data: dataToken, write: writeToken } = useContractWrite(configToken)
 
    const { 
        isLoading: isLoadingToken, 
        error: errorToken, 
        isError: isErrorToken, 
        isSuccess: isSuccessToken
    } = useWaitForTransaction({
      hash: dataToken?.hash,
    })

    useEffect(() => {
        setTotal((selected.reduce((a, b) => a + b.qty, 0) * 0.25))
    }, [selected])

    useEffect(() => {
        if (isSuccessToken) {
            setSteps(1)
        }
    }, [isSuccessToken])

    return (
        <>
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-6 overflow-y-scroll">
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
            </div>
            <div>
                Total <Link href="/numbers">${total.toFixed(2)}</Link>
            </div>
            <div className="lg:grid-cols-10 gap-6 overflow-y-scroll bg-white absolute inset-x-0 bottom-0 text-end">
                    {
                        (!connector) ? 
                        <label className="mr-3" style={{color: "black"}}>Conectar el wallet</label>
                        :(
                        (!writeBuy && steps === 0) ? (
                            <>
                                <button disabled={!writeToken} onClick={() => writeToken?.()} className="mr-3 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ">
                                    {isLoadingToken ? 'Aprobando...' : 'Comprar 1er paso: Aprobar'}
                                </button>
                            </>
                        ) : (
                            (steps === 1) && (
                                <button onClick={() => writeBuy?.()} className="mr-3 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ">
                                    {isLoadingBuy ? 'Pagando...' : 'Comprar 2do paso: Pagar'}
                                </button>
                        ))
                        )
                    }
            </div>
            {(isPrepareErrorBuy || isErrorBuy || isPrepareErrorToken || isErrorToken) && (
                <div>Error: {(prepareErrorBuy || errorBuy || prepareErrorToken || errorToken)?.message}</div>
            )}
        </>
    )
}