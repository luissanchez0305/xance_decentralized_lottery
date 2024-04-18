'use client'
import { formatDate, shortenHash } from "@/utils/helper";
import { useRouter } from "next/navigation";

type Props = {
    hash: string;
    date: Date;
    id: number;
}
export default function LotteryItem({hash, date, id}: Props) {
    const router = useRouter();

    const goLottery = (id: number) => () => {
        router.push(`/lotteries/${id}`);
    }
    return (
        <button onClick={goLottery(id)}
            className="flex items-center w-full p-3 leading-tight transition-all outline-none text-start">
            <div>
                <h6 
                    className="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
                    {shortenHash(hash)}
                </h6>
                <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-400">
                    {formatDate(date)}GMT
                </p>
            </div>
        </button>
    )
}