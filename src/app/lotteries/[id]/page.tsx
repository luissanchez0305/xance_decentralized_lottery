import LotteryDetail from '@/components/lotteryDetail';
import { prisma } from '../../../../db/prisma';

type Props = {
    params: {
      id: number;
    };
  };

export default async function Page({params}: Props) {
    const lotteryItem = await prisma.lottery.findFirstOrThrow({
        where: { id: Number(params.id) }
    });

    return (
        <main>
          <div className="flex justify-center max-w-md flex-col mx-auto">
                <LotteryDetail lottery={lotteryItem}/>
            </div>
        </main>
    )
}