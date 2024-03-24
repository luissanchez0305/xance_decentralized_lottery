import { prisma } from '../../db/prisma';
import LotteryItem from './lotteryItem';

export default async function Lotteries() {
    const lotteries = await prisma.lottery.findMany();

    const pastLotteries = lotteries.filter(lottery => lottery.lotteryDate < new Date());
    const futureLotteries = lotteries.filter(lottery => lottery.lotteryDate > new Date());

    return (
        <div className="relative flex flex-col bg-gradient-to-b from-indigo-500">
            <nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
                <h2 className="font-normal">Juega ahora con estos sorteos!!</h2>
                <div className="grid grid-cols-3">
                {
                    futureLotteries.length > 0 ?
                    futureLotteries.map(lottery => (
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
                <h1 className="border-t-2 border-[#afafaf] pt-3 mt-3">Sorteos Pasados</h1>
                <div className="grid grid-cols-3">
                {
                    pastLotteries.length > 0 ?
                    pastLotteries.map(lottery => (
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