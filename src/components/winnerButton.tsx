import Navigation from "@/components/navigation";
import { useGameContext } from "@/contexts/gameContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PropsWithChildren, useEffect, useState } from "react";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import xance from "../abi/Xance.json"
import { isUserWinner } from "@/utils/helper";

export default function WinnerButton(prop: PropsWithChildren) {
    const { address } = useAccount();
    const { lottery } = useGameContext();

    const [isWinner, setIsWinner] = useState(false);

    const { config: configClaim,
        error: prepareErrorClaim,
        isError: isPrepareErrorClaim, 
    } = usePrepareContractWrite({
        address: lottery?.contractHash as `0x${string}`, // Xance address
        abi: xance.abi,
        functionName: 'claim',
        args: []
    })

    const { data: dataWinners, isError: isErrorWinners, isLoading: isLoadingWinners } = useContractRead({
      address: lottery?.contractHash as `0x${string}`,
      abi: xance.abi,
      functionName: 'getAllPrizeNumbers',
    })

    const { data: dataClaim, write: writeClaim } = useContractWrite(configClaim)

  const { 
    isLoading: isLoadingClaim, 
    error: errorClaim, 
    isError: isErrorClaim, 
    isSuccess: isSuccessClaim
    } = useWaitForTransaction({
        hash: dataClaim?.hash,
    })

    useEffect(() => {
        if(!isErrorWinners) {
            console.log('address', address, dataWinners, lottery?.contractHash);
            setIsWinner(isUserWinner(address, dataWinners as []))
        }
    }, [address, dataWinners])
    return (
        <>
        {
            isWinner ?  
                isSuccessClaim ? 
                <label className="mr-3 w-full text-end">
                    Tu Premio ha sido depositado. FELICIDADES!!
                </label> : 
                <button onClick={() => writeClaim?.()} className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ">
                    { isLoadingClaim ? "Reclamando..." : "Reclamar Premio" }
                </button>
            : null
        }
        </>
    )
}
  