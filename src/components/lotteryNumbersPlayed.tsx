import { NumberBoughtInterface } from "@/utils/interfaces";

type Props = {
    numbersBought: NumberBoughtInterface[]
}
export default function LotteryNumbersPlayed({numbersBought}: Props) {

    return (
        <div className="relative flex flex-col bg-gradient-to-b from-indigo-500">
            <nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
                
                <div>

                    {
                        numbersBought.length > 0 &&
                        <h2 className="font-normal">Usted compró estos numeros en este sorteo:</h2>
                    }
                    {
                        numbersBought.length > 0 ?
                        numbersBought.map((item, id) => (
                            <>
                                <div 
                                    key={id} 
                                >Numero: {item.number} - Cantidad: {item.qty}</div>
                            </>
                        )) :
                        <label className="ml-5">No compró numeros para este sorteo</label>
                    }
                </div>
            </nav>
        </div>
    )
}