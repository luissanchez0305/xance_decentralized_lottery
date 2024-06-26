'use client'
import { useGameContext } from '@/contexts/gameContext';
import Link from 'next/link';
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
    useAccount, 
    usePrepareContractWrite, 
    useContractWrite, 
    useWaitForTransaction,
    useContractRead
} from "wagmi";
import { useDebounce } from '@/hooks/useDebounce';
import { ethers } from "ethers"
import xance from "../abi/Xance.json"
import { useRouter } from 'next/navigation';
import { prisma } from '../../db/prisma';
import { shortenHash } from '@/utils/helper';
import { useWindowSize } from 'usehooks-ts'
import Confetti from 'react-confetti'

export default function Numbers() {
    const router = useRouter();
    const [total, setTotal] = useState(0)
    const [steps, setSteps] = useState(0)
    const { numbers: selected, isGameExpired, lottery } = useGameContext();
    const debouncedSelectedNumbers = useDebounce(selected, 500)
    const { address, connector } = useAccount();
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize()
    const { config: configBuy,
        error: prepareErrorBuy,
        isError: isPrepareErrorBuy, 
        refetch: refetchBuy,
    } = usePrepareContractWrite({
        address: lottery?.contractHash as `0x${string}`, // Xance address
        abi: xance.abi,
        functionName: 'buy',
        args: [
            debouncedSelectedNumbers.map((n) => n.value), 
            debouncedSelectedNumbers.map((n) => n.qty)
        ],
        onSuccess(data) {
        },
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
        refetch: refetchToken,
    } = usePrepareContractWrite({
        address: process.env.NEXT_PUBLIC_USD_CONTRACT_ADDRESS! as `0x${string}`, // usd address
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
        args: [ lottery?.contractHash, ethers.parseEther(total.toString())
        ],
        value: ethers.parseEther('0')
    })

    const { data: dataBalance, error: errorBalance, isError: isErrorBalance, isLoading: isLoadingBalance, refetch: refetchBalance } = useContractRead({
        address: process.env.NEXT_PUBLIC_USD_CONTRACT_ADDRESS! as `0x${string}`,
        abi: [
            {
                "inputs": [
                    {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ],
        functionName: 'balanceOf',
        args: [address]
    });
    
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
        if(isGameExpired()){
            router.push('/')
        }   
    }, [isGameExpired])

    useEffect(() => {
        setTotal((selected.reduce((a, b) => a + b.qty, 0) * 0.25))
    }, [selected, dataBalance])

    useEffect(() => {
        if (isSuccessToken) {
            setSteps(1)
            refetchBuy?.()
        }
    }, [isSuccessToken])

    useEffect(() => {
        if (!isPrepareErrorBuy) {
            setSteps(1)
        } else {
            setSteps(0)
        }
    }, [isPrepareErrorBuy])

    useEffect(() => {
        if(address) {
            refetchBalance()
        }
    }, [address])

    useEffect(() => {
        if (isSuccessBuy) {
            refetchBalance()
            setShowConfetti(true);
            setSteps(2);
            fetch('/api/lottery/played', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lottery_id: lottery?.id,
                    address: address,
                }),
            });
            var text = `🎉Compra satisfactoria🎉\n${shortenHash(address as `0x${string}`)} ha comprado ${debouncedSelectedNumbers.reduce((sum, current) => sum + current.qty, 0)} billetes en el sorteo ${shortenHash(lottery?.contractHash as `0x${string}`)}.\n MUCHA SUERTE!`;
            fetch(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID}&text=${text}&parse_mode=html&disable_web_page_preview=1`,
            {
                method: 'GET',
            });
        }
    }, [isSuccessBuy])

    return (
        <>
            <div className="grid grid-cols-5 gap-6 overflow-y-scroll py-7 bg-gradient-to-b from-indigo-500">
                {
                    selected.map((v,i)=>(
                        <div key={i} className="grid grid-cols-2" >
                            <div key={i} className="text-center rounded-full border-2" style={{
                                borderColor: "#fff", cursor: "pointer"
                                }}
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
                    ))
                }
            </div>
            {
                (isLoadingBalance) ? 
                <div>
                    <label className="mr-3">Loading...</label> 
                </div> : 
                (dataBalance) ? 
                <div>
                    <label className="mr-3">Balance {ethers.formatEther(dataBalance.toString())} USD</label> 
                </div> :
                null
            }
            <div>
                Total <Link href="/numbers">{total.toFixed(2)} USD</Link>
            </div>
            <div className="flex flex-row justify-between mt-10 w-full text-white text-right">
                    {
                        (!connector) ? 
                        <label className="mr-3" style={{color: "black"}}>Conectar el wallet</label>
                        : (
                            (
                                ((steps === 0 && isPrepareErrorBuy) || ([1,2].includes(steps) && !isPrepareErrorBuy)) && 
                                dataBalance && 
                                (Number(ethers.formatEther(dataBalance.toString())) >= total)
                            ) ?
                            (!writeBuy && steps === 0) ? (
                                <button disabled={!writeToken} onClick={() => writeToken?.()} className="mr-3 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ">
                                    {isLoadingToken ? 'Aprobando...' : 'Comprar 1er paso de 2: Aprobar'}
                                </button>
                            ) : ((steps === 1) ? (
                                    <button onClick={() => writeBuy?.()} className="mr-3 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ">
                                        {isLoadingBuy ? 'Pagando...' : 'Comprar 2do paso de 2: Pagar'}
                                    </button>
                            ) : (
                                <>
                                    <label className="mr-3 w-full text-end" style={{color: "black"}}>Números comprados con éxito. BUENA SUERTE!!</label>
                                    <a style={{paddingLeft: '5px', color: 'blue'}} href="/">Regresar</a>
                                </>
                            )) : <div>Error: {(prepareErrorBuy || errorBuy)?.message}</div>
                        )
                    }
            </div>
            {
                showConfetti ? 
                <Confetti
                    width={width}
                    height={height}
                /> : null
            }
            {(isPrepareErrorBuy || isErrorBuy) && (
                (prepareErrorBuy || errorBuy)?.message.includes('have enough USD') ? 
                    <div>Error: No cuentas con suficiente saldo</div> : 
                (prepareErrorBuy || errorBuy)?.message.includes('You should buy at least one') ? 
                    <div>Error: Regrese a la página anterior para escoger sus números
                        <a style={{paddingLeft: '5px'}} href="/">Regresar</a>
                    </div> : 
                (!(prepareErrorBuy || errorBuy)?.message.includes('allowance')) ? (
                    <div>Error: {(prepareErrorBuy || errorBuy)?.message}</div>
                ) : (null)
            )}
            {(isPrepareErrorToken || isErrorToken) && (
                <div>Error Token: {(prepareErrorToken || errorToken)?.message}</div>
            )}
        </>
    )
}