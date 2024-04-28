import { useGameContext } from "@/contexts/gameContext";
import { NumberBoughtInterface } from "@/utils/interfaces";
import { useAccount } from "wagmi";

type Props = {
    boughtNumbers: NumberBoughtInterface[]
}
export default function LotteryNumbersPlayed({boughtNumbers}: Props) {
    const { address } = useAccount();
    const { isGameExpired } = useGameContext();

    return (
        <div className="relative flex flex-col bg-gradient-to-b from-indigo-500">
            <nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
                
                <div>
                    {
                        address && boughtNumbers.length > 0 &&
                        <h2 className="font-normal">Usted compró estos numeros en este sorteo:</h2>
                    }
                    {
                        address ?
                        <div className="flex flex-col py-3">
                            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                                    <div className="overflow-hidden">
                                        <table
                                            className="min-w-full text-left text-sm font-light text-surface dark:text-white">
                                            <thead
                                            className="border-b border-neutral-200 bg-neutral-50 font-medium dark:border-white/10 dark:text-neutral-800">
                                            <tr>
                                                <th scope="col" className="px-6 py-4">Numero</th>
                                                <th scope="col" className="px-6 py-4">Cantidad</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                boughtNumbers.length > 0 ?
                                                boughtNumbers.map((item, id) => (              
                                                    <tr key={id} className="border-b border-neutral-200 dark:border-white/10">
                                                        <td className="whitespace-nowrap px-6 py-4 font-medium">{item.number}</td>
                                                        <td className="whitespace-nowrap px-6 py-4">{item.qty}</td>
                                                    </tr>
                                                )) :
                                                <label className="ml-5">No compró numeros para este sorteo</label>
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        isGameExpired() ? null : <h2 className="font-normal text-center py-3 text-2xl">Conecte su wallet para comprar números en este sorteo</h2>
                    }
                </div>
            </nav>
        </div>
    )
}