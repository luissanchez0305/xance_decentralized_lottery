import Lotteries from '@/components/lotteries';

export default function Page() {

    return (
        <main>
          <div className="flex justify-center max-w-md flex-col mx-auto">
                <Lotteries connected={false} />
            </div>
        </main>
    )
}