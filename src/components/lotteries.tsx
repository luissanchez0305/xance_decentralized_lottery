'use client'
import { useEffect, useState } from 'react';
import { prisma } from '../../db/prisma';
import LotteryItem from './lotteryItem';
import { useAccount } from 'wagmi';
import { Prisma } from '@prisma/client';

type Props = {
    connected: boolean
}

export default function Lotteries({ connected }: Props) {

    const [futureLotteries, setFutureLotteries] = useState([] as any);
    const [pastLotteries, setPastLotteries] = useState([] as any);
    const { address } = useAccount();

    const getData = async () => {
        let data: {
            id: number;
            contractHash: string;
            tokenHash: string;
            createdDate: Date;
            lotteryDate: Date;
            country: string;
        }[] = await fetch(`/api/lotteries/`).then(res => res.json())
        
        setFutureLotteries(data.filter((lottery: any) => new Date(lottery.lotteryDate)> new Date()));
        if(connected) {
            data = await fetch(`/api/lotteries/${address}`).then(res => res.json())
            setPastLotteries(data);
        } else {
            const past = data.filter((lottery) => new Date(lottery.lotteryDate) <= new Date());
            setPastLotteries(past);
        }
    }

    useEffect(() => {
        getData();
    }, [])
    return (
        <div className="relative flex flex-col bg-gradient-to-b from-indigo-500">
            <nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
                {
                    !connected ? (
                        <>
                            <h2 className="font-normal text-[24px]">Juega ahora con estos sorteos!!</h2>
                            <div className="grid grid-cols-3">
                            {
                                futureLotteries.length > 0 ?
                                futureLotteries.map((lottery: any) => (
                                    <LotteryItem 
                                        key={lottery.id} 
                                        hash={lottery.contractHash}
                                        date={lottery.lotteryDate} 
                                        id={lottery.id}
                                    />
                                )) :
                                <label className="ml-5">No hay sorteos</label>
                            }
                            </div>
                        </>
                    ) : null
                }
                
                <h1 className="border-t-2 border-[#afafaf] pt-3 mt-3 text-[24px] content-center">{
                    connected ? 'Mis Sorteos' : 'Sorteos Pasados' 
                }</h1>
                <div className="grid grid-cols-3">
                {
                    pastLotteries.length > 0 ?
                    pastLotteries.map((lottery: any) => (
                        <LotteryItem 
                            key={lottery.id} 
                            hash={lottery.contractHash}
                            id={lottery.id}
                            date={lottery.lotteryDate} 
                        />
                    )) :
                    <label className="ml-5">No hay sorteos</label>
                }
                </div>
            </nav>
        </div>
    );
}