'use client'
import { NumberType } from "@/utils/types";
import { lottery as _lottery } from "@prisma/client";
import { createContext, PropsWithChildren, useContext, useState } from "react";

type GameContextType = {
    numbers: NumberType[],
    maxInventoryNumber: number,
    expiresAt: number,
    total: number,
    lottery: _lottery | undefined,
    isGameExpired: () => boolean,
    editGameContext: (data: any, typeOfUpdate: String) => void;
}

const initalState: GameContextType = {
    numbers: [],
    maxInventoryNumber: 0,
    expiresAt: 0,
    total: 0,
    lottery: {
        id: 0,
        contractHash: process.env.NEXT_PUBLIC_XANCE_CONTRACT_ADDRESS ?? '0x0',
        tokenHash: process.env.NEXT_PUBLIC_USD_CONTRACT_ADDRESS ?? '0x0',
        createdDate: new Date(),
        lotteryDate: new Date(),
        country: '',
    },
    isGameExpired: () => { return false; },
    editGameContext: () => {},
}

const GameContext = createContext(initalState);
export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }: PropsWithChildren<{}>) => {
    const [lottery, setLottery] = useState<_lottery>();
    const [numbers, setNumbers] = useState<NumberType[]>([]);
    const [expiresAt, setExpiresAt] = useState(0);
    const [maxInventoryNumber, setMaxInventoryNumber] = useState(0);
    const [total, setTotal] = useState(0)

    const editGameContext = (data: any, type: String) => {
        switch (type) {
            case 'numbers':
                setNumbers(data);
                break;
            case 'expiresAt':
                setExpiresAt(data);
                break;
            case 'maxInventoryNumber':
                setMaxInventoryNumber(data);
                break;
            case 'lottery':
                setLottery(data);
                break;
            case 'total':
                setTotal(data);
                break;
            default:
                break;
        }
    }

    const isGameExpired = () => {
        const now = new Date().getTime();
        return Number(expiresAt) * 1000 < now
    }

    return (
        <GameContext.Provider value={{ editGameContext, isGameExpired, maxInventoryNumber, numbers, expiresAt, lottery, total }}>
            {children}
        </GameContext.Provider>
    );
};