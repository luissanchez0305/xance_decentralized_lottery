import { formatDate, shortenHash } from "@/utils/helper";
import { format } from "path";
import GoToBuyButton from "./goToBuyButton";

type Props = {
    hash: string;
    date: Date | string;
    isOpen: boolean;
    maxInventoryNumber: number;
    xanceUrl: string;
}
export default function Header({hash, date, xanceUrl, maxInventoryNumber, isOpen}: Props) {
    return (
        <>
        <div className="flex flex-row justify-between bg-indigo-500 px-2 pt-3">
          <div className="flow-root w-full">
            <label className="text-2l font-bold float-left">Contrato del sorteo</label>
            <label className="text-sm float-right text-end"><a href={xanceUrl} target="_blank">{shortenHash(hash)}</a></label>
          </div>
        </div>
        <div className="flex flex-row justify-between bg-indigo-500 px-2 pt-3">
            {
              isOpen && maxInventoryNumber > 0 ? 
                <div className="flex flex-col">
                  <p className="text-2l font-bold">{`Escoge mínimo ${maxInventoryNumber < 10 ? maxInventoryNumber : 10} números`}</p>
                  <p className="text-sm">Costo por número: $0.25</p>
                </div> : 
              isOpen ?
              <div className="flex flex-col">
                <GoToBuyButton hash={hash} />
              </div>
              :
              <div className="flex flex-col"></div>
            }

          <div className="flex flex-col text-right">
            <p className="text-2l font-bold">Fecha de sorteo</p>
            <p className="text-sm">{formatDate(date)}GMT</p>
          </div>
        </div>
        </>
    )
}